import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "patient" | "doctor" | "admin";

type Ctx = {
  session: Session | null;
  user: User | null;
  roles: AppRole[];
  loading: boolean;
  rolesLoaded: boolean;
  hasRole: (r: AppRole) => boolean;
  primaryRole: AppRole | null;
  signOut: () => Promise<void>;
  refreshRoles: () => Promise<void>;
};

const AuthCtx = createContext<Ctx | null>(null);

function pickPrimary(roles: AppRole[]): AppRole | null {
  if (roles.includes("admin")) return "admin";
  if (roles.includes("doctor")) return "doctor";
  if (roles.includes("patient")) return "patient";
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [rolesLoaded, setRolesLoaded] = useState(false);

  const loadRoles = async (uid: string) => {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", uid);
    setRoles((data?.map((r) => r.role as AppRole)) ?? []);
    setRolesLoaded(true);
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        setRolesLoaded(false);
        setTimeout(() => loadRoles(s.user.id), 0);
      } else {
        setRoles([]);
        setRolesLoaded(true);
      }
    });

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) loadRoles(s.user.id).finally(() => setLoading(false));
      else { setRolesLoaded(true); setLoading(false); }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const value: Ctx = {
    session,
    user,
    roles,
    loading,
    rolesLoaded,
    hasRole: (r) => roles.includes(r),
    primaryRole: pickPrimary(roles),
    signOut: async () => { await supabase.auth.signOut(); },
    refreshRoles: async () => { if (user) await loadRoles(user.id); },
  };

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const c = useContext(AuthCtx);
  if (!c) throw new Error("useAuth must be inside AuthProvider");
  return c;
}
