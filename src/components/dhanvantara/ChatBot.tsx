import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Sparkles } from "lucide-react";

type Msg = { from: "ai" | "you"; text: string };

const seed: Msg[] = [
  { from: "ai", text: "Namaste 🙏 I'm your Dhanvantara AI companion. How are you feeling today?" },
];

const replies = [
  "I hear you. Let me suggest a specialist who can help — would you like a video consult today?",
  "That's quite common. I'd recommend Dr. Priya Iyer — she has a 4.8 rating and a slot at 4:30 PM. Shall I book it?",
  "Of course. Take a slow breath. While you do, I'll prepare a wellness plan tailored for you.",
];

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>(seed);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, typing]);

  function send() {
    if (!input.trim()) return;
    const u = input;
    setMsgs((m) => [...m, { from: "you", text: u }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs((m) => [...m, { from: "ai", text: replies[m.length % replies.length] }]);
    }, 1200);
  }

  return (
    <>
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.5, type: "spring" }}
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-primary text-white grid place-items-center shadow-[0_12px_40px_-8px_hsl(var(--primary)/0.7)] hover:scale-110 transition-transform"
        aria-label="Open AI assistant"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-5 h-5" />
            </motion.div>
          ) : (
            <motion.div key="bot" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <Bot className="w-5 h-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ type: "spring", damping: 22, stiffness: 250 }}
            className="fixed bottom-24 right-6 z-40 w-[min(90vw,360px)] glass rounded-3xl overflow-hidden shadow-[0_30px_80px_-20px_hsl(var(--primary)/0.5)]"
          >
            <div className="p-4 bg-gradient-primary text-white flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 grid place-items-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="font-display text-base">Dhanvantara AI</div>
                <div className="text-xs opacity-80 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  Online
                </div>
              </div>
            </div>
            <div className="h-80 overflow-y-auto p-4 space-y-3 bg-white/40">
              {msgs.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm ${
                    m.from === "ai"
                      ? "bg-white text-foreground rounded-tl-sm"
                      : "ml-auto bg-gradient-primary text-white rounded-tr-sm"
                  }`}
                >
                  {m.text}
                </motion.div>
              ))}
              {typing && (
                <div className="bg-white px-4 py-2.5 rounded-2xl rounded-tl-sm w-fit flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                      className="w-1.5 h-1.5 rounded-full bg-primary"
                    />
                  ))}
                </div>
              )}
              <div ref={endRef} />
            </div>
            <div className="p-3 bg-white/60 border-t border-white/40 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Tell me how you feel..."
                className="flex-1 bg-white rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />
              <button onClick={send} className="w-10 h-10 rounded-full bg-gradient-primary text-white grid place-items-center hover:scale-105 transition-transform">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
