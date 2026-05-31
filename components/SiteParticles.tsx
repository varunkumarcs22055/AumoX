"use client";

import { usePathname } from "next/navigation";
import ParticleField from "./anim/ParticleField";

/**
 * Fixed-position ambient particle field that lives behind ALL site content.
 * Visible through transparent / semi-transparent section backgrounds — gives
 * the entire site the antigravity-style spark layer.
 *
 * Hidden on /admin routes for a clean admin shell.
 */
export default function SiteParticles() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <div
      className="site-particles-overlay fixed inset-0 pointer-events-none z-30"
      aria-hidden="true"
      style={{ contain: "strict" }}
    >
      <ParticleField
        count={140}
        cursorRadius={130}
        cursorStrength={0.18}
        constellationRadius={170}
        showWand={false}
      />
    </div>
  );
}
