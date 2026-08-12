import { Link } from '@tanstack/react-router';

export function RouteErrorBoundary({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-background text-foreground font-sans border border-border rounded-lg m-4 shadow-sm">
      <div className="text-destructive mb-4">
        <span className="font-mono text-xl block">ERR_ROUTE_FAIL</span>
      </div>
      <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
      <p className="text-muted-foreground font-mono text-sm mb-6 max-w-md overflow-auto whitespace-pre-wrap text-left p-4 bg-muted/50 rounded-md">
        {error.message || 'Unknown error occurred'}
      </p>
      <div className="flex gap-4 font-mono text-sm">
        <button
          onClick={reset}
          className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors cursor-pointer"
        >
          &gt; Try again
        </button>
        <Link
          to="/"
          className="px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
        >
          &gt; Go home
        </Link>
      </div>
    </div>
  );
}
