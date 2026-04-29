import { motion } from "framer-motion";
import { Phone } from "lucide-react";

export default function EmergencyButton() {
  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 1.7, type: "spring" }}
      className="fixed bottom-6 left-6 z-40 group"
      aria-label="Emergency call"
    >
      <span className="absolute inset-0 rounded-full bg-destructive/40 animate-pulse-glow" />
      <span className="relative flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-br from-rose-500 to-rose-600 text-white text-sm font-medium shadow-[0_12px_40px_-8px_hsl(354,80%,55%,0.7)] hover:scale-105 transition-transform">
        <Phone className="w-4 h-4" />
        <span className="hidden sm:inline">SOS Emergency</span>
      </span>
    </motion.button>
  );
}
