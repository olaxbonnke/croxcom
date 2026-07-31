import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { type MockConversation } from "@/data/mock";

interface MessageThreadProps {
  conversation: MockConversation;
  backButton?: React.ReactNode;
}

export function MessageThread({ conversation, backButton }: MessageThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "auto" });
  }, [conversation.messages]);

  return (
    <div className="flex h-full flex-col">
      {/* Header with profile link */}
      <div className="flex items-center gap-3 border-b border-border/70 px-4 py-3 bg-background/80 backdrop-blur-md">
        {backButton}

        <Link
          to="/profile/$handle"
          params={{ handle: conversation.participant.handle }}
          className="flex items-center gap-3 group transition-opacity hover:opacity-90"
        >
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md font-mono text-xs font-bold text-[#111111] shadow-sm"
            style={{ backgroundColor: conversation.participant.avatarColor }}
          >
            {conversation.participant.name.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
              {conversation.participant.name}
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              @{conversation.participant.handle}
            </span>
          </div>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {conversation.messages.map((msg, index) => {
          const isMe = msg.senderId === "me";
          const prevMsg = index > 0 ? conversation.messages[index - 1] : null;
          const isSameSender = prevMsg?.senderId === msg.senderId;
          const marginTop = isSameSender ? "mt-0.5" : "mt-3";

          return (
            <div
              key={msg.id}
              className={`flex w-full ${marginTop} ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex flex-col max-w-[75%] ${isMe ? "items-end" : "items-start"}`}>
                <div
                  className={`rounded-lg px-3 py-2 text-[14px] leading-relaxed ${
                    isMe
                      ? "bg-primary text-primary-foreground font-normal"
                      : "bg-card border border-border/70 text-foreground"
                  }`}
                >
                  {msg.body}
                </div>
                <div className={`mt-1 font-mono text-[10px] text-muted-foreground ${isMe ? "text-right" : "text-left"}`}>
                  {msg.time}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
