import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="glass rounded-3xl p-10 max-w-md text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-accent mb-2">Access denied</p>
        <h1 className="font-display text-3xl mb-3">Not authorized</h1>
        <p className="text-sm text-muted-foreground mb-6">You don't have permission to view this page.</p>
        <Link to="/" className="px-5 py-2 rounded-full bg-gradient-gold text-foreground text-sm">Back home</Link>
      </div>
    </div>
  );
}
