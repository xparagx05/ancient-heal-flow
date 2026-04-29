import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { X, CheckCircle2, CreditCard, Lock } from "lucide-react";
import { useBooking } from "@/context/BookingContext";

export default function PaymentModal() {
  const { paymentFor, closePayment, markPaid } = useBooking();
  const [state, setState] = useState<"idle" | "processing" | "success">("idle");

  if (!paymentFor) return null;

  function handlePay() {
    setState("processing");
    setTimeout(() => {
      markPaid(paymentFor!.id);
      setState("success");
    }, 1400);
  }

  function handleClose() {
    closePayment();
    setTimeout(() => setState("idle"), 300);
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] grid place-items-center p-4 bg-foreground/40 backdrop-blur-sm"
        onClick={state === "processing" ? undefined : handleClose}
      >
        <motion.div
          initial={{ scale: 0.92, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", stiffness: 240, damping: 24 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md glass rounded-3xl p-7 shadow-2xl"
        >
          <button onClick={handleClose} aria-label="Close" className="absolute top-4 right-4 w-9 h-9 rounded-full grid place-items-center hover:bg-foreground/10">
            <X className="w-4 h-4" />
          </button>

          {state !== "success" ? (
            <>
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className="w-4 h-4 text-primary" />
                <p className="text-xs tracking-[0.25em] text-primary">— SECURE CHECKOUT —</p>
              </div>
              <h3 className="font-display text-3xl mb-5">Complete payment</h3>

              <div className="rounded-2xl glass p-4 space-y-2 text-sm">
                <Row label="Doctor" value={paymentFor.doctor} />
                <Row label="Specialty" value={paymentFor.specialty} />
                <Row label="Date" value={paymentFor.date} />
                <Row label="Time" value={paymentFor.time} />
                <div className="h-px bg-border my-2" />
                <Row label="Total" value={`₹${paymentFor.amount}`} bold />
              </div>

              <button
                disabled={state === "processing"}
                onClick={handlePay}
                className="mt-6 w-full py-3.5 rounded-full bg-gradient-primary text-primary-foreground font-medium hover:scale-[1.02] transition glow-primary disabled:opacity-70"
              >
                {state === "processing" ? "Processing…" : `Pay ₹${paymentFor.amount}`}
              </button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="w-3 h-3" /> 256-bit encrypted · UPI · Cards · Wallets
              </p>
            </>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-2">
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-gold grid place-items-center glow-gold mb-4">
                <CheckCircle2 className="w-8 h-8 text-foreground" />
              </div>
              <h3 className="font-display text-3xl">✅ Payment Successful</h3>
              <p className="mt-2 text-muted-foreground">
                Your appointment is now <span className="text-foreground font-medium">Paid</span>. A receipt has been sent to your phone.
              </p>
              <button onClick={handleClose} className="mt-6 w-full py-3 rounded-full bg-gradient-primary text-primary-foreground font-medium">
                Done
              </button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={bold ? "font-display text-lg text-gradient" : "text-foreground"}>{value}</span>
    </div>
  );
}
