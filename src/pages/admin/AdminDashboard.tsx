import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Stethoscope, Calendar, IndianRupee, ShieldAlert, Star, MessageSquare, LayoutDashboard, FileText, Bell, Settings, TrendingUp } from "lucide-react";
import PortalShell from "@/components/PortalShell";
import { supabase } from "@/integrations/supabase/client";

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

export default function AdminDashboard() {
  const [counts, setCounts] = useState({ users: 0, doctors: 0, pending: 0 });

  useEffect(() => {
    (async () => {
      const [u, d, p] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("doctors").select("id", { count: "exact", head: true }),
        supabase.from("doctor_applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
      ]);
      setCounts({ users: u.count ?? 0, doctors: d.count ?? 0, pending: p.count ?? 0 });
    })();
  }, []);

  const stats = [
    { label: "Total Users", value: counts.users, icon: Users, tint: "from-blue-500/20 to-cyan-500/10" },
    { label: "Verified Doctors", value: counts.doctors, icon: Stethoscope, tint: "from-emerald-500/20 to-teal-500/10" },
    { label: "Pending Verifications", value: counts.pending, icon: ShieldAlert, tint: "from-amber-500/20 to-yellow-500/10" },
    { label: "Total Appointments", value: 0, icon: Calendar, tint: "from-violet-500/20 to-indigo-500/10" },
    { label: "Revenue (₹)", value: 0, icon: IndianRupee, tint: "from-green-500/20 to-emerald-500/10" },
    { label: "Avg. Doctor Rating", value: "—", icon: Star, tint: "from-yellow-500/20 to-amber-500/10" },
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

      <div className="mt-8 glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-lg">Doctor Verification Queue</h3>
          <a href="/admin/doctors" className="text-xs text-accent hover:underline">Open verification center →</a>
        </div>
        <p className="text-sm text-muted-foreground">
          {counts.pending > 0 ? `${counts.pending} application${counts.pending > 1 ? "s" : ""} awaiting review.` : "No pending applications."}
        </p>
      </div>
    </PortalShell>
  );
}

export function AdminPlaceholder({ label }: { label: string }) {
  return (
    <PortalShell title={label} accent="Admin Control" nav={adminNav}>
      <div className="glass rounded-2xl p-12 text-center">
        <p className="text-sm text-muted-foreground">Coming in Phase 3 — {label}</p>
      </div>
    </PortalShell>
  );
}
