import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { PostCard } from "@/components/feed/PostCard";
import { CommentCard } from "@/components/feed/CommentCard";
import { GallerySection } from "@/components/profile/GallerySection";
import { mockUsers, mockComments } from "@/data/mock";
import { ArrowLeft, Repeat2 } from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePosts } from "@/hooks/usePosts";

export const Route = createFileRoute("/profile/$handle")({
  component: UserProfilePage,
});

const TABS = ["Posts", "Replies", "Reposts", "Gallery"] as const;
type Tab = (typeof TABS)[number];

function UserProfilePage() {
  const { handle } = Route.useParams();
  return <UserProfileView handle={handle} />;
}

export function UserProfileView({ handle: propHandle }: { handle?: string }) {
  const params = Route.useParams();
  const navigate = useNavigate();

  const handle = propHandle || (params as any)?.handle;
  const user = mockUsers.find((u) => u.handle === handle || u.id === handle);
  const { posts } = usePosts();
  const userPosts = user ? posts.filter((p) => p.author.id === user.id || p.author.handle === user.handle) : [];

  const [activeTab, setActiveTab] = useState<Tab>("Posts");

  if (!user) {
    return (
      <AppShell>
        <div className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-md">
          <button
            onClick={() => (window.history.length > 1 ? window.history.back() : navigate({ to: "/" }))}
            className="-ml-2 rounded-full p-2 text-foreground transition-colors hover:bg-accent cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-semibold text-foreground">User not found</h1>
        </div>
        <div className="p-8 text-center font-mono text-sm text-muted-foreground">
          &gt; 404 user_not_found
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {/* Sticky TopBar */}
      <div className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-md">
        <button
          onClick={() => (window.history.length > 1 ? window.history.back() : navigate({ to: "/" }))}
          className="-ml-2 rounded-full p-2 text-foreground transition-colors hover:bg-accent cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="font-semibold text-foreground">{user.name}</h1>
          <p className="font-mono text-xs text-muted-foreground">{userPosts.length} posts</p>
        </div>
      </div>

      <div className="border-b border-border">
        <ProfileHeader user={user} isCurrentUser={false} />
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
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              }`}
            >
              {tab}
              {isActive && (
                <motion.div
                  layoutId="profileHandleTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Feed Area */}
      <div className="w-full pb-20">
        <AnimatePresence mode="popLayout">
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
                  &gt; no posts found
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "Gallery" && (
            <motion.div
              key="gallery"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <GallerySection isCurrentUser={false} userHandle={user.handle} />
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
              {mockComments.filter((c) => c.author.id === user.id || c.author.handle === user.handle).length > 0 ? (
                mockComments
                  .filter((c) => c.author.id === user.id || c.author.handle === user.handle)
                  .map((comment) => (
                    <CommentCard key={comment.id} comment={comment} />
                  ))
              ) : (
                <div className="py-6 space-y-4">
                  <p className="font-mono text-xs text-muted-foreground border-b border-border/40 pb-2">
                    $ replies --user @{user.handle}
                  </p>
                  <CommentCard
                    comment={{
                      id: `rep-${user.handle}-1`,
                      postId: "p1",
                      author: user,
                      time: "2h ago",
                      body: "Great point! We noticed similar latency gains when tuning batch sizes for token generation.",
                      likes: 15,
                    }}
                  />
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
              {posts.slice(0, 2).map((post) => (
                <div key={post.id} className="relative">
                  <div className="flex items-center gap-1.5 px-4 pt-2.5 font-mono text-[11px] text-primary font-semibold border-t border-border/40 bg-accent/10">
                    <Repeat2 className="h-3.5 w-3.5" />
                    <span>Reposted by @{user.handle}</span>
                  </div>
                  <PostCard post={post} />
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
