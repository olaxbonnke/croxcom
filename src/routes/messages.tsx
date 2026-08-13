import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ConversationList } from "@/components/messages/ConversationList";
import { MessageThread } from "@/components/messages/MessageThread";
import { MessageInput } from "@/components/messages/MessageInput";
import { mockConversations, mockUsers, type MockUser, type MockConversation } from "@/data/mock";
import { Search, X, MessageSquarePlus } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { subscribeToMessages, sendMessageSupabase, isSupabaseConfigured, createConversationSupabase, fetchConversationsSupabase, searchUsersSupabase } from "@/lib/supabase";
import { SHOW_DEMO_DATA } from "@/lib/config";
import { toast } from "sonner";

export const Route = createFileRoute("/messages")({
  component: MessagesPage,
});

function MessagesPage() {
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState<MockConversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Load existing conversations from Supabase on mount
  useEffect(() => {
    async function loadConversations() {
      if (!isSupabaseConfigured || !currentUser?.id) return;
      const sbConvs = await fetchConversationsSupabase(currentUser.id);
      if (sbConvs.length > 0) {
        const mapped: MockConversation[] = sbConvs.map((c: Record<string, unknown>) => {
          const participants = (c.conversation_participants as Array<{ user_id: string; profiles: Record<string, unknown> }>) || [];
          const otherParticipant = participants.find((p) => p.user_id !== currentUser.id);
          const profile = otherParticipant?.profiles || {};
          const messages = ((c.messages as Array<Record<string, unknown>>) || []).map((m) => ({
            id: m.id as string,
            senderId: m.sender_id === currentUser.id ? "me" : (m.sender_id as string),
            body: (m.body as string) || "",
            time: new Date(m.created_at as string).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }),
          }));
          const lastMsg = messages[messages.length - 1];
          return {
            id: c.id as string,
            participant: {
              id: otherParticipant?.user_id || "unknown",
              name: (profile.name as string) || "User",
              handle: (profile.handle as string) || "user",
              avatarColor: (profile.avatarColor as string) || "#00ff9f",
            },
            lastMessage: lastMsg?.body || "No messages yet",
            lastTime: lastMsg?.time || "",
            unread: 0,
            messages,
          };
        });
        setConversations(mapped);
      }
    }
    loadConversations();
  }, [currentUser?.id]);

  useEffect(() => {
    let unsubscribe = () => {};
    if (isSupabaseConfigured && currentUser?.id) {
      unsubscribe = subscribeToMessages(currentUser.id, (payload) => {
        if (payload.new) {
          const incomingMsg = {
            id: payload.new.id,
            senderId: payload.new.sender_id === currentUser.id ? "me" : payload.new.sender_id,
            body: payload.new.content,
            time: "Just now",
          };

          setConversations((prev) =>
            prev.map((c) => {
              if (
                c.id === activeId ||
                c.participant.id === payload.new.sender_id ||
                c.participant.id === payload.new.receiver_id
              ) {
                return {
                  ...c,
                  lastMessage: payload.new.content,
                  lastTime: "Just now",
                  messages: [...c.messages, incomingMsg],
                };
              }
              return c;
            }),
          );
        }
      });
    }

    return () => unsubscribe();
  }, [currentUser, activeId]);

  const activeConv = conversations.find((c) => c.id === activeId);

  const handleSelect = (id: string) => {
    setActiveId(id);
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c)));
  };

  const handleSend = (body: string) => {
    if (!activeId) return;
    const newMsg = {
      id: Date.now().toString(),
      senderId: "me",
      body,
      time: "Just now",
    };

    if (isSupabaseConfigured && currentUser?.id && activeConv?.participant.id) {
      sendMessageSupabase(activeConv.id, currentUser.id, body).catch((err) => {
        console.error("Error sending message to Supabase:", err);
        toast.error("Couldn't send message to backend — try again.");
      });
    }

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeId) {
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

  const handleStartConversation = async (user: MockUser) => {
    const existing = conversations.find((c) => c.participant.handle === user.handle);
    if (existing) {
      setActiveId(existing.id);
    } else {
      let convId = `conv-${Date.now()}`;

      // Create real conversation in Supabase if configured
      if (isSupabaseConfigured && currentUser?.id) {
        const created = await createConversationSupabase(currentUser.id, user.id);
        if (created) {
          convId = created.id;
        }
      }

      const newConv: MockConversation = {
        id: convId,
        participant: user,
        lastMessage: "Say hello!",
        lastTime: "Just now",
        unread: 0,
        messages: [],
      };
      setConversations((prev) => [newConv, ...prev]);
      setActiveId(newConv.id);
    }
    setShowNewModal(false);
    setSearchQuery("");
  };

  const [supabaseUsers, setSupabaseUsers] = useState<MockUser[]>([]);

  useEffect(() => {
    let isMounted = true;
    if (isSupabaseConfigured && searchQuery.trim()) {
      searchUsersSupabase(searchQuery).then((results) => {
        if (isMounted) setSupabaseUsers(results);
      });
    } else {
      setSupabaseUsers([]);
    }
    return () => {
      isMounted = false;
    };
  }, [searchQuery]);

  const filteredUsers = isSupabaseConfigured
    ? supabaseUsers.filter((u) => u.id !== currentUser.id)
    : SHOW_DEMO_DATA
      ? mockUsers.slice(1).filter((u) => {
          const q = searchQuery.toLowerCase().trim();
          if (!q) return true;
          return (
            u.name.toLowerCase().includes(q) ||
            u.handle.toLowerCase().includes(q) ||
            u.role?.toLowerCase().includes(q)
          );
        })
      : [];

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-56px)] overflow-hidden lg:h-screen">
        <div
          className={`w-full shrink-0 border-r border-border/70 lg:w-[340px] ${
            activeId ? "hidden lg:block" : "block"
          }`}
        >
          <ConversationList
            conversations={conversations}
            activeId={activeId ?? undefined}
            onSelect={handleSelect}
            onNewMessage={() => setShowNewModal(true)}
          />
        </div>

        <div className={`flex-1 flex-col ${!activeId ? "hidden lg:flex" : "flex"}`}>
          {activeConv ? (
            <>
              <div className="flex-1 overflow-hidden">
                <MessageThread
                  conversation={activeConv}
                  backButton={
                    <button
                      onClick={() => setActiveId(null)}
                      className="lg:hidden text-muted-foreground hover:text-foreground mr-2 font-mono text-sm"
                    >
                      &larr;
                    </button>
                  }
                />
              </div>
              <MessageInput onSend={handleSend} />
            </>
          ) : (
            <div className="flex flex-col h-full items-center justify-center bg-background p-6 text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 grid place-items-center text-primary mb-3">
                <MessageSquarePlus className="h-6 w-6" />
              </div>
              <p className="font-mono text-sm font-semibold text-foreground">
                No conversation selected
              </p>
              <p className="text-xs text-muted-foreground mt-1 mb-4">
                Choose an existing message thread or start a new conversation.
              </p>
              <button
                onClick={() => setShowNewModal(true)}
                className="font-mono text-xs rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer"
              >
                + new conversation
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── NEW CONVERSATION MODAL ── */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-xl border border-border/80 bg-background shadow-2xl space-y-3 p-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <span className="text-primary font-bold">$ message --new</span>
              <button
                onClick={() => {
                  setShowNewModal(false);
                  setSearchQuery("");
                }}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search user by name or @handle..."
                className="w-full rounded-md border border-border/70 bg-card/60 py-1.5 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary/60 focus:outline-none"
              />
            </div>

            {/* Users list */}
            <div className="max-h-64 overflow-y-auto divide-y divide-border/30 scrollbar-none">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleStartConversation(user)}
                    className="flex w-full items-center gap-3 py-2.5 px-2 text-left hover:bg-accent/40 rounded-lg transition-colors cursor-pointer"
                  >
                    <div
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-md font-mono text-xs font-bold text-black"
                      style={{ backgroundColor: user.avatarColor }}
                    >
                      {user.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <span className="truncate font-sans font-medium text-foreground text-sm">
                          {user.name}
                        </span>
                        <span className="truncate text-muted-foreground text-[11px]">
                          @{user.handle}
                        </span>
                      </div>
                      {user.role && (
                        <p className="truncate text-[10px] text-muted-foreground">{user.role}</p>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="py-6 text-center text-muted-foreground">No users found</div>
              )}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
