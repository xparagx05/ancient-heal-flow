import { useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, FileText, Rocket, Newspaper, Phone, Mail, MapPin, Sparkles, Heart, Globe } from "lucide-react";
import { useI18n } from "@/context/I18nContext";

type ModalKey = null | "privacy" | "terms" | "careers" | "press" | "contact" | "about";

const links: { key: NonNullable<ModalKey>; emoji: string; label: string; icon: any }[] = [
  { key: "about", emoji: "🛕", label: "About", icon: Heart },
  { key: "privacy", emoji: "🔒", label: "Privacy", icon: Shield },
  { key: "terms", emoji: "📜", label: "A Promise", icon: FileText },
  { key: "careers", emoji: "🚀", label: "Careers", icon: Rocket },
  { key: "press", emoji: "📰", label: "Our Journey", icon: Newspaper },
  { key: "contact", emoji: "📞", label: "Contact", icon: Phone },
];

export default function Footer() {
  const { t } = useI18n();
  const [modal, setModal] = useState<ModalKey>(null);

  return (
    <footer className="px-6 pb-10 pt-20">
      <div className="container mx-auto max-w-6xl">
        <div className="relative glass rounded-3xl p-10 text-center overflow-hidden">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[200px] rounded-full bg-gradient-gold opacity-10 blur-3xl pointer-events-none" />

          <div className="relative">
            <div className="font-display text-3xl">
              🛕 Dhanvantara<span className="text-gradient-gold"> AI</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground italic">{t("footer.tagline")}</p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs">
              {links.map((l) => (
                <button
                  key={l.key}
                  onClick={() => setModal(l.key)}
                  className="group px-4 py-2 rounded-full glass hover:shadow-[0_0_24px_hsl(var(--accent)/0.4)] hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  <span className="text-sm">{l.emoji}</span>
                  <span>{l.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-10 pt-6 border-t border-white/40 space-y-1.5 text-sm">
              <p className="text-foreground/80">✨ {t("footer.built")}</p>
              <p className="text-muted-foreground text-xs tracking-wide">🚀 {t("footer.power")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ABOUT */}
      <FooterModal open={modal === "about"} onClose={() => setModal(null)} title="🛕 About Dhanvantara AI" icon={Heart}>
        <p className="font-display text-2xl text-gradient leading-snug">Where ancient healing meets modern intelligence.</p>
        <p>
          Thousands of years ago, in the calm halls of Ayurveda, a physician named <em>Dhanvantara</em> was said
          to hold not just knowledge — but presence. Care. The quiet belief that a healer's real work begins
          long before the first symptom.
        </p>
        <p>
          Dhanvantara AI carries that spirit forward. We're building a companion — one part technology, one
          part compassion — that meets people in the moments they need care most.
        </p>
        <div className="grid grid-cols-2 gap-2 pt-1">
          {[
            { e: "🌿", t: "Ancient healing" },
            { e: "🤖", t: "Modern AI" },
            { e: "❤️", t: "Compassion first" },
            { e: "🎯", t: "Real purpose" },
          ].map((x) => (
            <div key={x.t} className="glass rounded-xl px-3 py-2 text-sm flex items-center gap-2">
              <span>{x.e}</span>
              <span className="font-medium">{x.t}</span>
            </div>
          ))}
        </div>
        <p className="italic border-l-2 border-accent pl-4 text-foreground/80">
          We believe healthcare shouldn't begin when you're sick.
          <br />
          It should begin the moment you decide to care for yourself.
        </p>
      </FooterModal>

      {/* PRIVACY */}
      <FooterModal open={modal === "privacy"} onClose={() => setModal(null)} title="🔒 Your Health. Your Story. Your Choice." icon={Shield}>
        <p className="font-display text-2xl text-gradient leading-snug">Trust isn't a checkbox. It's a promise.</p>
        <p>
          Behind every record we hold is a person — someone's parent, someone's child, someone's tomorrow.
          We treat your health story the way we'd want ours to be treated. Quietly. Carefully. Only ever
          shared when <em>you</em> choose to share it.
        </p>
        <p>
          You'll never have to wonder who's watching. We built this platform assuming one thing: your data
          is yours. Full stop. You can see it, export it, or ask us to forget it — anytime.
        </p>
        <p className="italic text-foreground/80">
          Because before we're a product, we're people building for people. Your trust is what makes any of
          this worth doing.
        </p>
        <p className="text-xs text-muted-foreground">Questions? Write to privacy@dhanvantara.ai — a human will reply.</p>
      </FooterModal>

      {/* TERMS — "A Promise Between Us" */}
      <FooterModal open={modal === "terms"} onClose={() => setModal(null)} title="📜 A Promise Between Us" icon={FileText}>
        <p className="font-display text-2xl text-gradient leading-snug">This isn't fine print. It's the beginning of a relationship.</p>
        <p>Here's what we promise you:</p>
        <ul className="space-y-2 text-sm">
          <li className="flex gap-2"><span>💛</span><span>We'll show up when you need us — with care, not scripts.</span></li>
          <li className="flex gap-2"><span>🌱</span><span>We'll grow slowly, so we grow well. Never at the cost of your trust.</span></li>
          <li className="flex gap-2"><span>🤝</span><span>If we make a mistake, we'll own it — quickly, honestly, and in plain words.</span></li>
          <li className="flex gap-2"><span>🕊</span><span>We'll never sell your story. It isn't ours to sell.</span></li>
        </ul>
        <p>And here's what we ask of you:</p>
        <ul className="space-y-2 text-sm">
          <li className="flex gap-2"><span>🌸</span><span>Use Dhanvantara AI to care — for yourself, for someone you love.</span></li>
          <li className="flex gap-2"><span>🚑</span><span>In an emergency, please call your local services first. We're here for the rest.</span></li>
          <li className="flex gap-2"><span>✨</span><span>Tell us when we get it right. Tell us louder when we don't.</span></li>
        </ul>
        <p className="text-xs text-muted-foreground">A living promise. Updated whenever we learn to be better.</p>
      </FooterModal>

      {/* CAREERS */}
      <FooterModal open={modal === "careers"} onClose={() => setModal(null)} title="🚀 Build What Matters." icon={Rocket}>
        <p className="font-display text-2xl text-gradient leading-snug">We're not hiring employees. We're gathering believers.</p>
        <p>
          Dhanvantara AI exists to make healthcare feel human again. If that idea gives you goosebumps —
          if you've ever felt the frustration of a system that forgot the person in front of it — you're
          the kind of mind we want to build with.
        </p>
        <div className="grid grid-cols-2 gap-3 pt-2">
          {[
            { r: "Frontend Engineer", tag: "Craft delight" },
            { r: "AI/ML Engineer", tag: "Shape intelligence" },
            { r: "Clinical Lead", tag: "Guide the soul" },
            { r: "Product Designer", tag: "Design empathy" },
          ].map((x) => (
            <div key={x.r} className="glass rounded-xl px-4 py-3 text-sm hover:-translate-y-0.5 transition-all">
              <span className="text-[10px] tracking-widest text-primary uppercase">Open · {x.tag}</span>
              <p className="font-medium mt-0.5">{x.r}</p>
            </div>
          ))}
        </div>
        <p className="italic text-foreground/80">Come dream with us. Real work. Real impact. Real people.</p>
        <p className="text-sm">📩 Tell us your story: <span className="text-primary">careers@dhanvantara.ai</span></p>
      </FooterModal>

      {/* PRESS — "Our Journey is Just Beginning" — timeline */}
      <FooterModal open={modal === "press"} onClose={() => setModal(null)} title="📰 Our Journey is Just Beginning" icon={Newspaper}>
        <p className="font-display text-2xl text-gradient leading-snug">Small steps. Real momentum.</p>
        <div className="relative pl-6 space-y-5 border-l-2 border-accent/40">
          {[
            { y: "2026", e: "🚀", t: "Founded", d: "Three builders, one shared belief — healthcare deserves better." },
            { y: "2026", e: "🏆", t: "Hackathon", d: "Dhanvantara AI takes shape in a caffeinated blur of code and conviction." },
            { y: "2026", e: "💡", t: "Prototype", d: "First working platform: AI triage, booking, prescriptions — all in one flow." },
            { y: "Soon", e: "❤️", t: "First Patient Helped", d: "The moment this stops being a project and starts being a mission." },
            { y: "Future", e: "🌍", t: "Global Expansion", d: "Bringing ancient healing wisdom, powered by AI, to the world." },
          ].map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="relative"
            >
              <span className="absolute -left-[34px] top-0 w-6 h-6 rounded-full bg-gradient-gold grid place-items-center text-xs shadow-md">
                {m.e}
              </span>
              <p className="text-[10px] tracking-[0.25em] text-primary">{m.y}</p>
              <p className="font-display text-lg leading-tight">{m.t}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{m.d}</p>
            </motion.div>
          ))}
        </div>
        <p className="text-sm">Press inquiries: <span className="text-primary">press@dhanvantara.ai</span></p>
      </FooterModal>

      {/* CONTACT */}
      <FooterModal open={modal === "contact"} onClose={() => setModal(null)} title="📞 Let's Build a Healthier Tomorrow Together." icon={Phone}>
        <p>We'd love to hear from you. Reach out anytime — a real person reads every message.</p>
        <div className="space-y-3 pt-2">
          <ContactRow icon={Mail} label="Email" value="hellodhanvantara.ai@gmail.com" href="mailto:hellodhanvantara.ai@gmail.com" />
          <ContactRow icon={Phone} label="Phone" value="+91 99758 03340" href="tel:+919975803340" />
          <ContactRow icon={MapPin} label="Location" value="Mumbai, Maharashtra · Bharat 🇮🇳" />
          <ContactRow icon={Globe} label="Website" value="ancient-heal-flow.lovable.app" href="https://ancient-heal-flow.lovable.app" />
        </div>
        <div className="pt-4 border-t border-white/30 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-accent shrink-0 mt-0.5" />
          <p className="italic text-gradient font-medium">
            Every conversation has the power to change someone's life. Let's start one.
          </p>
        </div>
      </FooterModal>
    </footer>
  );
}

function ContactRow({ icon: Icon, label, value, href }: { icon: any; label: string; value: string; href?: string }) {
  const inner = (
    <>
      <div className="w-9 h-9 rounded-full bg-gradient-primary grid place-items-center">
        <Icon className="w-4 h-4 text-primary-foreground" />
      </div>
      <div>
        <p className="text-[10px] tracking-widest text-muted-foreground uppercase">{label}</p>
        <p className="text-sm font-medium break-all">{value}</p>
      </div>
    </>
  );
  const className = "flex items-center gap-3 p-3 glass rounded-xl hover:-translate-y-0.5 transition-all";
  return href ? (
    <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className={className}>{inner}</a>
  ) : (
    <div className={className}>{inner}</div>
  );
}

function FooterModal({ open, onClose, title, icon: Icon, children }: { open: boolean; onClose: () => void; title: string; icon: any; children: ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] grid place-items-center p-4 bg-foreground/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg glass rounded-3xl p-7 shadow-2xl max-h-[85vh] overflow-y-auto"
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-4 right-4 w-9 h-9 rounded-full grid place-items-center hover:bg-foreground/10 transition"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3 mb-5 pr-8">
              <div className="w-10 h-10 rounded-full bg-gradient-primary grid place-items-center shrink-0">
                <Icon className="w-4 h-4 text-primary-foreground" />
              </div>
              <h3 className="font-display text-2xl leading-tight">{title}</h3>
            </div>
            <div className="space-y-4 text-sm text-foreground/80 leading-relaxed">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
