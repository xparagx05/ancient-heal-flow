import { useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, FileText, Rocket, Newspaper, Phone, Mail, MapPin } from "lucide-react";
import { useI18n } from "@/context/I18nContext";

type ModalKey = null | "privacy" | "terms" | "careers" | "press" | "contact";

const links: { key: NonNullable<ModalKey>; emoji: string; tKey: any; icon: any }[] = [
  { key: "privacy", emoji: "🔒", tKey: "footer.privacy", icon: Shield },
  { key: "terms", emoji: "📜", tKey: "footer.terms", icon: FileText },
  { key: "careers", emoji: "🚀", tKey: "footer.careers", icon: Rocket },
  { key: "press", emoji: "📰", tKey: "footer.press", icon: Newspaper },
  { key: "contact", emoji: "📞", tKey: "footer.contact", icon: Phone },
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
                  <span>{t(l.tKey)}</span>
                </button>
              ))}
            </div>

            <div className="mt-10 pt-6 border-t border-white/40 space-y-1.5 text-sm">
              <p className="text-foreground/80">
                ✨ {t("footer.built")}
              </p>
              <p className="text-muted-foreground text-xs tracking-wide">
                🚀 {t("footer.power")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <FooterModal open={modal === "privacy"} onClose={() => setModal(null)} title="🔒 Privacy Policy" icon={Shield}>
        <p>
          Your data belongs to you. Dhanvantara AI uses bank-grade encryption (AES-256) for all health
          records and communications. We never sell your information to third parties.
        </p>
        <p>
          Information collected (appointments, vitals, prescriptions) is stored securely and only
          accessible to the doctor you consult and yourself. You can request a full export or deletion
          of your data at any time.
        </p>
        <p>For questions about how we handle your data, contact <span className="text-primary">privacy@dhanvantara.ai</span>.</p>
      </FooterModal>

      <FooterModal open={modal === "terms"} onClose={() => setModal(null)} title="📜 Terms of Service" icon={FileText}>
        <p>By using Dhanvantara AI you agree to use the platform for lawful, personal healthcare needs.</p>
        <ul className="list-disc pl-5 space-y-1.5 text-sm">
          <li>Consultations are advisory and do not replace emergency care.</li>
          <li>Prescriptions are issued at the discretion of the verified specialist.</li>
          <li>Refunds for cancelled appointments are processed within 5–7 business days.</li>
          <li>Misuse of the platform may result in suspension of your account.</li>
        </ul>
        <p className="text-xs text-muted-foreground">Last updated: April 2026</p>
      </FooterModal>

      <FooterModal open={modal === "careers"} onClose={() => setModal(null)} title="🚀 Careers at Dhanvantara" icon={Rocket}>
        <p className="font-display text-2xl text-gradient">We are building the future of healthcare. Join us!</p>
        <p>
          We're a small but ambitious team reshaping how India experiences care. If you love clean
          design, hard problems, and meaningful work — we'd love to talk.
        </p>
        <div className="grid grid-cols-2 gap-3 pt-2">
          {["Frontend Engineer", "AI/ML Engineer", "Clinical Lead", "Product Designer"].map((r) => (
            <div key={r} className="glass rounded-xl px-4 py-3 text-sm">
              <span className="text-xs text-muted-foreground">Open</span>
              <p className="font-medium mt-0.5">{r}</p>
            </div>
          ))}
        </div>
        <p className="text-sm">
          📩 Send your story to <span className="text-primary">careers@dhanvantara.ai</span>
        </p>
      </FooterModal>

      <FooterModal open={modal === "press"} onClose={() => setModal(null)} title="📰 Press & Media" icon={Newspaper}>
        <p className="font-display text-2xl text-gradient">Media and updates coming soon.</p>
        <p>
          We're heads-down building right now. Once we have stories worth telling, this is where you'll
          find press releases, brand assets, and founder interviews.
        </p>
        <p className="text-sm">
          Press inquiries: <span className="text-primary">press@dhanvantara.ai</span>
        </p>
      </FooterModal>

      <FooterModal open={modal === "contact"} onClose={() => setModal(null)} title="📞 Get in touch" icon={Phone}>
        <p>We'd love to hear from you. Reach out anytime — we usually reply within a day.</p>
        <div className="space-y-3 pt-2">
          <ContactRow icon={Mail} label="Email" value="hello@dhanvantara.ai" />
          <ContactRow icon={Phone} label="Phone" value="+91 98765 43210" />
          <ContactRow icon={MapPin} label="Location" value="Nashik, Maharashtra · Bharat 🇮🇳" />
        </div>
      </FooterModal>
    </footer>
  );
}

function ContactRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-3 glass rounded-xl">
      <div className="w-9 h-9 rounded-full bg-gradient-primary grid place-items-center">
        <Icon className="w-4 h-4 text-primary-foreground" />
      </div>
      <div>
        <p className="text-[10px] tracking-widest text-muted-foreground uppercase">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
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
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-gradient-primary grid place-items-center">
                <Icon className="w-4 h-4 text-primary-foreground" />
              </div>
              <h3 className="font-display text-2xl">{title}</h3>
            </div>
            <div className="space-y-4 text-sm text-foreground/80 leading-relaxed">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
