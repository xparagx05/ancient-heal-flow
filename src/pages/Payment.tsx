import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, CreditCard, Lock, Calendar, Clock, Stethoscope, ShieldCheck } from "lucide-react";
import Navbar from "@/components/dhanvantara/Navbar";
import Footer from "@/components/dhanvantara/Footer";
import EmergencyButton from "@/components/dhanvantara/EmergencyButton";
import { useBooking } from "@/context/BookingContext";

export default function PaymentPage() {
  const { id } = useParams();
  const { appointments, markPaid } = useBooking();
  const navigate = useNavigate();
  const appt = appointments.find((a) => a.id === id);
  const [state, setState] = useState<"idle" | "processing" | "success">("idle");

  useEffect(() => {
    if (!appt) {
      const t = setTimeout(() => navigate("/dashboard", { replace: true }), 1200);
      return () => clearTimeout(t);
    }
  }, [appt, navigate]);

  if (!appt) {
    return (
      <main className="min-h-screen grid place-items-center bg-gradient-hero">
        <p className="text-muted-foreground">Appointment not found. Redirecting…</p>
      </main>
    );
  }

  function pay() {
    setState("processing");
    setTimeout(() => {
      markPaid(appt!.id);
      setState("success");
    }, 1400);
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-gradient-hero">
      <Navbar />
      <EmergencyButton />

      <section className="container mx-auto max-w-3xl px-6 pt-32 pb-20">
        <Link to="/" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-4">
          <ArrowLeft className="w-3 h-3" /> Back to home
        </Link>

        {state !== "success" ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs tracking-[0.3em] text-primary mb-3">— SECURE CHECKOUT —</p>
            <h1 className="font-display text-5xl md:text-6xl">
              Complete your <span className="text-gradient-gold italic">payment</span>
            </h1>
            <p className="text-muted-foreground mt-3">256-bit encrypted. UPI · Cards · Wallets supported.</p>

            <div className="mt-10 grid md:grid-cols-[1fr_320px] gap-6">
              <div className="glass rounded-3xl p-6 space-y-4">
                <div className="flex items-center gap-2 text-xs tracking-[0.25em] text-primary">
                  <Stethoscope className="w-4 h-4" /> APPOINTMENT
                </div>
                <h2 className="font-display text-3xl">{appt.doctor}</h2>
                <p className="text-sm text-muted-foreground">{appt.specialty}</p>
                <div className="grid grid-cols-2 gap-3 text-sm pt-2">
                  <div className="glass rounded-2xl p-3">
                    <p className="text-[10px] tracking-widest text-muted-foreground">DATE</p>
                    <p className="mt-1 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {appt.date}</p>
                  </div>
                  <div className="glass rounded-2xl p-3">
                    <p className="text-[10px] tracking-widest text-muted-foreground">TIME</p>
                    <p className="mt-1 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {appt.time}</p>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verified specialist · Instant slot lock
                </div>
              </div>

              <div className="glass rounded-3xl p-6 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-4 h-4 text-primary" />
                  <p className="text-xs tracking-[0.25em] text-primary">SUMMARY</p>
                </div>
                <div className="space-y-2 text-sm mt-2">
                  <Row label="Consultation" value={`₹${appt.amount}`} />
                  <Row label="Platform fee" value="₹0" />
                  <Row label="Taxes" value="Included" />
                  <div className="h-px bg-border my-2" />
                  <Row label="Total" value={`₹${appt.amount}`} bold />
                </div>
                <button
                  disabled={state === "processing"}
                  onClick={pay}
                  className="mt-6 w-full py-3.5 rounded-full bg-gradient-primary text-primary-foreground font-medium hover:scale-[1.02] transition glow-primary disabled:opacity-70"
                >
                  {state === "processing" ? "Processing…" : `Pay ₹${appt.amount}`}
                </button>
                <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <Lock className="w-3 h-3" /> Encrypted by Dhanvantara Pay
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center py-10">
            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-gold grid place-items-center glow-gold mb-5">
              <CheckCircle2 className="w-10 h-10 text-foreground" />
            </div>
            <p className="text-xs tracking-[0.3em] text-primary mb-3">— CONFIRMED —</p>
            <h1 className="font-display text-5xl md:text-6xl">
              Your appointment is <span className="text-gradient-gold italic">confirmed</span>
            </h1>
            <p className="text-muted-foreground mt-4 max-w-md mx-auto">
              {appt.doctor} · {appt.date} at {appt.time}.<br />
              📩 SMS & Email sent successfully to +91 {appt.phone}.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
              <button onClick={() => navigate("/dashboard")} className="px-6 py-3 rounded-full bg-gradient-primary text-primary-foreground font-medium glow-primary">
                Go to dashboard
              </button>
              <Link to="/" className="px-6 py-3 rounded-full glass font-medium">Back to home</Link>
            </div>
          </motion.div>
        )}
      </section>

      <Footer />
    </main>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={bold ? "font-display text-lg text-gradient-gold" : "text-foreground"}>{value}</span>
    </div>
  );
}
