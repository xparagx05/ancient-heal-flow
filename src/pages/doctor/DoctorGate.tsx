import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export default function DoctorGate({ children }: { children: React.ReactNode }) {
  const { user, roles, loading } = useAuth();
  const [status, setStatus] = useState<"loading" | "ok" | "apply" | "pending">("loading");

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    if (roles.includes("doctor") || roles.includes("admin")) { setStatus("ok"); return; }
    (async () => {
      const { data } = await supabase.from("doctor_applications").select("status").eq("user_id", user.id).maybeSingle();
      if (!data) setStatus("apply");
      else if (data.status === "approved") setStatus("ok");
      else setStatus("pending");
    })();
  }, [user, roles, loading]);

  if (loading || status === "loading") {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" /></div>;
  }
  if (status === "apply") return <Navigate to="/doctor/apply" replace />;
  if (status === "pending") return <Navigate to="/doctor/pending" replace />;
  return <>{children}</>;
}
