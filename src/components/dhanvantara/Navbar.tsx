import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function Navbar() {
  const links = ["Features", "Doctors", "Pricing", "Dashboard"];
  return (
    <motion.nav
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[min(94%,1100px)]"
    >
      <div className="glass rounded-full px-6 py-3 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-full bg-gradient-primary grid place-items-center glow-primary">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-display text-lg tracking-wide">Dhanvantara<span className="text-gradient-gold"> AI</span></span>
        </a>
        <div className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
          {links.map((l) => (
            <a key={l} href={`#${l.toLowerCase()}`} className="relative hover:text-foreground transition-colors after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-primary hover:after:w-full after:transition-all">
              {l}
            </a>
          ))}
        </div>
        <button className="px-4 py-2 rounded-full text-sm font-medium bg-gradient-primary text-primary-foreground hover:scale-105 transition-transform shadow-[0_8px_24px_-8px_hsl(var(--primary)/0.6)]">
          Sign in
        </button>
      </div>
    </motion.nav>
  );
}
