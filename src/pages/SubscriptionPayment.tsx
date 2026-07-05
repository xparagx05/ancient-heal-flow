import { useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CreditCard, Lock, Sparkles, Crown, Check, Mail, User, Smartphone, QrCode, Building2 } from "lucide-react";
import Navbar from "@/components/dhanvantara/Navbar";
import Footer from "@/components/dhanvantara/Footer";
import EmergencyButton from "@/components/dhanvantara/EmergencyButton";
import SuccessScreen from "@/components/dhanvantara/SuccessScreen";
import { useSubscription, PlanId } from "@/context/SubscriptionContext";
import { useBooking } from "@/context/BookingContext";
import { openRazorpayCheckout, RAZORPAY_ME_FALLBACK } from "@/lib/razorpay";
import { downloadReceiptPDF } from "@/lib/receipt";
import { toast } from "sonner";

const plans: Record<string, { id: PlanId; name: string; amount: number; period: string; features: string[]; tagline: string }> = {
  basic: {
    id: "basic", name: "Basic", amount: 99, period: "/month",
    tagline: "Everyday care, simply.",
    features: ["10 consults/month", "Basic AI insights", "Digital prescriptions", "Standard support"],
  },
  pro: {
    id: "pro", name: "Pro", amount: 299, period: "/month",
    tagline: "Care without limits.",
    features: ["Unlimited consults", "Priority slots", "Specialist access", "Family profiles (4)", "24/7 chat support"],
  },
};

export default function SubscriptionPayment() {
  const { plan: planParam } = useParams();
  const navigate = useNavigate();
  const { activate } = useSubscription();
  const { pushNotification } = useBooking();
  const plan = planParam ? plans[planParam] : undefined;
  const [state, setState] = useState<"idle" | "processing" | "success">("idle");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [paymentId, setPaymentId] = useState<string>();
  const [orderId, setOrderId] = useState<string>();
  const receiptId = useMemo(() => `DHV-SUB-${(planParam || "").toUpperCase()}-${Date.now().toString().slice(-5)}`, [planParam]);

  if (!plan) {
    return (
      <main className="min-h-screen grid place-items-center bg-gradient-hero">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Plan not found.</p>
          <Link to="/pricing" className="text-primary underline">Back to pricing</Link>
        </div>
      </main>
    );
  }

  async function pay() {
    if (!plan) return;
    if (!name.trim()) return toast.error("Please enter your name");
    if (!/^\S+@\S+\.\S+$/.test(email)) return toast.error("Please enter a valid email");
    try {
      setState("processing");
      const res = await openRazorpayCheckout({
        amount: plan.amount,
        name: "Dhanvantara AI",
        description: `${plan.name} plan subscription`,
        prefill: { name, email },
        notes: { plan: plan.id, planName: plan.name },
        theme: { color: "#C9A24A" },
      });
      setPaymentId(res.razorpay_payment_id);
      setOrderId(res.razorpay_order_id);
      activate({
        plan: plan.id,
        planName: plan.name,
        amount: plan.amount,
        activatedAt: new Date().toISOString(),
      });
      pushNotification({
        title: "✨ Subscription activated",
        message: `Welcome to ${plan.name}! ₹${plan.amount}${plan.period} — receipt sent to ${email}.`,
        channel: "email",
      });
      setState("success");
    } catch (e: any) {
      setState("idle");
      toast.error(e?.message || "Payment could not be completed");
    }
  }

  function download() {
    if (!plan) return;
    downloadReceiptPDF({
      kind: "subscription",
      receiptId,
      paymentId,
      orderId,
      name,
      email,
      itemTitle: `${plan.name} Plan`,
      itemSubtitle: plan.tagline,
      amount: plan.amount,
    });
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-gradient-hero">
      <Navbar />
      <EmergencyButton />

      <section className="container mx-auto max-w-3xl px-6 pt-32 pb-20">
        <Link to="/pricing" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-4">
          <ArrowLeft className="w-3 h-3" /> Back to pricing
        </Link>

        {state !== "success" ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs tracking-[0.3em] text-primary mb-3">— SUBSCRIBE —</p>
            <h1 className="font-display text-5xl md:text-6xl">
              Activate your <span className="text-gradient-gold italic">{plan.name}</span> plan
            </h1>
            <p className="text-muted-foreground mt-3">{plan.tagline} · Cancel anytime from your dashboard.</p>

            <div className="mt-10 grid md:grid-cols-[1fr_320px] gap-6">
              <div className="glass rounded-3xl p-6 space-y-4">
                <div className="flex items-center gap-2 text-xs tracking-[0.25em] text-primary">
                  <Crown className="w-4 h-4" /> {plan.name.toUpperCase()} PLAN
                </div>
                <h2 className="font-display text-3xl">{plan.name}</h2>
                <p className="text-sm text-muted-foreground">{plan.tagline}</p>

                <ul className="mt-4 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <span className="w-5 h-5 rounded-full bg-gradient-primary text-white grid place-items-center">
                        <Check className="w-3 h-3" />
                      </span>
                      <span className="text-foreground/80">{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="grid grid-cols-2 gap-3 pt-3">
                  <div>
                    <label className="text-xs text-muted-foreground flex items-center gap-1"><User className="w-3 h-3" /> Name</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name"
                      className="mt-1 w-full px-3 py-2.5 rounded-xl bg-background/60 border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" /> Email</label>
                    <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" type="email"
                      className="mt-1 w-full px-3 py-2.5 rounded-xl bg-background/60 border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm" />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <Chip icon={Smartphone} label="UPI" />
                  <Chip icon={QrCode} label="QR" />
                  <Chip icon={CreditCard} label="Cards" />
                  <Chip icon={Building2} label="Net Banking" />
                </div>

                <div className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1">
                  <Sparkles className="w-3.5 h-3.5 text-accent" /> Auto-renews monthly · Cancel anytime
                </div>
              </div>

              <div className="glass rounded-3xl p-6 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-4 h-4 text-primary" />
                  <p className="text-xs tracking-[0.25em] text-primary">SUMMARY</p>
                </div>
                <div className="space-y-2 text-sm mt-2">
                  <Row label={`${plan.name} plan`} value={`₹${plan.amount}${plan.period}`} />
                  <Row label="Setup fee" value="₹0" />
                  <Row label="Taxes" value="Included" />
                  <div className="h-px bg-border my-2" />
                  <Row label="Today" value={`₹${plan.amount}`} bold />
                </div>
                <button
                  disabled={state === "processing"}
                  onClick={pay}
                  className="mt-6 w-full py-3.5 rounded-full bg-gradient-primary text-primary-foreground font-medium hover:scale-[1.02] transition glow-primary disabled:opacity-70"
                >
                  {state === "processing" ? "Opening Razorpay…" : `Pay ₹${plan.amount} & Subscribe`}
                </button>
                <a href={RAZORPAY_ME_FALLBACK} target="_blank" rel="noreferrer" className="mt-3 text-center text-xs text-primary hover:underline">
                  Prefer Razorpay.me? Pay here →
                </a>
                <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <Lock className="w-3 h-3" /> Secured by Razorpay
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <SuccessScreen
            title={`Welcome to ${plan.name}.`}
            message={`Your subscription is now active.\nA receipt has been sent to ${email}.\nThank you for choosing Dhanvantara AI.`}
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
function Chip({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-xs">
      <Icon className="w-3.5 h-3.5 text-primary" /> {label}
    </span>
  );
}
