import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import logo from "@/assets/dhanvantara-logo.png";
import ThemeToggle from "./ThemeToggle";
import NotificationBell from "./NotificationBell";
import LanguageToggle from "./LanguageToggle";
import { useBooking } from "@/context/BookingContext";
import { useI18n } from "@/context/I18nContext";

export default function Navbar() {
  const { scrollY } = useScroll();
  const padY = useTransform(scrollY, [0, 120], [16, 8]);
  const { openBooking } = useBooking();
  const { t } = useI18n();
  const links = [
    { label: t("nav.home"), emoji: "🏠", to: "/" },
    { label: t("nav.doctors"), emoji: "🩺", to: "/#doctors" },
    { label: t("nav.pricing"), emoji: "💳", to: "/pricing" },
    { label: t("nav.dashboard"), emoji: "📊", to: "/dashboard" },
  ];

  return (
    <motion.nav
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      style={{ paddingTop: padY }}
      className="fixed top-0 inset-x-0 z-50 px-3"
    >
      <div className="mx-auto w-[min(96%,1180px)] glass rounded-full pl-3 pr-3 py-2 flex items-center justify-between gap-3 shadow-[0_10px_40px_-15px_hsl(var(--primary)/0.4)]">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative w-11 h-11 rounded-full overflow-hidden ring-1 ring-accent/40 transition-all group-hover:ring-2 group-hover:ring-accent group-hover:shadow-[0_0_24px_hsl(var(--accent)/0.7)]">
            <img src={logo} alt="Dhanvantara AI logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-display text-lg tracking-wide hidden sm:inline">
            Dhanvantara<span className="text-gradient-gold"> AI</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              style={{
                fontFamily: "'Cormorant Garamond', 'Playfair Display', 'Libre Baskerville', serif",
                fontWeight: 600,
                fontSize: "17px",
                letterSpacing: "0.4px",
              }}
              className="relative px-4 py-1.5 rounded-full text-foreground/75 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-[hsl(42_95%_55%)] hover:via-[hsl(42_80%_75%)] hover:to-[hsl(45_60%_92%)] transition-all duration-300 group"
            >
              <span className="mr-1.5 text-sm align-middle">{l.emoji}</span>
              <span className="align-middle">{l.label}</span>
              <span className="absolute left-4 right-4 -bottom-0.5 h-px bg-gradient-to-r from-accent to-primary scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
            </Link>
          ))}
        </div>


        <div className="flex items-center gap-1.5">
          <LanguageToggle />
          <NotificationBell />
          <ThemeToggle />
          <button
            onClick={() => openBooking(null)}
            className="ripple px-4 py-2 rounded-full text-sm font-medium bg-gradient-gold text-foreground hover:scale-105 transition-transform shadow-[0_8px_24px_-8px_hsl(var(--accent)/0.7)] hidden sm:inline-flex"
          >
            {t("nav.bookNow")}
          </button>
        </div>
      </div>
    </motion.nav>
  );
}
