import { useState, useRef, useEffect } from "react";
import {
  MoreHorizontal,
  Edit2,
  Trash2,
  UserPlus,
  UserCheck,
  VolumeX,
  ShieldAlert,
  Flag,
  X,
  Check,
} from "lucide-react";
import type { MockPost } from "@/data/mock";
import { useAuth } from "@/lib/AuthContext";
import { usePosts } from "@/hooks/usePosts";
import { toast } from "sonner";

interface PostOptionsMenuProps {
  post: MockPost;
  onPostDeleted?: () => void;
}

export function PostOptionsMenu({ post, onPostDeleted }: PostOptionsMenuProps) {
  const { currentUser } = useAuth();
  const {
    deletePost,
    editPost,
    toggleMuteUser,
    toggleBlockUser,
    mutedUserHandles,
    blockedUserHandles,
  } = usePosts();

  const [isOpen, setIsOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Edit modal state
  const [editBody, setEditBody] = useState(post.body);
  const [editTagsText, setEditTagsText] = useState(post.tags ? post.tags.join(", ") : "");

  const [isFollowing, setIsFollowing] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  const isOwnPost =
    currentUser && (post.author.id === currentUser.id || post.author.handle === currentUser.handle);

  const isMuted = mutedUserHandles.has(post.author.handle);
  const isBlocked = blockedUserHandles.has(post.author.handle);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleEditSubmit = () => {
    if (!editBody.trim()) return;
    const parsedTags = editTagsText
      .split(",")
      .map((t) => t.trim().replace(/^#/, ""))
      .filter(Boolean);
    editPost(post.id, editBody.trim(), parsedTags);
    setShowEditModal(false);
    toast.success("Post updated successfully");
  };

  const handleDeleteSubmit = () => {
    deletePost(post.id);
    setShowDeleteModal(false);
    onPostDeleted?.();
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* Three dots button */}
      <button
        type="button"
        aria-label="Post options"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground cursor-pointer"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 top-full z-40 mt-1 w-44 rounded-lg border border-border/80 bg-background shadow-xl p-1 font-mono text-xs animate-in fade-in-50 zoom-in-95"
        >
          {isOwnPost ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setShowEditModal(true);
                }}
                className="flex w-full items-center gap-2 rounded px-2.5 py-2 text-foreground hover:bg-accent/60 transition-colors cursor-pointer"
              >
                <Edit2 className="h-3.5 w-3.5 text-primary" />
                <span>Edit post</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setShowDeleteModal(true);
                }}
                className="flex w-full items-center gap-2 rounded px-2.5 py-2 text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                <span>Delete post</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setIsFollowing((prev) => !prev);
                  toast.success(
                    isFollowing
                      ? `Unfollowed @${post.author.handle}`
                      : `Followed @${post.author.handle}`,
                  );
                }}
                className="flex w-full items-center gap-2 rounded px-2.5 py-2 text-foreground hover:bg-accent/60 transition-colors cursor-pointer"
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="h-3.5 w-3.5 text-primary" />
                    <span>Unfollow @{post.author.handle}</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-3.5 w-3.5 text-primary" />
                    <span>Follow @{post.author.handle}</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  toggleMuteUser(post.author.handle);
                  toast.success(
                    isMuted ? `Unmuted @${post.author.handle}` : `Muted @${post.author.handle}`,
                  );
                }}
                className="flex w-full items-center gap-2 rounded px-2.5 py-2 text-foreground hover:bg-accent/60 transition-colors cursor-pointer"
              >
                <VolumeX className="h-3.5 w-3.5 text-muted-foreground" />
                <span>
                  {isMuted ? "Unmute" : "Mute"} @{post.author.handle}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  toggleBlockUser(post.author.handle);
                  toast.success(
                    isBlocked
                      ? `Unblocked @${post.author.handle}`
                      : `Blocked @${post.author.handle}`,
                  );
                }}
                className="flex w-full items-center gap-2 rounded px-2.5 py-2 text-foreground hover:bg-accent/60 transition-colors cursor-pointer"
              >
                <ShieldAlert className="h-3.5 w-3.5 text-destructive" />
                <span>
                  {isBlocked ? "Unblock" : "Block"} @{post.author.handle}
                </span>
              </button>
              <div className="my-1 border-t border-border/40" />
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  toast.success("Report submitted. Thank you.");
                }}
                className="flex w-full items-center gap-2 rounded px-2.5 py-2 text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
              >
                <Flag className="h-3.5 w-3.5 text-destructive" />
                <span>Report post</span>
              </button>
            </>
          )}
        </div>
      )}

      {/* ── EDIT POST MODAL ── */}
      {showEditModal && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-lg rounded-xl border border-border/80 bg-background p-5 shadow-2xl space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <span className="text-primary font-bold">$ post --edit</span>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div>
              <label className="block text-muted-foreground mb-1">Content</label>
              <textarea
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                rows={4}
                className="w-full resize-none rounded-md border border-border/70 bg-card/60 px-3 py-2 text-sm text-foreground focus:border-primary/60 focus:outline-none scrollbar-none"
              />
            </div>
            <div>
              <label className="block text-muted-foreground mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                value={editTagsText}
                onChange={(e) => setEditTagsText(e.target.value)}
                placeholder="rag, evals, fine-tuning"
                className="w-full rounded-md border border-border/70 bg-card/60 px-3 py-1.5 text-xs text-foreground focus:border-primary/60 focus:outline-none"
              />
            </div>
            <div className="flex gap-2 pt-2 border-t border-border/50">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="flex-1 rounded-md border border-border py-2 text-muted-foreground hover:bg-accent cursor-pointer"
              >
                cancel
              </button>
              <button
                type="button"
                onClick={handleEditSubmit}
                disabled={!editBody.trim()}
                className="flex-1 rounded-md bg-primary py-2 text-primary-foreground font-bold hover:opacity-90 cursor-pointer disabled:opacity-50"
              >
                save changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {showDeleteModal && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-md rounded-xl border border-border/80 bg-background p-5 shadow-2xl space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <span className="text-destructive font-bold">$ post --delete</span>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-foreground text-sm leading-relaxed">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 rounded-md border border-border py-2 text-muted-foreground hover:bg-accent cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                className="flex-1 rounded-md bg-destructive py-2 text-destructive-foreground font-bold hover:opacity-90 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
