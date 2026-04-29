import { AnimatePresence, motion } from "framer-motion";
import { X, Video, Sparkles } from "lucide-react";
import { useBooking } from "@/context/BookingContext";

export default function VideoComingSoon() {
  const { videoOpen, closeVideo } = useBooking();
  return (
    <AnimatePresence>
      {videoOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] grid place-items-center p-4 bg-foreground/40 backdrop-blur-sm"
          onClick={closeVideo}
        >
          <motion.div
            initial={{ scale: 0.9, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md glass rounded-3xl p-8 text-center shadow-2xl"
          >
            <button onClick={closeVideo} aria-label="Close" className="absolute top-4 right-4 w-9 h-9 rounded-full grid place-items-center hover:bg-foreground/10">
              <X className="w-4 h-4" />
            </button>
            <motion.div
              animate={{ rotate: [0, -6, 6, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="mx-auto w-20 h-20 rounded-3xl bg-gradient-primary grid place-items-center glow-primary mb-5"
            >
              <Video className="w-9 h-9 text-white" />
            </motion.div>
            <p className="text-xs tracking-[0.3em] text-primary mb-2 inline-flex items-center gap-1.5"><Sparkles className="w-3 h-3" /> COMING SOON</p>
            <h3 className="font-display text-3xl">🚀 Video consultation is launching soon</h3>
            <p className="mt-3 text-muted-foreground">We are working on secure HD video rooms designed for warm, focused conversations.</p>
            <button onClick={closeVideo} className="mt-6 w-full py-3 rounded-full bg-gradient-primary text-primary-foreground font-medium hover:scale-[1.02] transition glow-primary">
              Notify me
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
