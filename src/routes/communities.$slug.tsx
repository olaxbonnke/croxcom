import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { PostCard } from "@/components/feed/PostCard";
import { Composer } from "@/components/feed/Composer";
import { EmptyState } from "@/components/ui/EmptyState";
import { mockCommunities, mockUsers, type PostMedia } from "@/data/mock";
import { ArrowLeft, Inbox } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { usePosts } from "@/hooks/usePosts";

import { useCommunities } from "@/lib/CommunityContext";
import { useAuth } from "@/lib/AuthContext";
import { SHOW_DEMO_DATA } from "@/lib/config";
import { isSupabaseConfigured, uploadPostImage } from "@/lib/supabase";

export const Route = createFileRoute("/communities/$slug")({
  component: CommunityPage,
});

function CommunityPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const { createdCommunities, isMember, joinCommunity, leaveCommunity } = useCommunities();
  const allCommunities = [...mockCommunities, ...createdCommunities];
  const community = allCommunities.find((c) => c.slug === slug || c.id === slug);
  const [activeTab, setActiveTab] = useState<"Posts" | "Members" | "About">("Posts");
  const { posts, addPost } = usePosts();
  const { currentUser } = useAuth();
  const joined = community ? isMember(community.id) : false;

  if (!community) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="font-mono text-4xl text-foreground font-bold mb-4">404</div>
          <div className="font-mono text-sm text-muted-foreground mb-6">community_not_found</div>
          <button
            onClick={() =>
              window.history.length > 1 ? window.history.back() : navigate({ to: "/browse" })
            }
            className="flex items-center gap-2 font-mono text-sm text-primary hover:underline cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            cd /browse
          </button>
        </div>
      </AppShell>
    );
  }

  const communityPosts = posts.filter(
    (p) => p.community?.id === community.id || p.community?.slug === community.slug,
  );

  const handleCommunityPost = async ({
    body,
    tags,
    media,
    imageDataUrls,
    imageFiles,
  }: {
    body: string;
    tags: string[];
    privacy: "public" | "followers" | "private";
    imageDataUrls: string[];
    imageFiles?: File[];
    media?: PostMedia | PostMedia[];
  }) => {
    let finalMedia: PostMedia | undefined = Array.isArray(media) ? media[0] : media;
    let imageUrls: string[] | undefined;

    // Upload images to Supabase Storage if configured
    if (isSupabaseConfigured && currentUser?.id && imageFiles && imageFiles.length > 0) {
      const uploadedUrls = await Promise.all(
        imageFiles.map((file) => uploadPostImage(currentUser.id, file)),
      );
      const validUrls = uploadedUrls.filter((url): url is string => url !== null);
      if (validUrls.length > 0) {
        imageUrls = validUrls;
        finalMedia =
          validUrls.length === 1
            ? { kind: "image", url: validUrls[0], alt: "Uploaded image" }
            : {
                kind: "image-grid",
                images: validUrls.map((url, i) => ({ url, alt: `Image ${i + 1}` })),
              };
      }
    } else if (!finalMedia && imageDataUrls.length > 0) {
      finalMedia =
        imageDataUrls.length === 1
          ? { kind: "image", url: imageDataUrls[0], alt: "Uploaded image" }
          : {
              kind: "image-grid",
              images: imageDataUrls.map((url, i) => ({ url, alt: `Image ${i + 1}` })),
            };
    }

    addPost({
      id: `comm-post-${Date.now()}`,
      author: currentUser,
      community,
      time: "Just now",
      body,
      tags,
      stats: { comments: 0, reposts: 0, likes: 0 },
      ...(finalMedia ? { media: finalMedia } : {}),
      ...(imageUrls ? { imageUrls } : {}),
    });
  };

  return (
    <AppShell>
      {/* Hero section */}
      <div className="px-4 py-6 border-b border-border/70">
        <h1 className="font-mono text-xl font-bold text-foreground">/{community.name}</h1>
        <p className="text-sm text-muted-foreground mt-1">{community.description}</p>

        <div className="mt-3 flex items-center gap-4 flex-wrap font-mono text-xs text-muted-foreground">
          <span>
            <span className="text-foreground font-medium">
              {(community.members + (joined ? 1 : 0)).toLocaleString()}
            </span>{" "}
            members
          </span>
          <span>
            <span className="text-foreground font-medium">{communityPosts.length}</span> posts
          </span>
        </div>

        {community.tags && community.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {community.tags.map((tag) => (
              <span
                key={tag}
                className="inline-block rounded border border-border/70 bg-card px-1.5 py-0.5 text-[10px] text-muted-foreground font-mono"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <button
          onClick={() => (joined ? leaveCommunity(community.id) : joinCommunity(community.id))}
          className={`mt-4 font-mono text-sm rounded-md px-5 py-2 transition-colors cursor-pointer ${
            joined
              ? "border border-border/70 text-foreground hover:bg-card"
              : "bg-primary text-primary-foreground hover:opacity-90 font-semibold"
          }`}
        >
          {joined ? "leave" : "join"}
        </button>
      </div>

      {/* Tab strip */}
      <div className="flex border-b border-border/70 font-mono text-sm">
        {(["Posts", "Members", "About"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 relative ${
              activeTab === tab ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div
                layoutId="community-tab-underline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="py-2">
        {activeTab === "Posts" && (
          <div className="flex flex-col">
            {/* In-community composer — restricted to members */}
            {joined ? (
              <div className="border-b border-border/70 bg-card/30">
                <Composer
                  onSubmit={handleCommunityPost}
                  placeholder={`Post to /${community.name}…`}
                  compact
                />
              </div>
            ) : (
              <div className="p-4 border-b border-border/70 bg-card/20 text-center font-mono text-xs text-muted-foreground flex flex-col items-center gap-2">
                <span>Join /{community.name} to participate and share updates with this community</span>
                <button
                  onClick={() => joinCommunity(community.id)}
                  className="rounded-md bg-primary/10 border border-primary/40 px-3 py-1 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
                >
                  + Join community
                </button>
              </div>
            )}

            {communityPosts.length > 0 ? (
              <AnimatePresence>
                {communityPosts.map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <PostCard post={post} />
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <EmptyState
                icon={<Inbox className="h-5 w-5" />}
                title="No posts in this community yet"
                description="Be the first one to start a discussion here."
              />
            )}
          </div>
        )}

        {activeTab === "Members" && (
          <div className="flex gap-3 px-4 py-4 flex-wrap">
            {(SHOW_DEMO_DATA ? mockUsers : []).map((user) => (
              <Link
                key={user.id}
                to="/profile/$handle"
                params={{ handle: user.handle }}
                className="flex-1 min-w-[150px] rounded-md border border-border/70 bg-card/40 px-3 py-2.5 flex items-center gap-2 hover:bg-accent/30 transition-colors"
              >
                <div
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-md font-mono text-xs"
                  style={{ background: user.avatarColor, color: "#0a0a0a" }}
                >
                  {user.name
                    .split(" ")
                    .map((p) => p[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div className="min-w-0 leading-tight">
                  <div className="truncate text-sm font-medium text-foreground">{user.name}</div>
                  <div className="truncate font-mono text-xs text-muted-foreground">
                    @{user.handle}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {activeTab === "About" && (
          <div className="px-4 py-5 space-y-6">
            <div>
              <h3 className="font-mono text-sm text-foreground mb-2">Description</h3>
              <p className="text-sm text-foreground leading-relaxed">
                {community.description}
                <br />
                <br />
                This is a great place to connect with other developers interested in this topic,
                share your projects, and ask questions.
              </p>
            </div>

            {community.tags && community.tags.length > 0 && (
              <div>
                <h3 className="font-mono text-sm text-foreground mb-2">Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {community.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-md border border-border/70 bg-card px-2.5 py-1 text-xs text-muted-foreground font-mono"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-border/50">
              <span className="font-mono text-xs text-muted-foreground">
                Created • Oct 24, 2023
              </span>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
