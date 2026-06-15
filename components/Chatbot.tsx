"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { MessageCircle, X, Send, ArrowRight } from "lucide-react";
import { flow, matchIntent, type FlowOption } from "@/lib/chatbot-flow";
import { LogoMark } from "./Logo";

type Msg = {
  role: "bot" | "user";
  text: string;
  options?: FlowOption[];
  id: string;
};

const STORAGE_KEY = "aumox_chat_v2";

export default function Chatbot() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hasGreeting, setHasGreeting] = useState(true);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load persisted messages or seed greeting
  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (raw) {
      try {
        setMessages(JSON.parse(raw));
        return;
      } catch {}
    }
    seedGreeting();
  }, []);

  useEffect(() => {
    if (messages.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open, typing]);

  function seedGreeting() {
    const g = flow.greeting;
    setMessages([
      { role: "bot", text: g.message, options: g.options, id: crypto.randomUUID() },
    ]);
  }

  function pushBot(nodeId: string) {
    const node = flow[nodeId] ?? flow.fallback;
    setMessages((prev) => [
      ...prev,
      { role: "bot", text: node.message, options: node.options, id: crypto.randomUUID() },
    ]);
  }

  function pushUser(text: string) {
    setMessages((prev) => [...prev, { role: "user", text, id: crypto.randomUUID() }]);
  }

  function handleOption(opt: FlowOption) {
    pushUser(opt.label);
    if (opt.action === "contact") {
      const transcript = encodeURIComponent(
        messages.map((m) => `${m.role === "bot" ? "AUMO" : "You"}: ${m.text}`).join("\n") +
          `\nYou: ${opt.label}`
      );
      setTimeout(() => {
        setOpen(false);
        router.push(`/contact?from=chat&chat=${transcript}`);
      }, 250);
      return;
    }
    if (opt.action === "external" && opt.href) {
      window.open(opt.href, opt.href.startsWith("mailto:") ? "_self" : "_blank", "noopener,noreferrer");
      return;
    }
    if (opt.action === "navigate" && opt.href) {
      setTimeout(() => { setOpen(false); router.push(opt.href!); }, 200);
      return;
    }
    if (opt.next) {
      replyBot(opt.next);
    }
  }

  // Show a brief "typing" indicator before the bot answers — feels alive.
  function replyBot(nodeId: string, delay = 480) {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      pushBot(nodeId);
    }, delay);
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    pushUser(text);
    setInput("");
    const target = matchIntent(text);
    replyBot(target, 620);
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    seedGreeting();
  }

  if (pathname?.startsWith("/admin") || pathname?.startsWith("/portal") || pathname?.startsWith("/staff")) return null;

  return (
    <>
      {/* Floating toggle — anchored bottom-right on every breakpoint */}
      <button
        onClick={() => {
          setOpen((v) => !v);
          setHasGreeting(false);
        }}
        className={`fixed right-6 bottom-6 z-[70] grid h-14 w-14 place-items-center rounded-full text-black shadow-[0_12px_32px_rgba(212,175,55,0.5)] transition-transform hover:scale-110 active:scale-95 ${
          hasGreeting && !open ? "animate-pulse-glow" : ""
        }`}
        style={{
          background: "linear-gradient(135deg, #F0DDA0 0%, #D4AF37 50%, #B8941F 100%)",
        }}
        aria-label={open ? "Close assistant" : "Open assistant"}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {/* Panel — opens upward from the bubble, bottom-right on all sizes */}
      <div
        className="fixed z-[69] bottom-24 right-6"
        style={{ pointerEvents: open ? "auto" : "none" }}
      >
        {/* Scaling/opacity wrapper — handles open/close animation independently */}
        <div
          className="flex flex-col overflow-hidden rounded-2xl border border-line bg-bg-surface shadow-2xl transition-[opacity,transform] duration-300 ease-out w-[380px] h-[560px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-9rem)] origin-bottom-right"
          style={{
            transform: open ? "scale(1)" : "scale(0.92)",
            opacity: open ? 1 : 0,
          }}
          role="dialog"
          aria-label="AUMOXO assistant"
        >
        {/* Header */}
        <div className="relative flex items-center gap-3 border-b border-line bg-gradient-to-r from-bg-elevated to-bg-surface px-5 py-4">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-bg-base/40 border border-gold-400/30">
            <LogoMark size={22} />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-ink-100">AUMOXO Assistant</div>
            <div className="text-[11px] text-gold-400/80 tracking-widest uppercase">
              Online · Ask me anything
            </div>
          </div>
          <button
            onClick={reset}
            className="text-[11px] uppercase tracking-widest text-ink-400 hover:text-gold-300 transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map((m) => (
            <div key={m.id}>
              {m.role === "bot" ? (
                <div className="max-w-[88%] rounded-2xl rounded-bl-md border border-line bg-bg-elevated px-4 py-3 text-sm text-ink-200 leading-relaxed">
                  {m.text}
                </div>
              ) : (
                <div className="ml-auto max-w-[88%] rounded-2xl rounded-br-md bg-gradient-to-br from-gold-300 to-gold-600 px-4 py-3 text-sm font-medium text-black">
                  {m.text}
                </div>
              )}

              {m.role === "bot" && m.options && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {m.options.map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => handleOption(opt)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-gold-400/30 bg-bg-base/40 px-3 py-1.5 text-xs text-gold-200 hover:border-gold-400 hover:bg-gold-400/10 hover:text-gold-300 transition-all"
                    >
                      {opt.label}
                      {opt.action === "contact" && <ArrowRight size={12} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {typing && (
            <div className="max-w-[60%] rounded-2xl rounded-bl-md border border-line bg-bg-elevated px-4 py-3">
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-gold-400/70 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 rounded-full bg-gold-400/70 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 rounded-full bg-gold-400/70 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form
          onSubmit={handleSend}
          className="flex items-center gap-2 border-t border-line bg-bg-base px-3 py-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about services, pricing, our work…"
            className="flex-1 rounded-full bg-bg-elevated border border-line px-4 py-2.5 text-sm text-ink-100 placeholder:text-ink-400 outline-none focus:border-gold-400/60"
          />
          <button
            type="submit"
            className="grid h-10 w-10 place-items-center rounded-full text-black hover:scale-105 transition-transform"
            style={{
              background: "linear-gradient(135deg, #F0DDA0 0%, #D4AF37 50%, #B8941F 100%)",
            }}
            aria-label="Send"
          >
            <Send size={16} />
          </button>
        </form>
        </div>
      </div>
    </>
  );
}
