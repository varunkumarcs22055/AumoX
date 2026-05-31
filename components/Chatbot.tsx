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

const STORAGE_KEY = "aumox_chat_v1";

export default function Chatbot() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hasGreeting, setHasGreeting] = useState(true);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
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
  }, [messages, open]);

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
    if (opt.next) {
      setTimeout(() => pushBot(opt.next!), 280);
    }
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    pushUser(text);
    setInput("");
    const target = matchIntent(text);
    setTimeout(() => pushBot(target), 360);
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    seedGreeting();
  }

  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      {/* Floating toggle */}
      <button
        onClick={() => {
          setOpen((v) => !v);
          setHasGreeting(false);
        }}
        className={`fixed bottom-6 right-6 z-[70] grid h-14 w-14 place-items-center rounded-full text-black shadow-[0_12px_32px_rgba(212,175,55,0.5)] transition-transform hover:scale-110 ${
          hasGreeting && !open ? "animate-pulse-glow" : ""
        }`}
        style={{
          background: "linear-gradient(135deg, #F0DDA0 0%, #D4AF37 50%, #B8941F 100%)",
        }}
        aria-label={open ? "Close assistant" : "Open assistant"}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {/* Panel */}
      <div
        className={`fixed z-[69] flex flex-col overflow-hidden rounded-2xl border border-line bg-bg-surface shadow-2xl transition-all duration-300 ${
          open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        } bottom-24 right-6 w-[380px] h-[560px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-9rem)] sm:bottom-24 sm:right-6`}
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
              Online · Guided
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
        </div>

        {/* Input */}
        <form
          onSubmit={handleSend}
          className="flex items-center gap-2 border-t border-line bg-bg-base px-3 py-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message…"
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
    </>
  );
}
