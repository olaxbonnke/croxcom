import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import {
  Sparkles,
  Check,
  ArrowLeft,
  Terminal,
  Cpu,
  Zap,
  Shield,
  Code2,
  CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/premium")({
  component: PremiumPage,
});

const FEATURES = [
  { text: "Extended post character limit (2,000 chars)", highlight: true },
  { text: "Executable Code Blocks in terminal viewer", highlight: true },
  { text: "Private Communities & Dev Channels", highlight: true },
  { text: "Advanced analytics on your posts & snippets", highlight: false },
  { text: "Verified Developer badge on profile", highlight: false },
  { text: "Priority indexing in search & feed algorithm", highlight: false },
  { text: "API access for custom integrations", highlight: false },
];

function PremiumPage() {
  const navigate = useNavigate();
  const [subscribed, setSubscribed] = useState(() => {
    try {
      return localStorage.getItem("croxcom_pro_waitlist") === "true";
    } catch {
      return false;
    }
  });

  const handleToggleSubscribed = () => {
    setSubscribed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("croxcom_pro_waitlist", String(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  return (
    <AppShell>
      {/* Sticky top bar with smart back button */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-border/70 bg-background/80 px-4 py-3 backdrop-blur-md">
        <button
          type="button"
          onClick={() =>
            window.history.length > 1 ? window.history.back() : navigate({ to: "/" })
          }
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-base font-semibold text-foreground">CroxCom Premium</h1>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-10">
        {/* Header section */}
        <div className="text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 font-mono text-xs text-primary shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            <span>croxcom_pro v1.0</span>
          </div>

          <h2 className="text-3xl font-extrabold text-foreground tracking-tight sm:text-4xl">
            Supercharge Your AI Dev Workflow
          </h2>
          <p className="mt-3 text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
            The elite membership tier for AI researchers, prompt engineers, and backend builders.
          </p>
        </div>

        {/* Pricing comparison grid */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {/* Free tier card */}
          <div className="rounded-xl border border-border/70 bg-card/40 p-6 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-mono text-base font-semibold text-foreground">Builder</h3>
                <span className="font-mono text-xs text-muted-foreground border border-border px-2 py-0.5 rounded">
                  Free
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Standard access for community members.
              </p>
              <div className="mt-4 font-mono text-2xl font-bold text-foreground">
                $0 <span className="text-xs text-muted-foreground font-normal">/ month</span>
              </div>

              <ul className="mt-6 space-y-2.5 font-mono text-xs text-muted-foreground border-t border-border/40 pt-4">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-primary" />
                  <span>Standard 500-char posts</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-primary" />
                  <span>Public community feeds</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-primary" />
                  <span>Code snippet sharing</span>
                </li>
              </ul>
            </div>

            <button
              disabled
              className="mt-6 w-full rounded-md border border-border py-2 font-mono text-xs text-muted-foreground cursor-default"
            >
              Current Plan
            </button>
          </div>

          {/* Premium Pro tier card */}
          <div className="relative rounded-xl border-2 border-primary/60 bg-card/80 p-6 flex flex-col justify-between shadow-lg shadow-primary/10">
            <div className="absolute -top-3 right-4 rounded-full bg-primary px-3 py-0.5 font-mono text-[10px] font-bold text-primary-foreground">
              RECOMMENDED
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-mono text-base font-semibold text-primary">Pro Builder</h3>
                <span className="font-mono text-xs text-primary border border-primary/40 bg-primary/10 px-2 py-0.5 rounded">
                  PRO
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Full power for professional AI developers.
              </p>
              <div className="mt-4 font-mono text-3xl font-bold text-foreground">
                $19 <span className="text-xs text-muted-foreground font-normal">/ month</span>
              </div>

              <ul className="mt-6 space-y-2.5 font-mono text-xs text-foreground border-t border-border/40 pt-4">
                {FEATURES.map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                    <span
                      className={
                        f.highlight ? "font-medium text-foreground" : "text-muted-foreground"
                      }
                    >
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={handleToggleSubscribed}
              className="mt-6 w-full rounded-md bg-primary py-2.5 font-mono text-xs text-primary-foreground font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-md"
            >
              {subscribed ? "✓ Joined Pro Waitlist" : "$ subscribe --pro"}
            </button>
          </div>
        </div>

        {/* Feature highlight cards */}
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border/70 bg-card/30 p-4 text-center">
            <Cpu className="mx-auto h-6 w-6 text-primary mb-2" />
            <h4 className="font-mono text-xs font-semibold text-foreground">GPU Priority</h4>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Fast sandbox execution for code snippets.
            </p>
          </div>

          <div className="rounded-lg border border-border/70 bg-card/30 p-4 text-center">
            <Zap className="mx-auto h-6 w-6 text-primary mb-2" />
            <h4 className="font-mono text-xs font-semibold text-foreground">Feed Boost</h4>
            <p className="mt-1 text-[11px] text-muted-foreground">
              3x higher visibility for technical threads.
            </p>
          </div>

          <div className="rounded-lg border border-border/70 bg-card/30 p-4 text-center">
            <Shield className="mx-auto h-6 w-6 text-primary mb-2" />
            <h4 className="font-mono text-xs font-semibold text-foreground">Verified Mark</h4>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Terminal badge next to handle across site.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
