"use client";

import { useEffect } from "react";

/**
 * Drives the gold cursor-spotlight on every .card. A single passive
 * pointermove listener (rAF-throttled) finds the card under the cursor and
 * writes --spx/--spy as percentages — pure compositor work, so it costs
 * essentially nothing even with many cards on screen. No-ops on touch
 * devices (no hover) and when the user prefers reduced motion.
 */
export default function CardSpotlight() {
  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    let raf = 0;
    let pending: { el: HTMLElement; x: number; y: number } | null = null;

    const apply = () => {
      raf = 0;
      if (!pending) return;
      const { el, x, y } = pending;
      el.style.setProperty("--spx", `${x}%`);
      el.style.setProperty("--spy", `${y}%`);
    };

    const onMove = (e: PointerEvent) => {
      const card = (e.target as HTMLElement)?.closest?.(".card") as HTMLElement | null;
      if (!card) return;
      const r = card.getBoundingClientRect();
      pending = {
        el: card,
        x: ((e.clientX - r.left) / r.width) * 100,
        y: ((e.clientY - r.top) / r.height) * 100,
      };
      if (!raf) raf = requestAnimationFrame(apply);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
