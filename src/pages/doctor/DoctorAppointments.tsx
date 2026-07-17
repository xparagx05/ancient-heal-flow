import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Users, Clock, Video, ArrowRight, Check, X, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import PortalShell from "@/components/PortalShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";


const nav = [
  { to: "/doctor", label: "Overview", icon: <Calendar className="w-4 h-4" /> },
  { to: "/doctor/appointments", label: "Appointments", icon: <Calendar className="w-4 h-4" /> },
  { to: "/doctor/availability", label: "Availability", icon: <Clock className="w-4 h-4" /> },
];

type Appt = {
  id: string;
  scheduled_at: string;
  status: string;
  mode: string;
  fee: number;
  patient_id: string;
  patient?: { full_name: string | null; email: string | null };
};

export default function DoctorAppointments() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"today" | "upcoming" | "past">("today");
  const [rows, setRows] = useState<Appt[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const now = new Date();
    const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now); endOfDay.setHours(23, 59, 59, 999);

    let q = supabase.from("appointments").select("*").eq("doctor_user_id", user.id);
    if (tab === "today") q = q.gte("scheduled_at", startOfDay.toISOString()).lte("scheduled_at", endOfDay.toISOString());
    if (tab === "upcoming") q = q.gt("scheduled_at", endOfDay.toISOString());
    if (tab === "past") q = q.lt("scheduled_at", startOfDay.toISOString());
    const { data } = await q.order("scheduled_at", { ascending: tab !== "past" });

    const ids = Array.from(new Set((data ?? []).map((r) => r.patient_id)));
    const { data: profs } = ids.length
      ? await supabase.from("profiles").select("user_id, full_name, email").in("user_id", ids)
      : { data: [] as { user_id: string; full_name: string | null; email: string | null }[] };
    const pmap = new Map((profs ?? []).map((p) => [p.user_id, p]));

    setRows((data ?? []).map((r) => ({ ...r, patient: pmap.get(r.patient_id) })) as Appt[]);
    setLoading(false);
  }, [user, tab]);

  useEffect(() => { load(); }, [load]);

  // Realtime: refetch when this doctor's appointments change
  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel(`doc-appts-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "appointments", filter: `doctor_user_id=eq.${user.id}` },
        () => load()
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, load]);

  async function updateStatus(id: string, status: "confirmed" | "cancelled" | "completed") {
    const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(
      status === "confirmed" ? "Appointment confirmed" :
      status === "cancelled" ? "Appointment cancelled" :
      "Marked complete"
    );
  }


  return (
    <PortalShell title="Appointments" accent="Doctor Portal" nav={nav}>
      <div className="flex gap-2 mb-6">
        {(["today", "upcoming", "past"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full text-sm capitalize transition ${
              tab === t ? "bg-gradient-gold text-foreground" : "glass hover:bg-white/5"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="glass rounded-2xl p-12 text-center text-sm text-muted-foreground">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <Users className="w-8 h-8 mx-auto mb-3 text-accent/70" />
          <p className="text-sm text-muted-foreground">No {tab} appointments.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="glass rounded-2xl p-5 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent/20 to-primary/10 grid place-items-center ring-1 ring-accent/20">
                  {r.mode === "video" ? <Video className="w-4 h-4 text-accent" /> : <Users className="w-4 h-4 text-accent" />}
                </div>
                <div className="min-w-0">
                  <div className="font-medium truncate">{r.patient?.full_name ?? r.patient?.email ?? "Patient"}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(r.scheduled_at).toLocaleString()} · {r.mode} · ₹{r.fee}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-full ${statusTint(r.status)}`}>
                  {r.status.replace("_", " ")}
                </span>
                <Link
                  to={`/doctor/consultations/${r.id}`}
                  className="inline-flex items-center gap-1 text-sm text-accent hover:underline"
                >
                  Open <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </PortalShell>
  );
}

function statusTint(s: string) {
  switch (s) {
    case "confirmed": return "bg-emerald-500/15 text-emerald-400";
    case "in_progress": return "bg-amber-500/15 text-amber-400";
    case "completed": return "bg-blue-500/15 text-blue-400";
    case "cancelled": return "bg-rose-500/15 text-rose-400";
    default: return "bg-white/5 text-muted-foreground";
  }
}
