"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUp } from "lucide-react";

/**
 * Floating "back to top" control. Fades + scales in once the user has
 * scrolled past one viewport, and rides on the Lenis instance for a smooth
 * animated return (falling back to native smooth scroll). Sits bottom-right,
 * stacked just above the chatbot bubble so the two never overlap.
 */
export default function ScrollToTop() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  if (
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/portal") ||
    pathname?.startsWith("/staff")
  )
    return null;

  const toTop = () => {
    if (window.__lenis) window.__lenis.scrollTo(0, { duration: 1.2 });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={toTop}
      aria-label="Back to top"
      className={`fixed right-6 bottom-24 z-[68] grid h-12 w-12 place-items-center rounded-full border border-gold-400/40 bg-bg-surface/80 text-gold-300 backdrop-blur-md transition-all duration-300 hover:border-gold-400 hover:text-gold-200 hover:-translate-y-0.5 ${
        show ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-3 pointer-events-none"
      }`}
      style={{ boxShadow: "0 8px 24px -10px rgba(212,175,55,0.45)" }}
    >
      <ArrowUp size={20} />
      <span className="absolute inset-0 rounded-full border border-gold-400/30 animate-ping-slow pointer-events-none" />
    </button>
  );
}
