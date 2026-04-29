export default function Footer() {
  return (
    <footer className="px-6 pb-10 pt-20">
      <div className="container mx-auto max-w-6xl">
        <div className="glass rounded-3xl p-10 text-center">
          <div className="font-display text-3xl">
            Dhanvantara<span className="text-gradient-gold"> AI</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground italic">Ancient Wisdom. Modern Healing.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Careers</a>
            <a href="#" className="hover:text-foreground transition-colors">Press</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
          <div className="mt-8 pt-6 border-t border-white/40 text-xs text-muted-foreground">
            © 2026 Dhanvantara AI · Crafted with care in Bharat 🇮🇳
          </div>
        </div>
      </div>
    </footer>
  );
}
