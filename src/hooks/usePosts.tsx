/**
 * PostProvider + usePosts hook.
 *
 * Provides global post state, comments, likes, reposts, edits, and deletions.
 * Integrates Supabase for pagination, likes, and comments.
 */
import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from "react";
import { type MockPost, type MockComment, mockPosts } from "@/data/mock";
import { useAuth } from "@/lib/AuthContext";
import {
  isSupabaseConfigured,
  fetchPostsSupabase,
  createPostSupabase,
  subscribeToPosts,
  toggleLikeSupabase,
  fetchLikedPostIdsSupabase,
  createCommentSupabase,
  fetchCommentsSupabase,
} from "@/lib/supabase";
import { SHOW_DEMO_DATA } from "@/lib/config";
import { toast } from "sonner";

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
  loadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
  loadCommentsForPost: (postId: string) => void;
};

const PostContext = createContext<PostContextType | undefined>(undefined);

const PAGE_SIZE = 20;

/** Map a Supabase post row to the MockPost shape */
function mapSupabasePost(sp: Record<string, any>): MockPost {
  const profile = sp.profiles || {};
  return {
    id: sp.id,
    author: {
      id: sp.author_id,
      name: profile.name || "AI Developer",
      handle: profile.handle || "developer",
      avatar:
        profile.avatar ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      avatarColor: profile.avatarColor || "#00ff9f",
      role: profile.role || "AI Developer",
    },
    time: new Date(sp.created_at).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
    body: sp.content,
    tags: sp.tags || [],
    media: sp.image_urls?.length > 0
      ? sp.image_urls.length === 1
        ? { kind: "image" as const, url: sp.image_urls[0], alt: "Post image" }
        : { kind: "image-grid" as const, images: sp.image_urls.map((url: string, i: number) => ({ url, alt: `Image ${i + 1}` })) }
      : undefined,
    stats: {
      likes: sp.likes_count || 0,
      comments: sp.comments_count || 0,
      reposts: 0,
    },
  };
}

export function PostProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState<MockPost[]>(() => {
    if (isSupabaseConfigured || !SHOW_DEMO_DATA) return [];
    return mockPosts;
  });
  const [comments, setComments] = useState<MockComment[]>([]);
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());
  const [repostedPostIds, setRepostedPostIds] = useState<Set<string>>(new Set());
  const [mutedUserHandles, setMutedUserHandles] = useState<Set<string>>(new Set());
  const [blockedUserHandles, setBlockedUserHandles] = useState<Set<string>>(new Set());

  // Pagination state
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const initialLoadDone = useRef(false);
  const recentOwnPostIds = useRef<Set<string>>(new Set());

  // Load initial page of posts + liked IDs from Supabase
  useEffect(() => {
    async function loadInitial() {
      if (!isSupabaseConfigured || initialLoadDone.current) return;
      initialLoadDone.current = true;

      const sbPosts = await fetchPostsSupabase(0, PAGE_SIZE);
      if (sbPosts && sbPosts.length > 0) {
        setPosts(sbPosts.map(mapSupabasePost));
        if (sbPosts.length < PAGE_SIZE) setHasMore(false);
      } else {
        setHasMore(false);
      }

      // Load liked post IDs for the current user
      if (currentUser?.id) {
        const likedIds = await fetchLikedPostIdsSupabase(currentUser.id);
        if (likedIds.length > 0) {
          setLikedPostIds(new Set(likedIds));
        }
      }
    }
    loadInitial();
  }, [currentUser]);

  // Subscribe to realtime new posts
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const unsubscribe = subscribeToPosts((payload: any) => {
      if (payload.eventType === "INSERT" && payload.new) {
        const sp = payload.new;
        setPosts((prev) => {
          if (prev.some((p) => p.id === sp.id) || recentOwnPostIds.current.has(sp.id)) return prev;
          const isMe = currentUser && sp.author_id === currentUser.id;
          const newMapped: MockPost = {
            id: sp.id,
            author: isMe
              ? currentUser
              : {
                  id: sp.author_id,
                  name: sp.profiles?.name || "AI Developer",
                  handle: sp.profiles?.handle || "developer",
                  avatar:
                    sp.profiles?.avatar ||
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                  avatarColor: "#00ff9f",
                  role: sp.profiles?.role || "AI Developer",
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

    return () => unsubscribe();
  }, [currentUser]);

  // ── Load more (next page) ──
  const loadMore = useCallback(async () => {
    if (!isSupabaseConfigured || isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    const nextPage = page + 1;
    try {
      const sbPosts = await fetchPostsSupabase(nextPage, PAGE_SIZE);
      if (sbPosts && sbPosts.length > 0) {
        const mapped = sbPosts.map(mapSupabasePost);
        setPosts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const newPosts = mapped.filter((p) => !existingIds.has(p.id));
          return [...prev, ...newPosts];
        });
        setPage(nextPage);
        if (sbPosts.length < PAGE_SIZE) setHasMore(false);
      } else {
        setHasMore(false);
      }
    } catch {
      toast.error("Failed to load more posts");
    } finally {
      setIsLoadingMore(false);
    }
  }, [page, isLoadingMore, hasMore]);

  // ── Load comments for a specific post ──
  const loadCommentsForPost = useCallback(async (postId: string) => {
    if (!isSupabaseConfigured) return;
    const sbComments = await fetchCommentsSupabase(postId);
    if (sbComments && sbComments.length > 0) {
      const mapped: MockComment[] = sbComments.map((sc: Record<string, any>) => {
        const profile = sc.profiles || {};
        return {
          id: sc.id,
          postId: sc.post_id,
          author: {
            id: sc.author_id,
            name: profile.name || "AI Developer",
            handle: profile.handle || "developer",
            avatar: profile.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            avatarColor: profile.avatarColor || "#00ff9f",
            role: profile.role || "AI Developer",
          },
          time: new Date(sc.created_at).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          }),
          body: sc.content,
          likes: 0,
          replies: [],
        };
      });
      setComments((prev) => {
        // Replace all comments for this post
        const otherComments = prev.filter((c) => c.postId !== postId);
        return [...otherComments, ...mapped];
      });
    }
  }, []);

  const addPost = useCallback(
    async (post: MockPost & { imageUrls?: string[] }) => {
      const postWithCurrentUser = {
        ...post,
        author: currentUser,
      };

      if (isSupabaseConfigured && currentUser?.id) {
        const saved = await createPostSupabase({
          title: post.body.slice(0, 50) || "New Post",
          content: post.body,
          tags: post.tags,
          authorId: currentUser.id,
          imageUrls: post.imageUrls,
        });
        if (saved) {
          const reconciledPost = { ...postWithCurrentUser, id: saved.id };
          recentOwnPostIds.current.add(saved.id);
          setPosts((prev) => [reconciledPost, ...prev]);
          toast.success("Post published!");
          return;
        } else {
          toast.error("Failed to publish post");
        }
      }
      // Fallback: local-only insert
      setPosts((prev) => [postWithCurrentUser, ...prev]);
    },
    [currentUser],
  );

  const deletePost = useCallback((id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    setComments((prev) => prev.filter((c) => c.postId !== id));
    toast.success("Post deleted");
  }, []);

  const editPost = useCallback((id: string, newBody: string, newTags?: string[]) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, body: newBody, ...(newTags ? { tags: newTags } : {}) } : p,
      ),
    );
  }, []);

  const addComment = useCallback(
    async (postId: string, body: string) => {
      if (!body.trim()) return;
      const authorToUse = currentUser;
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

      // Persist to Supabase
      if (isSupabaseConfigured && currentUser?.id) {
        const result = await createCommentSupabase({
          postId,
          authorId: currentUser.id,
          content: body.trim(),
        });
        if (result) {
          toast.success("Comment posted");
        } else {
          toast.error("Failed to post comment");
        }
      }
    },
    [currentUser],
  );

  const addReply = useCallback(
    async (postId: string, parentCommentId: string, body: string) => {
      if (!body.trim()) return;
      const authorToUse = currentUser;
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

      // Persist reply to Supabase
      if (isSupabaseConfigured && currentUser?.id) {
        await createCommentSupabase({
          postId,
          authorId: currentUser.id,
          content: body.trim(),
          parentCommentId,
        });
      }
    },
    [currentUser],
  );

  const toggleLike = useCallback(
    async (id: string) => {
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

        // Persist to Supabase
        if (isSupabaseConfigured && currentUser?.id) {
          toggleLikeSupabase(currentUser.id, id, wasLiked);
        }

        return next;
      });
    },
    [currentUser],
  );

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
    .filter((p) => !mutedUserHandles.has(p.author.handle))
    .map((p) => {
      if (
        currentUser &&
        (p.author.id === currentUser.id ||
          p.author.handle === currentUser.handle ||
          p.id.startsWith("local-") ||
          p.id.startsWith("new-"))
      ) {
        return {
          ...p,
          author: {
            ...p.author,
            id: currentUser.id,
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
        loadMore,
        hasMore,
        isLoadingMore,
        loadCommentsForPost,
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
