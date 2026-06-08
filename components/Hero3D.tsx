"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
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

    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // No mouse parallax on touch devices — saves a continuous rAF loop on mobile.
    let raf = 0;
    let cleanupMouse = () => {};
    if (!isTouch && !reducedMotion) {
      const target = { x: 0, y: 0 };
      const current = { x: 0, y: 0 };
      let idleFrames = 0;
      let last = 0;

      const handler = (e: MouseEvent) => {
        const now = performance.now();
        if (now - last < 16) return; // ~60Hz cap on event work
        last = now;
        const r = el.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;
        const ny = (e.clientY - r.top) / r.height - 0.5;
        target.x = nx * 18;
        target.y = ny * 18;
        idleFrames = 0;
        if (!raf) raf = requestAnimationFrame(flow);
      };
      window.addEventListener("mousemove", handler, { passive: true });

      function flow() {
        const dx = target.x - current.x;
        const dy = target.y - current.y;
        current.x += dx * 0.08;
        current.y += dy * 0.08;
        el!.style.setProperty("--mx", `${current.x.toFixed(2)}px`);
        el!.style.setProperty("--my", `${current.y.toFixed(2)}px`);

        // Stop the loop once we've settled (saves CPU when idle)
        if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
          if (++idleFrames > 6) {
            raf = 0;
            return;
          }
        } else {
          idleFrames = 0;
        }
        raf = requestAnimationFrame(flow);
      }
      // Prime once so the value is set
      raf = requestAnimationFrame(flow);

      cleanupMouse = () => {
        window.removeEventListener("mousemove", handler);
      };
    }

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
      if (raf) cancelAnimationFrame(raf);
      cleanupMouse();
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
      {/* Mouse-following soft glow (frame-locked via rAF, no CSS transition) */}
      <div
        className="hero-deco-soft absolute inset-0"
        style={{
          transform: "translate3d(var(--mx), var(--my), 0)",
          background:
            "radial-gradient(900px circle at 78% 38%, rgba(212,175,55,0.22), transparent 60%), radial-gradient(700px circle at 22% 78%, rgba(245,158,11,0.10), transparent 65%)",
          willChange: "transform",
        }}
      />

      {/* Mesh blobs — lighter blur on small screens (`md:blur-3xl` only) */}
      <div
        className="hero-deco-soft absolute -top-32 -right-32 w-[500px] h-[500px] lg:w-[700px] lg:h-[700px] rounded-full blur-2xl md:blur-3xl opacity-40 animate-[float-blob_22s_ease-in-out_infinite]"
        style={{ background: "radial-gradient(circle, rgba(212,175,55,0.55), transparent 60%)" }}
      />
      <div
        className="hero-deco-soft absolute -bottom-40 -left-32 w-[400px] h-[400px] lg:w-[600px] lg:h-[600px] rounded-full blur-2xl md:blur-3xl opacity-30 animate-[float-blob_26s_ease-in-out_infinite_reverse]"
        style={{ background: "radial-gradient(circle, rgba(184,148,31,0.5), transparent 60%)" }}
      />

      {/* ORBIT SYSTEM — only shown on xl+ screens where there's true right-side
          space next to the (narrowed) text column. Vertically centered with
          equal top/bottom space, never overlaps text. */}
      <div
        className="hero-orbit-soft absolute hidden xl:block"
        style={{
          top: "50%",
          right: "2%",
          width: "min(30vw, 56vh, 400px)",
          height: "min(30vw, 56vh, 400px)",
          transform: "translate3d(var(--mx), calc(var(--my) - 50%), 0)",
          willChange: "transform",
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

          {/* MAIN ORBITAL RING — bright, with glow */}
          <circle
            className="orbit-ring"
            cx="400" cy="400" r="300"
            fill="none"
            stroke="url(#gold-stroke)"
            strokeWidth="2.2"
            opacity="0.95"
            strokeDasharray="3 12"
            filter="url(#dot-bloom)"
            style={{
              transformOrigin: "400px 400px",
              animation: "spin-cw 55s linear infinite",
            }}
          />
          {/* Secondary inner ring */}
          <circle
            cx="400" cy="400" r="225"
            fill="none"
            stroke="url(#gold-stroke)"
            strokeWidth="1.5"
            opacity="0.6"
            strokeDasharray="2 18"
            style={{
              transformOrigin: "400px 400px",
              animation: "spin-cw 35s linear infinite reverse",
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

        {/* LOGO at the center — outer wrapper centers via flex (no transform),
            inner ref-ed element is what GSAP animates so transforms don't
            knock it out of position. */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            ref={logoRef}
            className="relative"
            style={{ width: "55%", height: "55%" }}
          >
            {/* Soft gold halo glow behind the image */}
            <div
              className="absolute inset-[-25%] rounded-full pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle, rgba(240,221,160,0.4) 0%, rgba(212,175,55,0.22) 35%, transparent 70%)",
                filter: "blur(24px)",
              }}
            />
            <img
              src="/logo-mark.png"
              alt=""
              className="relative block w-full h-full object-contain"
              style={{ filter: "drop-shadow(0 0 18px rgba(240,221,160,0.45))" }}
            />
          </div>
        </div>
      </div>

      {/* Premium canvas particle field — ParticleField auto-scales count down on
          small screens / touch devices so mobile stays smooth */}
      <div className="hero-deco-soft is-particles absolute inset-0">
        <ParticleField count={200} cursorRadius={110} cursorStrength={0.1} />
      </div>

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
