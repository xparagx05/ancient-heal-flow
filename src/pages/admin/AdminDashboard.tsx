import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Stethoscope, Calendar, IndianRupee, ShieldAlert, Star, MessageSquare, LayoutDashboard, FileText, Bell, Settings, TrendingUp } from "lucide-react";
import PortalShell from "@/components/PortalShell";
import { supabase } from "@/integrations/supabase/client";
import { fetchAppointmentsInRange, bucketDaily, statusBreakdown, rangeDays } from "@/lib/admin/analytics";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";

export const adminNav = [
  { to: "/admin", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
  { to: "/admin/users", label: "Users", icon: <Users className="w-4 h-4" /> },
  { to: "/admin/doctors", label: "Doctor Verification", icon: <Stethoscope className="w-4 h-4" /> },
  { to: "/admin/appointments", label: "Appointments", icon: <Calendar className="w-4 h-4" /> },
  { to: "/admin/payments", label: "Payments", icon: <IndianRupee className="w-4 h-4" /> },
  { to: "/admin/feedback", label: "Feedback", icon: <MessageSquare className="w-4 h-4" /> },
  { to: "/admin/reports", label: "Reports", icon: <ShieldAlert className="w-4 h-4" /> },
  { to: "/admin/notifications", label: "Notifications", icon: <Bell className="w-4 h-4" /> },
  { to: "/admin/cms", label: "CMS", icon: <FileText className="w-4 h-4" /> },
  { to: "/admin/analytics", label: "Analytics", icon: <TrendingUp className="w-4 h-4" /> },
  { to: "/admin/settings", label: "Settings", icon: <Settings className="w-4 h-4" /> },
];

const STATUS_COLORS: Record<string, string> = {
  scheduled: "#60a5fa",
  confirmed: "#34d399",
  in_progress: "#fbbf24",
  completed: "#10b981",
  cancelled: "#f87171",
};

export default function AdminDashboard() {
  const [counts, setCounts] = useState({ users: 0, doctors: 0, pending: 0, apptsToday: 0, apptsMonth: 0, revenueMonth: 0, avgRating: 0 });
  const [daily, setDaily] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const now = new Date();
      const sod = new Date(now); sod.setHours(0, 0, 0, 0);
      const eod = new Date(now); eod.setHours(23, 59, 59, 999);
      const som = new Date(now.getFullYear(), now.getMonth(), 1);

      const [u, d, p, today, monthAppts, feedback] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("doctors").select("id", { count: "exact", head: true }),
        supabase.from("doctor_applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("appointments").select("id", { count: "exact", head: true }).gte("scheduled_at", sod.toISOString()).lte("scheduled_at", eod.toISOString()),
        supabase.from("appointments").select("fee, payment_id").gte("scheduled_at", som.toISOString()),
        supabase.from("appointment_feedback").select("rating"),
      ]);

      const revenueMonth = (monthAppts.data ?? []).filter((r: any) => r.payment_id).reduce((s: number, r: any) => s + (r.fee ?? 0), 0);
      const ratings = (feedback.data ?? []).map((r: any) => r.rating);
      const avgRating = ratings.length ? Math.round((ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length) * 10) / 10 : 0;

      setCounts({
        users: u.count ?? 0,
        doctors: d.count ?? 0,
        pending: p.count ?? 0,
        apptsToday: today.count ?? 0,
        apptsMonth: monthAppts.data?.length ?? 0,
        revenueMonth,
        avgRating,
      });

      // 30-day trend
      const { from, to } = rangeDays(30);
      const rows = await fetchAppointmentsInRange(from, to);
      setDaily(bucketDaily(rows, from, to));
      setStatuses(statusBreakdown(rows));

      // Recent activity
      const { data: recentRows } = await supabase
        .from("appointments")
        .select("id, scheduled_at, status, doctor_id, patient_id")
        .order("created_at", { ascending: false }).limit(10);
      const dIds = Array.from(new Set((recentRows ?? []).map((r: any) => r.doctor_id).filter(Boolean)));
      const pIds = Array.from(new Set((recentRows ?? []).map((r: any) => r.patient_id).filter(Boolean)));
      const [{ data: docs }, { data: profs }] = await Promise.all([
        dIds.length ? supabase.from("doctors").select("id, full_name").in("id", dIds) : Promise.resolve({ data: [] }),
        pIds.length ? supabase.from("profiles").select("user_id, full_name").in("user_id", pIds) : Promise.resolve({ data: [] }),
      ]);
      const dm = new Map((docs ?? []).map((d: any) => [d.id, d.full_name]));
      const pm = new Map((profs ?? []).map((p: any) => [p.user_id, p.full_name]));
      setRecent((recentRows ?? []).map((r: any) => ({
        ...r,
        doctor_name: dm.get(r.doctor_id) ?? "—",
        patient_name: pm.get(r.patient_id) ?? "—",
      })));
    })();
  }, []);

  const stats = [
    { label: "Total Users", value: counts.users, icon: Users, tint: "from-blue-500/20 to-cyan-500/10" },
    { label: "Verified Doctors", value: counts.doctors, icon: Stethoscope, tint: "from-emerald-500/20 to-teal-500/10" },
    { label: "Pending Verifications", value: counts.pending, icon: ShieldAlert, tint: "from-amber-500/20 to-yellow-500/10" },
    { label: "Appointments Today", value: counts.apptsToday, icon: Calendar, tint: "from-violet-500/20 to-indigo-500/10" },
    { label: "Revenue this Month (₹)", value: counts.revenueMonth.toLocaleString(), icon: IndianRupee, tint: "from-green-500/20 to-emerald-500/10" },
    { label: "Avg. Doctor Rating", value: counts.avgRating || "—", icon: Star, tint: "from-yellow-500/20 to-amber-500/10" },
  ];

  return (
    <PortalShell title="Overview" accent="Admin Control" nav={adminNav}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className={`glass rounded-2xl p-5 bg-gradient-to-br ${s.tint}`}>
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center mb-4">
              <s.icon className="w-4 h-4 text-accent" />
            </div>
            <div className="font-display text-3xl">{s.value}</div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">
        <div className="glass rounded-2xl p-5 lg:col-span-2">
          <h3 className="font-display text-sm uppercase tracking-widest text-muted-foreground mb-4">Appointments · last 30 days</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={daily}>
              <defs>
                <linearGradient id="dashRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="rgba(255,255,255,0.4)" />
              <YAxis tick={{ fontSize: 10 }} stroke="rgba(255,255,255,0.4)" />
              <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
              <Area type="monotone" dataKey="appointments" stroke="hsl(var(--accent))" fill="url(#dashRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-2xl p-5">
          <h3 className="font-display text-sm uppercase tracking-widest text-muted-foreground mb-4">Status breakdown</h3>
          {statuses.length === 0 ? (
            <p className="text-sm text-muted-foreground">No appointments yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statuses} dataKey="count" nameKey="status" outerRadius={70} label={{ fontSize: 10 }}>
                  {statuses.map((s: any) => <Cell key={s.status} fill={STATUS_COLORS[s.status] ?? "#94a3b8"} />)}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="mt-6 glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-lg">Recent activity</h3>
          <a href="/admin/appointments" className="text-xs text-accent hover:underline">View all →</a>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent appointments.</p>
        ) : (
          <div className="divide-y divide-white/5">
            {recent.map((r) => (
              <div key={r.id} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <div>{r.patient_name} → {r.doctor_name}</div>
                  <div className="text-xs text-muted-foreground">{new Date(r.scheduled_at).toLocaleString()}</div>
                </div>
                <span className="text-xs uppercase tracking-widest text-muted-foreground">{r.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </PortalShell>
  );
}

export function AdminPlaceholder({ label }: { label: string }) {
  return (
    <PortalShell title={label} accent="Admin Control" nav={adminNav}>
      <div className="glass rounded-2xl p-12 text-center">
        <p className="text-sm text-muted-foreground">Coming soon — {label}</p>
      </div>
    </PortalShell>
  );
}
