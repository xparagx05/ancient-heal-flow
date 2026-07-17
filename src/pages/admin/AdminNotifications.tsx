import { useEffect, useState } from "react";
import PortalShell from "@/components/PortalShell";
import { adminNav } from "./AdminDashboard";
import { supabase } from "@/integrations/supabase/client";
import { Bell } from "lucide-react";

export default function AdminNotifications() {
  const [rows, setRows] = useState<any[]>([]);
  const [type, setType] = useState<string>("all");
  const [types, setTypes] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("notifications")
        .select("id, type, title, body, link, created_at, read_at, recipient_user_id")
        .order("created_at", { ascending: false })
        .limit(200);
      setRows(data ?? []);
      setTypes(Array.from(new Set((data ?? []).map((r: any) => r.type))));
    })();
  }, []);

  const filtered = rows.filter((r) => type === "all" || r.type === type);

  return (
    <PortalShell title="Notifications" accent="Admin Control" nav={adminNav}>
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setType("all")} className={`px-3 py-1.5 rounded-full text-xs uppercase tracking-widest border ${type === "all" ? "bg-accent text-background border-accent" : "border-white/10 text-muted-foreground"}`}>All</button>
        {types.map((t) => (
          <button key={t} onClick={() => setType(t)} className={`px-3 py-1.5 rounded-full text-xs uppercase tracking-widest border ${type === t ? "bg-accent text-background border-accent" : "border-white/10 text-muted-foreground"}`}>{t}</button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((n) => (
          <div key={n.id} className="glass rounded-xl p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0"><Bell className="w-4 h-4 text-accent" /></div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">{n.title}</div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{new Date(n.created_at).toLocaleString()}</div>
              </div>
              <div className="text-sm text-muted-foreground">{n.body}</div>
              <div className="text-[10px] text-muted-foreground mt-1 font-mono">{n.type} · {n.read_at ? "read" : "unread"}</div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="glass rounded-xl p-8 text-center text-sm text-muted-foreground">No notifications.</div>}
      </div>
    </PortalShell>
  );
}
