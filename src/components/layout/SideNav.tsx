import { Link, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  Bookmark,
  Compass,
  Home,
  Library,
  MessageSquare,
  Settings,
  Sparkles,
  User,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/AuthContext";
import { useComposerVisibility } from "@/hooks/useComposerVisibility";
import { ThemeToggle } from "@/components/theme-toggle";

type NavItem = { label: string; to: string; icon: ComponentType<SVGProps<SVGSVGElement>> };

const NAV: NavItem[] = [
  { label: "Home", to: "/", icon: Home },
  { label: "Browse", to: "/browse", icon: Compass },
  { label: "Library", to: "/library", icon: Library },
  { label: "Notifications", to: "/notifications", icon: Bell },
  { label: "Messages", to: "/messages", icon: MessageSquare },
  { label: "Bookmarks", to: "/bookmarks", icon: Bookmark },
  { label: "Profile", to: "/profile", icon: User },
  { label: "Premium", to: "/premium", icon: Sparkles },
  { label: "Settings", to: "/more", icon: Settings },
];

export function SideNav({
  onNavigate,
  onNewPost,
}: {
  onNavigate?: () => void;
  onNewPost?: () => void;
}) {
  const { currentUser } = useAuth();
  const showComposer = useComposerVisibility();

  return (
    <nav className="flex h-full flex-col gap-1 px-3 py-4" aria-label="Primary">
      <Link
        to="/"
        onClick={onNavigate}
        className="group mb-4 flex items-center gap-2 rounded-md px-3 py-2 text-foreground hover:bg-accent/40 transition-colors"
      >
        <Logo size="md" />
      </Link>

      <ul className="flex flex-col gap-0.5">
        {NAV.map((item) => (
          <li key={item.to}>
            <NavLinkItem item={item} onNavigate={onNavigate} />
          </li>
        ))}
      </ul>

      {/* Desktop Add Post Button */}
      {!onNavigate && showComposer && (
        <button
          type="button"
          onClick={onNewPost}
          className="mt-3 hidden lg:flex w-full items-center justify-center gap-2 rounded-md bg-primary py-2.5 font-mono text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
        >
          <span>$ new post</span>
        </button>
      )}

      <div className="px-3 mb-2 mt-auto">
        <ThemeToggle />
      </div>

      <Link
        to="/profile"
        className="flex items-center gap-2 rounded-md border border-border/70 bg-card/40 px-3 py-2 hover:bg-accent/30 transition-colors"
      >
        <div
          aria-hidden
          className="grid h-8 w-8 shrink-0 place-items-center rounded-md font-mono text-xs overflow-hidden"
          style={{ background: currentUser.avatarColor, color: "#0a0a0a" }}
        >
          {currentUser.avatar ? (
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="h-full w-full object-cover"
            />
          ) : (
            currentUser.name
              .split(" ")
              .map((p) => p[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()
          )}
        </div>
        <div className="min-w-0 leading-tight">
          <div className="truncate text-sm text-foreground font-medium">{currentUser.name}</div>
          <div className="truncate font-mono text-xs text-muted-foreground">
            @{currentUser.handle}
          </div>
        </div>
      </Link>
    </nav>
  );
}

function NavLinkItem({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      onClick={onNavigate}
      activeOptions={{ exact: item.to === "/" }}
      className={cn(
        "group flex items-center gap-3 rounded-md px-3 py-2 text-[15px] text-muted-foreground",
        "transition-colors hover:text-foreground hover:bg-accent/60",
        "data-[status=active]:text-foreground data-[status=active]:bg-accent/70",
      )}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" />
      <span>{item.label}</span>
    </Link>
  );
}
