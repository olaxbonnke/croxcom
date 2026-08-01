/**
 * PostProvider + usePosts hook.
 *
 * Provides global post state, comments, likes, reposts, edits, and deletions.
 */
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { type MockPost, type MockComment } from "@/data/mock";
import { useAuth } from "@/lib/AuthContext";
import { isSupabaseConfigured, fetchPostsSupabase, createPostSupabase, subscribeToPosts } from "@/lib/supabase";

type PostContextType = {
  posts: MockPost[];
  comments: MockComment[];
  addPost: (post: MockPost) => void;
  deletePost: (id: string) => void;
  editPost: (id: string, newBody: string, newTags?: string[]) => void;
  addComment: (postId: string, body: string) => void;
  addReply: (postId: string, parentCommentId: string, body: string) => void;
  toggleLike: (id: string) => void;
  toggleRepost: (id: string) => void;
  commentPost: (id: string) => void;
  likedPostIds: Set<string>;
  repostedPostIds: Set<string>;
  mutedUserHandles: Set<string>;
  blockedUserHandles: Set<string>;
  toggleMuteUser: (handle: string) => void;
  toggleBlockUser: (handle: string) => void;
  likePost: (id: string) => void;
  repostPost: (id: string) => void;
};

const PostContext = createContext<PostContextType | undefined>(undefined);


export function PostProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState<MockPost[]>([]);
  const [comments, setComments] = useState<MockComment[]>([]);
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());
  const [repostedPostIds, setRepostedPostIds] = useState<Set<string>>(new Set());
  const [mutedUserHandles, setMutedUserHandles] = useState<Set<string>>(new Set());
  const [blockedUserHandles, setBlockedUserHandles] = useState<Set<string>>(new Set());

  // Load live posts from Supabase on mount and subscribe to realtime updates
  useEffect(() => {
    async function loadLivePosts() {
      if (isSupabaseConfigured) {
        const sbPosts = await fetchPostsSupabase();
        if (sbPosts && sbPosts.length > 0) {
          const mappedPosts: MockPost[] = sbPosts.map((sp: Record<string, any>) => {
            const profile = sp.profiles || {};
            return {
              id: sp.id,
              author: {
                id: sp.author_id,
                name: profile.name || "AI Developer",
                handle: profile.handle || "developer",
                avatar: profile.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                role: profile.role || "AI Developer",
              },
              time: new Date(sp.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
              body: sp.content,
              tags: sp.tags || [],
              stats: {
                likes: sp.likes_count || 0,
                comments: sp.comments_count || 0,
                reposts: 0,
              },
            };
          });
          setPosts(mappedPosts);
        }
      }
    }
    loadLivePosts();

    let unsubscribe = () => {};
    if (isSupabaseConfigured) {
      unsubscribe = subscribeToPosts((payload) => {
        if (payload.eventType === "INSERT" && payload.new) {
          const sp = payload.new;
          setPosts((prev) => {
            if (prev.some((p) => p.id === sp.id)) return prev;
            const newMapped: MockPost = {
              id: sp.id,
              author: {
                id: sp.author_id,
                name: "AI Developer",
                handle: "developer",
                avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                role: "AI Developer",
              },
              time: "Just now",
              body: sp.content,
              tags: sp.tags || [],
              stats: { likes: 0, comments: 0, reposts: 0 },
            };
            return [newMapped, ...prev];
          });
        }
      });
    }

    return () => unsubscribe();
  }, []);


  const addPost = useCallback(
    async (post: MockPost) => {
      setPosts((prev) => [post, ...prev]);

      if (isSupabaseConfigured && currentUser?.id) {
        await createPostSupabase({
          title: post.body.slice(0, 50) || "New Post",
          content: post.body,
          tags: post.tags,
          authorId: currentUser.id,
        });
      }
    },
    [currentUser?.id],
  );


  const deletePost = useCallback((id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    setComments((prev) => prev.filter((c) => c.postId !== id));
  }, []);

  const editPost = useCallback((id: string, newBody: string, newTags?: string[]) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, body: newBody, ...(newTags ? { tags: newTags } : {}) } : p,
      ),
    );
  }, []);

  const addComment = useCallback(
    (postId: string, body: string) => {
      if (!body.trim()) return;
      const authorToUse = currentUser || mockUsers[0];
      const newComment: MockComment = {
        id: `comm-${Date.now()}`,
        postId,
        author: authorToUse,
        time: "Just now",
        body: body.trim(),
        likes: 0,
        replies: [],
      };
      setComments((prev) => [...prev, newComment]);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, stats: { ...p.stats, comments: p.stats.comments + 1 } } : p,
        ),
      );
    },
    [currentUser],
  );

  const addReply = useCallback(
    (postId: string, parentCommentId: string, body: string) => {
      if (!body.trim()) return;
      const authorToUse = currentUser || mockUsers[0];
      const newReply: MockComment = {
        id: `reply-${Date.now()}`,
        postId,
        author: authorToUse,
        time: "Just now",
        body: body.trim(),
        likes: 0,
      };

      const appendReplyToTree = (list: MockComment[]): MockComment[] => {
        return list.map((c) => {
          if (c.id === parentCommentId) {
            return { ...c, replies: [...(c.replies || []), newReply] };
          }
          if (c.replies && c.replies.length > 0) {
            return { ...c, replies: appendReplyToTree(c.replies) };
          }
          return c;
        });
      };

      setComments((prev) => appendReplyToTree(prev));
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, stats: { ...p.stats, comments: p.stats.comments + 1 } } : p,
        ),
      );
    },
    [currentUser],
  );

  const toggleLike = useCallback((id: string) => {
    setLikedPostIds((prev) => {
      const next = new Set(prev);
      const wasLiked = next.has(id);
      if (wasLiked) {
        next.delete(id);
      } else {
        next.add(id);
      }
      setPosts((ps) =>
        ps.map((p) =>
          p.id === id
            ? { ...p, stats: { ...p.stats, likes: p.stats.likes + (wasLiked ? -1 : 1) } }
            : p,
        ),
      );
      return next;
    });
  }, []);

  const toggleRepost = useCallback((id: string) => {
    setRepostedPostIds((prev) => {
      const next = new Set(prev);
      const wasReposted = next.has(id);
      if (wasReposted) {
        next.delete(id);
      } else {
        next.add(id);
      }
      setPosts((ps) =>
        ps.map((p) =>
          p.id === id
            ? { ...p, stats: { ...p.stats, reposts: p.stats.reposts + (wasReposted ? -1 : 1) } }
            : p,
        ),
      );
      return next;
    });
  }, []);

  const toggleMuteUser = useCallback((handle: string) => {
    setMutedUserHandles((prev) => {
      const next = new Set(prev);
      if (next.has(handle)) {
        next.delete(handle);
      } else {
        next.add(handle);
      }
      return next;
    });
  }, []);

  const toggleBlockUser = useCallback((handle: string) => {
    setBlockedUserHandles((prev) => {
      const next = new Set(prev);
      if (next.has(handle)) {
        next.delete(handle);
      } else {
        next.add(handle);
      }
      return next;
    });
  }, []);

  const commentPost = useCallback((id: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, stats: { ...p.stats, comments: p.stats.comments + 1 } } : p,
      ),
    );
  }, []);

  const likePost = toggleLike;
  const repostPost = toggleRepost;

  // Ensure current user posts resolve with current user's profile info dynamically
  const resolvedPosts = posts
    .filter((p) => !blockedUserHandles.has(p.author.handle))
    .map((p) => {
      if (
        currentUser &&
        (p.author.id === currentUser.id || p.author.handle === currentUser.handle)
      ) {
        return {
          ...p,
          author: {
            ...p.author,
            name: currentUser.name,
            handle: currentUser.handle,
            avatar: currentUser.avatar,
            avatarColor: currentUser.avatarColor,
            role: currentUser.role,
          },
        };
      }
      return p;
    });

  return (
    <PostContext.Provider
      value={{
        posts: resolvedPosts,
        comments,
        addPost,
        deletePost,
        editPost,
        addComment,
        addReply,
        toggleLike,
        toggleRepost,
        commentPost,
        likedPostIds,
        repostedPostIds,
        mutedUserHandles,
        blockedUserHandles,
        toggleMuteUser,
        toggleBlockUser,
        likePost,
        repostPost,
      }}
    >
      {children}
    </PostContext.Provider>
  );
}

export function usePosts() {
  const context = useContext(PostContext);
  if (context === undefined) {
    throw new Error("usePosts must be used within a PostProvider");
  }
  return context;
}
