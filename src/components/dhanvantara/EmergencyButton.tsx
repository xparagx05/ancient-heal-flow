import { motion, AnimatePresence } from "framer-motion";
import { Phone, MapPin, Loader2, Ambulance, X, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useBooking } from "@/context/BookingContext";

type Step = "ask" | "locating" | "located" | "dispatched";

export default function EmergencyButton() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("ask");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const { pushNotification } = useBooking();

  function start() {
    setOpen(true);
    setStep("ask");
    setCoords(null);
  }

  function allowLocation() {
    setStep("locating");
    const finish = (lat: number, lng: number) => {
      setCoords({ lat, lng });
      setStep("located");
      setTimeout(() => {
        setStep("dispatched");
        pushNotification({
          title: "🚑 Emergency dispatched",
          message: `Response team notified at ${lat.toFixed(3)}, ${lng.toFixed(3)}. ETA 8–12 minutes.`,
          channel: "system",
        });
      }, 1400);
    };

    if (!navigator.geolocation) {
      finish(19.076, 72.8777);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => finish(pos.coords.latitude, pos.coords.longitude),
      () => finish(19.076, 72.8777),
      { timeout: 6000 }
    );
  }

  function close() {
    setOpen(false);
    setTimeout(() => setStep("ask"), 300);
  }

  return (
    <>
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.7, type: "spring" }}
        className="fixed bottom-6 left-6 z-40 group"
        aria-label="Emergency call"
        onClick={start}
      >
        <span className="absolute inset-0 rounded-full bg-destructive/40 animate-pulse-glow" />
        <span className="relative flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-br from-rose-500 to-rose-600 text-white text-sm font-medium shadow-[0_12px_40px_-8px_hsl(354,80%,55%,0.7)] hover:scale-105 transition-transform">
          <Phone className="w-4 h-4" />
          <span className="hidden sm:inline">SOS Emergency</span>
        </span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] grid place-items-center p-4 bg-foreground/40 backdrop-blur-sm"
            onClick={close}
          >
            <motion.div
              initial={{ scale: 0.92, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 240, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md glass rounded-3xl p-7 shadow-2xl"
            >
              <button onClick={close} className="absolute top-4 right-4 w-9 h-9 rounded-full grid place-items-center hover:bg-foreground/10">
                <X className="w-4 h-4" />
              </button>

              {step === "ask" && (
                <>
                  <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-rose-500 to-rose-600 grid place-items-center mb-4 animate-pulse-glow">
                    <Ambulance className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-display text-3xl text-center">Emergency assistance</h3>
                  <p className="mt-3 text-center text-muted-foreground text-sm">
                    To dispatch the nearest response team, we need to access your location.
                  </p>
                  <button
                    onClick={allowLocation}
                    className="mt-6 w-full py-3.5 rounded-full bg-gradient-to-br from-rose-500 to-rose-600 text-white font-medium hover:scale-[1.02] transition flex items-center justify-center gap-2"
                  >
                    <MapPin className="w-4 h-4" /> Allow location access
                  </button>
                  <button onClick={close} className="mt-2 w-full py-3 rounded-full glass text-sm">
                    Cancel
                  </button>
                </>
              )}

              {step === "locating" && (
                <div className="text-center py-6">
                  <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
                  <p className="mt-4 font-display text-2xl">Locating you…</p>
                  <p className="text-sm text-muted-foreground mt-1">Securing GPS signal</p>
                </div>
              )}

              {step === "located" && coords && (
                <div className="text-center py-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-gradient-primary grid place-items-center mb-3 glow-primary">
                    <MapPin className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <p className="font-display text-2xl">📍 Location detected</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                  </p>
                  <p className="mt-4 text-sm text-foreground/80">Notifying emergency team…</p>
                </div>
              )}

              {step === "dispatched" && (
                <div className="text-center py-2">
                  <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-rose-500 to-rose-600 grid place-items-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-display text-3xl">🚑 Team Notified</h3>
                  <p className="mt-3 text-muted-foreground">
                    Emergency team notified.<br />
                    <span className="text-foreground font-medium">Estimated response: 8–12 minutes</span>
                  </p>
                  <div className="mt-5 glass rounded-2xl p-3 text-xs text-muted-foreground">
                    Stay calm. A responder will call you shortly. Keep your phone unlocked.
                  </div>
                  <button onClick={close} className="mt-5 w-full py-3 rounded-full bg-gradient-primary text-primary-foreground font-medium">
                    Got it
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
