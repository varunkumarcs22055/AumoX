"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type RevealProps = {
  children: React.ReactNode;
  /** Animation kind */
  kind?: "fade-up" | "fade-in" | "scale-in" | "slide-right";
  /** Stagger child elements with this CSS selector */
  stagger?: string;
  /** Delay before animation starts (s) */
  delay?: number;
  /** Duration of each child (s) */
  duration?: number;
  /** Stagger gap between children (s) */
  staggerGap?: number;
  /** Distance to translate (px) — fade-up only */
  distance?: number;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
};

export default function Reveal({
  children,
  kind = "fade-up",
  stagger,
  delay = 0,
  duration = 0.9,
  staggerGap = 0.08,
  distance = 28,
  className = "",
  as: Tag = "div",
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets: Element[] = stagger
      ? Array.from(el.querySelectorAll(stagger))
      : [el];

    if (targets.length === 0) return;

    const fromVars: gsap.TweenVars = { opacity: 0 };
    if (kind === "fade-up") fromVars.y = distance;
    if (kind === "scale-in") {
      fromVars.scale = 0.94;
      fromVars.y = 10;
    }
    if (kind === "slide-right") fromVars.x = -distance;

    gsap.set(targets, fromVars);

    const ctx = gsap.context(() => {
      gsap.to(targets, {
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
        duration,
        delay,
        ease: "power3.out",
        stagger: staggerGap,
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
    }, el);

    return () => ctx.revert();
  }, [kind, stagger, delay, duration, staggerGap, distance]);

  const Wrapper = Tag as any;
  return (
    <Wrapper ref={ref} className={className}>
      {children}
    </Wrapper>
  );
}
