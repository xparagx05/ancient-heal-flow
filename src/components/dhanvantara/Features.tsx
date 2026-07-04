import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Bot, Calendar, Video, FileText, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";
import { useState, type ReactNode, type MouseEvent } from "react";
import FeatureModal, { featureDetails } from "./FeatureModal";

const features = [
  { icon: Bot, title: "AI Health Assistant", desc: "24/7 intelligent triage that listens, learns, and guides you to the right care.", color: "from-violet-400/40 to-blue-400/40" },
  { icon: Calendar, title: "Smart Appointment Booking", desc: "Find the perfect doctor and slot in seconds with predictive availability.", color: "from-blue-400/40 to-cyan-400/40" },
  { icon: Video, title: "Video Consultation", desc: "HD secure video rooms designed for warm, focused conversations.", color: "from-cyan-400/40 to-teal-400/40" },
  { icon: FileText, title: "Digital Prescription", desc: "Beautifully formatted, instantly delivered, always accessible.", color: "from-amber-300/40 to-rose-300/40" },
  { icon: ShieldCheck, title: "Secure Payments", desc: "Bank-grade encryption with one-tap UPI, cards & wallets.", color: "from-rose-300/40 to-violet-400/40" },
  { icon: Sparkles, title: "Wellness Insights", desc: "Personalised health journeys grounded in Ayurveda + AI.", color: "from-emerald-300/40 to-blue-300/40" },
];

function TiltCard({ children }: { children: ReactNode }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotX = useSpring(useTransform(y, [-50, 50], [8, -8]), { stiffness: 200, damping: 20 });
  const rotY = useSpring(useTransform(x, [-50, 50], [-8, 8]), { stiffness: 200, damping: 20 });

  function onMove(e: MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - r.left - r.width / 2);
    y.set(e.clientY - r.top - r.height / 2);
  }
  function onLeave() { x.set(0); y.set(0); }

  return (
    <motion.div
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" }}
      className="relative"
    >
      {children}
    </motion.div>
  );
}

export default function Features() {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const detail = openKey ? featureDetails[openKey] ?? null : null;

  return (
    <section id="features" className="relative py-32 px-6">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-2xl mx-auto mb-20"
        >
          <p className="text-xs tracking-[0.3em] text-primary mb-4">— PLATFORM —</p>
          <h2 className="font-display text-5xl md:text-6xl leading-tight">
            Everything you need.
            <br />
            <span className="text-gradient italic">Nothing you don't.</span>
          </h2>
          <p className="mt-5 text-muted-foreground">A complete healthcare suite, woven from intelligent micro-experiences.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
            >
              <TiltCard>
                <div className="group glass rounded-3xl p-7 h-full hover:shadow-[0_30px_70px_-20px_hsl(var(--primary)/0.4)] transition-all duration-500 hover:-translate-y-1 flex flex-col">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} grid place-items-center mb-5 group-hover:scale-110 transition-transform`}>
                    <f.icon className="w-6 h-6 text-foreground" />
                  </div>
                  <h3 className="font-display text-2xl mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">{f.desc}</p>
                  <button
                    onClick={() => setOpenKey(f.title)}
                    className="mt-6 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:gap-2.5 transition-all self-start group/btn"
                  >
                    Learn more
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>

      <FeatureModal detail={detail} onClose={() => setOpenKey(null)} />
    </section>
  );
}
