import { motion } from "framer-motion";
import HeroOrb from "./HeroOrb";
import { ArrowRight, Stethoscope } from "lucide-react";
import { useBooking } from "@/context/BookingContext";

export default function Hero() {
  const { openBooking, openVideo } = useBooking();
  return (
    <section id="top" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
      <div className="absolute top-1/4 -left-24 w-96 h-96 rounded-full bg-accent/30 blur-3xl animate-float" />
      <div className="absolute bottom-1/4 -right-24 w-[28rem] h-[28rem] rounded-full bg-primary/30 blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      <div className="absolute top-10 right-1/3 w-72 h-72 rounded-full bg-accent/20 blur-3xl animate-float" style={{ animationDelay: "4s" }} />

      {/* Neon gradient lines */}
      <div className="absolute top-[28%] inset-x-0 h-px neon-line opacity-60" />
      <div className="absolute bottom-[18%] inset-x-0 h-px neon-line opacity-40" />

      <HeroOrb />

      <div className="relative z-10 container mx-auto px-6 pt-28 pb-20 text-center max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-gradient-gold animate-pulse" />
          <span className="text-muted-foreground tracking-wide">Powered by Lovable AI · v1.0</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.1 }}
          className="font-display text-6xl md:text-8xl leading-[0.95] tracking-tight"
        >
          Dhanvantara
          <br />
          <span className="italic text-gradient-gold">AI</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="mt-6 font-display italic text-xl md:text-2xl text-foreground/70"
        >
          Ancient Wisdom. Modern Healing.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-5 max-w-xl mx-auto text-base md:text-lg text-muted-foreground"
        >
          Experience intelligent healthcare powered by AI — book trusted doctors,
          consult by video, and receive instant prescriptions. All in one breath.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.65 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={() => openBooking(null)}
            className="ripple group relative px-7 py-3.5 rounded-full bg-gradient-primary text-primary-foreground font-medium flex items-center gap-2 transition-all hover:scale-105 hover:glow-primary shadow-[0_12px_30px_-10px_hsl(var(--primary)/0.7)]"
          >
            Book Appointment
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
          <button
            onClick={openVideo}
            className="ripple px-7 py-3.5 rounded-full glass font-medium flex items-center gap-2 hover:scale-105 transition-transform"
          >
            <Stethoscope className="w-4 h-4 text-accent" />
            Start Consultation
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-16 flex items-center justify-center gap-8 text-xs text-muted-foreground"
        >
          {["10K+ Consultations", "500+ Doctors", "4.9★ Rated"].map((t) => (
            <div key={t} className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-accent" />
              {t}
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs text-muted-foreground tracking-widest"
      >
        SCROLL ↓
      </motion.div>
    </section>
  );
}
