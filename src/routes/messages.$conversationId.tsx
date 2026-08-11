import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { MessageThread } from "@/components/messages/MessageThread";
import { MessageInput } from "@/components/messages/MessageInput";
import { mockConversations } from "@/data/mock";

export const Route = createFileRoute("/messages/$conversationId")({
  component: MessageThreadPage,
});

function MessageThreadPage() {
  const { conversationId } = Route.useParams();

  const [conversations, setConversations] = useState<typeof mockConversations>(() =>
    (mockConversations || []).map((c) => (c.id === conversationId ? { ...c, unread: 0 } : c)),
  );

  const activeConv = conversations.find((c) => c.id === conversationId);

  const handleSend = (body: string) => {
    const newMsg = {
      id: Date.now().toString(),
      senderId: "me",
      body,
      time: "Just now",
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId) {
          return {
            ...c,
            lastMessage: body,
            lastTime: "Just now",
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      }),
    );
  };

  if (!activeConv) return null;

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-56px)] flex-col lg:h-screen">
        <div className="flex-1 overflow-hidden">
          <MessageThread
            conversation={activeConv}
            backButton={
              <Link to="/messages" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            }
          />
        </div>
        <MessageInput onSend={handleSend} />
      </div>
    </AppShell>
  );
}
