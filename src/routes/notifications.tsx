import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { NotifItem } from "@/components/notifications/NotifItem";
import { mockNotifications } from "@/data/mock";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";
import { subscribeToNotifications, fetchNotificationsSupabase, markNotificationReadSupabase, isSupabaseConfigured } from "@/lib/supabase";

import { NotificationSkeleton } from "@/components/feed/Skeleton";

export const Route = createFileRoute("/notifications")({
  component: NotificationsPage,
});

function NotificationsPage() {
  const { currentUser } = useAuth();
  const [tab, setTab] = useState<"all" | "mentions">("all");
  const [notifications, setNotifications] = useState<typeof mockNotifications>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let unsubscribe = () => {};
    if (isSupabaseConfigured && currentUser?.id) {
      // Load existing notifications from Supabase
      setIsLoading(true);
      fetchNotificationsSupabase(currentUser.id).then((existing) => {
        if (existing.length > 0) {
          const mapped = existing.map((n: Record<string, unknown>) => ({
            id: n.id as string,
            actor: {
              id: (n.actor as Record<string, unknown>)?.id as string || "unknown",
              name: (n.actor as Record<string, unknown>)?.name as string || "Developer",
              handle: (n.actor as Record<string, unknown>)?.handle as string || "dev",
              avatarColor: (n.actor as Record<string, unknown>)?.avatarColor as string || "#00ff9f",
            },
            kind: (n.kind as string) || "system",
            target: (n.content as string) || "your post",
            time: new Date(n.created_at as string).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
            read: Boolean(n.is_read),
          }));
          setNotifications(mapped as typeof mockNotifications);
        }
        setIsLoading(false);
      });

      // Subscribe to new notifications
      unsubscribe = subscribeToNotifications(currentUser.id, (payload) => {
        if (payload.new) {
          const newNotif = {
            id: payload.new.id,
            actor: {
              id: payload.new.actor?.id || "unknown",
              name: payload.new.actor?.name || "Developer",
              handle: payload.new.actor?.handle || "dev",
              avatarColor: "#00ff9f",
            },
            kind: payload.new.kind || "system",
            target: payload.new.content || "your post",
            time: "Just now",
            read: false,
          };
          setNotifications((prev) => [newNotif as typeof mockNotifications[number], ...prev]);
        }
      });
    }

    return () => {
      unsubscribe();
    };
  }, [currentUser]);

  const filtered =
    tab === "all" ? notifications : notifications.filter((n) => n.kind === "mention");

  const markAllRead = () => {
    setNotifications((prev) => {
      // Persist read status to Supabase for unread notifications
      if (isSupabaseConfigured) {
        prev.filter((n) => !n.read).forEach((n) => markNotificationReadSupabase(n.id));
      }
      return prev.map((n) => ({ ...n, read: true }));
    });
  };

  return (
    <AppShell>
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-border/70">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-foreground">Notifications</h1>
          <button
            onClick={markAllRead}
            className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            mark all read
          </button>
        </div>
        <div className="flex px-4 gap-4">
          <button
            onClick={() => setTab("all")}
            className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
              tab === "all"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setTab("mentions")}
            className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
              tab === "mentions"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Mentions
          </button>
        </div>
      </div>

      {isLoading ? (
        <NotificationSkeleton />
      ) : (
        <div className="divide-y divide-border/70">
          <AnimatePresence initial={false}>
            {filtered.length > 0 ? (
              filtered.map((notif) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <NotifItem notif={notif} />
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-4 py-12 text-center"
              >
                <div className="font-mono text-sm text-muted-foreground">
                  $ notifications --empty
                </div>
                <p className="text-sm text-muted-foreground mt-2">You're all caught up!</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AppShell>
  );
}
