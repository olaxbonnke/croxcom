import { MockNotification } from "@/data/mock";
import { Heart, Repeat2, UserPlus, AtSign, MessageCircle } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

export function NotifItem({ notif }: { notif: MockNotification }) {
  const navigate = useNavigate();

  const Icon = {
    like: Heart,
    repost: Repeat2,
    follow: UserPlus,
    mention: AtSign,
    comment: MessageCircle,
  }[notif.kind];

  const iconColors = {
    like: "text-accent-orange bg-accent-orange/10",
    repost: "text-accent-blue bg-accent-blue/10",
    follow: "text-accent-purple bg-accent-purple/10",
    mention: "text-accent-orange bg-accent-orange/10",
    comment: "text-primary bg-primary/10",
  }[notif.kind];

  const actionText = {
    like: "liked your post",
    repost: "reposted your post",
    follow: "started following you",
    mention: "mentioned you",
    comment: "replied to your post",
  }[notif.kind];

  const handleClick = () => {
    if (notif.kind === "follow") {
      navigate({ to: "/profile/$handle", params: { handle: notif.actor.handle } });
    } else if (notif.postId) {
      navigate({ to: "/posts/$postId", params: { postId: notif.postId } });
    }
  };

  return (
    <article
      onClick={handleClick}
      className="relative cursor-pointer border-b border-border/70 px-4 py-3.5 flex gap-3 hover:bg-accent/20 transition-colors"
    >
      {!notif.read && (
        <div className="absolute left-0 inset-y-0 w-0.5 bg-primary" />
      )}
      
      <div className={`h-9 w-9 rounded-md grid place-items-center shrink-0 ${iconColors}`}>
        <Icon className="h-4 w-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="text-sm">
            <span className="text-foreground font-medium">{notif.actor.name}</span>{" "}
            <span className="text-muted-foreground">{actionText}</span>
          </div>
          <span className="font-mono text-xs text-muted-foreground shrink-0 mt-0.5">
            {notif.time}
          </span>
        </div>
        
        {notif.excerpt && (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-1 border-l-2 border-border pl-2">
            {notif.excerpt}
          </p>
        )}
      </div>
    </article>
  );
}
