import { useState, useRef, useEffect, useMemo } from "react";
import { Bell, Mail, MessageSquare, Sparkles, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useBooking } from "@/context/BookingContext";
import { useSupabaseNotifications } from "@/hooks/useSupabaseNotifications";

type UnifiedNote = {
  id: string;
  title: string;
  message: string;
  channel: "sms" | "email" | "system";
  read: boolean;
  createdAt: string;
  link?: string | null;
  source: "local" | "supabase";
};

export default function NotificationBell() {
  const { notifications, markAllRead: markLocalRead, clearNotifications } = useBooking();
  const { items: supaItems, unread: supaUnread, markAllRead: markSupaRead, clear: clearSupa } = useSupabaseNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const merged: UnifiedNote[] = useMemo(() => {
    const local: UnifiedNote[] = notifications.map((n) => ({
      id: `local-${n.id}`,
      title: n.title,
      message: n.message,
      channel: n.channel,
      read: n.read,
      createdAt: n.createdAt,
      source: "local",
    }));
    const remote: UnifiedNote[] = supaItems.map((n) => ({
      id: `sb-${n.id}`,
      title: n.title,
      message: n.body ?? "",
      channel: n.type.startsWith("appointment") ? "sms" : n.type.startsWith("prescription") ? "email" : "system",
      read: !!n.read_at,
      createdAt: n.created_at,
      link: n.link,
      source: "supabase",
    }));
    return [...remote, ...local].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }, [notifications, supaItems]);

  const unread = supaUnread + notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function toggle() {
    setOpen((v) => {
      const next = !v;
      if (next && unread > 0) {
        setTimeout(() => { markLocalRead(); markSupaRead(); }, 600);
      }
      return next;
    });
  }

  function clearAll() {
    clearNotifications();
    clearSupa();
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={toggle}
        aria-label="Notifications"
        className="relative w-9 h-9 rounded-full grid place-items-center hover:bg-foreground/10 transition"
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-gold text-[10px] font-semibold text-foreground grid place-items-center">
            {unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 mt-3 w-[min(92vw,360px)] glass rounded-2xl p-3 shadow-2xl ring-1 ring-border z-[80]"
          >
            <div className="flex items-center justify-between px-2 pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                <p className="text-xs tracking-[0.2em] text-muted-foreground">NOTIFICATIONS</p>
              </div>
              {merged.length > 0 && (
                <button onClick={clearAll} className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1">
                  <Trash2 className="w-3 h-3" /> Clear
                </button>
              )}
            </div>

            <div className="max-h-[360px] overflow-y-auto pr-1 space-y-1.5">
              {merged.length === 0 && (
                <div className="text-center py-10 text-sm text-muted-foreground">
                  No notifications yet.
                </div>
              )}
              {merged.map((n) => {
                const Icon = n.channel === "email" ? Mail : n.channel === "sms" ? MessageSquare : Bell;
                const inner = (
                  <div className={`rounded-xl p-3 text-sm transition ${n.read ? "bg-background/40" : "bg-primary/10 ring-1 ring-primary/20"}`}>
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 w-7 h-7 rounded-full bg-gradient-primary grid place-items-center flex-shrink-0">
                        <Icon className="w-3.5 h-3.5 text-primary-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground leading-tight">{n.title}</p>
                        {n.message && <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>}
                        <p className="text-[10px] text-muted-foreground/70 mt-1">
                          {new Date(n.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
                return n.link ? (
                  <Link key={n.id} to={n.link} onClick={() => setOpen(false)} className="block">{inner}</Link>
                ) : (
                  <div key={n.id}>{inner}</div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
