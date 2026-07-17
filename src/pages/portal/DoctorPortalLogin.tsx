import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Stethoscope, KeyRound, IdCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import logo from "@/assets/dhanvantara-logo.png";

export default function DoctorPortalLogin() {
  const [professionalId, setProfessionalId] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();
  const { session, primaryRole, loading } = useAuth();

  useEffect(() => {
    if (loading || !session) return;
    if (primaryRole === "doctor") nav("/doctor", { replace: true });
    else if (primaryRole === "admin") nav("/admin", { replace: true });
    else nav("/unauthorized", { replace: true });
  }, [session, primaryRole, loading, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("resolve-doctor-id", {
        body: { professional_id: professionalId.trim() },
      });
      if (error) throw new Error(error.message);
      if ((data as any)?.error) throw new Error((data as any).error);
      const { email, application_status, is_active } = data as {
        email: string; application_status: string | null; is_active: boolean;
      };
      if (!is_active) throw new Error("This doctor account has been deactivated. Contact support.");
      if (application_status && application_status !== "approved") {
        throw new Error("Your application is not yet approved. Please wait for verification.");
      }
      const { error: signErr } = await supabase.auth.signInWithPassword({ email, password });
      if (signErr) throw signErr;
      toast.success("Welcome, doctor");
    } catch (err: any) {
      toast.error(err.message ?? "Sign-in failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/10" />
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-accent/10 blur-[120px]" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary/20 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="relative w-full max-w-md glass rounded-3xl p-8 shadow-[0_30px_80px_-20px_hsl(var(--primary)/0.4)]"
      >
        <Link to="/" className="flex items-center gap-2.5 mb-6">
          <div className="w-10 h-10 rounded-full overflow-hidden ring-1 ring-accent/40">
            <img src={logo} alt="Dhanvantara AI" className="w-full h-full object-cover" />
          </div>
          <span className="font-display text-lg">Dhanvantara<span className="text-gradient-gold"> AI</span></span>
        </Link>

        <div className="flex items-center gap-2 mb-1">
          <Stethoscope className="w-4 h-4 text-accent" />
          <p className="text-xs tracking-[0.25em] text-accent">— DOCTOR PORTAL —</p>
        </div>
        <h1 className="font-display text-3xl mb-1">Physician sign-in</h1>
        <p className="text-sm text-muted-foreground mb-6">Use your Professional ID issued after verification.</p>

        <form onSubmit={submit} className="space-y-3">
          <label className="block">
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground flex items-center gap-1"><IdCard className="w-3 h-3" /> Professional ID</span>
            <input
              value={professionalId}
              onChange={(e) => setProfessionalId(e.target.value.toUpperCase())}
              required
              placeholder="DOC-2026-0001"
              className="mt-1 w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-accent/60 focus:outline-none text-sm tracking-wider"
            />
          </label>
          <label className="block">
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground flex items-center gap-1"><KeyRound className="w-3 h-3" /> Password</span>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              required minLength={8}
              className="mt-1 w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-accent/60 focus:outline-none text-sm"
            />
          </label>
          <button
            type="submit" disabled={busy}
            className="ripple w-full py-2.5 rounded-full bg-gradient-gold text-foreground font-medium text-sm hover:scale-[1.01] transition disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Sign in to Doctor Portal"}
          </button>
        </form>

        <p className="mt-5 text-xs text-center text-muted-foreground">
          Not a doctor yet? <Link to="/doctor/apply" className="text-accent hover:underline">Apply to join</Link>
        </p>
        <p className="mt-2 text-xs text-center text-muted-foreground">
          Patient? <Link to="/auth" className="text-accent hover:underline">Patient sign-in</Link>
        </p>
      </motion.div>
    </div>
  );
}
