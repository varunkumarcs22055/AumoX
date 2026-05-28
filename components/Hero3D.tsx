"use client";

import { useEffect, useRef } from "react";

/**
 * Premium animated hero background — pure CSS + SVG (no WebGL deps).
 * Rotating concentric gold rings + floating particles + parallax on mouse move.
 */
export default function Hero3D() {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const handler = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty("--mx", `${x * 20}px`);
      el.style.setProperty("--my", `${y * 20}px`);
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
      style={
        {
          ["--mx" as any]: "0px",
          ["--my" as any]: "0px",
        } as React.CSSProperties
      }
    >
      {/* Soft radial glow following mouse */}
      <div
        className="absolute inset-0 transition-transform duration-300 ease-out"
        style={{
          transform: "translate3d(var(--mx), var(--my), 0)",
          background:
            "radial-gradient(800px circle at 70% 30%, rgba(212,175,55,0.18), transparent 60%), radial-gradient(700px circle at 20% 80%, rgba(245,158,11,0.10), transparent 65%)",
        }}
      />

      {/* Mesh blob (top right) */}
      <div className="absolute -top-32 -right-32 w-[700px] h-[700px] rounded-full blur-3xl opacity-40 animate-[float-blob_18s_ease-in-out_infinite]"
        style={{ background: "radial-gradient(circle, rgba(212,175,55,0.6), transparent 60%)" }}
      />
      {/* Mesh blob (bottom left) */}
      <div className="absolute -bottom-40 -left-32 w-[600px] h-[600px] rounded-full blur-3xl opacity-30 animate-[float-blob_22s_ease-in-out_infinite_reverse]"
        style={{ background: "radial-gradient(circle, rgba(184,148,31,0.5), transparent 60%)" }}
      />

      {/* Rotating ring system (centered, off to the right on desktop) */}
      <div
        className="absolute top-1/2 right-[-10%] lg:right-[-5%] -translate-y-1/2 w-[640px] h-[640px] lg:w-[820px] lg:h-[820px] opacity-90"
        style={{ transform: "translate(var(--mx), calc(var(--my) - 50%))", transition: "transform 300ms ease-out" }}
      >
        <svg viewBox="0 0 800 800" className="w-full h-full">
          <defs>
            <linearGradient id="gold-stroke" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F0DDA0" />
              <stop offset="50%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#B8941F" />
            </linearGradient>
            <radialGradient id="core-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F0DDA0" stopOpacity="0.55" />
              <stop offset="50%" stopColor="#D4AF37" stopOpacity="0.2" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>

          {/* Core glow */}
          <circle cx="400" cy="400" r="220" fill="url(#core-glow)" />

          {/* Solid inner orb (gold-tinted) */}
          <g className="origin-center animate-[spin_30s_linear_infinite]" style={{ transformOrigin: "400px 400px" }}>
            <circle cx="400" cy="400" r="120" fill="none" stroke="url(#gold-stroke)" strokeWidth="1.2" opacity="0.7" />
            <circle cx="400" cy="400" r="120" fill="none" stroke="url(#gold-stroke)" strokeWidth="1.2" strokeDasharray="6 14" opacity="0.5" />
          </g>

          {/* Ring 1 — counter rotation */}
          <g className="animate-[spin_60s_linear_infinite_reverse]" style={{ transformOrigin: "400px 400px" }}>
            <ellipse cx="400" cy="400" rx="240" ry="80" fill="none" stroke="url(#gold-stroke)" strokeWidth="1" opacity="0.55" />
            <ellipse cx="400" cy="400" rx="240" ry="80" fill="none" stroke="url(#gold-stroke)" strokeWidth="2" strokeDasharray="4 90" opacity="0.9" />
          </g>

          {/* Ring 2 */}
          <g className="animate-[spin_80s_linear_infinite]" style={{ transformOrigin: "400px 400px", transform: "rotate(35deg)" }}>
            <ellipse cx="400" cy="400" rx="300" ry="110" fill="none" stroke="url(#gold-stroke)" strokeWidth="1" opacity="0.45" />
            <ellipse cx="400" cy="400" rx="300" ry="110" fill="none" stroke="url(#gold-stroke)" strokeWidth="2" strokeDasharray="3 120" opacity="0.85" />
          </g>

          {/* Ring 3 */}
          <g className="animate-[spin_100s_linear_infinite_reverse]" style={{ transformOrigin: "400px 400px", transform: "rotate(-25deg)" }}>
            <ellipse cx="400" cy="400" rx="360" ry="140" fill="none" stroke="url(#gold-stroke)" strokeWidth="1" opacity="0.35" />
          </g>

          {/* Outer faint circle */}
          <circle cx="400" cy="400" r="380" fill="none" stroke="url(#gold-stroke)" strokeWidth="0.5" opacity="0.25" strokeDasharray="2 8" />
        </svg>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 28 }).map((_, i) => {
          const top = (i * 37) % 100;
          const left = (i * 53) % 100;
          const size = 2 + (i % 4);
          const delay = (i * 0.4) % 8;
          const duration = 8 + (i % 6);
          return (
            <span
              key={i}
              className="absolute rounded-full"
              style={{
                top: `${top}%`,
                left: `${left}%`,
                width: `${size}px`,
                height: `${size}px`,
                background: i % 3 === 0 ? "#F0DDA0" : "#D4AF37",
                boxShadow: `0 0 ${size * 4}px rgba(212,175,55,0.7)`,
                opacity: 0.5 + ((i % 5) / 10),
                animation: `particle-float ${duration}s ease-in-out ${delay}s infinite`,
              }}
            />
          );
        })}
      </div>

      {/* Vignette so foreground copy stays legible (theme-aware via CSS var) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at left center, transparent 25%, rgb(var(--bg-base) / 0.55) 75%)",
        }}
      />

      <style jsx>{`
        @keyframes float-blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%      { transform: translate(40px, -30px) scale(1.05); }
          66%      { transform: translate(-30px, 40px) scale(0.95); }
        }
        @keyframes particle-float {
          0%, 100% { transform: translate(0, 0); opacity: 0.4; }
          50%      { transform: translate(20px, -30px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
