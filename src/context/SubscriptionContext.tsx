import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type PlanId = "starter" | "basic" | "pro";
export type Subscription = {
  plan: PlanId;
  planName: string;
  amount: number;
  activatedAt: string;
} | null;

type Ctx = {
  subscription: Subscription;
  activate: (s: NonNullable<Subscription>) => void;
  cancel: () => void;
};

const SubCtx = createContext<Ctx | null>(null);
const KEY = "dhanvantara.subscription";

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscription, setSubscription] = useState<Subscription>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setSubscription(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    if (subscription) localStorage.setItem(KEY, JSON.stringify(subscription));
    else localStorage.removeItem(KEY);
  }, [subscription]);

  return (
    <SubCtx.Provider
      value={{
        subscription,
        activate: (s) => setSubscription(s),
        cancel: () => setSubscription(null),
      }}
    >
      {children}
    </SubCtx.Provider>
  );
}

export function useSubscription() {
  const c = useContext(SubCtx);
  if (!c) throw new Error("useSubscription must be inside SubscriptionProvider");
  return c;
}
