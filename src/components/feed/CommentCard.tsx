import { useState, useEffect } from "react";
import { Heart, MessageCircle, CornerDownRight } from "lucide-react";
import { mockUsers, type MockComment } from "@/data/mock";
import { cn } from "@/lib/utils";
import { extractUrl, LinkPreviewCard } from "./LinkPreviewCard";

import { Link } from "@tanstack/react-router";

interface CommentCardProps {
  comment: MockComment;
  depth?: number;
  onAddReply?: (parentCommentId: string, replyText: string) => void;
}

export function CommentCard({ comment, depth = 0, onAddReply }: CommentCardProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.likes);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [localReplies, setLocalReplies] = useState<MockComment[]>(comment.replies || []);

  useEffect(() => {
    setLocalReplies(comment.replies || []);
  }, [comment.replies]);

  const toggleLike = () => {
    setLiked((prev) => {
      const next = !prev;
      setLikeCount((c) => c + (next ? 1 : -1));
      return next;
    });
  };

  const handleReplySubmit = () => {
    if (!replyText.trim()) return;

    const newReply: MockComment = {
      id: `reply-${Date.now()}`,
      postId: comment.postId,
      author: mockUsers[0], // current user Ada
      time: "Just now",
      body: replyText.trim(),
      likes: 0,
    };

    setLocalReplies((prev) => [...prev, newReply]);
    onAddReply?.(comment.id, replyText.trim());
    setReplyText("");
    setShowReplyForm(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const detectedUrl = extractUrl(comment.body);

  return (
    <div className={cn("flex gap-3 py-3", depth === 0 ? "border-b border-border/70" : "pt-2 pb-1")}>
      <Link
        to="/profile/$handle"
        params={{ handle: comment.author.handle }}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-md font-mono text-xs font-bold hover:opacity-80 transition-opacity"
        style={{ background: comment.author.avatarColor || "#a1a1aa", color: "#0a0a0a" }}
      >
        {comment.author.avatar ? (
          <img src={comment.author.avatar} alt={comment.author.name} className="h-full w-full object-cover rounded-md" />
        ) : (
          getInitials(comment.author.name)
        )}
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Link
            to="/profile/$handle"
            params={{ handle: comment.author.handle }}
            className="text-sm font-medium text-foreground hover:underline"
          >
            {comment.author.name}
          </Link>
          <Link
            to="/profile/$handle"
            params={{ handle: comment.author.handle }}
            className="font-mono text-xs text-muted-foreground hover:text-primary"
          >
            @{comment.author.handle}
          </Link>
          <span className="text-muted-foreground text-xs">·</span>
          <span className="font-mono text-xs text-muted-foreground">{comment.time}</span>
        </div>

        <p className="text-[14.5px] leading-relaxed text-foreground mt-1 whitespace-pre-wrap">
          {comment.body}
        </p>

        {detectedUrl && <LinkPreviewCard url={detectedUrl} />}

        {/* Comment actions */}
        <div className="flex items-center gap-4 mt-2">
          <button
            type="button"
            onClick={toggleLike}
            className={cn(
              "flex items-center gap-1.5 text-xs font-mono transition-colors group cursor-pointer",
              liked ? "text-primary font-semibold" : "text-muted-foreground hover:text-primary"
            )}
          >
            <Heart className={cn("h-3.5 w-3.5", liked && "fill-current")} />
            <span>{likeCount > 0 ? likeCount : "like"}</span>
          </button>

          {depth < 2 && (
            <button
              type="button"
              onClick={() => setShowReplyForm((prev) => !prev)}
              className="flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>reply</span>
            </button>
          )}
        </div>

        {/* Inline reply form */}
        {showReplyForm && (
          <div className="mt-2.5 flex items-center gap-2">
            <CornerDownRight className="h-4 w-4 text-primary shrink-0" />
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleReplySubmit()}
              placeholder={`Reply to @${comment.author.handle}…`}
              className="flex-1 rounded-md border border-border/70 bg-background/60 px-3 py-1.5 font-mono text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary/60 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleReplySubmit}
              disabled={!replyText.trim()}
              className="rounded-md bg-primary px-3 py-1.5 font-mono text-xs text-primary-foreground hover:opacity-90 disabled:opacity-50 cursor-pointer"
            >
              reply
            </button>
          </div>
        )}

        {/* Nested replies */}
        {localReplies.length > 0 && (
          <div className="border-l border-border/50 pl-3 mt-2.5 space-y-1">
            {localReplies.map((reply) => (
              <CommentCard
                key={reply.id}
                comment={reply}
                depth={depth + 1}
                onAddReply={onAddReply}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
