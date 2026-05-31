"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/**
 * Animates a hero block with a polished entrance timeline.
 * Targets descendants by data-anim attribute:
 *   data-anim="eyebrow" | "title" | "subtitle" | "cta" | "stat"
 */
export default function HeroEntrance({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const q = (sel: string) => root.querySelectorAll(sel);

    const eyebrow = q('[data-anim="eyebrow"]');
    const titleEls = q('[data-anim="title"] .anim-word');
    const titleFallback = q('[data-anim="title"]');
    const subtitle = q('[data-anim="subtitle"]');
    const cta = q('[data-anim="cta"]');
    const stat = q('[data-anim="stat"]');

    const useWords = titleEls.length > 0;

    gsap.set([eyebrow, subtitle, cta, stat], { opacity: 0, y: 24 });
    if (useWords) gsap.set(titleEls, { opacity: 0, y: 40, rotateX: -25 });
    else gsap.set(titleFallback, { opacity: 0, y: 24 });

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.7 }, 0.1);

      if (useWords) {
        tl.to(
          titleEls,
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 0.9,
            stagger: 0.08,
          },
          0.25
        );
      } else {
        tl.to(titleFallback, { opacity: 1, y: 0, duration: 0.9 }, 0.25);
      }

      tl.to(subtitle, { opacity: 1, y: 0, duration: 0.8 }, "-=0.5");
      tl.to(cta, { opacity: 1, y: 0, duration: 0.7, stagger: 0.1 }, "-=0.45");
      tl.to(stat, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 }, "-=0.3");
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/**
 * Splits a heading into per-word spans for staggered animation by HeroEntrance.
 * Usage: <SplitWords text="Engineering the next decade" />
 */
export function SplitWords({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((w, i) => (
        <span key={i} className="inline-block">
          <span className="anim-word inline-block">{w}</span>
          {i < words.length - 1 && <span>&nbsp;</span>}
        </span>
      ))}
    </span>
  );
}
