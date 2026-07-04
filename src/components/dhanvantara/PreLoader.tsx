import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/dhanvantara-logo.png";

const lines = [
  "Every heartbeat tells a story…",
  "Preparing your care…",
  "Welcome to Dhanvantara AI",
];

export default function PreLoader() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return true;
    return !sessionStorage.getItem("dhanvantara.loaded");
  });
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!visible) return;
    const t1 = setTimeout(() => setStep(1), 900);
    const t2 = setTimeout(() => setStep(2), 1800);
    const t3 = setTimeout(() => {
      sessionStorage.setItem("dhanvantara.loaded", "1");
      setVisible(false);
    }, 2900);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(12px)" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[300] grid place-items-center overflow-hidden"
          style={{
            background:
              "radial-gradient(ellipse at 50% 40%, hsl(220 60% 14%) 0%, hsl(220 70% 8%) 60%, hsl(220 80% 5%) 100%)",
          }}
        >
          {/* floating particles */}
          {Array.from({ length: 28 }).map((_, i) => (
            <motion.span
              key={i}
              className="absolute rounded-full"
              style={{
                width: 2 + (i % 3),
                height: 2 + (i % 3),
                background: i % 2 ? "hsl(42 90% 70% / 0.7)" : "hsl(220 90% 70% / 0.6)",
                left: `${(i * 37) % 100}%`,
                top: `${(i * 53) % 100}%`,
                filter: "blur(0.5px)",
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.2, 0.9, 0.2],
              }}
              transition={{
                duration: 3 + (i % 4),
                repeat: Infinity,
                delay: i * 0.12,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* gold aura */}
          <div className="absolute w-[520px] h-[520px] rounded-full bg-[radial-gradient(circle,hsl(42_90%_60%/0.18),transparent_70%)] blur-2xl" />

          <div className="relative flex flex-col items-center gap-10">
            <div className="relative w-[320px] h-[140px]">
              {/* Step 0-1: ECG line → heart */}
              <AnimatePresence mode="wait">
                {step < 2 && (
                  <motion.svg
                    key="ecg"
                    viewBox="0 0 320 140"
                    className="absolute inset-0 w-full h-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                  >
                    <defs>
                      <linearGradient id="ecgGrad" x1="0" x2="1">
                        <stop offset="0%" stopColor="hsl(42 95% 65%)" stopOpacity="0" />
                        <stop offset="40%" stopColor="hsl(42 95% 65%)" />
                        <stop offset="100%" stopColor="hsl(42 95% 75%)" stopOpacity="0.2" />
                      </linearGradient>
                      <filter id="ecgGlow">
                        <feGaussianBlur stdDeviation="3" result="b" />
                        <feMerge>
                          <feMergeNode in="b" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>

                    {/* baseline */}
                    <line x1="0" y1="70" x2="320" y2="70" stroke="hsl(220 50% 40% / 0.25)" strokeWidth="1" />

                    <motion.path
                      d="M0 70 L80 70 L100 70 L108 40 L116 100 L124 20 L132 110 L140 70 L220 70 L320 70"
                      fill="none"
                      stroke="url(#ecgGrad)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      filter="url(#ecgGlow)"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
                    />

                    {step >= 1 && (
                      <motion.path
                        // heart shape centered near 160,70
                        d="M160 100 C 120 70, 120 35, 150 35 C 160 35, 160 45, 160 50 C 160 45, 160 35, 170 35 C 200 35, 200 70, 160 100 Z"
                        fill="hsl(42 95% 62%)"
                        stroke="hsl(42 95% 80%)"
                        strokeWidth="1"
                        filter="url(#ecgGlow)"
                        initial={{ scale: 0, transformOrigin: "160px 70px", opacity: 0 }}
                        animate={{
                          scale: [0, 1.15, 1, 1.08, 1],
                          opacity: 1,
                        }}
                        transition={{ duration: 1.1, ease: "easeOut" }}
                        style={{ transformBox: "fill-box", transformOrigin: "center" }}
                      />
                    )}
                  </motion.svg>
                )}

                {step >= 2 && (
                  <motion.div
                    key="logo"
                    initial={{ scale: 0.6, opacity: 0, filter: "blur(8px)" }}
                    animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                    transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0 grid place-items-center"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,hsl(42_95%_65%/0.6),transparent_70%)] blur-2xl animate-pulse" />
                      <img
                        src={logo}
                        alt="Dhanvantara AI"
                        className="relative w-24 h-24 object-contain drop-shadow-[0_0_25px_hsl(42_95%_60%/0.8)]"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="h-6 relative w-full text-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={step}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="font-display italic text-lg md:text-xl tracking-wide"
                  style={{ color: "hsl(42 90% 82%)" }}
                >
                  {lines[step]}
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="w-40 h-[2px] rounded-full overflow-hidden bg-white/10">
              <motion.div
                className="h-full bg-gradient-to-r from-transparent via-[hsl(42_95%_65%)] to-transparent"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
