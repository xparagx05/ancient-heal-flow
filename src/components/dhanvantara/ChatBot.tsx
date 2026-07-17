import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Sparkles, RotateCcw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { sendChat, type ChatMessage } from "@/lib/ai/chatService";

const GREETING: ChatMessage = {
  role: "assistant",
  content:
    "Namaste 🙏 I'm your Dhanvantara AI companion. I can help you find a doctor, understand a service, book a consultation, or answer anything about the platform. How can I help today?",
};

const QUICK_PROMPTS = [
  "Book a video consultation",
  "Show me available doctors",
  "How much does a consultation cost?",
  "What is Dhanvantara AI?",
];

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const { user, primaryRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const context = useMemo(
    () => ({
      name: (user?.user_metadata as any)?.full_name || user?.email?.split("@")[0],
      email: user?.email,
      role: primaryRole ?? undefined,
      route: location.pathname,
    }),
    [user, primaryRole, location.pathname]
  );

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, streaming]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

  useEffect(() => () => abortRef.current?.abort(), []);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || streaming) return;
    setInput("");
    setError(null);

    const next: ChatMessage[] = [...msgs, { role: "user", content }, { role: "assistant", content: "" }];
    setMsgs(next);
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await sendChat(
        next.slice(0, -1), // history without the empty assistant placeholder
        context,
        {
          signal: controller.signal,
          onDelta: (chunk) => {
            setMsgs((prev) => {
              const copy = prev.slice();
              const last = copy[copy.length - 1];
              if (last?.role === "assistant") {
                copy[copy.length - 1] = { role: "assistant", content: last.content + chunk };
              }
              return copy;
            });
          },
        }
      );
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      setError(e?.message || "Something went wrong.");
      setMsgs((prev) => {
        const copy = prev.slice();
        if (copy[copy.length - 1]?.role === "assistant" && !copy[copy.length - 1].content) {
          copy.pop();
        }
        return copy;
      });
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }

  function resetChat() {
    abortRef.current?.abort();
    setMsgs([GREETING]);
    setError(null);
  }

  function handleLinkClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    // In-app links → SPA navigation. External links open normally.
    if (href.startsWith("/") || href.startsWith("#")) {
      e.preventDefault();
      if (href.startsWith("/#")) {
        // Route to root, then scroll to anchor.
        const anchor = href.slice(2);
        navigate("/");
        setTimeout(() => document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth" }), 80);
      } else if (href.startsWith("#")) {
        document.getElementById(href.slice(1))?.scrollIntoView({ behavior: "smooth" });
      } else {
        navigate(href);
      }
      setOpen(false);
    }
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
            className="fixed bottom-24 right-6 z-40 w-[min(92vw,400px)] glass rounded-3xl overflow-hidden shadow-[0_30px_80px_-20px_hsl(var(--primary)/0.5)]"
          >
            <div className="p-4 bg-gradient-primary text-white flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 grid place-items-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display text-base">Dhanvantara AI</div>
                <div className="text-xs opacity-80 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  {streaming ? "Thinking…" : "Online"}
                </div>
              </div>
              <button
                onClick={resetChat}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 grid place-items-center transition-colors"
                aria-label="Reset conversation"
                title="Reset conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="h-[420px] overflow-y-auto p-4 space-y-3 bg-white/40">
              {msgs.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm ${
                    m.role === "assistant"
                      ? "bg-white text-foreground rounded-tl-sm shadow-sm"
                      : "ml-auto bg-gradient-primary text-white rounded-tr-sm"
                  }`}
                >
                  {m.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-0.5 prose-headings:font-display prose-a:no-underline">
                      <ReactMarkdown
                        components={{
                          a: ({ href, children }) => {
                            const target = href ?? "#";
                            const isInternal = target.startsWith("/") || target.startsWith("#");
                            if (isInternal) {
                              return (
                                <a
                                  href={target}
                                  onClick={(e) => handleLinkClick(e, target)}
                                  className="inline-flex items-center gap-1 mt-1 mr-1 mb-1 px-3 py-1.5 rounded-full bg-gradient-primary text-white text-xs font-medium hover:scale-105 transition-transform cursor-pointer no-underline"
                                >
                                  {children}
                                </a>
                              );
                            }
                            return (
                              <a href={target} target="_blank" rel="noreferrer" className="text-primary underline">
                                {children}
                              </a>
                            );
                          },
                        }}
                      >
                        {m.content || (streaming && i === msgs.length - 1 ? "…" : "")}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <span className="whitespace-pre-wrap">{m.content}</span>
                  )}
                </motion.div>
              ))}

              {streaming && msgs[msgs.length - 1]?.role === "assistant" && !msgs[msgs.length - 1].content && (
                <div className="bg-white px-4 py-2.5 rounded-2xl rounded-tl-sm w-fit flex gap-1 shadow-sm">
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

              {error && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                  {error}
                </div>
              )}

              {msgs.length === 1 && !streaming && (
                <div className="pt-2 space-y-2">
                  <div className="text-[10px] tracking-[0.25em] text-muted-foreground uppercase pl-1">Try asking</div>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_PROMPTS.map((p) => (
                      <button
                        key={p}
                        onClick={() => send(p)}
                        className="px-3 py-1.5 rounded-full bg-white/80 hover:bg-white text-xs border border-white/60 transition-colors"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div ref={endRef} />
            </div>

            <div className="p-3 bg-white/60 border-t border-white/40 flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
                placeholder={streaming ? "Assistant is replying…" : "Ask about doctors, bookings, pricing…"}
                disabled={streaming}
                className="flex-1 bg-white rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60"
              />
              <button
                onClick={() => send()}
                disabled={streaming || !input.trim()}
                className="w-10 h-10 rounded-full bg-gradient-primary text-white grid place-items-center hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
