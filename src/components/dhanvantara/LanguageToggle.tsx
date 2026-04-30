import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/context/I18nContext";

export default function LanguageToggle() {
  const { lang, setLang } = useI18n();
  const next = lang === "en" ? "hi" : "en";
  return (
    <button
      onClick={() => setLang(next)}
      aria-label="Switch language"
      className="relative h-9 px-3 rounded-full glass text-xs font-medium flex items-center gap-1.5 hover:scale-105 transition-transform overflow-hidden"
      title={lang === "en" ? "Switch to Hindi" : "अंग्रेज़ी में बदलें"}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={lang}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-1.5"
        >
          <span className="text-base leading-none">{lang === "en" ? "🇬🇧" : "🇮🇳"}</span>
          <span className="tracking-wider">{lang === "en" ? "EN" : "हिं"}</span>
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
