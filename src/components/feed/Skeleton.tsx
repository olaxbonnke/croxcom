export function FeedSkeleton() {
  return (
    <div className="px-4 py-6 sm:px-5" role="status" aria-live="polite" aria-label="Loading feed">
      <div className="mb-6 font-mono text-xs text-muted-foreground cursor-pulse">
        loading feed
      </div>
      <div className="space-y-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="h-10 w-10 shrink-0 rounded-md bg-accent/60" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-40 rounded bg-accent/60" />
              <div className="h-3 w-full rounded bg-accent/50" />
              <div className="h-3 w-11/12 rounded bg-accent/40" />
              <div className="h-3 w-2/3 rounded bg-accent/40" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-4" role="status" aria-label="Loading profile">
      <div className="h-36 w-full bg-accent/40" />
      <div className="px-4 space-y-3">
        <div className="h-16 w-16 rounded-xl bg-accent/70 -mt-10 border-4 border-background" />
        <div className="h-5 w-48 rounded bg-accent/60" />
        <div className="h-3 w-32 rounded bg-accent/40" />
        <div className="h-3 w-full max-w-md rounded bg-accent/30" />
      </div>
    </div>
  );
}

export function CommunitySkeleton() {
  return (
    <div className="p-4 space-y-4 animate-pulse" role="status" aria-label="Loading community">
      <div className="h-6 w-48 rounded bg-accent/60" />
      <div className="h-4 w-full rounded bg-accent/40" />
      <div className="h-8 w-24 rounded bg-accent/50" />
      <div className="space-y-3 pt-4">
        {[0, 1].map((i) => (
          <div key={i} className="h-24 rounded-lg bg-accent/30" />
        ))}
      </div>
    </div>
  );
}

export function BrowseSkeleton() {
  return (
    <div className="p-4 space-y-6 animate-pulse" role="status" aria-label="Loading browse">
      <div className="h-10 w-full rounded-md bg-accent/50" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-md bg-accent/30" />
        ))}
      </div>
    </div>
  );
}

export function NotificationSkeleton() {
  return (
    <div className="p-4 space-y-4 animate-pulse" role="status" aria-label="Loading notifications">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex gap-3">
          <div className="h-9 w-9 rounded-md bg-accent/50 shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-3/4 rounded bg-accent/60" />
            <div className="h-3 w-1/2 rounded bg-accent/40" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MessagesSkeleton() {
  return (
    <div className="p-4 space-y-4 animate-pulse" role="status" aria-label="Loading messages">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex gap-3">
          <div className="h-10 w-10 rounded-md bg-accent/50 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-32 rounded bg-accent/60" />
            <div className="h-3 w-48 rounded bg-accent/40" />
          </div>
        </div>
      ))}
    </div>
  );
}
