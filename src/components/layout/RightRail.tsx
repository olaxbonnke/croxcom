import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { mockCommunities, mockUsers, trending } from "@/data/mock";
import { Search, X, User, MessageSquare, Compass } from "lucide-react";
import { usePosts } from "@/hooks/usePosts";

export function RightRail() {
  const navigate = useNavigate();
  const { posts } = usePosts();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const matchedUsers = query.trim()
    ? mockUsers.filter(
        (u) =>
          u.name.toLowerCase().includes(query.toLowerCase()) ||
          u.handle.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const matchedPosts = query.trim()
    ? posts.filter(
        (p) =>
          p.body.toLowerCase().includes(query.toLowerCase()) ||
          p.tags?.some((t) => t.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 3)
    : [];

  const matchedCommunities = query.trim()
    ? mockCommunities.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
    : [];

  const hasResults = matchedUsers.length > 0 || matchedPosts.length > 0 || matchedCommunities.length > 0;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate({ to: "/browse", search: { q: query.trim() } as any });
    }
  };

  return (
    <aside className="hidden w-[300px] shrink-0 xl:block" aria-label="Discover">
      <div className="sticky top-4 flex flex-col gap-4 py-4 pr-4">
        {/* Top Right Search Bar */}
        <div className="relative">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 200)}
              placeholder="Search CroxCom..."
              className="w-full rounded-lg border border-border/80 bg-card/70 pl-9 pr-8 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary/80 focus:outline-none focus:ring-1 focus:ring-primary/40 backdrop-blur-sm"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </form>

          {/* Search Dropdown Popup */}
          {focused && query.trim() && (
            <div className="absolute top-full left-0 right-0 z-40 mt-1.5 max-h-80 overflow-y-auto rounded-lg border border-border/80 bg-background shadow-2xl p-2 font-mono text-xs scrollbar-none">
              {matchedUsers.length > 0 && (
                <div className="mb-2">
                  <div className="px-2 py-1 text-[10px] text-muted-foreground uppercase font-semibold">Users</div>
                  {matchedUsers.map((u) => (
                    <Link
                      key={u.id}
                      to="/profile/$handle"
                      params={{ handle: u.handle }}
                      className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent/60 transition-colors"
                    >
                      <div
                        className="h-6 w-6 rounded font-mono text-[10px] grid place-items-center shrink-0"
                        style={{ backgroundColor: u.avatarColor, color: "#0a0a0a" }}
                      >
                        {u.name[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-foreground font-sans font-medium">{u.name}</div>
                        <div className="truncate text-muted-foreground text-[10px]">@{u.handle}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {matchedCommunities.length > 0 && (
                <div className="mb-2 border-t border-border/40 pt-1">
                  <div className="px-2 py-1 text-[10px] text-muted-foreground uppercase font-semibold">Communities</div>
                  {matchedCommunities.map((c) => (
                    <Link
                      key={c.id}
                      to="/communities/$slug"
                      params={{ slug: c.slug }}
                      className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent/60 transition-colors"
                    >
                      <Compass className="h-3.5 w-3.5 text-primary" />
                      <span className="truncate text-foreground font-medium">/{c.name}</span>
                    </Link>
                  ))}
                </div>
              )}

              {matchedPosts.length > 0 && (
                <div className="border-t border-border/40 pt-1">
                  <div className="px-2 py-1 text-[10px] text-muted-foreground uppercase font-semibold">Posts</div>
                  {matchedPosts.map((p) => (
                    <Link
                      key={p.id}
                      to="/posts/$postId"
                      params={{ postId: p.id }}
                      className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent/60 transition-colors"
                    >
                      <MessageSquare className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate text-foreground font-sans text-xs">{p.body}</span>
                    </Link>
                  ))}
                </div>
              )}

              {!hasResults && (
                <div className="p-3 text-center text-muted-foreground">
                  No matches found for "{query}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Trending in AI */}
        <section className="rounded-lg border border-border/70 bg-card/60 backdrop-blur-sm">
          <header className="border-b border-border/70 px-4 py-3">
            <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              # trending in ai
            </h2>
          </header>
          <ul className="divide-y divide-border/60">
            {trending.map((t) => (
              <li key={t.topic}>
                <button
                  onClick={() => navigate({ to: "/browse", search: { q: t.topic } as any })}
                  className="flex w-full flex-col items-start px-4 py-2.5 text-left transition-colors hover:bg-accent/50 cursor-pointer"
                >
                  <span className="text-sm text-foreground">#{t.topic}</span>
                  <span className="font-mono text-xs text-muted-foreground">{t.posts}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* Suggested Communities */}
        <section className="rounded-lg border border-border/70 bg-card/60 backdrop-blur-sm">
          <header className="border-b border-border/70 px-4 py-3">
            <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              # suggested communities
            </h2>
          </header>
          <ul className="divide-y divide-border/60">
            {mockCommunities.slice(0, 4).map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <Link to="/communities/$slug" params={{ slug: c.slug }} className="truncate font-mono text-sm text-foreground hover:underline">
                    /{c.name}
                  </Link>
                  <div className="truncate text-xs text-muted-foreground">
                    {c.members.toLocaleString()} members
                  </div>
                </div>
                <button className="shrink-0 rounded-md border border-border px-3 py-1 font-mono text-xs text-foreground transition-colors hover:border-primary hover:text-primary cursor-pointer">
                  join
                </button>
              </li>
            ))}
          </ul>
        </section>

        <p className="px-1 font-mono text-[11px] leading-relaxed text-muted-foreground/70">
          croxcom v0.1 · a community for ai developers
        </p>
      </div>
    </aside>
  );
}
