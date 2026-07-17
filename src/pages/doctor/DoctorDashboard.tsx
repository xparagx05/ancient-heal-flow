import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Calendar, CheckCircle2, Clock, Star, IndianRupee, TrendingUp, Video } from "lucide-react";
import PortalShell from "@/components/PortalShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const nav = [
  { to: "/doctor", label: "Overview", icon: <TrendingUp className="w-4 h-4" /> },
  { to: "/doctor/appointments", label: "Appointments", icon: <Calendar className="w-4 h-4" /> },
  { to: "/doctor/availability", label: "Availability", icon: <Clock className="w-4 h-4" /> },
];

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [doc, setDoc] = useState<any>(null);
  const [stats, setStats] = useState({ today: 0, upcoming: 0, completed: 0, pending: 0, rating: 0, earnings: 0 });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: d } = await supabase.from("doctors").select("*").eq("user_id", user.id).maybeSingle();
      setDoc(d);
      const now = new Date();
      const sod = new Date(now); sod.setHours(0, 0, 0, 0);
      const eod = new Date(now); eod.setHours(23, 59, 59, 999);

      const [today, upcoming, completed, pending, feedback] = await Promise.all([
        supabase.from("appointments").select("id", { count: "exact", head: true })
          .eq("doctor_user_id", user.id).gte("scheduled_at", sod.toISOString()).lte("scheduled_at", eod.toISOString()),
        supabase.from("appointments").select("id", { count: "exact", head: true })
          .eq("doctor_user_id", user.id).gt("scheduled_at", eod.toISOString()),
        supabase.from("appointments").select("fee", { count: "exact" })
          .eq("doctor_user_id", user.id).eq("status", "completed"),
        supabase.from("appointments").select("id", { count: "exact", head: true })
          .eq("doctor_user_id", user.id).in("status", ["confirmed", "in_progress"]),
        supabase.from("appointment_feedback").select("rating").eq("doctor_user_id", user.id),
      ]);

      const earnings = (completed.data ?? []).reduce((s: number, r: any) => s + (r.fee ?? 0), 0);
      const ratings = (feedback.data ?? []).map((r: any) => r.rating);
      const avg = ratings.length ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : 0;

      setStats({
        today: today.count ?? 0,
        upcoming: upcoming.count ?? 0,
        completed: completed.count ?? 0,
        pending: pending.count ?? 0,
        rating: Math.round(avg * 10) / 10,
        earnings,
      });
    })();
  }, [user]);

  const cards = [
    { label: "Today's Patients", value: String(stats.today), icon: Users, tint: "from-blue-500/20 to-cyan-500/10" },
    { label: "Upcoming", value: String(stats.upcoming), icon: Calendar, tint: "from-amber-500/20 to-yellow-500/10" },
    { label: "Completed", value: String(stats.completed), icon: CheckCircle2, tint: "from-emerald-500/20 to-teal-500/10" },
    { label: "Pending", value: String(stats.pending), icon: Clock, tint: "from-rose-500/20 to-pink-500/10" },
    { label: "Avg. Rating", value: stats.rating ? stats.rating.toFixed(1) : "—", icon: Star, tint: "from-yellow-500/20 to-amber-500/10" },
    { label: "Earnings (₹)", value: stats.earnings.toLocaleString(), icon: IndianRupee, tint: "from-green-500/20 to-emerald-500/10" },
  ];

  return (
    <PortalShell title="Overview" accent="Doctor Portal" nav={nav}>
      {doc && (
        <div className="glass rounded-2xl p-5 mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Welcome</div>
            <div className="font-display text-2xl">{doc.full_name}</div>
            <div className="text-sm text-muted-foreground">{doc.specialization}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Professional ID</div>
            <div className="font-mono text-lg text-gradient-gold">{doc.professional_id}</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className={`glass rounded-2xl p-5 relative overflow-hidden bg-gradient-to-br ${s.tint}`}>
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center mb-4">
              <s.icon className="w-4 h-4 text-accent" />
            </div>
            <div className="font-display text-3xl">{s.value}</div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>
    </PortalShell>
  );
}

export function DoctorPlaceholder({ label }: { label: string }) {
  return (
    <PortalShell title={label} accent="Doctor Portal" nav={nav}>
      <div className="glass rounded-2xl p-12 text-center">
        <p className="text-sm text-muted-foreground">Coming soon — {label}</p>
      </div>
    </PortalShell>
  );
}
