import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { CommentCard } from "@/components/feed/CommentCard";
import { Lightbox } from "@/components/feed/Lightbox";
import { FeedSkeleton } from "@/components/feed/Skeleton";
import type { PostMedia } from "@/data/mock";
import {
  ArrowLeft,
  MessageCircle,
  Repeat2,
  Heart,
  Bookmark,
  Share2,
  MoreHorizontal,
  Play,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useBookmarks } from "@/hooks/useBookmarks";
import { usePosts } from "@/hooks/usePosts";
import { PostOptionsMenu } from "@/components/feed/PostOptionsMenu";

export const Route = createFileRoute("/posts/$postId")({
  component: PostViewRoute,
});

function PostViewRoute() {
  const { postId } = Route.useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [replyValue, setReplyValue] = useState("");
  const { savedPosts, toggleBookmark } = useBookmarks();
  const {
    posts,
    comments,
    addComment,
    addReply,
    toggleLike,
    toggleRepost,
    likedPostIds,
    repostedPostIds,
  } = usePosts();

  const saved = savedPosts.includes(postId);
  const liked = likedPostIds.has(postId);
  const reposted = repostedPostIds.has(postId);

  const post = posts.find((p) => p.id === postId);
  const postComments = comments.filter((c) => c.postId === postId);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 200);
    return () => clearTimeout(timer);
  }, [postId]);

  const handleAddComment = () => {
    if (!replyValue.trim() || !post) return;
    addComment(post.id, replyValue.trim());
    setReplyValue("");
  };

  const handleAddReply = (parentCommentId: string, replyText: string) => {
    if (!post) return;
    addReply(post.id, parentCommentId, replyText);
  };

  if (!post && !isLoading) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
          <div className="mb-3 font-mono text-xs text-muted-foreground">
            ~/croxcom $ cat post.md
          </div>
          <h1 className="font-mono text-4xl font-bold text-foreground">404</h1>
          <h2 className="mt-3 text-lg font-semibold text-foreground">Post not found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This post may have been removed or never existed.
          </p>
          <button
            onClick={() => navigate({ to: "/" })}
            className="mt-6 flex items-center gap-2 px-4 py-2 font-mono text-sm text-primary border border-primary/40 rounded-md hover:bg-primary/10 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            $ cd ~
          </button>
        </div>
      </AppShell>
    );
  }

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  return (
    <AppShell>
      {/* Sticky top header bar */}
      <div className="sticky top-0 z-10 border-b border-border/70 bg-background/80 backdrop-blur-md px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => (window.history.length > 1 ? window.history.back() : navigate({ to: "/" }))}
          aria-label="Go back"
          className="p-1.5 -ml-1.5 text-muted-foreground hover:text-foreground rounded-md transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="text-sm font-medium text-foreground">Post</span>
      </div>

      {isLoading ? (
        <FeedSkeleton />
      ) : post ? (
        <>
          {/* Full post content section */}
          <div className="px-4 py-5 border-b border-border/70">
            {/* Author row */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-md font-mono text-xs"
                  style={{ background: post.author.avatarColor, color: "#0a0a0a" }}
                >
                  {getInitials(post.author.name)}
                </div>
                <div className="flex flex-col leading-tight">
                  <Link
                    to="/profile/$handle"
                    params={{ handle: post.author.handle }}
                    className="text-sm font-medium text-foreground hover:underline"
                  >
                    {post.author.name}
                  </Link>
                  <div className="flex items-center gap-1.5">
                    <Link
                      to="/profile/$handle"
                      params={{ handle: post.author.handle }}
                      className="font-mono text-xs text-muted-foreground hover:text-primary"
                    >
                      @{post.author.handle}
                    </Link>
                    <span className="text-muted-foreground text-[10px]">·</span>
                    <span className="font-mono text-xs text-muted-foreground">{post.time}</span>
                    {post.community && (
                      <>
                        <span className="text-muted-foreground text-[10px]">in</span>
                        <Link
                          to="/communities/$slug"
                          params={{ slug: post.community.slug }}
                          className="font-mono text-xs text-primary hover:underline"
                        >
                          /{post.community.name}
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <PostOptionsMenu post={post} onPostDeleted={() => navigate({ to: "/" })} />
            </div>

            {/* Full body text — no clamping */}
            <p className="text-[15px] leading-[1.65] text-foreground whitespace-pre-wrap mt-4">
              {post.body}
            </p>

            {/* Media block */}
            {post.media && (
              <div className="mt-4">
                <MediaBlock media={post.media} />
              </div>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md border border-border/70 bg-background/40 px-2 py-0.5 font-mono text-xs text-muted-foreground hover:border-primary/60 hover:text-primary transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Engagement stats */}
            <div className="mt-5 mb-3 flex items-center gap-4 font-mono text-xs text-muted-foreground border-t border-border/70 pt-4">
              <span>
                <span className="text-foreground font-medium">{post.stats.comments}</span> replies
              </span>
              <span>
                <span className="text-foreground font-medium">{post.stats.reposts}</span> reposts
              </span>
              <span>
                <span className="text-foreground font-medium">{post.stats.likes}</span> likes
              </span>
            </div>

            {/* Engagement buttons row */}
            <div className="flex items-center justify-between border-t border-border/70 pt-3">
              <button
                type="button"
                aria-label="Reply"
                className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-primary transition-colors rounded-md px-2 py-1 hover:bg-accent/60"
              >
                <MessageCircle className="h-[15px] w-[15px]" />
                <span>{post.stats.comments}</span>
              </button>
              <button
                type="button"
                aria-label={reposted ? "Undo repost" : "Repost"}
                aria-pressed={reposted}
                onClick={(e) => {
                  e.preventDefault();
                  toggleRepost(postId);
                }}
                className={cn(
                  "flex items-center gap-1.5 font-mono text-xs transition-colors rounded-md px-2 py-1 hover:bg-accent/60",
                  reposted ? "text-primary" : "text-muted-foreground hover:text-primary",
                )}
              >
                <Repeat2 className="h-[15px] w-[15px]" />
                <span>{post.stats.reposts}</span>
              </button>
              <button
                type="button"
                aria-label={liked ? "Unlike" : "Like"}
                aria-pressed={liked}
                onClick={(e) => {
                  e.preventDefault();
                  toggleLike(postId);
                }}
                className={cn(
                  "flex items-center gap-1.5 font-mono text-xs transition-colors rounded-md px-2 py-1 hover:bg-accent/60",
                  liked ? "text-primary" : "text-muted-foreground hover:text-primary",
                )}
              >
                <Heart className={cn("h-[15px] w-[15px]", liked && "fill-current")} />
                <span>{post.stats.likes}</span>
              </button>
              <button
                type="button"
                aria-label={saved ? "Remove bookmark" : "Bookmark"}
                aria-pressed={saved}
                onClick={(e) => {
                  e.preventDefault();
                  toggleBookmark(postId);
                }}
                className={cn(
                  "flex items-center gap-1.5 font-mono text-xs transition-colors rounded-md px-2 py-1 hover:bg-accent/60",
                  saved ? "text-primary" : "text-muted-foreground hover:text-primary",
                )}
              >
                <Bookmark className={cn("h-[15px] w-[15px]", saved && "fill-current")} />
              </button>
              <button
                type="button"
                aria-label="Share"
                className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors rounded-md px-2 py-1 hover:bg-accent/60"
              >
                <Share2 className="h-[15px] w-[15px]" />
              </button>
            </div>
          </div>

          {/* Replies divider */}
          <div className="py-3 border-b border-border/70 flex justify-center bg-background/30">
            <span className="font-mono text-xs text-muted-foreground">— replies —</span>
          </div>

          {/* Comments section */}
          <div className="pb-24 md:pb-0">
            {postComments.length > 0 ? (
              postComments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  onAddReply={handleAddReply}
                />
              ))
            ) : (
              <div className="py-16 flex flex-col items-center justify-center text-center px-4">
                <MessageCircle className="h-8 w-8 text-muted-foreground/30 mb-3" />
                <h3 className="font-medium text-foreground text-[15px]">No replies yet</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Be the first to share your thoughts.
                </p>
              </div>
            )}
          </div>
        </>
      ) : null}

      {/* Sticky reply composer */}
      {!isLoading && post && (
        <div className="sticky bottom-14 lg:bottom-0 bg-background/95 backdrop-blur border-t border-border/70 px-4 py-3 flex gap-3 items-center z-20">
          <div className="font-mono text-xs text-muted-foreground shrink-0">&gt;</div>
          <textarea
            value={replyValue}
            onChange={(e) => setReplyValue(e.target.value)}
            placeholder="add a reply..."
            rows={1}
            className="flex-1 bg-transparent font-mono text-[14px] text-foreground placeholder:text-muted-foreground/70 resize-none focus:outline-none"
          />
          <button
            type="button"
            onClick={handleAddComment}
            disabled={!replyValue.trim()}
            className="shrink-0 h-9 px-4 bg-primary text-primary-foreground font-mono text-xs rounded-md hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            reply
          </button>
        </div>
      )}
    </AppShell>
  );
}

// ─── Inline media renderer ────────────────────────────────────────────────────

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
  const [activeImage, setActiveImage] = useState<{ url: string; alt?: string } | null>(null);
  const [copied, setCopied] = useState(false);

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
          className="overflow-hidden rounded-lg border border-border/70 cursor-pointer group"
        >
          <img
            src={media.url}
            alt={media.alt}
            loading="lazy"
            className="aspect-[16/10] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
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
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-destructive/80" />
              <div className="h-2 w-2 rounded-full bg-yellow-500/80" />
              <div className="h-2 w-2 rounded-full bg-primary/80" />
              <span className="ml-2 font-mono text-[10px] text-muted-foreground">
                {media.language || "code"}
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                copyCode();
              }}
              className="font-mono text-[10px] text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            >
              {copied ? "✓ copied" : "copy"}
            </button>
          </div>
          <div className="flex bg-[#0d0d0d]">
            <div className="flex w-8 shrink-0 flex-col items-end border-r border-zinc-800 bg-zinc-900/50 py-3 pr-2 font-mono text-[13px] text-zinc-500 select-none pointer-events-none">
              {media.code.split("\n").map((_, i) => (
                <span key={i} className="leading-relaxed">
                  {i + 1}
                </span>
              ))}
            </div>
            <pre
              className="flex-1 overflow-x-auto p-3 font-mono text-[13px] leading-relaxed text-zinc-100 scrollbar-none"
              aria-label={`${media.language} code block`}
            >
              <code>{media.code}</code>
            </pre>
          </div>
        </div>
      )}
    </>
  );
}
