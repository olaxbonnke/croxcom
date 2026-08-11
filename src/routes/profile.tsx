/**
 * /profile — Current user profile page.
 *
 * Changes:
 * - Gallery tab now uses the real GallerySection component (with localStorage)
 * - Posts tab filters from usePosts (includes local/new posts)
 * - Replies tab shows "coming soon" terminal message
 * - Reposts tab shows "coming soon"
 */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { PostCard } from "@/components/feed/PostCard";
import { CommentCard } from "@/components/feed/CommentCard";
import { GallerySection } from "@/components/profile/GallerySection";
import { mockComments } from "@/data/mock";
import { ArrowLeft, Repeat2 } from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePosts } from "@/hooks/usePosts";

import type { MockUser } from "@/data/mock";

import { useAuth } from "@/lib/AuthContext";
import { UserProfileView } from "./profile.$handle";
import { useLocation } from "@tanstack/react-router";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

const TABS = ["Posts", "Replies", "Reposts", "Gallery"] as const;
type Tab = (typeof TABS)[number];

function ProfilePage() {
  const location = useLocation();
  const pathParts = location.pathname.split("/").filter(Boolean);
  const handleFromPath = pathParts.length >= 2 && pathParts[0] === "profile" ? pathParts[1] : null;

  const { currentUser } = useAuth();

  // If viewing a different handle, render UserProfileView for that target user!
  if (handleFromPath && handleFromPath !== currentUser.handle) {
    return <UserProfileView handle={handleFromPath} />;
  }

  return <CurrentUserProfilePage />;
}

function CurrentUserProfilePage() {
  const navigate = useNavigate();
  const { currentUser, updateUser } = useAuth();
  const { posts } = usePosts();
  const userPosts = posts.filter(
    (p) => p.author.id === currentUser.id || p.author.handle === currentUser.handle,
  );

  const [activeTab, setActiveTab] = useState<Tab>("Posts");

  return (
    <AppShell>
      {/* Sticky header */}
      <div className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-md">
        <button
          onClick={() =>
            window.history.length > 1 ? window.history.back() : navigate({ to: "/" })
          }
          className="-ml-2 cursor-pointer rounded-full p-2 text-foreground transition-colors hover:bg-accent"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="font-semibold text-foreground">Profile</h1>
          <p className="font-mono text-[10px] text-muted-foreground">{userPosts.length} posts</p>
        </div>
      </div>

      {/* Profile header */}
      <div className="border-b border-border">
        <ProfileHeader
          user={currentUser}
          isCurrentUser={true}
          onUpdateUser={(updated) => updateUser(updated)}
        />
      </div>

      {/* Tab strip */}
      <div className="relative flex overflow-x-auto border-b border-border">
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative min-w-[80px] flex-1 cursor-pointer px-4 py-3 text-sm font-medium outline-none transition-colors ${
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              }`}
            >
              {tab}
              {isActive && (
                <motion.div
                  layoutId="profileTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="w-full pb-20">
        <AnimatePresence mode="popLayout">
          {/* Posts tab */}
          {activeTab === "Posts" && (
            <motion.div
              key="posts"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {userPosts.length > 0 ? (
                userPosts.map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <PostCard post={post} />
                  </motion.div>
                ))
              ) : (
                <div className="p-8 text-center font-mono text-sm text-muted-foreground">
                  &gt; no posts yet
                </div>
              )}
            </motion.div>
          )}

          {/* Gallery tab — uses real GallerySection */}
          {activeTab === "Gallery" && (
            <motion.div
              key="gallery"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <GallerySection />
            </motion.div>
          )}

          {/* Replies tab */}
          {activeTab === "Replies" && (
            <motion.div
              key="replies"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="divide-y divide-border/60 px-4"
            >
              {mockComments.filter(
                (c) => c.author.id === currentUser.id || c.author.handle === currentUser.handle,
              ).length > 0 ? (
                mockComments
                  .filter(
                    (c) => c.author.id === currentUser.id || c.author.handle === currentUser.handle,
                  )
                  .map((comment) => <CommentCard key={comment.id} comment={comment} />)
              ) : (
                <div className="py-12 text-center">
                  <p className="font-mono text-sm text-muted-foreground">
                    $ replies --user @{currentUser.handle} --empty
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">No replies yet.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Reposts tab */}
          {activeTab === "Reposts" && (
            <motion.div
              key="reposts"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="py-12 text-center">
                <p className="font-mono text-sm text-muted-foreground">
                  $ reposts --user @{currentUser.handle} --empty
                </p>
                <p className="text-sm text-muted-foreground mt-2">No reposted items yet.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
