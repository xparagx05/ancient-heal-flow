import { useEffect, useMemo, useState } from "react";
import PortalShell from "@/components/PortalShell";
import { adminNav } from "./AdminDashboard";
import { supabase } from "@/integrations/supabase/client";
import { Star } from "lucide-react";

export default function AdminFeedback() {
  const [rows, setRows] = useState<any[]>([]);
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("appointment_feedback")
        .select("id, rating, comment, created_at, patient_id, doctor_user_id, appointment_id")
        .order("created_at", { ascending: false })
        .limit(100);
      const rowsData = data ?? [];
      const pIds = Array.from(new Set(rowsData.map((r: any) => r.patient_id).filter(Boolean)));
      const dUserIds = Array.from(new Set(rowsData.map((r: any) => r.doctor_user_id).filter(Boolean)));
      const [{ data: profs }, { data: docs }] = await Promise.all([
        pIds.length ? supabase.from("profiles").select("user_id, full_name").in("user_id", pIds) : Promise.resolve({ data: [] }),
        dUserIds.length ? supabase.from("doctors").select("user_id, full_name").in("user_id", dUserIds) : Promise.resolve({ data: [] }),
      ]);
      const pm = new Map((profs ?? []).map((p: any) => [p.user_id, p.full_name]));
      const dm = new Map((docs ?? []).map((d: any) => [d.user_id, d.full_name]));
      setRows(rowsData.map((r: any) => ({
        ...r,
        patient_name: pm.get(r.patient_id) ?? "—",
        doctor_name: dm.get(r.doctor_user_id) ?? "—",
      })));
    })();
  }, []);

  const filtered = useMemo(() => rows.filter((r) => r.rating >= minRating), [rows, minRating]);
  const dist = useMemo(() => {
    const b: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of rows) b[r.rating] = (b[r.rating] ?? 0) + 1;
    return b;
  }, [rows]);
  const total = rows.length || 1;

  return (
    <PortalShell title="Feedback" accent="Admin Control" nav={adminNav}>
      <div className="glass rounded-2xl p-5 mb-5">
        <h3 className="font-display text-sm uppercase tracking-widest text-muted-foreground mb-4">Rating distribution</h3>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((r) => (
            <div key={r} className="flex items-center gap-3">
              <div className="w-10 flex items-center gap-1 text-sm"><Star className="w-3 h-3 fill-amber-400 text-amber-400" />{r}</div>
              <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400" style={{ width: `${((dist[r] || 0) / total) * 100}%` }} />
              </div>
              <div className="w-10 text-right text-xs text-muted-foreground">{dist[r] || 0}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {[0, 1, 2, 3, 4, 5].map((m) => (
          <button key={m} onClick={() => setMinRating(m)}
            className={`px-3 py-1.5 rounded-full text-xs uppercase tracking-widest border ${minRating === m ? "bg-accent text-background border-accent" : "border-white/10 text-muted-foreground"}`}>
            {m === 0 ? "All" : `${m}★+`}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((r) => (
          <div key={r.id} className="glass rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="font-medium text-sm">{r.patient_name} → {r.doctor_name}</div>
                <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</div>
              </div>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-white/10"}`} />
                ))}
              </div>
            </div>
            {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
          </div>
        ))}
        {filtered.length === 0 && <div className="glass rounded-xl p-8 text-center text-sm text-muted-foreground">No feedback yet.</div>}
      </div>
    </PortalShell>
  );
}
