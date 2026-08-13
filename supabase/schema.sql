-- CroxCom Supabase Database Schema
-- ============================================================================
-- SECURITY NOTES:
-- • Every INSERT policy on a table with an owner column MUST bind auth.uid()
--   to that column. Never use a bare `auth.role() = 'authenticated'` check.
-- • Every UPDATE policy MUST have both USING and a matching WITH CHECK clause.
-- • Privileged columns (is_verified, reputation) are protected by a trigger
--   that silently reverts changes unless the request uses the service_role key.
-- ============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- PROFILES TABLE
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  name text not null,
  handle text unique not null,
  avatar text,
  avatar_color text default '#00ff9f',
  role text default 'AI Developer',
  company text,
  location text,
  bio text check (char_length(bio) <= 500),
  github text,
  twitter text,
  website text,
  reputation integer default 100,
  is_verified boolean default false,
  preferences text[] default '{}',
  tools text[] default '{}',
  interests text[] default '{}',
  dev_position text default 'Solo'
);

-- POSTS TABLE
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  community_id uuid, -- FK added after communities table is created
  title text not null check (char_length(title) <= 300),
  content text not null check (char_length(content) <= 5000),
  category text default 'discussion' not null,
  tags text[] default '{}',
  image_urls text[] default '{}',
  likes_count integer default 0,
  comments_count integer default 0,
  bounty_amount text,
  bounty_status text default 'Open',
  ai_model text,
  tool_url text
);

-- COMMENTS TABLE
create table public.comments (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now() not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  parent_comment_id uuid references public.comments(id) on delete cascade,
  content text not null check (char_length(content) <= 2000),
  likes_count integer default 0
);

-- BOOKMARKS TABLE
create table public.bookmarks (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now() not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  unique (user_id, post_id)
);

-- ============================================================================
-- LIKES TABLE (per-user tracking, not just a global counter)
-- ============================================================================

create table public.likes (
  user_id uuid references public.profiles(id) on delete cascade,
  post_id uuid references public.posts(id) on delete cascade,
  created_at timestamptz default now() not null,
  primary key (user_id, post_id)
);

-- ============================================================================
-- COMMUNITIES
-- ============================================================================

create table public.communities (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now() not null,
  slug text unique not null check (slug ~ '^[a-z0-9-]{3,50}$'),
  name text not null check (char_length(name) <= 100),
  description text check (char_length(description) <= 1000),
  is_public boolean default true,
  created_by uuid references public.profiles(id) on delete set null
);

create table public.community_members (
  community_id uuid references public.communities(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  joined_at timestamptz default now() not null,
  role text default 'member' check (role in ('member', 'moderator', 'owner')),
  primary key (community_id, user_id)
);

-- Add FK from posts to communities (deferred to after communities table exists)
alter table public.posts
  add constraint posts_community_id_fkey
  foreign key (community_id) references public.communities(id) on delete set null;

-- ============================================================================
-- CONVERSATIONS & MESSAGES (conversation-based DM model)
-- ============================================================================

create table public.conversations (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now() not null
);

create table public.conversation_participants (
  conversation_id uuid references public.conversations(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  primary key (conversation_id, user_id)
);

create table public.messages (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now() not null,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  body text not null check (char_length(body) <= 5000)
);

-- Helper function to check conversation membership without RLS recursion
create or replace function public.is_conversation_participant(conv_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.conversation_participants
    where conversation_id = conv_id and user_id = auth.uid()
  );
$$ language sql security definer stable;

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now() not null,
  recipient_id uuid references public.profiles(id) on delete cascade not null,
  actor_id uuid references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('like', 'repost', 'follow', 'mention', 'comment', 'system')),
  post_id uuid references public.posts(id) on delete cascade,
  content text,
  is_read boolean default false not null
);

-- ============================================================================
-- LIBRARY
-- ============================================================================

create table public.library_items (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now() not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  title text not null check (char_length(title) <= 200),
  description text check (char_length(description) <= 1000),
  image_url text,
  category text,
  source_post_id uuid references public.posts(id) on delete set null
);

create table public.library_saves (
  user_id uuid references public.profiles(id) on delete cascade,
  item_id uuid references public.library_items(id) on delete cascade,
  saved_at timestamptz default now() not null,
  primary key (user_id, item_id)
);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.bookmarks enable row level security;
alter table public.likes enable row level security;
alter table public.communities enable row level security;
alter table public.community_members enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.library_items enable row level security;
alter table public.library_saves enable row level security;

-- ============================================================================
-- RLS POLICIES — PROFILES
-- ============================================================================

create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- ============================================================================
-- RLS POLICIES — POSTS
-- ============================================================================

create policy "Posts are viewable by everyone" on public.posts
  for select using (true);

-- SECURITY FIX: bind INSERT to the real owner (was auth.role() = 'authenticated')
create policy "Users can create their own posts" on public.posts
  for insert with check (auth.uid() = author_id);

-- SECURITY FIX: added WITH CHECK to prevent ownership reassignment
create policy "Users can update their own posts" on public.posts
  for update using (auth.uid() = author_id) with check (auth.uid() = author_id);

create policy "Users can delete their own posts" on public.posts
  for delete using (auth.uid() = author_id);

-- ============================================================================
-- RLS POLICIES — COMMENTS
-- ============================================================================

create policy "Comments are viewable by everyone" on public.comments
  for select using (true);

-- SECURITY FIX: bind INSERT to the real owner (was auth.role() = 'authenticated')
create policy "Users can create their own comments" on public.comments
  for insert with check (auth.uid() = author_id);

-- SECURITY FIX: added missing UPDATE/DELETE policies
create policy "Users can update their own comments" on public.comments
  for update using (auth.uid() = author_id) with check (auth.uid() = author_id);

create policy "Users can delete their own comments" on public.comments
  for delete using (auth.uid() = author_id);

-- ============================================================================
-- RLS POLICIES — BOOKMARKS
-- ============================================================================

create policy "Users can view their own bookmarks" on public.bookmarks
  for select using (auth.uid() = user_id);

create policy "Users can create bookmarks" on public.bookmarks
  for insert with check (auth.uid() = user_id);

create policy "Users can delete their own bookmarks" on public.bookmarks
  for delete using (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES — LIKES
-- ============================================================================

create policy "Likes are viewable by everyone" on public.likes
  for select using (true);

create policy "Users can like posts" on public.likes
  for insert with check (auth.uid() = user_id);

create policy "Users can remove their own likes" on public.likes
  for delete using (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES — COMMUNITIES
-- ============================================================================

create policy "Public communities are viewable by everyone" on public.communities
  for select using (is_public or exists (
    select 1 from public.community_members where community_id = id and user_id = auth.uid()
  ));

create policy "Authenticated users can create communities" on public.communities
  for insert with check (auth.uid() = created_by);

create policy "Owners can update their communities" on public.communities
  for update using (auth.uid() = created_by) with check (auth.uid() = created_by);

create policy "Members are viewable by everyone" on public.community_members
  for select using (true);

create policy "Users can join communities" on public.community_members
  for insert with check (auth.uid() = user_id);

create policy "Users can leave communities" on public.community_members
  for delete using (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES — CONVERSATIONS & MESSAGES
-- ============================================================================

create policy "Participants can view their conversations" on public.conversations
  for select using (public.is_conversation_participant(id));

create policy "Authenticated users can create conversations" on public.conversations
  for insert with check (auth.role() = 'authenticated');

create policy "Participants can view the participant list" on public.conversation_participants
  for select using (public.is_conversation_participant(conversation_id));

create policy "Users can add themselves to a conversation" on public.conversation_participants
  for insert with check (auth.uid() = user_id);

create policy "Participants can view messages" on public.messages
  for select using (public.is_conversation_participant(conversation_id));

create policy "Participants can send messages" on public.messages
  for insert with check (
    auth.uid() = sender_id and public.is_conversation_participant(conversation_id)
  );

-- ============================================================================
-- RLS POLICIES — NOTIFICATIONS
-- ============================================================================

-- No client-facing INSERT policy — notifications are created by triggers only
create policy "Users can view their own notifications" on public.notifications
  for select using (auth.uid() = recipient_id);

create policy "Users can mark their own notifications read" on public.notifications
  for update using (auth.uid() = recipient_id) with check (auth.uid() = recipient_id);

-- ============================================================================
-- RLS POLICIES — LIBRARY
-- ============================================================================

create policy "Library items are viewable by everyone" on public.library_items
  for select using (true);

create policy "Users can add their own library items" on public.library_items
  for insert with check (auth.uid() = author_id);

create policy "Users can update their own library items" on public.library_items
  for update using (auth.uid() = author_id) with check (auth.uid() = author_id);

create policy "Users can delete their own library items" on public.library_items
  for delete using (auth.uid() = author_id);

create policy "Users can manage their own saves" on public.library_saves
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS & FUNCTIONS
-- ============================================================================

-- Protect privileged profile columns from client-side self-escalation
create or replace function public.protect_privileged_profile_fields()
returns trigger as $$
begin
  -- Only allow changes to these fields via service_role (admin/server-side)
  if auth.role() <> 'service_role' then
    new.is_verified := old.is_verified;
    new.reputation := old.reputation;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger protect_profile_privileged_fields
  before update on public.profiles
  for each row execute procedure public.protect_privileged_profile_fields();

-- Keep posts.likes_count accurate via trigger (never trust client-reported counts)
create or replace function public.sync_post_likes_count()
returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    update public.posts set likes_count = likes_count + 1 where id = new.post_id;
  elsif (tg_op = 'DELETE') then
    update public.posts set likes_count = greatest(likes_count - 1, 0) where id = old.post_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create trigger on_like_change
  after insert or delete on public.likes
  for each row execute procedure public.sync_post_likes_count();

-- Keep posts.comments_count accurate via trigger
create or replace function public.sync_post_comments_count()
returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    update public.posts set comments_count = comments_count + 1 where id = new.post_id;
  elsif (tg_op = 'DELETE') then
    update public.posts set comments_count = greatest(comments_count - 1, 0) where id = old.post_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create trigger on_comment_change
  after insert or delete on public.comments
  for each row execute procedure public.sync_post_comments_count();

-- Auto-create notification when someone likes a post
create or replace function public.notify_on_like()
returns trigger as $$
begin
  insert into public.notifications (recipient_id, actor_id, kind, post_id)
  select p.author_id, new.user_id, 'like', new.post_id
  from public.posts p where p.id = new.post_id and p.author_id <> new.user_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_like_notify
  after insert on public.likes
  for each row execute procedure public.notify_on_like();

-- Auto-create notification when someone comments on a post
create or replace function public.notify_on_comment()
returns trigger as $$
begin
  insert into public.notifications (recipient_id, actor_id, kind, post_id)
  select p.author_id, new.author_id, 'comment', new.post_id
  from public.posts p where p.id = new.post_id and p.author_id <> new.author_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_comment_notify
  after insert on public.comments
  for each row execute procedure public.notify_on_comment();

-- Universal & Fault-Tolerant Profile Creation Trigger for ALL Auth Providers
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  raw_handle text;
  final_handle text;
  raw_email text;
  extracted_name text;
  extracted_avatar text;
begin
  raw_email := coalesce(new.email, 'user');

  extracted_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'custom_claims'->>'name',
    split_part(raw_email, '@', 1),
    'AI Developer'
  );

  raw_handle := lower(regexp_replace(
    coalesce(
      new.raw_user_meta_data->>'user_name',
      new.raw_user_meta_data->>'preferred_username',
      new.raw_user_meta_data->>'nickname',
      split_part(raw_email, '@', 1)
    ),
    '[^a-z0-9_]', '_', 'g'
  ));
  
  if raw_handle is null or char_length(raw_handle) < 2 then
    raw_handle := 'dev';
  end if;

  if char_length(raw_handle) > 20 then
    raw_handle := substring(raw_handle from 1 for 20);
  end if;

  final_handle := raw_handle || '_' || substring(new.id::text from 1 for 4);

  extracted_avatar := coalesce(
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'picture',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  );

  insert into public.profiles (
    id,
    name,
    handle,
    avatar,
    role,
    onboarding_completed
  )
  values (
    new.id,
    extracted_name,
    final_handle,
    extracted_avatar,
    'AI Developer',
    false
  )
  on conflict (id) do update set
    name = excluded.name,
    avatar = coalesce(public.profiles.avatar, excluded.avatar);

  return new;
exception when others then
  raise warning 'handle_new_user trigger exception: %', sqlerrm;
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
grant execute on function public.handle_new_user() to service_role;

-- ============================================================================
-- REALTIME PUBLICATIONS
-- ============================================================================

alter publication supabase_realtime add table public.posts;
alter publication supabase_realtime add table public.comments;
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.likes;

-- ============================================================================
-- STORAGE BUCKET (post images)
-- ============================================================================

-- Create a public bucket for post images
insert into storage.buckets (id, name, public) values ('post-images', 'post-images', true);

-- Anyone can view (bucket is public-read)
create policy "Anyone can view post images" on storage.objects
  for select using (bucket_id = 'post-images');

-- Users can only upload into their own folder path
create policy "Users can upload their own post images" on storage.objects
  for insert with check (
    bucket_id = 'post-images' and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can only delete their own uploaded images
create policy "Users can delete their own post images" on storage.objects
  for delete using (
    bucket_id = 'post-images' and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================================
-- PERFORMANCE INDEXES & FULL-TEXT SEARCH (SCALE READINESS)
-- ============================================================================

-- Foreign key & recency performance indexes
create index if not exists idx_posts_author_id on public.posts(author_id);
create index if not exists idx_posts_created_at on public.posts(created_at desc);
create index if not exists idx_comments_post_id on public.comments(post_id);
create index if not exists idx_comments_author_id on public.comments(author_id);
create index if not exists idx_bookmarks_user_id on public.bookmarks(user_id);
create index if not exists idx_bookmarks_post_id on public.bookmarks(post_id);
create index if not exists idx_likes_post_id on public.likes(post_id);
create index if not exists idx_community_members_user_id on public.community_members(user_id);
create index if not exists idx_notifications_recipient_read on public.notifications(recipient_id, is_read);
create index if not exists idx_messages_conversation_created on public.messages(conversation_id, created_at desc);

-- Full-Text Search tsvector column and GIN index for posts
alter table public.posts add column if not exists search_vector tsvector
  generated always as (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, ''))) stored;
create index if not exists idx_posts_search on public.posts using gin(search_vector);

