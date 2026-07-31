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
              needsClamp && !expanded && "line-clamp-6"
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
              icon={
                <Heart className={cn("h-[15px] w-[15px]", liked && "fill-current")} />
              }
            />
            <EngageButton
              label={saved ? "Remove bookmark" : "Bookmark"}
              active={saved}
              activeClass="text-primary"
              onClick={() => toggleBookmark(post.id)}
              icon={
                <Bookmark className={cn("h-[15px] w-[15px]", saved && "fill-current")} />
              }
            />
            <EngageButton
              label="Share"
              icon={<Share2 className="h-[15px] w-[15px]" />}
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: `Post by ${post.author.name}`, url: window.location.href });
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
        active && (activeClass ?? "text-primary")
      )}
    >
      {icon}
      {typeof count === "number" && (
        <span className="tabular-nums">{formatCount(count)}</span>
      )}
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
  const [copied, setCopied] = useState(false);
  const [activeImage, setActiveImage] = useState<{ url: string; alt?: string } | null>(null);

  const copyCode = () => {
    if (media.kind === "code") {
      navigator.clipboard.writeText(media.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <Lightbox
        src={activeImage?.url ?? null}
        alt={activeImage?.alt}
        onClose={() => setActiveImage(null)}
      />

      {media.kind === "image" && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setActiveImage({ url: media.url, alt: media.alt });
          }}
          className="overflow-hidden rounded-lg border border-border/70 cursor-pointer group max-h-[400px]"
        >
          <img
            src={media.url}
            alt={media.alt}
            loading="lazy"
            className="w-full max-h-[400px] object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </div>
      )}

      {media.kind === "image-grid" && (
        <div className="grid grid-cols-2 gap-1 overflow-hidden rounded-lg border border-border/70">
          {media.images.slice(0, 4).map((img, i) => (
            <div
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                setActiveImage({ url: img.url, alt: img.alt });
              }}
              className="overflow-hidden cursor-pointer group"
            >
              <img
                src={img.url}
                alt={img.alt}
                loading="lazy"
                className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
            </div>
          ))}
        </div>
      )}

      {media.kind === "video" && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setActiveImage({ url: media.thumbnail, alt: media.title });
          }}
          className="relative overflow-hidden rounded-lg border border-border/70 cursor-pointer group"
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

      {media.kind === "code" && (
        <div className="flex flex-col overflow-hidden rounded-md border border-border/70 bg-[#0d0d0d] shadow-sm">
          <div className="flex items-center justify-between border-b border-border/40 bg-muted/10 px-3 py-1.5">
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
              <span className="text-primary font-semibold">{">"}</span>
              <span className="text-foreground/80 font-medium">prompt:</span>
              <span className="text-muted-foreground/80 font-mono">[{media.language || "code"}]</span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(media.code);
              }}
              className="rounded bg-accent/40 px-2 py-0.5 font-mono text-[10px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground cursor-pointer"
            >
              copy code
            </button>
          </div>
            <pre
              className="flex-1 overflow-x-auto p-3 font-mono text-[13px] leading-relaxed text-zinc-100 scrollbar-none"
              aria-label={`${media.language} code block`}
            >
              <code>{media.code}</code>
            </pre>
          </div>
      )}
    </>
  );
}
