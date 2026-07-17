import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/context/AuthContext";
import logo from "@/assets/dhanvantara-logo.png";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next");
  const { session, primaryRole, loading } = useAuth();

  // Route once we know the role
  useEffect(() => {
    if (loading || !session) return;
    if (next && next.startsWith("/")) {
      nav(next, { replace: true });
      return;
    }
    if (primaryRole === "admin") nav("/admin", { replace: true });
    else if (primaryRole === "doctor") nav("/doctor", { replace: true });
    else nav("/dashboard", { replace: true });
  }, [session, primaryRole, loading, next, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        toast.success("Account created. Signing you in…");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back");
      }
    } catch (err: any) {
      toast.error(err.message ?? "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    const res = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/auth",
    });
    if (res.error) {
      toast.error("Google sign-in failed");
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/10" />
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-accent/10 blur-[120px]" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary/20 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md glass rounded-3xl p-8 shadow-[0_30px_80px_-20px_hsl(var(--primary)/0.4)]"
      >
        <Link to="/" className="flex items-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-full overflow-hidden ring-1 ring-accent/40">
            <img src={logo} alt="Dhanvantara AI" className="w-full h-full object-cover" />
          </div>
          <span className="font-display text-lg">
            Dhanvantara<span className="text-gradient-gold"> AI</span>
          </span>
        </Link>

        <h1 className="font-display text-3xl mb-1">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          {mode === "login" ? "Sign in to continue your healthcare journey." : "Join Dhanvantara AI in under a minute."}
        </p>

        <button
          type="button"
          onClick={google}
          disabled={busy}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition text-sm"
        >
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 5c1.6 0 3 .55 4.13 1.62l3.07-3.07C17.4 1.62 14.9.5 12 .5 7.35.5 3.35 3.16 1.4 7.05l3.57 2.77C5.9 6.98 8.7 5 12 5z"/><path fill="#4285F4" d="M23.5 12.28c0-.79-.07-1.55-.2-2.28H12v4.32h6.47c-.28 1.5-1.13 2.77-2.4 3.62v3h3.88c2.27-2.09 3.55-5.17 3.55-8.66z"/><path fill="#FBBC05" d="M4.97 14.18a7.05 7.05 0 0 1 0-4.36L1.4 7.05a11.5 11.5 0 0 0 0 9.9l3.57-2.77z"/><path fill="#34A853" d="M12 23.5c3.24 0 5.96-1.07 7.95-2.9l-3.88-3c-1.08.72-2.46 1.15-4.07 1.15-3.3 0-6.1-1.98-7.03-4.82L1.4 16.7C3.35 20.6 7.35 23.5 12 23.5z"/></svg>
          Continue with Google
        </button>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex-1 h-px bg-white/10" /> or <div className="flex-1 h-px bg-white/10" />
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && (
            <input
              type="text"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-accent/60 focus:outline-none text-sm"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-accent/60 focus:outline-none text-sm"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-accent/60 focus:outline-none text-sm"
          />
          <button
            type="submit"
            disabled={busy}
            className="ripple w-full py-2.5 rounded-full bg-gradient-gold text-foreground font-medium text-sm hover:scale-[1.01] transition disabled:opacity-60"
          >
            {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="mt-5 text-sm text-center text-muted-foreground">
          {mode === "login" ? "New to Dhanvantara?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="text-accent hover:underline"
          >
            {mode === "login" ? "Create account" : "Sign in"}
          </button>
        </p>

        <p className="mt-6 text-xs text-center text-muted-foreground">
          Are you a doctor?{" "}
          <Link to="/doctor/apply" className="text-accent hover:underline">Apply to join</Link>
        </p>
      </motion.div>
    </div>
  );
}
