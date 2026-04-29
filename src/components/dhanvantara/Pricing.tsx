import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { useBooking } from "@/context/BookingContext";

const plans = [
  {
    name: "Starter",
    price: "₹0",
    period: "first 5 consults",
    features: ["AI Health Assistant", "Standard booking", "Digital prescriptions", "Email support"],
    cta: "Start free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "₹299",
    period: "/month",
    features: ["Unlimited consults", "Priority slots", "Specialist access", "Family profiles (4)", "24/7 chat support"],
    cta: "Go Pro",
    highlight: true,
  },
  {
    name: "Basic",
    price: "₹99",
    period: "/month",
    features: ["10 consults/mo", "Basic AI insights", "Digital prescriptions", "Standard support"],
    cta: "Choose Basic",
    highlight: false,
  },
];

export default function Pricing() {
  const { openBooking } = useBooking();
  return (
    <section id="pricing" className="relative py-32 px-6 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] rounded-full bg-primary/10 blur-3xl" />
      <div className="container mx-auto max-w-6xl relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p className="text-xs tracking-[0.3em] text-primary mb-4">— PRICING —</p>
          <h2 className="font-display text-5xl md:text-6xl">
            Care that <span className="text-gradient italic">scales</span> with you.
          </h2>
          <p className="mt-5 text-muted-foreground">Your first 5 consultations are on us. Always.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-center">
          {plans.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className={`relative rounded-3xl p-8 transition-all duration-500 hover:-translate-y-2 ${
                p.highlight
                  ? "glass scale-105 ring-2 ring-primary/40 shadow-[0_30px_80px_-20px_hsl(var(--primary)/0.5)] glow-primary md:order-2"
                  : "glass md:order-1"
              } ${i === 2 ? "md:order-3" : ""}`}
            >
              {p.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-gold text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" /> Most loved
                </div>
              )}
              <h3 className="font-display text-2xl">{p.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className={`font-display text-5xl ${p.highlight ? "text-gradient" : ""}`}>{p.price}</span>
                <span className="text-sm text-muted-foreground">{p.period}</span>
              </div>
              <ul className="mt-6 space-y-3 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <span className={`w-5 h-5 rounded-full grid place-items-center ${p.highlight ? "bg-gradient-primary text-white" : "bg-muted text-primary"}`}>
                      <Check className="w-3 h-3" />
                    </span>
                    <span className="text-foreground/80">{f}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => openBooking(null)}
                className={`ripple mt-8 w-full py-3 rounded-full font-medium transition-all hover:scale-[1.02] ${
                  p.highlight
                    ? "bg-gradient-primary text-primary-foreground glow-primary"
                    : "glass hover:bg-background/60"
                }`}
              >
                {p.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
