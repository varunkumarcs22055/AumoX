"use client";

import ParticleField from "./anim/ParticleField";

/**
 * Fixed-position ambient particle field that lives behind ALL site content.
 * Visible through transparent / semi-transparent section backgrounds — gives
 * the entire site the antigravity-style spark layer.
 *
 * Densities are tuned lower than the hero's own field so it never overpowers
 * text. Cursor still pulls glowing "constellation" lines toward nearby sparks.
 */
export default function SiteParticles() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-30"
      aria-hidden="true"
      style={{ mixBlendMode: "screen", contain: "strict" }}
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
