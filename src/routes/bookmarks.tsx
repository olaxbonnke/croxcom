/**
 * Bookmarks page.
 *
 * Changes from original:
 * - Now reads from the BookmarkContext (savedPosts) instead of hardcoded mockPosts.
 * - Merges mockPosts + local user-created posts from usePosts() to find bookmarked items.
 * - clearBookmarks button wired to context.
 * - Shows count in header.
 */
import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PostCard } from "@/components/feed/PostCard";
import { useBookmarks } from "@/hooks/useBookmarks";
import { usePosts } from "@/hooks/usePosts";
import { toast } from "sonner";

export const Route = createFileRoute("/bookmarks")({
  component: BookmarksPage,
});

function BookmarksPage() {
  const { savedPosts, clearBookmarks } = useBookmarks();
  const { posts } = usePosts();

  // Find the full post objects for each saved ID (covers both mock + local posts)
  const bookmarkedPosts = posts.filter((p) => savedPosts.includes(p.id));

  const handleClear = () => {
    if (bookmarkedPosts.length === 0) return;
    clearBookmarks();
    toast.success("Bookmarks cleared");
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/70 bg-background/80 px-4 py-4 backdrop-blur-md">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Bookmarks</h1>
          <p className="mt-0.5 font-mono text-xs text-muted-foreground">
            $ posts saved by @you
            {bookmarkedPosts.length > 0 && (
              <span className="ml-2 text-primary">({bookmarkedPosts.length})</span>
            )}
          </p>
        </div>
        {bookmarkedPosts.length > 0 && (
          <button
            onClick={handleClear}
            className="font-mono text-xs text-muted-foreground/70 transition-colors hover:text-destructive"
          >
            clear all
          </button>
        )}
      </div>

      {/* Feed */}
      <AnimatePresence mode="popLayout">
        {bookmarkedPosts.length > 0 ? (
          bookmarkedPosts.map((post) => (
            <motion.div
              key={post.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, overflow: "hidden" }}
              transition={{ duration: 0.18 }}
            >
              <PostCard post={post} />
            </motion.div>
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center px-4"
          >
            <Bookmark className="mb-4 h-12 w-12 text-muted-foreground/30" />
            <p className="font-mono text-xs text-muted-foreground/50 mb-2">~/croxcom $</p>
            <h2 className="text-base font-medium text-foreground">No bookmarks yet</h2>
            <p className="mt-2 font-mono text-sm text-muted-foreground">
              $ bookmark posts to save them here
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
