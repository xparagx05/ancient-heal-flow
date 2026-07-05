import { motion } from "framer-motion";
import { Check, Download } from "lucide-react";
import { Link } from "react-router-dom";

type Props = {
  title?: string;
  message?: string;
  onDownload?: () => void;
  primaryLabel?: string;
  primaryTo?: string;
  onPrimary?: () => void;
};

/**
 * Premium confirmation experience:
 * heartbeat → golden glow → checkmark → message
 */
export default function SuccessScreen({
  title = "Your appointment has been confirmed.",
  message = "A confirmation has been sent to your registered email.\nWe look forward to caring for you.",
  onDownload,
  primaryLabel = "Go to dashboard",
  primaryTo = "/dashboard",
  onPrimary,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative text-center py-14"
    >
      {/* golden glow */}
      <motion.div
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: [0.4, 1.8, 1.4], opacity: [0, 0.6, 0.35] }}
        transition={{ duration: 1.6, ease: "easeOut" }}
        className="pointer-events-none absolute left-1/2 top-8 -translate-x-1/2 w-[420px] h-[420px] rounded-full bg-gradient-gold blur-3xl opacity-30"
      />

      {/* heartbeat pulse rings */}
      <div className="relative mx-auto w-28 h-28">
        {[0, 0.4, 0.8].map((d) => (
          <motion.span
            key={d}
            initial={{ scale: 0.6, opacity: 0.6 }}
            animate={{ scale: 2.2, opacity: 0 }}
            transition={{ duration: 1.8, delay: d, repeat: Infinity, ease: "easeOut" }}
            className="absolute inset-0 rounded-full border-2 border-accent/60"
          />
        ))}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.15, 1] }}
          transition={{ delay: 0.5, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-28 h-28 rounded-full bg-gradient-gold grid place-items-center glow-gold shadow-2xl"
        >
          <motion.div
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.5 }}
          >
            <Check className="w-14 h-14 text-foreground" strokeWidth={3} />
          </motion.div>
        </motion.div>
      </div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="text-xs tracking-[0.4em] text-primary mt-8"
      >
        — CONFIRMED —
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.35 }}
        className="font-display text-4xl md:text-5xl mt-3 leading-tight"
      >
        {title.split(" ").map((w, i, a) => (
          <span key={i} className={i === a.length - 1 ? "text-gradient-gold italic" : ""}>
            {w}{i < a.length - 1 ? " " : ""}
          </span>
        ))}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.55 }}
        className="text-muted-foreground mt-5 max-w-md mx-auto whitespace-pre-line leading-relaxed"
      >
        {message}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.75 }}
        className="mt-9 flex items-center justify-center gap-3 flex-wrap"
      >
        {onDownload && (
          <button
            onClick={onDownload}
            className="px-5 py-3 rounded-full glass font-medium inline-flex items-center gap-2 hover:-translate-y-0.5 transition"
          >
            <Download className="w-4 h-4" /> Download receipt
          </button>
        )}
        {onPrimary ? (
          <button onClick={onPrimary} className="px-6 py-3 rounded-full bg-gradient-primary text-primary-foreground font-medium glow-primary">
            {primaryLabel}
          </button>
        ) : (
          <Link to={primaryTo} className="px-6 py-3 rounded-full bg-gradient-primary text-primary-foreground font-medium glow-primary">
            {primaryLabel}
          </Link>
        )}
        <Link to="/" className="px-5 py-3 rounded-full glass font-medium">Back to home</Link>
      </motion.div>
    </motion.div>
  );
}
