import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { AppShell } from "@/components/layout/AppShell";
import { CommunityCard } from "@/components/browse/CommunityCard";
import { PostCard } from "@/components/feed/PostCard";
import { mockCommunities, trending, mockUsers } from "@/data/mock";
import { Search, X, Loader2, Plus, Users, Globe, Lock } from "lucide-react";
import { searchPostsSupabase, isSupabaseConfigured } from "@/lib/supabase";
import type { MockPost } from "@/data/mock";
import { SHOW_DEMO_DATA } from "@/lib/config";
import { RouteErrorBoundary } from "@/components/ui/RouteErrorBoundary";
import { useCommunities } from "@/lib/CommunityContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/browse")({
  validateSearch: z.object({
    q: z.string().optional().catch(undefined),
  }),
  component: BrowsePage,
  errorComponent: RouteErrorBoundary,
});

function BrowsePage() {
  const navigate = useNavigate();
  const { q: searchParam } = Route.useSearch();
  const [query, setQuery] = useState(searchParam ?? "");
  const [followedUserIds, setFollowedUserIds] = useState<Set<string>>(new Set());
  const [commTab, setCommTab] = useState<"discover" | "joined">("discover");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { createdCommunities, isMember, createCommunity } = useCommunities();
  const allCommunitiesList = [...createdCommunities, ...mockCommunities];

  // Form state for creating a new community
  const [newCommName, setNewCommName] = useState("");
  const [newCommDesc, setNewCommDesc] = useState("");
  const [newCommTags, setNewCommTags] = useState("");
  const [newCommPublic, setNewCommPublic] = useState(true);

  useEffect(() => {
    if (searchParam !== undefined) {
      setQuery(searchParam);
    }
  }, [searchParam]);

  const q = query.trim().toLowerCase();

  const baseCommunities = commTab === "joined"
    ? allCommunitiesList.filter((c) => isMember(c.id))
    : allCommunitiesList;

  const filteredCommunities = baseCommunities.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.tags?.some((t) => t.toLowerCase().includes(q)),
  );

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommName.trim()) {
      toast.error("Please enter a community name");
      return;
    }

    try {
      const created = createCommunity({
        name: newCommName.trim(),
        description: newCommDesc.trim() || "A community for developers.",
        isPublic: newCommPublic,
      });

      toast.success(`Community /${created.name} created!`);
      setShowCreateModal(false);
      setNewCommName("");
      setNewCommDesc("");
      setNewCommTags("");
      navigate({ to: "/communities/$slug", params: { slug: created.slug } });
    } catch (err: any) {
      toast.error(err?.message || "Failed to create community");
    }
  };

  const filteredTrending = trending.filter((t) => t.topic.toLowerCase().includes(q));

  const filteredPeople = SHOW_DEMO_DATA
    ? mockUsers
        .slice(1)
        .filter(
          (u) =>
            u.name.toLowerCase().includes(q) ||
            u.handle.toLowerCase().includes(q) ||
            u.role?.toLowerCase().includes(q),
        )
    : [];

  const toggleFollow = (id: string) => {
    setFollowedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Server-side full-text post search
  const [searchResults, setSearchResults] = useState<MockPost[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!q || !isSupabaseConfigured) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchPostsSupabase(q);
        const mapped: MockPost[] = results.map((sp: Record<string, any>) => {
          const profile = sp.profiles || {};
          return {
            id: sp.id,
            author: {
              id: sp.author_id,
              name: profile.name || "AI Developer",
              handle: profile.handle || "developer",
              avatar: profile.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
              avatarColor: profile.avatarColor || "#00ff9f",
              role: profile.role || "AI Developer",
            },
            time: new Date(sp.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
            body: sp.content,
            tags: sp.tags || [],
            stats: { likes: sp.likes_count || 0, comments: sp.comments_count || 0, reposts: 0 },
          };
        });
        setSearchResults(mapped);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400); // debounce
    return () => clearTimeout(timer);
  }, [q]);

  return (
    <AppShell>
      <div className="sticky top-0 z-10 border-b border-border/70 bg-background/80 backdrop-blur-md">
        <div className="px-4 pt-3">
          <h1 className="text-lg font-semibold text-foreground">Browse</h1>
        </div>
        <div className="relative mt-3 px-4 pb-3">
          <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search communities, topics, people..."
            className="w-full rounded-md border border-border bg-card/60 py-2 pl-9 pr-9 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none transition-colors"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-7 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-8 py-4">
        {/* Trending topics */}
        {filteredTrending.length > 0 && (
          <section>
            <h2 className="mb-3 px-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">
              # trending topics
            </h2>
            <div className="grid grid-cols-2 gap-2 px-4 sm:grid-cols-3">
              {filteredTrending.map((topic, i) => (
                <Link
                  key={i}
                  to="/"
                  className="cursor-pointer rounded-md border border-border/70 bg-card/40 px-3 py-2 transition-colors hover:border-primary/40"
                >
                  <div className="font-mono text-sm text-foreground">#{topic.topic}</div>
                  <div className="mt-1 font-mono text-xs text-muted-foreground">{topic.posts}</div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Communities Section with Tabs & Create Button */}
        <section>
          <div className="px-4 mb-3 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                # communities
              </h2>
              <div className="flex rounded-md border border-border/70 p-0.5 font-mono text-xs bg-card/40">
                <button
                  type="button"
                  onClick={() => setCommTab("discover")}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    commTab === "discover"
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Discover
                </button>
                <button
                  type="button"
                  onClick={() => setCommTab("joined")}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    commTab === "joined"
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Joined
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 border border-primary/40 px-3 py-1 font-mono text-xs text-primary hover:bg-primary/20 transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Community</span>
            </button>
          </div>

          {filteredCommunities.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 px-4 pb-2 sm:grid-cols-2">
              {filteredCommunities.map((community) => (
                <CommunityCard key={community.id} community={community} />
              ))}
            </div>
          ) : (
            <div className="px-4 py-8 text-center border border-dashed border-border/70 rounded-md mx-4 font-mono text-xs text-muted-foreground">
              {commTab === "joined"
                ? "You haven't joined any communities yet. Click 'Discover' above to explore and join communities!"
                : "No communities matching your search"}
            </div>
          )}
        </section>

        {/* People to follow */}
        {filteredPeople.length > 0 && (
          <section>
            <h2 className="mb-3 px-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">
              # people to follow
            </h2>
            <div className="space-y-3 px-4 pb-6">
              {filteredPeople.map((user) => {
                const isFollowing = followedUserIds.has(user.id);
                return (
                  <div
                    key={user.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-card/40 p-3 transition-colors hover:border-primary/40"
                  >
                    <Link
                      to="/profile/$handle"
                      params={{ handle: user.handle }}
                      className="flex items-center gap-3 min-w-0 flex-1 group"
                    >
                      <div
                        className="h-10 w-10 shrink-0 place-items-center rounded-md font-mono text-xs font-bold text-black grid"
                        style={{ backgroundColor: user.avatarColor }}
                      >
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                            {user.name}
                          </span>
                          <span className="truncate font-mono text-xs text-muted-foreground">
                            @{user.handle}
                          </span>
                        </div>
                        {user.role && (
                          <div className="mt-0.5 truncate text-xs text-muted-foreground">
                            {user.role}
                          </div>
                        )}
                      </div>
                    </Link>

                    <button
                      type="button"
                      onClick={() => toggleFollow(user.id)}
                      className={`shrink-0 rounded-md px-4 py-1.5 font-mono text-xs transition-colors cursor-pointer ${
                        isFollowing
                          ? "border border-border text-foreground hover:border-destructive hover:text-destructive"
                          : "bg-primary text-primary-foreground hover:opacity-90 font-semibold"
                      }`}
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Post search results */}
        {q && isSupabaseConfigured && (
          <section>
            <h2 className="mb-3 px-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">
              # post results
            </h2>
            {isSearching ? (
              <div className="flex items-center justify-center gap-2 py-8 font-mono text-xs text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span>searching posts…</span>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="divide-y divide-border/70 px-0">
                {searchResults.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="px-4 py-6 text-center font-mono text-xs text-muted-foreground">
                No matching posts found
              </div>
            )}
          </section>
        )}

        {/* No results */}
        {filteredTrending.length === 0 &&
          filteredCommunities.length === 0 &&
          filteredPeople.length === 0 &&
          searchResults.length === 0 &&
          !isSearching && (
            <div className="px-4 py-16 text-center font-mono text-xs text-muted-foreground">
              $ search --query "{query}" --no-results-found
            </div>
          )}
      </div>
      {/* Create Community Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-border/70 pb-3">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <h2 className="font-mono text-base font-semibold text-foreground">
                    Create a New Community
                  </h2>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label className="block font-mono text-xs text-muted-foreground mb-1">
                    Community Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCommName}
                    onChange={(e) => setNewCommName(e.target.value)}
                    placeholder="e.g. Next.js Developers, Autonomous AI Agents"
                    className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs text-muted-foreground mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={newCommDesc}
                    onChange={(e) => setNewCommDesc(e.target.value)}
                    placeholder="What is this community about? Who should join?"
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs text-muted-foreground mb-1">
                    Privacy Setting
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setNewCommPublic(true)}
                      className={`flex-1 flex items-center justify-center gap-2 rounded-md border p-2.5 font-mono text-xs transition-colors cursor-pointer ${
                        newCommPublic
                          ? "border-primary bg-primary/10 text-primary font-medium"
                          : "border-border/70 text-muted-foreground hover:bg-card"
                      }`}
                    >
                      <Globe className="h-4 w-4" />
                      <span>Public</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewCommPublic(false)}
                      className={`flex-1 flex items-center justify-center gap-2 rounded-md border p-2.5 font-mono text-xs transition-colors cursor-pointer ${
                        !newCommPublic
                          ? "border-primary bg-primary/10 text-primary font-medium"
                          : "border-border/70 text-muted-foreground hover:bg-card"
                      }`}
                    >
                      <Lock className="h-4 w-4" />
                      <span>Private</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/70">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-md font-mono text-xs border border-border text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-md font-mono text-xs bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-colors cursor-pointer"
                  >
                    Create Community
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
