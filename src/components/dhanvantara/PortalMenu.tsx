import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { UserRound, Stethoscope, ShieldCheck, LogOut, LayoutDashboard, ChevronDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function PortalMenu() {
  const [open, setOpen] = useState(false);
  const { session, primaryRole, signOut } = useAuth();

  const dashHref =
    primaryRole === "admin" ? "/admin" : primaryRole === "doctor" ? "/doctor" : "/dashboard";

  return (
    <div className="relative" onMouseLeave={() => setOpen(false)}>
      <button
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        style={{
          fontFamily: "'Cormorant Garamond', 'Playfair Display', 'Libre Baskerville', serif",
          fontWeight: 600,
          fontSize: "17px",
          letterSpacing: "0.4px",
        }}
        className="relative px-4 py-1.5 rounded-full text-foreground/75 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-[hsl(42_95%_55%)] hover:via-[hsl(42_80%_75%)] hover:to-[hsl(45_60%_92%)] transition-all duration-300 group inline-flex items-center gap-1"
      >
        <span className="mr-1.5 text-sm align-middle">🔐</span>
        <span className="align-middle">Portal</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
        <span className="absolute left-4 right-4 -bottom-0.5 h-px bg-gradient-to-r from-accent to-primary scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 mt-2 w-[300px] glass rounded-2xl p-2 shadow-[0_30px_80px_-20px_hsl(var(--primary)/0.5)] ring-1 ring-accent/20 z-50"
          >
            {session ? (
              <div className="p-2">
                <div className="px-3 py-2 text-xs uppercase tracking-widest text-muted-foreground">
                  Signed in as <span className="text-gradient-gold">{primaryRole ?? "patient"}</span>
                </div>
                <Link
                  to={dashHref}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition"
                >
                  <LayoutDashboard className="w-4 h-4 text-accent" />
                  <span className="text-sm">Go to my dashboard</span>
                </Link>
                <button
                  onClick={async () => { setOpen(false); await signOut(); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition text-left"
                >
                  <LogOut className="w-4 h-4 text-accent" />
                  <span className="text-sm">Sign out</span>
                </button>
              </div>
            ) : (
              <div className="p-1">
                <div className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  Choose your portal
                </div>
                <Tile
                  to="/auth"
                  icon={<UserRound className="w-4 h-4" />}
                  title="Patient Portal"
                  subtitle="Book, consult and follow up"
                  onClick={() => setOpen(false)}
                />
                <Tile
                  to="/portal/doctor"
                  icon={<Stethoscope className="w-4 h-4" />}
                  title="Doctor Portal"
                  subtitle="Sign in with Professional ID"
                  onClick={() => setOpen(false)}
                />
                <Tile
                  to="/portal/admin"
                  icon={<ShieldCheck className="w-4 h-4" />}
                  title="Admin Portal"
                  subtitle="Platform administration"
                  onClick={() => setOpen(false)}
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Tile({ to, icon, title, subtitle, onClick }: {
  to: string; icon: React.ReactNode; title: string; subtitle: string; onClick: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition"
    >
      <div className="w-9 h-9 rounded-xl grid place-items-center bg-gradient-to-br from-accent/20 to-primary/10 ring-1 ring-accent/20 text-accent group-hover:scale-105 transition">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-[11px] text-muted-foreground truncate">{subtitle}</div>
      </div>
    </Link>
  );
}
