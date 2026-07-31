import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const TABS = ["Trend", "Following", "Communities"] as const;
export type FeedTab = (typeof TABS)[number];

export function TopBar({
  activeTab = "Trend",
  onTabChange,
}: {
  activeTab?: FeedTab;
  onTabChange?: (tab: FeedTab) => void;
}) {
  return (
    <div className="sticky top-0 z-20 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="flex items-center justify-between gap-2 px-2 sm:px-4">
        <div className="flex flex-1 min-w-0" role="tablist" aria-label="Feed">
          {TABS.map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={activeTab === t}
              onClick={() => onTabChange?.(t)}
              className={cn(
                "relative flex-1 shrink-0 px-3 py-3.5 text-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground cursor-pointer",
                activeTab === t && "text-foreground font-semibold",
              )}
            >
              <span className="whitespace-nowrap">{t}</span>
              <span
                aria-hidden
                className={cn(
                  "absolute inset-x-4 -bottom-px h-[2px] rounded-full transition-all duration-200",
                  activeTab === t ? "bg-primary opacity-100 scale-x-100" : "opacity-0 scale-x-0",
                )}
              />
            </button>
          ))}
        </div>
        <div className="hidden lg:block">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
