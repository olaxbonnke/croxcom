import { createClient } from "@supabase/supabase-js";

// Read Supabase configuration from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

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
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

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
  const { data, error } = await supabase
    .from("profiles")
    .upsert(profile)
    .select()
    .single();

  if (error) {
    console.error("Error upserting profile:", error);
    return null;
  }
  return data;
}

/**
 * Fetch Posts from Supabase
 */
export async function fetchPostsSupabase() {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from("posts")
    .select("*, profiles(*)")
    .order("created_at", { ascending: false });

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
  const { data, error } = await supabase
    .from("bookmarks")
    .select("post_id")
    .eq("user_id", userId);

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
    const { error } = await supabase
      .from("bookmarks")
      .insert({ user_id: userId, post_id: postId });
    if (error) console.error("Error adding bookmark to Supabase:", error);
  }
}

