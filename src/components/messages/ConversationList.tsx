import { MockConversation } from "@/data/mock";

interface ConversationListProps {
  conversations: MockConversation[];
  activeId?: string;
  onSelect: (id: string) => void;
  onNewMessage?: () => void;
}

export function ConversationList({ conversations, activeId, onSelect, onNewMessage }: ConversationListProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
        <h1 className="text-lg font-semibold text-foreground">Messages</h1>
        <button
          onClick={onNewMessage}
          className="rounded-md border border-primary/30 px-3 py-1 font-mono text-xs text-primary transition-colors hover:bg-primary/10 cursor-pointer"
        >
          + new message
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={`flex w-full gap-3 border-b border-border/70 px-4 py-3 text-left transition-colors hover:bg-accent/20 ${
              activeId === conv.id ? "bg-accent/40" : ""
            }`}
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md font-mono text-xs text-[#111111]"
              style={{ backgroundColor: conv.participant.avatarColor }}
            >
              {conv.participant.name.charAt(0)}
            </div>
            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{conv.participant.name}</span>
                <span className="ml-auto font-mono text-xs text-muted-foreground">{conv.lastTime}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="line-clamp-1 text-xs text-muted-foreground">{conv.lastMessage}</span>
                {conv.unread > 0 && (
                  <span className="ml-2 rounded-full bg-primary px-1.5 py-0.5 font-mono text-[10px] text-primary-foreground">
                    {conv.unread}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
