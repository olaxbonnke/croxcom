import { Link } from "@tanstack/react-router";
import { MockCommunity } from "@/data/mock";

export function CommunityCard({ community }: { community: MockCommunity }) {
  return (
    <Link to={'/communities/' + community.slug} className="block group">
      <article className="h-full rounded-lg border border-border/70 bg-card/60 backdrop-blur-sm p-4 hover:border-primary/40 transition-colors group-hover:bg-card flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-mono text-sm text-foreground">
            /{community.name}
          </h3>
          <span className="font-mono text-xs text-muted-foreground shrink-0">
            {community.members.toLocaleString()} members
          </span>
        </div>
        
        <p className="text-sm text-muted-foreground mt-2 line-clamp-2 flex-1">
          {community.description}
        </p>
        
        {community.tags && community.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {community.tags.map(tag => (
              <span 
                key={tag} 
                className="font-mono text-xs text-muted-foreground border border-border/50 rounded px-1.5 py-0.5 group-hover:border-primary/50 group-hover:text-primary transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        
        <button className="mt-3 w-full border border-border font-mono text-xs text-foreground rounded-md py-1.5 group-hover:border-primary group-hover:text-primary transition-colors text-center">
          Join
        </button>
      </article>
    </Link>
  );
}
