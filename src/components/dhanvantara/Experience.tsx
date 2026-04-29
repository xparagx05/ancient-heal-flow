import { motion } from "framer-motion";
import { UserCheck, CalendarCheck, CreditCard, VideoIcon, FileCheck } from "lucide-react";

const steps = [
  { icon: UserCheck, title: "Select Doctor", desc: "Browse verified specialists across 30+ fields." },
  { icon: CalendarCheck, title: "Book Slot", desc: "Pick a time that fits your day in two taps." },
  { icon: CreditCard, title: "Pay Securely", desc: "UPI, cards, wallets — all bank-grade encrypted." },
  { icon: VideoIcon, title: "Join Consultation", desc: "Crystal-clear video, designed for calm conversation." },
  { icon: FileCheck, title: "Get Prescription", desc: "Digital, beautifully formatted, instantly delivered." },
];

export default function Experience() {
  return (
    <section className="relative py-32 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      <div className="container mx-auto max-w-6xl relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-2xl mx-auto mb-20"
        >
          <p className="text-xs tracking-[0.3em] text-primary mb-4">— THE FLOW —</p>
          <h2 className="font-display text-5xl md:text-6xl">From symptom to <span className="text-gradient italic">solace</span>.</h2>
          <p className="mt-5 text-muted-foreground">Five seamless steps. Designed to feel like one breath.</p>
        </motion.div>

        <div className="relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                className="text-center relative"
              >
                <div className="relative mx-auto w-24 h-24 mb-5">
                  <div className="absolute inset-0 rounded-full bg-gradient-primary opacity-20 blur-xl group-hover:opacity-40" />
                  <div className="relative w-24 h-24 rounded-full glass grid place-items-center hover:scale-110 transition-transform duration-500">
                    <s.icon className="w-9 h-9 text-primary" />
                    <span className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-gradient-gold text-xs font-semibold grid place-items-center text-foreground">
                      {i + 1}
                    </span>
                  </div>
                </div>
                <h4 className="font-display text-lg">{s.title}</h4>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
