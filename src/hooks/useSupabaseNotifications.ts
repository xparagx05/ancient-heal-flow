import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export type SupaNotification = {
  id: string;
  recipient_user_id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  meta: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
};

/**
 * Subscribes the current user to their notifications table with realtime updates.
 * Additive: does not replace the legacy BookingContext notifications feed.
 */
export function useSupabaseNotifications() {
  const { user } = useAuth();
  const [items, setItems] = useState<SupaNotification[]>([]);

  const load = useCallback(async () => {
    if (!user) { setItems([]); return; }
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("recipient_user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30);
    setItems((data as SupaNotification[]) ?? []);
  }, [user]);

  useEffect(() => {
    load();
    if (!user) return;
    const channel = supabase
      .channel(`notif-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `recipient_user_id=eq.${user.id}` },
        () => load()
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, load]);

  const unread = items.filter((n) => !n.read_at).length;

  const markAllRead = useCallback(async () => {
    if (!user) return;
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("recipient_user_id", user.id)
      .is("read_at", null);
  }, [user]);

  const clear = useCallback(async () => {
    if (!user) return;
    await supabase.from("notifications").delete().eq("recipient_user_id", user.id);
  }, [user]);

  const remove = useCallback(async (id: string) => {
    await supabase.from("notifications").delete().eq("id", id);
  }, []);

  return { items, unread, markAllRead, clear, remove, reload: load };
}
