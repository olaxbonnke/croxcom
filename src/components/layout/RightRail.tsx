import { useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { mockCommunities, mockUsers } from "@/data/mock";
import { Search, X, User, MessageSquare, Compass, ExternalLink, Newspaper } from "lucide-react";
import { usePosts } from "@/hooks/usePosts";
import { fetchLiveAINews, DEFAULT_AI_NEWS, type NewsArticle } from "@/lib/news";

export function RightRail() {
  const navigate = useNavigate();
  const { posts } = usePosts();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [liveNews, setLiveNews] = useState<NewsArticle[]>(DEFAULT_AI_NEWS);

  useEffect(() => {
    async function loadLiveNews() {
      const articles = await fetchLiveAINews();
      if (articles && articles.length > 0) {
        setLiveNews(articles);
      }
    }
    loadLiveNews();
  }, []);

  const matchedUsers = query.trim()
    ? mockUsers.filter(
        (u) =>
          u.name.toLowerCase().includes(query.toLowerCase()) ||
          u.handle.toLowerCase().includes(query.toLowerCase()),
      )
    : [];

  const matchedPosts = query.trim()
    ? posts
        .filter(
          (p) =>
            p.body.toLowerCase().includes(query.toLowerCase()) ||
            p.tags?.some((t) => t.toLowerCase().includes(query.toLowerCase())),
        )
        .slice(0, 3)
    : [];

  const matchedCommunities = query.trim()
    ? mockCommunities.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
    : [];

  const hasResults =
    matchedUsers.length > 0 || matchedPosts.length > 0 || matchedCommunities.length > 0;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate({ to: "/browse", search: { q: query.trim() } as Record<string, string> });
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
                  <div className="px-2 py-1 text-[10px] text-muted-foreground uppercase font-semibold">
                    Users
                  </div>
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
                        <div className="truncate text-foreground font-sans font-medium">
                          {u.name}
                        </div>
                        <div className="truncate text-muted-foreground text-[10px]">
                          @{u.handle}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {matchedCommunities.length > 0 && (
                <div className="mb-2 border-t border-border/40 pt-1">
                  <div className="px-2 py-1 text-[10px] text-muted-foreground uppercase font-semibold">
                    Communities
                  </div>
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
                  <div className="px-2 py-1 text-[10px] text-muted-foreground uppercase font-semibold">
                    Posts
                  </div>
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

        {/* Live Trending in AI News */}
        <section className="rounded-lg border border-border/70 bg-card/60 backdrop-blur-sm">
          <header className="border-b border-border/70 px-4 py-3 flex items-center justify-between">
            <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Newspaper className="h-3.5 w-3.5 text-primary" />
              <span># live ai & tech news</span>
            </h2>
          </header>
          <ul className="divide-y divide-border/60">
            {liveNews.slice(0, 5).map((article) => (
              <li key={article.id}>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex flex-col items-start px-4 py-2.5 text-left transition-colors hover:bg-accent/50 cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 w-full">
                    <span className="text-xs text-foreground font-medium group-hover:text-primary transition-colors line-clamp-1">
                      {article.headline}
                    </span>
                    <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground mt-0.5">
                    <span>{article.source}</span>
                    <span>·</span>
                    <span>{article.time}</span>
                  </div>
                </a>
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
