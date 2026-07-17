import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function DoctorPending() {
  const { signOut } = useAuth();
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="glass rounded-3xl p-10 max-w-md text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-accent/15 flex items-center justify-center">
          <ShieldCheck className="w-6 h-6 text-accent" />
        </div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-accent mb-2">Application status</p>
        <h1 className="font-display text-3xl mb-3">Under review</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Thank you for applying. Our medical admin team is verifying your credentials.
          You'll receive access to the Doctor Portal once approved (typically 24–48 hours).
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/" className="px-5 py-2 rounded-full border border-white/10 text-sm hover:bg-white/5">Back to home</Link>
          <button onClick={signOut} className="px-5 py-2 rounded-full bg-gradient-gold text-foreground text-sm">Sign out</button>
        </div>
      </div>
    </div>
  );
}
