"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Premium momentum smooth-scroll (Lenis) wired into GSAP's ticker so every
 * ScrollTrigger reveal stays perfectly in sync — one rAF loop drives both,
 * so there's no extra per-frame cost. Disabled on the app surfaces
 * (admin / portal / staff) where native scrolling is snappier, and fully
 * skipped when the user prefers reduced motion.
 *
 * The live instance is published on window.__lenis so UI like the
 * scroll-to-top button can request an animated scroll without prop drilling.
 */
declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const isApp =
      pathname?.startsWith("/admin") ||
      pathname?.startsWith("/portal") ||
      pathname?.startsWith("/staff");

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (isApp || reduced) return;

    const lenis = new Lenis({
      duration: 1.1,
      // easeOutExpo — fast start, long premium glide to a stop
      easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
    });
    window.__lenis = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const onTick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      lenis.destroy();
      if (window.__lenis === lenis) delete window.__lenis;
    };
  }, [pathname]);

  return null;
}
