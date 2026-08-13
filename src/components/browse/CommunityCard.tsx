import { Link } from "@tanstack/react-router";
import { MockCommunity } from "@/data/mock";
import { useCommunities } from "@/lib/CommunityContext";

export function CommunityCard({ community }: { community: MockCommunity }) {
  const { isMember, joinCommunity, leaveCommunity } = useCommunities();
  const joined = isMember(community.id);
  const memberCount = community.members + (joined ? 1 : 0);

  const handleToggleJoin = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (joined) {
      leaveCommunity(community.id);
    } else {
      joinCommunity(community.id);
    }
  };

  return (
    <article className="h-full rounded-lg border border-border/70 bg-card/60 backdrop-blur-sm p-4 hover:border-primary/40 transition-colors flex flex-col justify-between">
      <Link to={"/communities/" + community.slug} className="block group flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-mono text-sm text-foreground group-hover:text-primary transition-colors">
            /{community.name}
          </h3>
          <span className="font-mono text-xs text-muted-foreground shrink-0">
            {memberCount.toLocaleString()} members
          </span>
        </div>

        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
          {community.description}
        </p>

        {community.tags && community.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {community.tags.map((tag) => (
              <span
                key={tag}
                className="font-mono text-xs text-muted-foreground border border-border/50 rounded px-1.5 py-0.5"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </Link>

      <button
        type="button"
        onClick={handleToggleJoin}
        className={`mt-3 w-full border font-mono text-xs rounded-md py-1.5 transition-colors text-center cursor-pointer ${
          joined
            ? "border-border bg-card text-muted-foreground hover:border-destructive hover:text-destructive"
            : "border-primary/40 text-primary hover:border-primary hover:bg-primary/10 font-semibold"
        }`}
      >
        {joined ? "Leave" : "Join"}
      </button>
    </article>
  );
}
