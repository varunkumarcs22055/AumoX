"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { LogoMark } from "./Logo";
import ParticleField from "./anim/ParticleField";

/**
 * Hero background — refined for impact.
 * Composition (centered on the logo):
 *   1. Soft conic halo slowly rotating behind the logo
 *   2. Radial glow + gold pulse shockwaves emanating from center
 *   3. ONE elegant orbital ring with 5 large gold dots
 *   4. Subtle starfield + drifting particles + mesh blobs
 * Choreography: on mount, halo + glow fade in, logo zooms in, ring strokes
 * draw on, dots fly out from center to ring positions, then the loops start.
 */
export default function Hero3D() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    // Subtle 3D-tilt on the logo as the cursor moves
    const handler = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty("--mx", `${x * 20}px`);
      el.style.setProperty("--my", `${y * 20}px`);
      if (logoRef.current) {
        gsap.to(logoRef.current, {
          rotateY: x * 14,
          rotateX: -y * 14,
          duration: 0.6,
          ease: "power2.out",
        });
      }
    };
    window.addEventListener("mousemove", handler);

    // Entrance choreography
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Halo rotates in
      if (haloRef.current) {
        tl.fromTo(haloRef.current, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 1.4 }, 0);
      }

      // Logo zoom
      if (logoRef.current) {
        tl.fromTo(
          logoRef.current,
          { scale: 0.25, opacity: 0, rotate: -50 },
          { scale: 1, opacity: 1, rotate: 0, duration: 1.7, ease: "power4.out" },
          0.1
        );
      }

      const svg = svgRef.current;
      if (!svg) return;

      const orbitRing = svg.querySelector(".orbit-ring");
      const dots = svg.querySelectorAll<SVGCircleElement>(".orbit-dot");
      const stars = svg.querySelectorAll(".twinkle-star");

      // Ring stroke draw-on
      if (orbitRing) {
        const len = (orbitRing as any).getTotalLength?.() ?? 2000;
        gsap.set(orbitRing, { strokeDasharray: len, strokeDashoffset: len, opacity: 1 });
        tl.to(orbitRing, { strokeDashoffset: 0, duration: 1.8, ease: "power2.inOut" }, 0.5);
      }

      // Dots fly out from logo to their orbit positions
      dots.forEach((d, i) => {
        const cx = parseFloat(d.getAttribute("cx") || "400");
        const cy = parseFloat(d.getAttribute("cy") || "400");
        gsap.set(d, {
          attr: { cx: 400, cy: 400 },
          opacity: 0,
          scale: 0,
          transformOrigin: "400px 400px",
        });
        tl.to(
          d,
          {
            attr: { cx, cy },
            opacity: 1,
            scale: 1,
            duration: 1.2,
            ease: "power3.out",
          },
          1.0 + i * 0.08
        );
      });

      // Stars fade in
      if (stars.length) tl.fromTo(stars, { opacity: 0 }, { opacity: 1, duration: 1.4, stagger: 0.04 }, 0.6);

      // Continuous: gentle breathing on logo
      if (logoRef.current) {
        gsap.to(logoRef.current, {
          scale: 1.05,
          duration: 4,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: 2,
        });
      }
    }, el);

    return () => {
      window.removeEventListener("mousemove", handler);
      ctx.revert();
    };
  }, []);

  // 5 dots evenly spaced on the orbital ellipse (rx=300, ry=300 → circle)
  const dots = Array.from({ length: 5 }, (_, i) => {
    const t = (i / 5) * Math.PI * 2 - Math.PI / 2;
    return { cx: 400 + 300 * Math.cos(t), cy: 400 + 300 * Math.sin(t), r: 7 };
  });

  // 28 deterministic stars across the SVG
  const stars = Array.from({ length: 28 }, (_, i) => {
    const x = ((i * 91 + 17) % 780) + 10;
    const y = ((i * 137 + 53) % 780) + 10;
    const r = 0.7 + ((i * 7) % 6) / 4;
    const delay = (i * 0.27) % 4;
    return { x, y, r, delay };
  });

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
      style={{ ["--mx" as any]: "0px", ["--my" as any]: "0px" } as React.CSSProperties}
    >
      {/* Mouse-following soft glow */}
      <div
        className="absolute inset-0 transition-transform duration-300 ease-out"
        style={{
          transform: "translate3d(var(--mx), var(--my), 0)",
          background:
            "radial-gradient(900px circle at 78% 38%, rgba(212,175,55,0.22), transparent 60%), radial-gradient(700px circle at 22% 78%, rgba(245,158,11,0.10), transparent 65%)",
        }}
      />

      {/* Mesh blobs */}
      <div
        className="absolute -top-32 -right-32 w-[700px] h-[700px] rounded-full blur-3xl opacity-40 animate-[float-blob_18s_ease-in-out_infinite]"
        style={{ background: "radial-gradient(circle, rgba(212,175,55,0.55), transparent 60%)" }}
      />
      <div
        className="absolute -bottom-40 -left-32 w-[600px] h-[600px] rounded-full blur-3xl opacity-30 animate-[float-blob_22s_ease-in-out_infinite_reverse]"
        style={{ background: "radial-gradient(circle, rgba(184,148,31,0.5), transparent 60%)" }}
      />

      {/* ORBIT SYSTEM */}
      <div
        className="absolute top-1/2 right-[5%] lg:right-[8%] -translate-y-1/2 w-[640px] h-[640px] lg:w-[780px] lg:h-[780px]"
        style={{
          transform: "translate(var(--mx), calc(var(--my) - 50%))",
          transition: "transform 300ms ease-out",
          perspective: "1200px",
        }}
      >
        {/* Slowly rotating conic halo behind logo */}
        <div
          ref={haloRef}
          className="absolute inset-0 rounded-full opacity-90 animate-[halo-spin_36s_linear_infinite]"
          style={{
            background:
              "conic-gradient(from 0deg, rgba(212,175,55,0) 0%, rgba(212,175,55,0.35) 25%, rgba(212,175,55,0) 50%, rgba(240,221,160,0.28) 75%, rgba(212,175,55,0) 100%)",
            filter: "blur(40px)",
          }}
        />

        <svg ref={svgRef} viewBox="0 0 800 800" className="absolute inset-0 w-full h-full">
          <defs>
            <linearGradient id="gold-stroke" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F0DDA0" />
              <stop offset="50%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#B8941F" />
            </linearGradient>
            <radialGradient id="core-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F0DDA0" stopOpacity="0.55" />
              <stop offset="55%" stopColor="#D4AF37" stopOpacity="0.18" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            <radialGradient id="star-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="dot-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F0DDA0" />
              <stop offset="60%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#B8941F" />
            </radialGradient>
            <filter id="dot-bloom" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Twinkling stars */}
          {stars.map((s, i) => (
            <circle
              key={i}
              className="twinkle-star"
              cx={s.x} cy={s.y} r={s.r}
              fill="url(#star-glow)"
              style={{ animation: `twinkle 3.5s ease-in-out ${s.delay}s infinite` }}
            />
          ))}

          {/* Halo radial glow */}
          <circle cx="400" cy="400" r="260" fill="url(#core-glow)" />

          {/* PULSE SHOCKWAVES — much more visible */}
          {[0, 1.4, 2.8].map((delay, i) => (
            <circle
              key={i}
              cx="400" cy="400" r="170"
              fill="none"
              stroke="url(#gold-stroke)"
              strokeWidth="2"
              opacity="0"
              style={{
                transformOrigin: "400px 400px",
                animation: `pulse-ring 4.2s ease-out ${delay}s infinite`,
              }}
            />
          ))}

          {/* THE ORBITAL RING — single, elegant, circular */}
          <circle
            className="orbit-ring"
            cx="400" cy="400" r="300"
            fill="none"
            stroke="url(#gold-stroke)"
            strokeWidth="1.5"
            opacity="0.65"
            strokeDasharray="3 14"
            style={{
              transformOrigin: "400px 400px",
              animation: "spin-cw 60s linear infinite",
            }}
          />

          {/* Glowing dots travelling on the ring (rotation via parent <g>) */}
          <g style={{ transformOrigin: "400px 400px", animation: "spin-cw 30s linear infinite" }}>
            {dots.map((d, i) => (
              <circle
                key={i}
                className="orbit-dot"
                cx={d.cx} cy={d.cy} r={d.r}
                fill="url(#dot-glow)"
                filter="url(#dot-bloom)"
              />
            ))}
          </g>

          {/* Faint outer guide ring */}
          <circle
            cx="400" cy="400" r="370"
            fill="none" stroke="url(#gold-stroke)"
            strokeWidth="0.5" opacity="0.2"
            strokeDasharray="1 12"
          />
        </svg>

        {/* LOGO at the center */}
        <div
          ref={logoRef}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div
            className="drop-shadow-[0_0_70px_rgba(212,175,55,0.55)]"
            style={{ width: "min(38vw, 260px)", height: "min(38vw, 260px)" }}
          >
            <LogoMark size={260} className="w-full h-full" />
          </div>
        </div>
      </div>

      {/* Premium canvas particle field — 280 gold sparks, cursor-reactive */}
      <ParticleField count={280} cursorRadius={140} cursorStrength={0.5} />

      {/* Left-side vignette so foreground copy stays legible */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at left center, transparent 25%, rgb(var(--bg-base) / 0.6) 80%)",
        }}
      />

      <style jsx>{`
        @keyframes float-blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%      { transform: translate(40px, -30px) scale(1.05); }
          66%      { transform: translate(-30px, 40px) scale(0.95); }
        }
        @keyframes spin-cw {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes halo-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(0.9); opacity: 0.85; }
          75%  { transform: scale(2.6); opacity: 0; }
          100% { transform: scale(2.6); opacity: 0; }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.7); }
          50%      { opacity: 1;   transform: scale(1.5); }
        }
      `}</style>
    </div>
  );
}
