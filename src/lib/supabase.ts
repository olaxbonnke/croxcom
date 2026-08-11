import { createClient } from "@supabase/supabase-js";

// Read Supabase configuration from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

// Check if Supabase credentials are provided
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Initialize Supabase client (dummy URL provided if missing so code doesn't throw at boot time)
export const supabase = createClient(
  supabaseUrl || "https://placeholder-project.supabase.co",
  supabaseAnonKey || "placeholder-anon-key",
);

/**
 * Sign in with Email / Password
 */
export async function signInWithEmail(email: string) {
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured: using mock fallback authentication.");
    return { data: { user: { id: "demo-user-id", email } }, error: null };
  }
  return await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/`,
    },
  });
}

/**
 * Sign in with GitHub OAuth
 */
export async function signInWithGitHub() {
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured: using mock fallback authentication.");
    return { data: { provider: "github", url: null }, error: null };
  }
  return await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: `${window.location.origin}/`,
    },
  });
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle() {
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured: using mock fallback authentication.");
    return { data: { provider: "google", url: null }, error: null };
  }
  return await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/`,
    },
  });
}

/**
 * Sign Out
 */
export async function signOutSupabase() {
  if (!isSupabaseConfigured) return { error: null };
  return await supabase.auth.signOut();
}

/**
 * Fetch User Profile from Supabase
 */
export async function fetchProfile(userId: string) {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();

  if (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
  return data;
}

/**
 * Upsert User Profile in Supabase
 */
export async function upsertProfile(profile: Record<string, unknown>) {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase.from("profiles").upsert(profile).select().single();

  if (error) {
    console.error("Error upserting profile:", error);
    return null;
  }
  return data;
}

/**
 * Fetch Posts from Supabase (with pagination)
 */
export async function fetchPostsSupabase(page = 0, pageSize = 20) {
  if (!isSupabaseConfigured) return [];
  const from = page * pageSize;
  const to = from + pageSize - 1;
  const { data, error } = await supabase
    .from("posts")
    .select("*, profiles(*)")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error fetching posts from Supabase:", error);
    return [];
  }
  return data || [];
}

/**
 * Create a new Post in Supabase
 */
export async function createPostSupabase(post: {
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  authorId: string;
  aiModel?: string;
  toolUrl?: string;
  bountyAmount?: string;
}) {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from("posts")
    .insert({
      title: post.title,
      content: post.content,
      category: post.category || "discussion",
      tags: post.tags || [],
      author_id: post.authorId,
      ai_model: post.aiModel,
      tool_url: post.toolUrl,
      bounty_amount: post.bountyAmount,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating post in Supabase:", error);
    return null;
  }
  return data;
}

/**
 * Fetch User Bookmarks from Supabase
 */
export async function fetchBookmarksSupabase(userId: string): Promise<string[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase.from("bookmarks").select("post_id").eq("user_id", userId);

  if (error) {
    console.error("Error fetching bookmarks from Supabase:", error);
    return [];
  }
  return (data || []).map((b) => b.post_id);
}

/**
 * Toggle Bookmark in Supabase
 */
export async function toggleBookmarkSupabase(userId: string, postId: string, isSaved: boolean) {
  if (!isSupabaseConfigured) return;
  if (isSaved) {
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("user_id", userId)
      .eq("post_id", postId);
    if (error) console.error("Error removing bookmark from Supabase:", error);
  } else {
    const { error } = await supabase.from("bookmarks").insert({ user_id: userId, post_id: postId });
    if (error) console.error("Error adding bookmark to Supabase:", error);
  }
}

/**
 * Subscribe to Realtime Posts updates
 */
export function subscribeToPosts(onPayload: (payload: any) => void) {
  if (!isSupabaseConfigured) return () => {};

  const channel = supabase
    .channel("public:posts")
    .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, onPayload)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Fetch Notifications from Supabase
 */
export async function fetchNotificationsSupabase(userId: string) {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from("notifications")
    .select("*, actor:profiles!notifications_actor_id_fkey(*)")
    .eq("recipient_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
  return data || [];
}

/**
 * Subscribe to Realtime Notifications
 */
export function subscribeToNotifications(userId: string, onPayload: (payload: any) => void) {
  if (!isSupabaseConfigured) return () => {};

  const channel = supabase
    .channel(`public:notifications:${userId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "notifications", filter: `recipient_id=eq.${userId}` },
      onPayload,
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Send Direct Message via Supabase (conversation-based)
 */
export async function sendMessageSupabase(
  conversationId: string,
  senderId: string,
  body: string,
) {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      body,
    })
    .select()
    .single();

  if (error) {
    console.error("Error sending message:", error);
    return null;
  }
  return data;
}

/**
 * Subscribe to Realtime Direct Messages in a Conversation
 */
export function subscribeToMessages(
  conversationId: string,
  onPayload: (payload: any) => void,
) {
  if (!isSupabaseConfigured) return () => {};

  const channel = supabase
    .channel(`public:messages:${conversationId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      onPayload,
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Fetch Comments for a Post from Supabase
 */
export async function fetchCommentsSupabase(postId: string) {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from("comments")
    .select("*, profiles(*)")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
  return data || [];
}

/**
 * Create a Comment in Supabase
 */
export async function createCommentSupabase(comment: {
  postId: string;
  authorId: string;
  content: string;
  parentCommentId?: string;
}) {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from("comments")
    .insert({
      post_id: comment.postId,
      author_id: comment.authorId,
      content: comment.content,
      parent_comment_id: comment.parentCommentId || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating comment:", error);
    return null;
  }
  return data;
}

/**
 * Toggle Like on a Post in Supabase
 */
export async function toggleLikeSupabase(
  userId: string,
  postId: string,
  isLiked: boolean,
) {
  if (!isSupabaseConfigured) return;
  if (isLiked) {
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("user_id", userId)
      .eq("post_id", postId);
    if (error) console.error("Error removing like:", error);
  } else {
    const { error } = await supabase
      .from("likes")
      .insert({ user_id: userId, post_id: postId });
    if (error) console.error("Error adding like:", error);
  }
}

/**
 * Fetch user's liked post IDs from Supabase
 */
export async function fetchLikedPostIdsSupabase(
  userId: string,
): Promise<string[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from("likes")
    .select("post_id")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching liked posts:", error);
    return [];
  }
  return (data || []).map((l) => l.post_id);
}

/**
 * Fetch Communities from Supabase
 */
export async function fetchCommunitiesSupabase() {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from("communities")
    .select("*, community_members(count)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching communities:", error);
    return [];
  }
  return data || [];
}

/**
 * Join a Community in Supabase
 */
export async function joinCommunitySupabase(
  userId: string,
  communityId: string,
) {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from("community_members")
    .insert({ community_id: communityId, user_id: userId })
    .select()
    .single();

  if (error) {
    console.error("Error joining community:", error);
    return null;
  }
  return data;
}

/**
 * Leave a Community in Supabase
 */
export async function leaveCommunitySupabase(
  userId: string,
  communityId: string,
) {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase
    .from("community_members")
    .delete()
    .eq("community_id", communityId)
    .eq("user_id", userId);
  if (error) console.error("Error leaving community:", error);
}

/**
 * Mark a Notification as Read in Supabase
 */
export async function markNotificationReadSupabase(notificationId: string) {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId);
  if (error) console.error("Error marking notification read:", error);
}

/**
 * Fetch Library Items from Supabase
 */
export async function fetchLibraryItemsSupabase() {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from("library_items")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching library items:", error);
    return [];
  }
  return data || [];
}

/**
 * Toggle Library Save in Supabase
 */
export async function toggleLibrarySaveSupabase(
  userId: string,
  itemId: string,
  isSaved: boolean,
) {
  if (!isSupabaseConfigured) return;
  if (isSaved) {
    const { error } = await supabase
      .from("library_saves")
      .delete()
      .eq("user_id", userId)
      .eq("item_id", itemId);
    if (error) console.error("Error removing library save:", error);
  } else {
    const { error } = await supabase
      .from("library_saves")
      .insert({ user_id: userId, item_id: itemId });
    if (error) console.error("Error saving library item:", error);
  }
}

/**
 * Upload a post image to Supabase Storage
 * Returns the public URL on success, null on failure.
 */
export async function uploadPostImage(
  userId: string,
  file: File,
): Promise<string | null> {
  if (!isSupabaseConfigured) return null;
  const fileExt = file.name.split(".").pop();
  const filePath = `${userId}/${crypto.randomUUID()}.${fileExt}`;

  const { error } = await supabase.storage
    .from("post-images")
    .upload(filePath, file);

  if (error) {
    console.error("Error uploading image:", error);
    return null;
  }

  const { data } = supabase.storage.from("post-images").getPublicUrl(filePath);
  return data.publicUrl;
}
