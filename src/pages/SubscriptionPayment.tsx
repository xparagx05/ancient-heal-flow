import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, CreditCard, Lock, Sparkles, Crown, Check } from "lucide-react";
import Navbar from "@/components/dhanvantara/Navbar";
import Footer from "@/components/dhanvantara/Footer";
import EmergencyButton from "@/components/dhanvantara/EmergencyButton";
import { useSubscription, PlanId } from "@/context/SubscriptionContext";
import { useBooking } from "@/context/BookingContext";
import { toast } from "sonner";

const plans: Record<string, { id: PlanId; name: string; amount: number; period: string; features: string[]; tagline: string }> = {
  basic: {
    id: "basic",
    name: "Basic",
    amount: 99,
    period: "/month",
    tagline: "Everyday care, simply.",
    features: ["10 consults/month", "Basic AI insights", "Digital prescriptions", "Standard support"],
  },
  pro: {
    id: "pro",
    name: "Pro",
    amount: 299,
    period: "/month",
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

  function pay() {
    if (!plan) return;
    setState("processing");
    setTimeout(() => {
      activate({
        plan: plan.id,
        planName: plan.name,
        amount: plan.amount,
        activatedAt: new Date().toISOString(),
      });
      pushNotification({
        title: "✨ Subscription activated",
        message: `Welcome to ${plan.name}! ₹${plan.amount}${plan.period} — receipt sent to your email.`,
        channel: "system",
      });
      toast.success(`✨ ${plan.name} subscription activated`);
      setState("success");
    }, 1400);
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
                  {state === "processing" ? "Processing…" : `Pay ₹${plan.amount} & Subscribe`}
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
            <p className="text-xs tracking-[0.3em] text-primary mb-3">— ACTIVATED —</p>
            <h1 className="font-display text-5xl md:text-6xl">
              Subscription <span className="text-gradient-gold italic">activated</span> successfully
            </h1>
            <p className="text-muted-foreground mt-4 max-w-md mx-auto">
              Welcome to <strong>{plan.name}</strong>. Your plan is now live and your benefits are unlocked.
              <br />📩 Receipt sent to your email.
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
