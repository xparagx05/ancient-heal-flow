import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = SCRIPT_URL;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export type RzpSuccess = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

export type RzpOpenOpts = {
  amount: number;           // rupees
  currency?: string;
  name: string;             // company/brand name
  description: string;
  prefill?: { name?: string; email?: string; contact?: string };
  notes?: Record<string, string>;
  theme?: { color?: string };
  /** DB appointment id (uuid) — sent to verify function to confirm server-side */
  appointmentId?: string;
};

export async function openRazorpayCheckout(opts: RzpOpenOpts): Promise<RzpSuccess> {
  const ok = await loadRazorpayScript();
  if (!ok) throw new Error("Payment SDK failed to load. Check your connection.");

  const { data, error } = await supabase.functions.invoke("create-razorpay-order", {
    body: {
      amount: opts.amount,
      currency: opts.currency || "INR",
      notes: opts.notes,
    },
  });
  if (error) {
    console.error("[razorpay] create-order failed", error);
    throw new Error("Unable to start payment right now. Please try again in a moment.");
  }
  const { order, keyId } = (data || {}) as { order: any; keyId: string };
  if (!order?.id || !keyId) {
    throw new Error("Payment service is temporarily unavailable. Please try again.");
  }
  

  return new Promise<RzpSuccess>((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: keyId,
      amount: order.amount,
      currency: order.currency,
      order_id: order.id,
      name: opts.name,
      description: opts.description,
      prefill: opts.prefill || {},
      notes: opts.notes || {},
      theme: { color: opts.theme?.color || "#C9A24A" },
      method: {
        upi: true,
        card: true,
        netbanking: true,
        wallet: true,
        qr: true,
      },
      handler: async (resp: RzpSuccess) => {
        try {
          const { data: v, error: verr } = await supabase.functions.invoke("verify-razorpay-payment", {
            body: { ...resp, appointment_id: opts.appointmentId },
          });
          if (verr) return reject(new Error(verr.message || "Verification failed"));
          if (!v?.verified) return reject(new Error("Payment signature invalid"));
          resolve(resp);
        } catch (e) {
          reject(e as Error);
        }
      },
      modal: {
        ondismiss: () => reject(new Error("Payment cancelled")),
      },
    });
    rzp.on("payment.failed", (r: any) => {
      reject(new Error(r?.error?.description || "Payment failed"));
    });
    rzp.open();
  });
}

export const RAZORPAY_ME_FALLBACK = "https://razorpay.me/@paragsanjaymarathe";
