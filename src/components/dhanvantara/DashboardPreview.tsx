import { motion } from "framer-motion";
import { Activity, TrendingUp, Calendar, FileText, Heart } from "lucide-react";

export default function DashboardPreview() {
  return (
    <section id="dashboard" className="py-32 px-6">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <p className="text-xs tracking-[0.3em] text-primary mb-4">— YOUR SPACE —</p>
          <h2 className="font-display text-5xl md:text-6xl">A dashboard you'll actually <span className="text-gradient italic">love</span>.</h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9 }}
          className="relative"
        >
          <div className="absolute -inset-6 bg-gradient-primary opacity-20 blur-3xl rounded-[3rem]" />
          <div className="relative glass rounded-[2rem] p-6 md:p-8 shadow-[0_40px_120px_-30px_hsl(var(--primary)/0.5)]">
            {/* Window header */}
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/40">
              <span className="w-3 h-3 rounded-full bg-rose-300" />
              <span className="w-3 h-3 rounded-full bg-amber-300" />
              <span className="w-3 h-3 rounded-full bg-emerald-300" />
              <span className="ml-4 text-xs text-muted-foreground">app.dhanvantara.ai/home</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Vitals card */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="md:col-span-2 rounded-2xl p-6 bg-gradient-to-br from-white/80 to-primary/10 border border-white/60"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Today's vitals</p>
                    <h4 className="font-display text-xl mt-1">Looking great, Aarya 🌿</h4>
                  </div>
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Heart", val: "72", unit: "bpm", icon: Heart, color: "text-rose-500" },
                    { label: "Steps", val: "8.2k", unit: "today", icon: TrendingUp, color: "text-emerald-500" },
                    { label: "Sleep", val: "7.5", unit: "hrs", icon: Activity, color: "text-violet-500" },
                  ].map((v) => (
                    <div key={v.label} className="rounded-xl bg-white/70 p-4">
                      <v.icon className={`w-4 h-4 ${v.color}`} />
                      <div className="mt-2 font-display text-2xl">{v.val}</div>
                      <div className="text-[10px] text-muted-foreground">{v.label} · {v.unit}</div>
                    </div>
                  ))}
                </div>
                {/* Sparkline */}
                <div className="mt-5 h-16 flex items-end gap-1">
                  {Array.from({ length: 28 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${30 + Math.sin(i * 0.6) * 25 + Math.random() * 20}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 + i * 0.02, duration: 0.5 }}
                      className="flex-1 rounded-full bg-gradient-to-t from-primary/40 to-primary"
                    />
                  ))}
                </div>
              </motion.div>

              {/* Appointment */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="rounded-2xl p-6 bg-gradient-to-br from-amber-100/80 to-rose-100/60 border border-white/60"
              >
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-4 h-4" /> Upcoming
                </div>
                <h4 className="font-display text-lg mt-3">Dr. Priya Iyer</h4>
                <p className="text-xs text-muted-foreground">Dermatologist · Video</p>
                <div className="mt-4 p-3 rounded-xl bg-white/70 text-xs">
                  <div className="font-medium">Tomorrow · 4:30 PM</div>
                  <div className="text-muted-foreground mt-0.5">15 min consultation</div>
                </div>
                <button className="mt-4 w-full py-2 rounded-full bg-foreground text-background text-xs font-medium hover:scale-[1.02] transition-transform">
                  Join Room
                </button>
              </motion.div>

              {/* Prescription */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="md:col-span-3 rounded-2xl p-6 bg-white/70 border border-white/60 flex flex-col md:flex-row gap-6 items-start"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-primary grid place-items-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Latest prescription</p>
                    <h4 className="font-display">Vitamin D3 + B12 Protocol</h4>
                  </div>
                </div>
                <div className="flex-1 grid grid-cols-3 gap-3 text-xs">
                  {["Vitamin D3 — 1/day", "B12 — morning", "Hydrate — 3L"].map((m) => (
                    <div key={m} className="rounded-lg bg-muted/50 px-3 py-2">{m}</div>
                  ))}
                </div>
                <button className="text-xs text-primary font-medium">View PDF →</button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
