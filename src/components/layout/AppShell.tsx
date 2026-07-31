import { useState, type ReactNode } from "react";
import { SideNav } from "./SideNav";
import { MobileTabBar, MobileTopBar } from "./MobileNav";
import { RightRail } from "./RightRail";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Composer } from "@/components/feed/Composer";
import { ClientOnly } from "@/components/ClientOnly";
import { usePosts } from "@/hooks/usePosts";
import { mockUsers, type PostMedia } from "@/data/mock";

export function AppShell({ children }: { children: ReactNode }) {
  const [composerOpen, setComposerOpen] = useState(false);
  const { addPost } = usePosts();
  const me = mockUsers[0];

  const handlePost = ({
    body,
    tags,
    media,
    imageDataUrls,
  }: {
    body: string;
    tags: string[];
    privacy: "public" | "followers" | "private";
    imageDataUrls: string[];
    media?: PostMedia | PostMedia[];
  }) => {
    let finalMedia: PostMedia | undefined = Array.isArray(media) ? media[0] : media;
    if (!finalMedia && imageDataUrls.length > 0) {
      finalMedia =
        imageDataUrls.length === 1
          ? { kind: "image", url: imageDataUrls[0], alt: "Uploaded image" }
          : {
              kind: "image-grid",
              images: imageDataUrls.map((url, i) => ({ url, alt: `Image ${i + 1}` })),
            };
    }

    addPost({
      id: "new-" + Date.now(),
      author: me,
      time: "Just now",
      body,
      tags,
      stats: { comments: 0, reposts: 0, likes: 0 },
      ...(finalMedia ? { media: finalMedia } : {}),
    });
    setComposerOpen(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MobileTopBar onNewPost={() => setComposerOpen(true)} />

      <div className="mx-auto flex w-full max-w-7xl">
        {/* Desktop sidebar */}
        <aside
          className="sticky top-0 hidden h-screen w-[220px] shrink-0 border-r border-border/70 lg:block xl:w-[240px]"
          aria-label="Primary navigation"
        >
          <SideNav onNewPost={() => setComposerOpen(true)} />
        </aside>

        <main className="min-w-0 flex-1 border-r border-border/70 pb-20 lg:pb-0">
          {children}
        </main>

        <RightRail />
      </div>

      {/* Mobile bottom tab bar with FAB */}
      <MobileTabBar onNewPost={() => setComposerOpen(true)} />

      <ClientOnly>
        <Dialog open={composerOpen} onOpenChange={setComposerOpen}>
          <DialogContent className="border-border bg-transparent p-0 shadow-none max-w-2xl">
            <DialogTitle className="sr-only">Create New Post</DialogTitle>
            <div className="overflow-hidden rounded-md border border-border/70 bg-background">
              <Composer onSubmit={handlePost} />
            </div>
          </DialogContent>
        </Dialog>
      </ClientOnly>
    </div>
  );
}
