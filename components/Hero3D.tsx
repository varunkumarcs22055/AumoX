"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { LogoMark } from "./Logo";

/**
 * Hero background — gold logo at center, three concentric orbital rings with
 * traveling dots, soft glow + mesh blobs + floating particles. GSAP timeline
 * handles the entrance; CSS keyframes drive the continuous rotation (cheap on GPU).
 */
export default function Hero3D() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    // Subtle mouse parallax
    const handler = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty("--mx", `${x * 22}px`);
      el.style.setProperty("--my", `${y * 22}px`);
    };
    window.addEventListener("mousemove", handler);

    // GSAP entrance timeline
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      if (logoRef.current) {
        tl.fromTo(
          logoRef.current,
          { scale: 0.3, opacity: 0, rotate: -45 },
          { scale: 1, opacity: 1, rotate: 0, duration: 1.6, ease: "power4.out" },
          0
        );
      }

      const groups = svgRef.current?.querySelectorAll(".orbit");
      const dots = svgRef.current?.querySelectorAll(".orbit-dot");
      const glow = svgRef.current?.querySelectorAll(".core-glow");

      if (glow && glow.length)
        tl.fromTo(glow, { opacity: 0 }, { opacity: 1, duration: 1.2 }, 0.2);
      if (groups && groups.length)
        tl.fromTo(
          groups,
          { opacity: 0, scale: 0.55, transformOrigin: "50% 50%" },
          { opacity: 1, scale: 1, duration: 1.4, stagger: 0.18 },
          0.4
        );
      if (dots && dots.length)
        tl.fromTo(dots, { opacity: 0 }, { opacity: 1, duration: 0.6, stagger: 0.1 }, 1.2);

      // Continuous gentle "breathing" on the logo
      if (logoRef.current) {
        gsap.to(logoRef.current, {
          scale: 1.04,
          duration: 3.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: 1.8,
        });
      }
    }, el);

    return () => {
      window.removeEventListener("mousemove", handler);
      ctx.revert();
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
      style={{ ["--mx" as any]: "0px", ["--my" as any]: "0px" } as React.CSSProperties}
    >
      {/* Soft mouse-following glow */}
      <div
        className="absolute inset-0 transition-transform duration-300 ease-out"
        style={{
          transform: "translate3d(var(--mx), var(--my), 0)",
          background:
            "radial-gradient(780px circle at 75% 35%, rgba(212,175,55,0.18), transparent 60%), radial-gradient(700px circle at 25% 80%, rgba(245,158,11,0.10), transparent 65%)",
        }}
      />

      {/* Mesh blob top-right */}
      <div
        className="absolute -top-32 -right-32 w-[700px] h-[700px] rounded-full blur-3xl opacity-40 animate-[float-blob_18s_ease-in-out_infinite]"
        style={{ background: "radial-gradient(circle, rgba(212,175,55,0.55), transparent 60%)" }}
      />
      {/* Mesh blob bottom-left */}
      <div
        className="absolute -bottom-40 -left-32 w-[600px] h-[600px] rounded-full blur-3xl opacity-30 animate-[float-blob_22s_ease-in-out_infinite_reverse]"
        style={{ background: "radial-gradient(circle, rgba(184,148,31,0.5), transparent 60%)" }}
      />

      {/* ORBIT SYSTEM — centered on the logo */}
      <div
        className="absolute top-1/2 right-[-12%] lg:right-[-2%] -translate-y-1/2 w-[700px] h-[700px] lg:w-[860px] lg:h-[860px]"
        style={{
          transform: "translate(var(--mx), calc(var(--my) - 50%))",
          transition: "transform 300ms ease-out",
        }}
      >
        <svg ref={svgRef} viewBox="0 0 800 800" className="absolute inset-0 w-full h-full">
          <defs>
            <linearGradient id="gold-stroke" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F0DDA0" />
              <stop offset="50%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#B8941F" />
            </linearGradient>
            <radialGradient id="core-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F0DDA0" stopOpacity="0.55" />
              <stop offset="60%" stopColor="#D4AF37" stopOpacity="0.15" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>

          {/* Big halo behind the logo */}
          <circle className="core-glow" cx="400" cy="400" r="220" fill="url(#core-glow)" />

          {/* Orbit 1 — innermost, fastest, reverse */}
          <g className="orbit">
            <g style={{ transformOrigin: "400px 400px", animation: "spin-cw 28s linear infinite reverse" }}>
              <ellipse cx="400" cy="400" rx="240" ry="80" fill="none" stroke="url(#gold-stroke)" strokeWidth="1" opacity="0.55" />
              <ellipse cx="400" cy="400" rx="240" ry="80" fill="none" stroke="url(#gold-stroke)" strokeWidth="2" strokeDasharray="4 90" opacity="0.9" />
              <circle className="orbit-dot" cx="640" cy="400" r="5" fill="url(#gold-stroke)" />
            </g>
          </g>

          {/* Orbit 2 — tilted 35° */}
          <g className="orbit" style={{ transformOrigin: "400px 400px", transform: "rotate(35deg)" }}>
            <g style={{ transformOrigin: "400px 400px", animation: "spin-cw 48s linear infinite" }}>
              <ellipse cx="400" cy="400" rx="300" ry="110" fill="none" stroke="url(#gold-stroke)" strokeWidth="1" opacity="0.5" />
              <ellipse cx="400" cy="400" rx="300" ry="110" fill="none" stroke="url(#gold-stroke)" strokeWidth="2" strokeDasharray="3 120" opacity="0.85" />
              <circle className="orbit-dot" cx="700" cy="400" r="6" fill="url(#gold-stroke)" />
            </g>
          </g>

          {/* Orbit 3 — outer, slow, tilted -25° */}
          <g className="orbit" style={{ transformOrigin: "400px 400px", transform: "rotate(-25deg)" }}>
            <g style={{ transformOrigin: "400px 400px", animation: "spin-cw 80s linear infinite reverse" }}>
              <ellipse cx="400" cy="400" rx="360" ry="140" fill="none" stroke="url(#gold-stroke)" strokeWidth="1" opacity="0.4" />
              <circle className="orbit-dot" cx="760" cy="400" r="4" fill="url(#gold-stroke)" />
            </g>
          </g>

          {/* Faint outer ring (no rotation) */}
          <circle cx="400" cy="400" r="380" fill="none" stroke="url(#gold-stroke)" strokeWidth="0.5" opacity="0.25" strokeDasharray="2 8" />
        </svg>

        {/* The LOGO sits at the center of the orbit system */}
        <div
          ref={logoRef}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <div
            className="drop-shadow-[0_0_50px_rgba(212,175,55,0.45)]"
            style={{ width: "min(34vw, 220px)", height: "min(34vw, 220px)" }}
          >
            <LogoMark size={220} className="w-full h-full" />
          </div>
        </div>
      </div>

      {/* Floating ambient particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 26 }).map((_, i) => {
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
                opacity: 0.5 + (i % 5) / 10,
                animation: `particle-float ${duration}s ease-in-out ${delay}s infinite`,
              }}
            />
          );
        })}
      </div>

      {/* Vignette for legible foreground text */}
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
        @keyframes spin-cw {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
