import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

export type FeatureDetail = {
  key: string;
  title: string;
  tagline: string;
  hero: string;
  gradient: string;
  bullets: { icon: string; title: string; desc: string }[];
  footer?: string;
  badge?: string;
};

export const featureDetails: Record<string, FeatureDetail> = {
  "AI Health Assistant": {
    key: "ai",
    title: "AI Health Assistant",
    tagline: "A quiet, brilliant companion — always listening, never judging.",
    hero: "Describe how you feel in your own words. Our assistant listens, understands context, and gently guides you toward the right care.",
    gradient: "from-violet-400/40 to-blue-400/40",
    bullets: [
      { icon: "🧠", title: "AI symptom guidance", desc: "Conversational triage trained on millions of clinical patterns." },
      { icon: "🌿", title: "Personalized recommendations", desc: "Advice shaped around your history, lifestyle, and vitals." },
      { icon: "📈", title: "Health insights", desc: "Weekly summaries that turn data into meaning." },
      { icon: "☀️", title: "Daily wellness tips", desc: "Small, kind nudges — hydration, breath, movement, sleep." },
      { icon: "🛤", title: "AI-powered care journey", desc: "Every recommendation connects to a doctor, action, or reflection." },
    ],
    footer: "Care that feels less like a chatbot, more like a friend who happens to be a doctor.",
  },
  "Smart Appointment Booking": {
    key: "booking",
    title: "Smart Appointment Booking",
    tagline: "The slot you want, the doctor you trust — in three taps.",
    hero: "No more phone tag. No more waiting rooms. Just a beautiful moment of care, scheduled around your day.",
    gradient: "from-blue-400/40 to-cyan-400/40",
    bullets: [
      { icon: "⚡️", title: "Real-time slot prediction", desc: "We surface openings before they show up anywhere else." },
      { icon: "✅", title: "Verified specialists", desc: "Every doctor is credential-checked and patient-rated." },
      { icon: "👆", title: "One-click booking", desc: "Confirm in seconds. Reschedule in one." },
      { icon: "🔔", title: "Smart reminders", desc: "Gentle nudges over email and in-app — never noisy." },
    ],
    footer: "Booking a doctor should feel as easy as booking a coffee.",
  },
  "Digital Prescription": {
    key: "rx",
    title: "Digital Prescriptions",
    tagline: "Your prescriptions, safely stored — for life.",
    hero: "Every prescription becomes a beautifully formatted, always-available part of your personal health story.",
    gradient: "from-amber-300/40 to-rose-300/40",
    bullets: [
      { icon: "☁️", title: "Cloud storage", desc: "Encrypted, versioned, and accessible from any device." },
      { icon: "⬇️", title: "Download anytime", desc: "Export as PDF or print-ready format in one tap." },
      { icon: "🔒", title: "Secure records", desc: "AES-256 at rest, TLS in transit, always yours to delete." },
      { icon: "🤝", title: "Share with doctors", desc: "One-tap sharing with the specialists you trust." },
    ],
    footer: "Never lose a prescription again — even the one from years ago.",
  },
  "Video Consultation": {
    key: "video",
    title: "Video Consultation",
    tagline: "Face-to-face care, from anywhere in the world.",
    hero: "High-definition, private consultation rooms designed for warm, focused conversations. Coming soon.",
    gradient: "from-cyan-400/40 to-teal-400/40",
    badge: "Coming soon",
    bullets: [
      { icon: "🎥", title: "HD consultation", desc: "Crystal-clear video and studio-quality audio." },
      { icon: "🛡", title: "Secure rooms", desc: "End-to-end encrypted, never recorded without consent." },
      { icon: "🕐", title: "24/7 availability", desc: "Doctors across time zones so care never sleeps." },
      { icon: "🗺", title: "Future roadmap", desc: "Multi-party rooms, live transcription, family consults." },
    ],
    footer: "Because sometimes, a face is worth a thousand messages.",
  },
  "Secure Payments": {
    key: "pay",
    title: "Secure Payments",
    tagline: "Bank-grade security. Delightful simplicity.",
    hero: "UPI, cards, wallets — all encrypted, all instant, all seamlessly integrated.",
    gradient: "from-rose-300/40 to-violet-400/40",
    bullets: [
      { icon: "🔐", title: "AES-256 encryption", desc: "Every transaction protected by the same tech banks trust." },
      { icon: "⚡", title: "One-tap UPI", desc: "Pay in a second, receive a beautiful receipt instantly." },
      { icon: "💳", title: "All cards accepted", desc: "Visa, Mastercard, Rupay, Amex — plus every wallet." },
      { icon: "🧾", title: "Transparent receipts", desc: "No hidden fees. Every rupee accounted for." },
    ],
  },
  "Wellness Insights": {
    key: "wellness",
    title: "Wellness Insights",
    tagline: "Ancient wisdom, translated by modern AI.",
    hero: "Personalised health journeys grounded in Ayurveda, sleep science, and behavioural design.",
    gradient: "from-emerald-300/40 to-blue-300/40",
    bullets: [
      { icon: "🌱", title: "Dosha-aware guidance", desc: "Recommendations tuned to your constitution." },
      { icon: "🌙", title: "Sleep intelligence", desc: "Learn how your nights shape your days." },
      { icon: "🧘", title: "Mindful rituals", desc: "Short, meaningful practices built into your routine." },
      { icon: "📊", title: "Trend visualisations", desc: "See your progress like never before." },
    ],
  },
};

export default function FeatureModal({ detail, onClose }: { detail: FeatureDetail | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {detail && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[220] grid place-items-center p-4 bg-foreground/50 backdrop-blur-md"
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 24 }}
            className="relative w-full max-w-2xl glass rounded-[2rem] overflow-hidden max-h-[88vh] flex flex-col"
          >
            <div className={`relative h-40 bg-gradient-to-br ${detail.gradient} overflow-hidden`}>
              <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-white/40 blur-3xl" />
              <div className="absolute -bottom-16 -left-10 w-64 h-64 rounded-full bg-primary/30 blur-3xl" />
              <button
                onClick={onClose}
                aria-label="Close"
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/40 backdrop-blur hover:bg-white/60 grid place-items-center transition"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="relative h-full flex flex-col justify-end p-6">
                {detail.badge && (
                  <span className="self-start px-3 py-1 rounded-full text-[10px] tracking-[0.25em] bg-foreground/80 text-background mb-2">
                    {detail.badge}
                  </span>
                )}
                <h3 className="font-display text-3xl md:text-4xl leading-tight">{detail.title}</h3>
                <p className="text-sm italic text-foreground/80 mt-1">{detail.tagline}</p>
              </div>
            </div>

            <div className="overflow-y-auto p-7 space-y-6">
              <p className="text-sm md:text-base text-foreground/80 leading-relaxed">{detail.hero}</p>

              <div className="grid sm:grid-cols-2 gap-3">
                {detail.bullets.map((b) => (
                  <motion.div
                    key={b.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="glass rounded-2xl p-4 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-10px_hsl(var(--primary)/0.3)] transition-all"
                  >
                    <div className="text-xl mb-1.5">{b.icon}</div>
                    <p className="text-sm font-medium">{b.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{b.desc}</p>
                  </motion.div>
                ))}
              </div>

              {detail.footer && (
                <div className="flex items-start gap-2 pt-2 border-t border-white/40">
                  <Sparkles className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <p className="text-sm italic text-gradient font-medium">{detail.footer}</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Row({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Check className="w-4 h-4 text-primary" /> {children}
    </div>
  );
}
