import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CreditCard, Lock, Calendar, Clock, Stethoscope, ShieldCheck, Smartphone, QrCode, Building2 } from "lucide-react";
import Navbar from "@/components/dhanvantara/Navbar";
import Footer from "@/components/dhanvantara/Footer";
import EmergencyButton from "@/components/dhanvantara/EmergencyButton";
import SuccessScreen from "@/components/dhanvantara/SuccessScreen";
import { useBooking } from "@/context/BookingContext";
import { openRazorpayCheckout, RAZORPAY_ME_FALLBACK } from "@/lib/razorpay";
import { downloadReceiptPDF } from "@/lib/receipt";
import { toast } from "sonner";

export default function PaymentPage() {
  const { id } = useParams();
  const { appointments, markPaid } = useBooking();
  const navigate = useNavigate();
  const appt = appointments.find((a) => a.id === id);
  const [state, setState] = useState<"idle" | "processing" | "success">("idle");
  const [paymentId, setPaymentId] = useState<string>();
  const [orderId, setOrderId] = useState<string>();
  const receiptId = useMemo(() => `DHV-${(id || "").slice(0, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`, [id]);

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

  async function pay() {
    if (!appt) return;
    try {
      setState("processing");
      const res = await openRazorpayCheckout({
        amount: appt.amount,
        name: "Dhanvantara AI",
        description: `Consultation with ${appt.doctor}`,
        prefill: { name: appt.name, email: appt.email, contact: appt.phone },
        notes: { appointmentId: appt.id, doctor: appt.doctor, date: appt.date, time: appt.time },
        theme: { color: "#C9A24A" },
        appointmentId: appt.supaId,
      });
      setPaymentId(res.razorpay_payment_id);
      setOrderId(res.razorpay_order_id);
      markPaid(appt.id, {
        paymentId: res.razorpay_payment_id,
        orderId: res.razorpay_order_id,
        receiptId,
      });
      setState("success");
    } catch (e: any) {
      setState("idle");
      toast.error(e?.message || "Payment could not be completed");
    }
  }

  function download() {
    if (!appt) return;
    downloadReceiptPDF({
      kind: "appointment",
      receiptId,
      paymentId,
      orderId,
      name: appt.name,
      email: appt.email,
      phone: appt.phone,
      itemTitle: appt.doctor,
      itemSubtitle: appt.specialty,
      date: appt.date,
      time: appt.time,
      amount: appt.amount,
    });
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
            <p className="text-muted-foreground mt-3">Powered by Razorpay · UPI · QR · Cards · Net Banking</p>

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
                <div className="flex flex-wrap gap-2 pt-2">
                  <PayChip icon={Smartphone} label="UPI" />
                  <PayChip icon={QrCode} label="QR Code" />
                  <PayChip icon={CreditCard} label="Cards" />
                  <PayChip icon={Building2} label="Net Banking" />
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
                  {state === "processing" ? "Opening Razorpay…" : `Pay ₹${appt.amount} securely`}
                </button>
                <a
                  href={RAZORPAY_ME_FALLBACK}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 text-center text-xs text-primary hover:underline"
                >
                  Having trouble? Use Razorpay.me fallback →
                </a>
                <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <Lock className="w-3 h-3" /> 256-bit encrypted · PCI-DSS compliant
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <SuccessScreen
            title="Your appointment has been confirmed."
            message={`${appt.doctor} · ${appt.date} at ${appt.time}\nA confirmation has been sent to ${appt.email || "your email"}.\nWe look forward to caring for you.`}
            onDownload={download}
            onPrimary={() => navigate("/dashboard")}
          />
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

function PayChip({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-xs">
      <Icon className="w-3.5 h-3.5 text-primary" /> {label}
    </span>
  );
}
