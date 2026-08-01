-- CroxCom Supabase Database Schema
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES TABLE
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  name text not null,
  handle text unique not null,
  avatar text,
  role text default 'AI Developer',
  company text,
  location text,
  bio text,
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

-- POSTS TABLE (Feed, Discussions, Bounties, Projects, News, Tools)
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  content text not null,
  category text default 'discussion' not null,
  tags text[] default '{}',
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
  content text not null,
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

-- ENABLE ROW LEVEL SECURITY (RLS)
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.bookmarks enable row level security;

-- PROFILES POLICIES
create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- POSTS POLICIES
create policy "Posts are viewable by everyone" on public.posts
  for select using (true);

create policy "Authenticated users can create posts" on public.posts
  for insert with check (auth.role() = 'authenticated');

create policy "Users can update their own posts" on public.posts
  for update using (auth.uid() = author_id);

create policy "Users can delete their own posts" on public.posts
  for delete using (auth.uid() = author_id);

-- COMMENTS POLICIES
create policy "Comments are viewable by everyone" on public.comments
  for select using (true);

create policy "Authenticated users can create comments" on public.comments
  for insert with check (auth.role() = 'authenticated');

-- BOOKMARKS POLICIES
create policy "Users can view their own bookmarks" on public.bookmarks
  for select using (auth.uid() = user_id);

create policy "Users can create bookmarks" on public.bookmarks
  for insert with check (auth.uid() = user_id);

create policy "Users can delete their own bookmarks" on public.bookmarks
  for delete using (auth.uid() = user_id);

-- MESSAGES TABLE (Direct Messaging)
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now() not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  is_read boolean default false
);

-- NOTIFICATIONS TABLE
create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now() not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  actor_id uuid references public.profiles(id) on delete cascade,
  kind text not null, -- 'like', 'repost', 'comment', 'mention', 'system'
  post_id uuid references public.posts(id) on delete cascade,
  content text,
  is_read boolean default false
);

-- ENABLE ROW LEVEL SECURITY
alter table public.messages enable row level security;
alter table public.notifications enable row level security;

-- MESSAGES POLICIES
create policy "Users can view their own sent or received messages" on public.messages
  for select using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Users can send messages" on public.messages
  for insert with check (auth.uid() = sender_id);

-- NOTIFICATIONS POLICIES
create policy "Users can view their own notifications" on public.notifications
  for select using (auth.uid() = user_id);

create policy "Users can update their own notifications" on public.notifications
  for update using (auth.uid() = user_id);

-- ENABLE REALTIME PUBLICATIONS ON PUBLIC TABLES
alter publication supabase_realtime add table public.posts;
alter publication supabase_realtime add table public.comments;
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.notifications;

-- TRIGGER FOR NEW USER CREATION FROM AUTH.USERS
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, handle, avatar, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'user_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'),
    'AI Developer'
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

