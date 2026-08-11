import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/feed/PostCard";
import {
  Terminal,
  Home,
  Bell,
  MessageCircle,
  Bookmark,
  Heart,
  Code2,
  Search,
  User,
  Settings,
  Compass,
  Sparkles,
} from "lucide-react";

const samplePost = {
  id: "ds-sample-1",
  author: {
    id: "ds-dev",
    name: "AI Developer",
    handle: "ai_dev",
    avatarColor: "#00ff9f",
    role: "Systems Engineer",
  },
  time: "2h ago",
  body: "Testing design system PostCard specimen component.",
  stats: { comments: 5, reposts: 2, likes: 12 },
};

export const Route = createFileRoute("/design-system")({
  component: DesignSystemPage,
});

function DesignSystemPage() {
  const colors = [
    { name: "Background", value: "#111111" },
    { name: "Surface/Card", value: "#1a1a1a" },
    { name: "Primary/Accent", value: "#00ff9f" },
    { name: "Foreground", value: "#ffffff" },
    { name: "Muted", value: "#a1a1aa" },
    { name: "Border", value: "#333333" },
    { name: "Destructive", value: "#e87070" },
  ];

  const icons = [
    { name: "Terminal", icon: Terminal },
    { name: "Home", icon: Home },
    { name: "Bell", icon: Bell },
    { name: "MessageCircle", icon: MessageCircle },
    { name: "Bookmark", icon: Bookmark },
    { name: "Heart", icon: Heart },
    { name: "Code2", icon: Code2 },
    { name: "Search", icon: Search },
    { name: "User", icon: User },
    { name: "Settings", icon: Settings },
    { name: "Compass", icon: Compass },
    { name: "Sparkles", icon: Sparkles },
  ];

  return (
    <AppShell>
      <div className="sticky top-0 z-10 border-b border-border/70 bg-background/95 px-4 py-4 backdrop-blur-md">
        <h1 className="text-xl font-semibold text-foreground">Design System</h1>
        <p className="mt-0.5 font-mono text-xs text-muted-foreground">
          croxcom v0.1 — design tokens & components
        </p>
      </div>

      <div className="flex flex-col">
        {/* Colors Section */}
        <section className="border-b border-border/70 px-4 py-6">
          <h2 className="mb-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Colors
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {colors.map((color) => (
              <div key={color.name} className="overflow-hidden rounded-md border border-border/70">
                <div className="h-12 w-full" style={{ background: color.value }} />
                <div className="bg-card px-2 py-1.5">
                  <p className="font-mono text-xs text-foreground">{color.name}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">{color.value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Typography Section */}
        <section className="border-b border-border/70 px-4 py-6">
          <h2 className="mb-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Typography
          </h2>
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">The future of AI development</h2>
              <p className="mt-1 font-mono text-xs text-muted-foreground">text-2xl font-bold</p>
            </div>
            <div>
              <p className="text-[15px] leading-relaxed text-foreground">
                We are building the terminal-inspired professional community platform for AI
                developers. It's fast, minimal, and respects your attention.
              </p>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                text-[15px] leading-relaxed (Body)
              </p>
            </div>
            <div>
              <p className="font-mono text-sm text-foreground">$ npm run dev</p>
              <p className="mt-1 font-mono text-xs text-muted-foreground">font-mono text-sm</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">This is some secondary muted text.</p>
              <p className="mt-1 font-mono text-xs text-muted-foreground">text-muted-foreground</p>
            </div>
            <div>
              <p className="font-medium text-primary">Accent colored text example</p>
              <p className="mt-1 font-mono text-xs text-muted-foreground">text-primary</p>
            </div>
          </div>
        </section>

        {/* Buttons Section */}
        <section className="border-b border-border/70 px-4 py-6">
          <h2 className="mb-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Buttons
          </h2>
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col items-center gap-2">
              <Button>Default</Button>
              <p className="font-mono text-[10px] text-muted-foreground">default</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Button variant="outline">Outline</Button>
              <p className="font-mono text-[10px] text-muted-foreground">outline</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Button variant="ghost">Ghost</Button>
              <p className="font-mono text-[10px] text-muted-foreground">ghost</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Button variant="destructive">Destructive</Button>
              <p className="font-mono text-[10px] text-muted-foreground">destructive</p>
            </div>
          </div>
        </section>

        {/* PostCard Specimen Section */}
        <section className="border-b border-border/70 px-4 py-6">
          <h2 className="mb-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">
            PostCard Specimen
          </h2>
          <div className="max-w-xl">
            <PostCard post={samplePost} />
          </div>
        </section>

        {/* Icon Sample Section */}
        <section className="px-4 py-6">
          <h2 className="mb-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Icons
          </h2>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
            {icons.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.name}
                  className="flex flex-col items-center gap-1 rounded-md border border-border/70 bg-card/40 p-2 transition-colors hover:border-primary/40"
                >
                  <Icon className="h-5 w-5 text-foreground" />
                  <p className="font-mono text-[10px] text-muted-foreground">{item.name}</p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
