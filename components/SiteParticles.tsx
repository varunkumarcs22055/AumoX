"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import ParticleField from "./anim/ParticleField";

/**
 * Sitewide ambient particle field. Performance-conscious:
 *   • Hidden on screens < 1024px (mobile + tablet) so it never causes lag
 *   • Hidden on touch devices regardless of width
 *   • Hidden on /admin routes
 *   • Hidden when user prefers reduced motion
 *   • Sparser particle count + no constellation lines (those live in the hero only)
 */
export default function SiteParticles() {
  const pathname = usePathname();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const evaluate = () => {
      const wideEnough = window.innerWidth >= 1024;
      const pointerFine = window.matchMedia("(pointer: fine)").matches;
      const motionOk = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      setEnabled(wideEnough && pointerFine && motionOk);
    };
    evaluate();
    window.addEventListener("resize", evaluate);
    return () => window.removeEventListener("resize", evaluate);
  }, []);

  if (pathname?.startsWith("/admin")) return null;
  if (!enabled) return null;

  return (
    <div
      className="site-particles-overlay fixed inset-0 pointer-events-none z-30"
      aria-hidden="true"
      style={{ contain: "strict" }}
    >
      <ParticleField
        count={90}
        cursorRadius={120}
        cursorStrength={0.12}
        constellationRadius={0}
        showWand={false}
      />
    </div>
  );
}
