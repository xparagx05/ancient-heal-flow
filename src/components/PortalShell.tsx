import { Link, NavLink, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import logo from "@/assets/dhanvantara-logo.png";

export type NavItem = { to: string; label: string; icon: React.ReactNode; badge?: string };

export default function PortalShell({
  title,
  accent,
  nav,
  children,
}: {
  title: string;
  accent: string; // e.g. "Doctor Portal" / "Admin Control"
  nav: NavItem[];
  children: React.ReactNode;
}) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-white/5 bg-gradient-to-b from-background to-primary/5 p-5">
        <Link to="/" className="flex items-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-full overflow-hidden ring-1 ring-accent/40">
            <img src={logo} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-base">Dhanvantara<span className="text-gradient-gold"> AI</span></div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-accent/80">{accent}</div>
          </div>
        </Link>

        <nav className="flex-1 space-y-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to.split("/").length <= 2}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition ${
                  isActive
                    ? "bg-gradient-to-r from-accent/20 to-primary/20 text-foreground ring-1 ring-accent/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`
              }
            >
              <span className="w-4 h-4 flex items-center justify-center">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/20 text-accent">{item.badge}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={async () => { await signOut(); navigate("/"); }}
          className="mt-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground px-3 py-2 rounded-xl hover:bg-white/5"
        >
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/60 border-b border-white/5 px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-accent">{accent}</p>
            <h1 className="font-display text-2xl">{title}</h1>
          </div>
          <div className="text-xs text-muted-foreground truncate max-w-[220px]">
            {user?.email}
          </div>
        </header>
        <div className="p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
