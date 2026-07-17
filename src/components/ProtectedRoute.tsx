import { Navigate, useLocation } from "react-router-dom";
import { useAuth, type AppRole } from "@/context/AuthContext";

export default function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: AppRole;
}) {
  const { session, roles, loading, rolesLoaded } = useAuth();
  const location = useLocation();

  if (loading || (session && !rolesLoaded)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to={`/auth?next=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (requiredRole && !roles.includes(requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
