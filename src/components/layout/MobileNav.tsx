import { Link } from "@tanstack/react-router";
import { useComposerVisibility } from "@/hooks/useComposerVisibility";
import { Bell, Home, Library, Menu, MessageSquare, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { SideNav } from "./SideNav";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";

export function MobileTopBar({ onNewPost }: { onNewPost?: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-border/70 bg-background/80 px-3 backdrop-blur-md lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Open navigation">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-[70vw] max-w-[280px] border-r border-border/70 bg-background p-0"
        >
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SideNav onNavigate={() => setOpen(false)} onNewPost={onNewPost} />
        </SheetContent>
      </Sheet>

      <Link to="/" className="group flex items-center gap-2">
        <Logo size="sm" />
      </Link>

      <ThemeToggle />
    </header>
  );
}

const TABS = [
  { to: "/", label: "Home", icon: Home, exact: true },
  { to: "/library", label: "Library", icon: Library },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/messages", label: "Messages", icon: MessageSquare },
] as const;

export function MobileTabBar({ onNewPost }: { onNewPost?: () => void }) {
  const showFab = useComposerVisibility();

  return (
    <>
      {/* Floating plus button for mobile/tablet — only on home screens */}
      {showFab && (
        <button
          type="button"
          onClick={onNewPost}
          aria-label="Create post"
          className="fixed bottom-20 right-4 z-40 grid h-14 w-14 cursor-pointer place-items-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-105 active:scale-95 lg:hidden"
        >
          <Plus className="h-7 w-7 stroke-[2.5]" />
        </button>
      )}

      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-border/70 bg-background/95 backdrop-blur-md lg:hidden"
      >
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <Link
              key={t.to}
              to={t.to}
              activeOptions={{ exact: "exact" in t ? t.exact : false }}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-mono text-muted-foreground transition-colors",
                "data-[status=active]:text-primary data-[status=active]:font-semibold",
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{t.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
