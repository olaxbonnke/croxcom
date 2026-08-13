import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { TopBar } from "@/components/layout/TopBar";
import { Composer } from "@/components/feed/Composer";
import { PostCard } from "@/components/feed/PostCard";
import { FeedSkeleton } from "@/components/feed/Skeleton";
import { LandingPage } from "@/components/landing/LandingPage";
import { mockCommunities, type PostMedia } from "@/data/mock";
import { usePosts } from "@/hooks/usePosts";
import { useAuth } from "@/lib/AuthContext";
import { isSupabaseConfigured, uploadPostImage, fetchFollowingUserIdsSupabase } from "@/lib/supabase";
import { useCommunities as useCommunityCtx } from "@/lib/CommunityContext";
import { fetchLiveAINews, DEFAULT_AI_NEWS, type NewsArticle } from "@/lib/news";
import {
  TrendingUp,
  Newspaper,
  Users,
  ExternalLink,
  Sparkles,
  Plus,
  X,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { RouteErrorBoundary } from "@/components/ui/RouteErrorBoundary";

const ADS = [
  {
    sponsor: "NVIDIA AI Enterprise",
    headline: "Train faster. Deploy smarter. H100 GPU clusters ready for instant provisioning.",
    url: "https://nvidia.com",
  },
  {
    sponsor: "Pinecone Vector Database",
    headline:
      "Serverless Vector Search — scale to billions of embeddings with zero infra management.",
    url: "https://pinecone.io",
  },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [{ title: "CroxCom — AI Developer Community" }],
  }),
  component: RootRoute,
  errorComponent: RouteErrorBoundary,
});

function RootRoute() {
  const { isAuthenticated, hasCompletedOnboarding, isLoadingAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoadingAuth && isAuthenticated && !hasCompletedOnboarding) {
      navigate({ to: "/auth", replace: true });
    }
  }, [isLoadingAuth, isAuthenticated, hasCompletedOnboarding, navigate]);

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center font-mono text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span>Connecting to CroxCom...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  if (!hasCompletedOnboarding) {
    return null;
  }

  return <FeedPage />;
}

function FeedPage() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"Trend" | "Following" | "Communities">("Trend");
  const { posts, addPost, loadMore, hasMore, isLoadingMore } = usePosts();
  const [aiNews, setAiNews] = useState<NewsArticle[]>(DEFAULT_AI_NEWS);
  const [followingUserIds, setFollowingUserIds] = useState<Set<string>>(new Set());

  // Fetch live AI & Tech news from real APIs on mount
  useEffect(() => {
    async function loadNews() {
      const live = await fetchLiveAINews();
      if (live && live.length > 0) {
        setAiNews(live);
      }
    }
    loadNews();
  }, []);

  // Fetch following user IDs for Following feed tab
  useEffect(() => {
    async function loadFollowing() {
      if (isSupabaseConfigured && currentUser?.id) {
        const ids = await fetchFollowingUserIdsSupabase(currentUser.id);
        setFollowingUserIds(new Set(ids));
      }
    }
    loadFollowing();
  }, [currentUser?.id, activeTab]);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 250);
    return () => clearTimeout(t);
  }, []);

  // Infinite scroll sentinel
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const sentinelCallback = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) observerRef.current.disconnect();
      if (!node || !hasMore) return;
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting && hasMore && !isLoadingMore) {
            loadMore();
          }
        },
        { rootMargin: "200px" },
      );
      observerRef.current.observe(node);
    },
    [hasMore, isLoadingMore, loadMore],
  );

  const handlePost = async ({
    body,
    tags,
    media,
    imageDataUrls,
    imageFiles,
  }: {
    body: string;
    tags: string[];
    privacy: string;
    imageDataUrls: string[];
    imageFiles?: File[];
    media?: PostMedia | PostMedia[];
  }) => {
    let finalMedia = media;
    let imageUrls: string[] | undefined;

    // Upload images to Supabase Storage if configured
    if (isSupabaseConfigured && currentUser?.id && imageFiles && imageFiles.length > 0) {
      const uploadedUrls = await Promise.all(
        imageFiles.map((file) => uploadPostImage(currentUser.id, file)),
      );
      const validUrls = uploadedUrls.filter((url): url is string => url !== null);
      if (validUrls.length > 0) {
        imageUrls = validUrls;
        finalMedia =
          validUrls.length === 1
            ? { kind: "image", url: validUrls[0], alt: "Uploaded image" }
            : {
                kind: "image-grid",
                images: validUrls.map((url, i) => ({ url, alt: `Image ${i + 1}` })),
              };
      }
    } else if (!finalMedia && imageDataUrls.length > 0) {
      // Fallback to data URLs for local/mock mode
      finalMedia =
        imageDataUrls.length === 1
          ? { kind: "image", url: imageDataUrls[0], alt: "Uploaded image" }
          : {
              kind: "image-grid",
              images: imageDataUrls.map((url, i) => ({ url, alt: `Image ${i + 1}` })),
            };
    }

    addPost({
      id: `local-${Date.now()}`,
      author: currentUser,
      time: "Just now",
      body,
      tags,
      stats: { comments: 0, reposts: 0, likes: 0 },
      ...(finalMedia ? { media: finalMedia } : {}),
      ...(imageUrls ? { imageUrls } : {}),
    });
  };

  // Build interleaved Trend feed: mix community posts with live news and ads
  const trendItems: Array<
    | { type: "post"; data: (typeof posts)[0] }
    | { type: "news"; data: NewsArticle }
    | { type: "ad"; data: (typeof ADS)[0] }
  > = [];

  let newsIdx = 0;

  // If no user posts yet, populate Trend feed with live AI & tech news!
  if (posts.length === 0) {
    aiNews.forEach((newsArticle) => {
      trendItems.push({ type: "news", data: newsArticle });
    });
  } else {
    posts.forEach((post, i) => {
      // Interleave news every 2 posts
      if (i % 2 === 0 && newsIdx < aiNews.length) {
        trendItems.push({ type: "news", data: aiNews[newsIdx++] });
      }
      trendItems.push({ type: "post", data: post });

      // Interleave ad after every 4 posts using cyclic ad index
      if ((i + 1) % 4 === 0 && ADS.length > 0) {
        const adIndex = Math.floor(i / 4) % ADS.length;
        trendItems.push({ type: "ad", data: ADS[adIndex] });
      }
    });
  }

  return (
    <AppShell>
      <TopBar activeTab={activeTab} onTabChange={setActiveTab} />

      {loading ? (
        <FeedSkeleton />
      ) : (
        <AnimatePresence mode="popLayout">
          {/* ── Trend Tab (Interleaved News, Ads & Community Posts) ── */}
          {activeTab === "Trend" && (
            <motion.div
              key="trend"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="divide-y divide-border/70"
            >
              {/* Subtle header */}
              <div className="flex items-center gap-2 px-4 py-2.5 font-mono text-xs text-muted-foreground bg-accent/10 border-b border-border/70">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                <span className="text-primary font-medium">trending</span>
                <span>— community posts, news & discussions</span>
              </div>

              {/* Post composer accessible on Trend tab */}
              <div className="bg-card/40 border-b border-border/70">
                <Composer
                  onSubmit={handlePost}
                  placeholder="what are you building or thinking about?"
                />
              </div>

              {trendItems.map((item, idx) => {
                if (item.type === "post") {
                  return (
                    <motion.div
                      key={`p-${item.data.id}`}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <PostCard post={item.data} />
                    </motion.div>
                  );
                }

                if (item.type === "news") {
                  return (
                    <motion.a
                      key={`n-${item.data.id}`}
                      href={item.data.url}
                      target="_blank"
                      rel="noreferrer"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="group flex cursor-pointer items-start gap-3.5 bg-card/30 px-4 py-4 transition-colors hover:bg-accent/20 border-b border-border/70"
                    >
                      <img
                        src={item.data.imageUrl}
                        alt={item.data.headline}
                        className="hidden h-16 w-20 shrink-0 rounded-md border border-border/50 object-cover sm:block"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-[9px] uppercase tracking-wider text-primary border border-primary/30 rounded px-1.5 py-0.5 bg-primary/10">
                            AI & Tech News
                          </span>
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {item.data.tag}
                          </span>
                        </div>
                        <h3 className="text-[15px] font-medium text-foreground leading-snug group-hover:text-primary transition-colors">
                          {item.data.headline}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                          {item.data.summary}
                        </p>
                        <div className="mt-2 flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
                          <Newspaper className="h-3 w-3" />
                          <span>{item.data.source}</span>
                          <span>·</span>
                          <span>{item.data.time}</span>
                          <ExternalLink className="ml-auto h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity" />
                        </div>
                      </div>
                    </motion.a>
                  );
                }

                if (item.type === "ad") {
                  return (
                    <div
                      key={`ad-${idx}`}
                      className="flex items-start gap-3 px-4 py-3 bg-primary/5 border-l-2 border-primary/40"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground/70 border border-border/50 rounded px-1">
                            Sponsored
                          </span>
                          <span className="font-mono text-[10px] text-primary font-medium">
                            {item.data.sponsor}
                          </span>
                        </div>
                        <p className="text-sm text-foreground/90 leading-snug">
                          {item.data.headline}
                        </p>
                      </div>
                      <a
                        href={item.data.url}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 rounded-md border border-border/70 px-3 py-1 font-mono text-xs text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary"
                      >
                        learn more
                      </a>
                    </div>
                  );
                }

                return null;
              })}

              {/* Infinite scroll sentinel */}
              <div ref={sentinelCallback} className="h-1" />
              {isLoadingMore && (
                <div className="flex items-center justify-center gap-2 py-6 font-mono text-xs text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span>loading more…</span>
                </div>
              )}
            </motion.div>
          )}

          {/* ── Following Tab ── */}
          {activeTab === "Following" && (() => {
            const followingPosts = posts.filter(
              (p) =>
                p.author.id === currentUser?.id ||
                followingUserIds.has(p.author.id) ||
                followingUserIds.has(p.author.handle),
            );
            return (
              <motion.div
                key="following"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="divide-y divide-border/70"
              >
                {/* First item: Add Post section */}
                <div className="bg-card/40 border-b border-border/70">
                  <Composer
                    onSubmit={handlePost}
                    placeholder="Share an update or code with your network…"
                  />
                </div>

                {followingPosts.length > 0 ? (
                  followingPosts.map((post) => (
                    <motion.div
                      key={post.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <PostCard post={post} />
                    </motion.div>
                  ))
                ) : (
                  <div className="px-4 py-12 text-center">
                    <div className="font-mono text-sm text-muted-foreground">
                      $ feed --following --empty
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      No posts yet from developers you follow. Follow developers or share an update above!
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })()}

          {/* ── Communities Tab ── */}
          {activeTab === "Communities" && <CommunitiesTab posts={posts} />}
        </AnimatePresence>
      )}

      {!hasMore && posts.length > 0 && (
        <div className="px-4 py-10 text-center font-mono text-xs text-muted-foreground">
          — end of feed —
        </div>
      )}
    </AppShell>
  );
}

// ─── Communities Tab Component ────────────────────────────────────────────────

function CommunitiesTab({ posts }: { posts: ReturnType<typeof usePosts>["posts"] }) {
  const [subTab, setSubTab] = useState<"feed" | "my">("feed");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newIsPublic, setNewIsPublic] = useState(true);

  const {
    joinedCommunityIds,
    createdCommunities,
    joinCommunity,
    leaveCommunity,
    createCommunity,
    isMember,
  } = useCommunityCtx();

  // All communities: mock + user-created
  const allCommunities = [...mockCommunities, ...createdCommunities];

  // Feed: posts from joined communities OR public communities
  const communityPosts = posts.filter((p) => {
    if (!p.community) return false;
    if (isMember(p.community.id)) return true;
    if (p.community.isPublic !== false) return true;
    return false;
  });

  // My communities: ones the user has joined
  const myCommunities = allCommunities.filter((c) => isMember(c.id));

  const handleCreate = () => {
    if (!newName.trim()) return;
    createCommunity({ name: newName.trim(), description: newDesc.trim(), isPublic: newIsPublic });
    setNewName("");
    setNewDesc("");
    setNewIsPublic(true);
    setShowCreateModal(false);
  };

  return (
    <motion.div key="communities" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Sub-tab strip */}
      <div className="flex border-b border-border/70 px-4 gap-4 bg-accent/10">
        <button
          onClick={() => setSubTab("feed")}
          className={`pb-2 pt-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
            subTab === "feed"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Feed
        </button>
        <button
          onClick={() => setSubTab("my")}
          className={`pb-2 pt-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
            subTab === "my"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          My Communities
        </button>
      </div>

      {subTab === "feed" && (
        <div className="divide-y divide-border/70">
          {communityPosts.length > 0 ? (
            communityPosts.map((post) => (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
              >
                <PostCard post={post} />
              </motion.div>
            ))
          ) : (
            <div className="px-4 py-12 text-center">
              <div className="font-mono text-sm text-muted-foreground">
                $ communities --feed --empty
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Join some communities to see posts here.
              </p>
            </div>
          )}
        </div>
      )}

      {subTab === "my" && (
        <div className="p-4 space-y-3">
          {/* Create button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 py-3 font-mono text-sm text-primary hover:bg-primary/10 hover:border-primary/60 transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Create Community</span>
          </button>

          {/* My communities list */}
          {myCommunities.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2">
              {myCommunities.map((community, idx) => (
                <motion.div
                  key={community.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <div className="flex flex-col gap-2 rounded-lg border border-border/70 bg-card/60 p-4 transition-all hover:border-primary/50 hover:bg-card shadow-sm">
                    <div className="flex items-center justify-between">
                      <Link
                        to="/communities/$slug"
                        params={{ slug: community.slug }}
                        className="font-mono text-base font-semibold text-primary hover:underline"
                      >
                        /{community.name}
                      </Link>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
                          <Users className="h-3.5 w-3.5" />
                          {community.members.toLocaleString()}
                        </span>
                        {community.isPublic === false && (
                          <span className="font-mono text-[9px] border border-accent-purple/40 text-accent-purple px-1.5 py-0.5 rounded bg-accent-purple/10">
                            PRIVATE
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {community.description}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      {community.tags && community.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {community.tags.map((t) => (
                            <span
                              key={t}
                              className="rounded border border-border/50 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={() => leaveCommunity(community.id)}
                        className="shrink-0 rounded-md border border-border px-3 py-1 font-mono text-xs text-muted-foreground hover:border-destructive hover:text-destructive transition-colors cursor-pointer ml-auto"
                      >
                        leave
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center font-mono text-xs text-muted-foreground">
              $ communities --mine --empty
              <br />
              You haven't joined any communities yet.
            </div>
          )}

          {/* Discover more */}
          <div className="pt-4 border-t border-border/50">
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground/60 mb-3">
              Discover communities
            </p>
            <div className="grid gap-2 sm:grid-cols-1 md:grid-cols-2">
              {allCommunities
                .filter((c) => !isMember(c.id))
                .map((community) => (
                  <div
                    key={community.id}
                    className="flex items-center justify-between rounded-lg border border-border/70 bg-card/40 p-3"
                  >
                    <Link
                      to="/communities/$slug"
                      params={{ slug: community.slug }}
                      className="font-mono text-sm text-foreground hover:text-primary transition-colors"
                    >
                      /{community.name}
                    </Link>
                    <button
                      onClick={() => joinCommunity(community.id)}
                      className="shrink-0 rounded-md bg-primary px-3 py-1 font-mono text-xs text-primary-foreground hover:opacity-90 cursor-pointer"
                    >
                      join
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Create Community Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-border/80 bg-background p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-2 font-mono text-xs">
              <span className="text-primary font-bold">$ community --create</span>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div>
              <label className="block font-mono text-xs text-muted-foreground mb-1">
                Community Name
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. vision-transformers"
                className="w-full rounded-md border border-border/70 bg-card/60 px-3 py-2 font-mono text-sm text-foreground focus:border-primary/60 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-mono text-xs text-muted-foreground mb-1">
                Description
              </label>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="What is this community about?"
                rows={2}
                className="w-full resize-none rounded-md border border-border/70 bg-card/60 px-3 py-2 font-mono text-sm text-foreground focus:border-primary/60 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="font-mono text-xs text-muted-foreground">Visibility:</label>
              <button
                onClick={() => setNewIsPublic(true)}
                className={`rounded-md border px-3 py-1 font-mono text-xs transition-colors cursor-pointer ${
                  newIsPublic
                    ? "border-primary text-primary bg-primary/10"
                    : "border-border text-muted-foreground"
                }`}
              >
                Public
              </button>
              <button
                onClick={() => setNewIsPublic(false)}
                className={`rounded-md border px-3 py-1 font-mono text-xs transition-colors cursor-pointer ${
                  !newIsPublic
                    ? "border-accent-purple text-accent-purple bg-accent-purple/10"
                    : "border-border text-muted-foreground"
                }`}
              >
                Private
              </button>
            </div>
            <div className="flex gap-2 pt-2 border-t border-border/50">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 rounded-md border border-border py-2 font-mono text-xs text-muted-foreground hover:bg-accent cursor-pointer"
              >
                cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newName.trim()}
                className="flex-1 rounded-md bg-primary py-2 font-mono text-xs font-semibold text-primary-foreground hover:opacity-90 cursor-pointer disabled:opacity-50"
              >
                create
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
