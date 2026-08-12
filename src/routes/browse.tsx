import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { AppShell } from "@/components/layout/AppShell";
import { CommunityCard } from "@/components/browse/CommunityCard";
import { PostCard } from "@/components/feed/PostCard";
import { mockCommunities, trending, mockUsers } from "@/data/mock";
import { Search, X, Loader2 } from "lucide-react";
import { searchPostsSupabase, isSupabaseConfigured } from "@/lib/supabase";
import type { MockPost } from "@/data/mock";
import { SHOW_DEMO_DATA } from "@/lib/config";
import { RouteErrorBoundary } from "@/components/ui/RouteErrorBoundary";

export const Route = createFileRoute("/browse")({
  validateSearch: z.object({
    q: z.string().optional().catch(undefined),
  }),
  component: BrowsePage,
  errorComponent: RouteErrorBoundary,
});

function BrowsePage() {
  const { q: searchParam } = Route.useSearch();
  const [query, setQuery] = useState(searchParam ?? "");
  const [followedUserIds, setFollowedUserIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (searchParam !== undefined) {
      setQuery(searchParam);
    }
  }, [searchParam]);

  const q = query.trim().toLowerCase();

  const filteredCommunities = mockCommunities.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.tags?.some((t) => t.toLowerCase().includes(q)),
  );

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

        {/* Communities */}
        {filteredCommunities.length > 0 && (
          <section>
            <h2 className="mb-3 px-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">
              # communities
            </h2>
            <div className="grid grid-cols-1 gap-3 px-4 pb-2 sm:grid-cols-2">
              {filteredCommunities.map((community) => (
                <CommunityCard key={community.id} community={community} />
              ))}
            </div>
          </section>
        )}

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
    </AppShell>
  );
}
