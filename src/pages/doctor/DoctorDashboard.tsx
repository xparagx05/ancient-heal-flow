import { motion } from "framer-motion";
import { Users, Calendar, CheckCircle2, Clock, Star, IndianRupee, TrendingUp, Video } from "lucide-react";
import PortalShell from "@/components/PortalShell";

const nav = [
  { to: "/doctor", label: "Overview", icon: <TrendingUp className="w-4 h-4" /> },
  { to: "/doctor/appointments", label: "Appointments", icon: <Calendar className="w-4 h-4" /> },
  { to: "/doctor/calendar", label: "Calendar", icon: <Calendar className="w-4 h-4" /> },
  { to: "/doctor/patients", label: "Patients", icon: <Users className="w-4 h-4" /> },
  { to: "/doctor/consultations", label: "Consultations", icon: <Video className="w-4 h-4" /> },
  { to: "/doctor/availability", label: "Availability", icon: <Clock className="w-4 h-4" /> },
  { to: "/doctor/analytics", label: "Analytics", icon: <TrendingUp className="w-4 h-4" /> },
  { to: "/doctor/feedback", label: "Feedback", icon: <Star className="w-4 h-4" /> },
];

const stats = [
  { label: "Today's Patients", value: "0", icon: Users, tint: "from-blue-500/20 to-cyan-500/10" },
  { label: "Upcoming", value: "0", icon: Calendar, tint: "from-amber-500/20 to-yellow-500/10" },
  { label: "Completed", value: "0", icon: CheckCircle2, tint: "from-emerald-500/20 to-teal-500/10" },
  { label: "Pending", value: "0", icon: Clock, tint: "from-rose-500/20 to-pink-500/10" },
  { label: "Avg. Rating", value: "—", icon: Star, tint: "from-yellow-500/20 to-amber-500/10" },
  { label: "Earnings (₹)", value: "0", icon: IndianRupee, tint: "from-green-500/20 to-emerald-500/10" },
];

export default function DoctorDashboard() {
  return (
    <PortalShell title="Overview" accent="Doctor Portal" nav={nav}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`glass rounded-2xl p-5 relative overflow-hidden bg-gradient-to-br ${s.tint}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                <s.icon className="w-4 h-4 text-accent" />
              </div>
            </div>
            <div className="font-display text-3xl">{s.value}</div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 glass rounded-2xl p-8 text-center">
        <p className="text-sm text-muted-foreground max-w-xl mx-auto">
          Your consultation workspace, calendar, prescriptions, and analytics arrive in Phase 2.
          Verified doctors already appear in the patient-facing "Find a Doctor" section.
        </p>
      </div>
    </PortalShell>
  );
}

export function DoctorPlaceholder({ label }: { label: string }) {
  return (
    <PortalShell title={label} accent="Doctor Portal" nav={nav}>
      <div className="glass rounded-2xl p-12 text-center">
        <p className="text-sm text-muted-foreground">Coming in Phase 2 — {label}</p>
      </div>
    </PortalShell>
  );
}
