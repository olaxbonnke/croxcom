/**
 * PostCard — individual post in the feed.
 *
 * Changes:
 * - Removed local liked/reposted useState; now derived from PostContext sets
 *   (likedPostIds, repostedPostIds) so state is persistent and global.
 * - Bookmark state comes from BookmarkContext via useBookmarks (lib/BookmarkContext).
 * - Clicking anywhere on the card (except buttons/links) navigates to /posts/$postId.
 * - Code blocks show in a terminal-style viewer within the card.
 */
import {
  Bookmark,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Play,
  Repeat2,
  Share2,
} from "lucide-react";
import { type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import type { MockPost, PostMedia } from "@/data/mock";
import { cn } from "@/lib/utils";
import { useBookmarks } from "@/hooks/useBookmarks";
import { usePosts } from "@/hooks/usePosts";
import { extractUrl, LinkPreviewCard } from "./LinkPreviewCard";
import { Lightbox } from "./Lightbox";
import { PostOptionsMenu } from "./PostOptionsMenu";
import { useState } from "react";

export function PostCard({ post }: { post: MockPost }) {
  const [expanded, setExpanded] = useState(false);
  // Bookmark from global context → persists to localStorage
  const { savedPosts, toggleBookmark } = useBookmarks();
  // Like/repost from global context → persists while session is alive
  const { toggleLike, toggleRepost, likedPostIds, repostedPostIds } = usePosts();
  const navigate = useNavigate();

  const saved = savedPosts.includes(post.id);
  const liked = likedPostIds.has(post.id);
  const reposted = repostedPostIds.has(post.id);

  const needsClamp = post.longForm || post.body.length > 320;

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button, a, textarea")) return;
    navigate({ to: "/posts/$postId", params: { postId: post.id } });
  };

  return (
    <article
      onClick={handleCardClick}
      className="cursor-pointer border-b border-border/70 px-4 py-4 transition-colors hover:bg-accent/20 sm:px-5"
    >
      <div className="flex gap-3">
        <Avatar user={post.author} />

        <div className="min-w-0 flex-1">
          {/* Header */}
          <header className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
            <Link
              to="/profile/$handle"
              params={{ handle: post.author.handle }}
              className="truncate text-sm font-medium text-foreground hover:underline"
            >
              {post.author.name}
            </Link>
            <Link
              to="/profile/$handle"
              params={{ handle: post.author.handle }}
              className="truncate font-mono text-xs text-muted-foreground hover:text-primary"
            >
              @{post.author.handle}
            </Link>
            <span aria-hidden className="font-mono text-xs text-muted-foreground">
              ·
            </span>
            <Link
              to="/posts/$postId"
              params={{ postId: post.id }}
              className="font-mono text-xs text-muted-foreground hover:text-primary"
            >
              <time>{post.time}</time>
            </Link>
            {post.community && (
              <>
                <span aria-hidden className="font-mono text-xs text-muted-foreground">
                  in
                </span>
                <Link
                  to="/communities/$slug"
                  params={{ slug: post.community.slug }}
                  className="font-mono text-xs text-primary hover:underline"
                >
                  /{post.community.name}
                </Link>
              </>
            )}
            <div className="ml-auto" onClick={(e) => e.stopPropagation()}>
              <PostOptionsMenu post={post} />
            </div>
          </header>

          {/* Body */}
          <div
            className={cn(
              "mt-1 whitespace-pre-wrap text-[15px] leading-[1.65] text-foreground",
              needsClamp && !expanded && "line-clamp-6",
            )}
          >
            {post.body}
          </div>

          {needsClamp && !expanded && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="mt-1 font-mono text-xs text-primary hover:underline"
            >
              read more →
            </button>
          )}

          {/* Media */}
          {post.media && (
            <div className="mt-3">
              <MediaBlock media={post.media} />
            </div>
          )}

          {/* Link preview card if URL detected */}
          {(() => {
            const detectedUrl = extractUrl(post.body);
            return detectedUrl ? <LinkPreviewCard url={detectedUrl} /> : null;
          })()}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {post.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-md border border-border/70 bg-background/40 px-2 py-0.5 font-mono text-xs text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Engagement */}
          <div className="mt-3 flex max-w-md items-center justify-between text-muted-foreground">
            <EngageButton
              label="Reply"
              count={post.stats.comments}
              icon={<MessageCircle className="h-[15px] w-[15px]" />}
              onClick={() => navigate({ to: "/posts/$postId", params: { postId: post.id } })}
            />
            <EngageButton
              label={reposted ? "Undo repost" : "Repost"}
              count={post.stats.reposts}
              active={reposted}
              activeClass="text-primary"
              onClick={() => toggleRepost(post.id)}
              icon={<Repeat2 className="h-[15px] w-[15px]" />}
            />
            <EngageButton
              label={liked ? "Unlike" : "Like"}
              count={post.stats.likes}
              active={liked}
              activeClass="text-primary"
              onClick={() => toggleLike(post.id)}
              icon={<Heart className={cn("h-[15px] w-[15px]", liked && "fill-current")} />}
            />
            <EngageButton
              label={saved ? "Remove bookmark" : "Bookmark"}
              active={saved}
              activeClass="text-primary"
              onClick={() => toggleBookmark(post.id)}
              icon={<Bookmark className={cn("h-[15px] w-[15px]", saved && "fill-current")} />}
            />
            <EngageButton
              label="Share"
              icon={<Share2 className="h-[15px] w-[15px]" />}
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: `Post by ${post.author.name}`,
                    url: window.location.href,
                  });
                } else {
                  navigator.clipboard.writeText(window.location.origin + `/posts/${post.id}`);
                }
              }}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({ user }: { user: MockPost["author"] }) {
  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);
  return (
    <Link
      to="/profile/$handle"
      params={{ handle: user.handle }}
      onClick={(e) => e.stopPropagation()}
      className="grid h-10 w-10 shrink-0 place-items-center rounded-md font-mono text-xs overflow-hidden transition-transform hover:scale-105 cursor-pointer"
      style={{ background: user.avatarColor, color: "#0a0a0a" }}
    >
      {user.avatar ? (
        <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
      ) : (
        initials
      )}
    </Link>
  );
}

function EngageButton({
  icon,
  label,
  count,
  active,
  activeClass,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  count?: number;
  active?: boolean;
  activeClass?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={typeof active === "boolean" ? active : undefined}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={cn(
        "group flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-xs transition-colors",
        "hover:bg-accent/60 hover:text-foreground",
        active && (activeClass ?? "text-primary"),
      )}
    >
      {icon}
      {typeof count === "number" && <span className="tabular-nums">{formatCount(count)}</span>}
    </button>
  );
}

function formatCount(n: number) {
  if (n < 1000) return n.toString();
  if (n < 10000) return `${(n / 1000).toFixed(1)}k`;
  return `${Math.round(n / 1000)}k`;
}

// ─── Media renderer ───────────────────────────────────────────────────────────

// ─── Media renderer ───────────────────────────────────────────────────────────

function MediaBlock({ media }: { media: PostMedia | PostMedia[] }) {
  if (Array.isArray(media)) {
    return (
      <div className="flex flex-col gap-3">
        {media.map((item, i) => (
          <SingleMediaBlock key={i} media={item} />
        ))}
      </div>
    );
  }
  return <SingleMediaBlock media={media} />;
}

function SingleMediaBlock({ media }: { media: PostMedia }) {
  const [lightboxState, setLightboxState] = useState<{
    isOpen: boolean;
    images: Array<{ url: string; alt?: string }>;
    index: number;
  }>({
    isOpen: false,
    images: [],
    index: 0,
  });

  const [isIdeMinimized, setIsIdeMinimized] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);

  const openLightbox = (images: Array<{ url: string; alt?: string }>, index: number) => {
    setLightboxState({ isOpen: true, images, index });
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <>
      {lightboxState.isOpen && (
        <Lightbox
          images={lightboxState.images}
          initialIndex={lightboxState.index}
          onClose={() => setLightboxState({ isOpen: false, images: [], index: 0 })}
        />
      )}

      {/* ── Single Image ── */}
      {media.kind === "image" && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            openLightbox([{ url: media.url, alt: media.alt }], 0);
          }}
          className="overflow-hidden rounded-xl border border-border/70 cursor-pointer group max-h-[420px] bg-black/30"
        >
          <img
            src={media.url}
            alt={media.alt}
            loading="lazy"
            className="w-full max-h-[420px] object-cover transition-transform duration-300 group-hover:scale-[1.01]"
          />
        </div>
      )}

      {/* ── Multi-Image Grid (Match X Layout for 2, 3, 4 images) ── */}
      {media.kind === "image-grid" &&
        (() => {
          const imgs = media.images.slice(0, 4);
          const count = imgs.length;

          if (count === 1) {
            return (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  openLightbox(imgs, 0);
                }}
                className="overflow-hidden rounded-xl border border-border/70 cursor-pointer group max-h-[420px] bg-black/30"
              >
                <img
                  src={imgs[0].url}
                  alt={imgs[0].alt}
                  loading="lazy"
                  className="w-full max-h-[420px] object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                />
              </div>
            );
          }

          if (count === 2) {
            return (
              <div className="grid grid-cols-2 gap-0.5 overflow-hidden rounded-xl border border-border/70">
                {imgs.map((img, i) => (
                  <div
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      openLightbox(imgs, i);
                    }}
                    className="aspect-[7/8] overflow-hidden cursor-pointer group bg-muted/20"
                  >
                    <img
                      src={img.url}
                      alt={img.alt}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  </div>
                ))}
              </div>
            );
          }

          if (count === 3) {
            return (
              <div className="grid grid-cols-2 gap-0.5 overflow-hidden rounded-xl border border-border/70 aspect-[16/9] sm:aspect-[2/1]">
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    openLightbox(imgs, 0);
                  }}
                  className="h-full overflow-hidden cursor-pointer group bg-muted/20"
                >
                  <img
                    src={imgs[0].url}
                    alt={imgs[0].alt}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </div>
                <div className="grid grid-rows-2 gap-0.5 h-full">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      openLightbox(imgs, 1);
                    }}
                    className="h-full overflow-hidden cursor-pointer group bg-muted/20"
                  >
                    <img
                      src={imgs[1].url}
                      alt={imgs[1].alt}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  </div>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      openLightbox(imgs, 2);
                    }}
                    className="h-full overflow-hidden cursor-pointer group bg-muted/20"
                  >
                    <img
                      src={imgs[2].url}
                      alt={imgs[2].alt}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  </div>
                </div>
              </div>
            );
          }

          // 4 images (2x2 grid)
          return (
            <div className="grid grid-cols-2 gap-0.5 overflow-hidden rounded-xl border border-border/70 aspect-[16/9] sm:aspect-[2/1]">
              {imgs.map((img, i) => (
                <div
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    openLightbox(imgs, i);
                  }}
                  className="h-full overflow-hidden cursor-pointer group bg-muted/20"
                >
                  <img
                    src={img.url}
                    alt={img.alt}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </div>
              ))}
            </div>
          );
        })()}

      {/* ── Video Media ── */}
      {media.kind === "video" && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            openLightbox([{ url: media.thumbnail, alt: media.title }], 0);
          }}
          className="relative overflow-hidden rounded-xl border border-border/70 cursor-pointer group"
        >
          <img
            src={media.thumbnail}
            alt={media.title}
            loading="lazy"
            className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 grid place-items-center bg-black/30 group-hover:bg-black/20 transition-colors">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-background/90 text-foreground shadow-lg transition-transform group-hover:scale-110">
              <Play className="ml-0.5 h-6 w-6 fill-current" />
            </div>
          </div>
          <div className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 font-mono text-[11px] text-white">
            {media.duration}
          </div>
        </div>
      )}

      {/* ── Code / IDE Media (Defaults to MINIMIZED, NO 3 dots) ── */}
      {media.kind === "code" && (
        <div className="flex flex-col overflow-hidden rounded-md border border-border/70 bg-[#0d0d0d] shadow-sm my-1">
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-border/40 bg-muted/10 px-3 py-2">
            <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
              <span className="font-mono text-xs text-primary font-semibold flex items-center gap-1 shrink-0">
                <span className="text-muted-foreground">{">"}</span>prompt:
              </span>
              <span className="font-mono text-xs text-foreground/80 truncate">
                {media.code.split("\n")[0]
                  ? `"${media.code.split("\n")[0].slice(0, 50)}..."`
                  : `snippet.${media.language || "code"}`}
              </span>
              <span className="font-mono text-[10px] text-muted-foreground/70 shrink-0">
                [{media.language || "code"}]
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  copyCode(media.code);
                }}
                className="rounded bg-accent/40 px-2 py-0.5 font-mono text-[10px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground cursor-pointer"
              >
                {copiedCode ? "✓ copied" : "copy code"}
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsIdeMinimized((prev) => !prev);
                }}
                className="font-mono text-[11px] text-primary hover:underline cursor-pointer"
              >
                {isIdeMinimized ? "□ expand" : "_ minimize"}
              </button>
            </div>
          </div>

          {/* Code Body (only shown when NOT minimized) */}
          {!isIdeMinimized && (
            <div className="flex bg-[#0a0a0c]">
              <div className="flex w-9 shrink-0 flex-col items-end border-r border-border/30 bg-muted/10 py-3 pr-2 font-mono text-[13px] text-muted-foreground/40 pointer-events-none select-none overflow-hidden">
                {Array.from({ length: media.code.split("\n").length }).map((_, i) => (
                  <span key={i} className="leading-relaxed shrink-0">
                    {i + 1}
                  </span>
                ))}
              </div>
              <pre
                className="flex-1 overflow-x-auto p-3 font-mono text-[13px] leading-relaxed text-emerald-400 scrollbar-none"
                aria-label={`${media.language} code block`}
              >
                <code>{media.code}</code>
              </pre>
            </div>
          )}
        </div>
      )}
    </>
  );
}
