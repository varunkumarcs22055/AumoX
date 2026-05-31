"use client";

import { useEffect, useRef } from "react";

/**
 * Premium canvas particle field — hundreds of small gold "sparks" drifting
 * ambiently with subtle sway physics and cursor reactivity. Inspired by
 * antigravity-style hero backgrounds, tuned for the AUMOXO gold palette.
 *
 * Performance: single canvas, O(n) update loop, devicePixelRatio capped at 2,
 * pauses when the page is hidden. ~280 particles ≈ 0.5–1% CPU on a laptop.
 */

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  width: number;
  angle: number;
  spin: number;
  opacity: number;
  baseOpacity: number;
  twinklePhase: number;
  hueIdx: number;
};

const PALETTE = ["#F0DDA0", "#E5C76B", "#D4AF37", "#B8941F", "#FAF1D6"];

export default function ParticleField({
  count = 280,
  /** Max repulsion radius around the cursor (px). */
  cursorRadius = 130,
  /** Strength of repulsion. 0–1 */
  cursorStrength = 0.45,
  className = "",
}: {
  count?: number;
  cursorRadius?: number;
  cursorStrength?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = parent.clientWidth;
    let h = parent.clientHeight;

    function resize() {
      if (!canvas || !ctx || !parent) return;
      w = parent.clientWidth;
      h = parent.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    // Initial particles
    const particles: Particle[] = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -Math.random() * 0.35 - 0.05, // drift gently upward
      length: 2 + Math.random() * 8,
      width: 0.8 + Math.random() * 1.4,
      angle: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.012,
      opacity: 0,
      baseOpacity: 0.25 + Math.random() * 0.55,
      twinklePhase: Math.random() * Math.PI * 2,
      hueIdx: Math.floor(Math.random() * PALETTE.length),
    }));

    // Mouse position (in CSS pixels, relative to canvas)
    let mx = -9999, my = -9999;
    function onMouse(e: MouseEvent) {
      const r = canvas!.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
    }
    function onLeave() {
      mx = my = -9999;
    }

    window.addEventListener("mousemove", onMouse);
    window.addEventListener("mouseleave", onLeave);
    const ro = new ResizeObserver(resize);
    ro.observe(parent);

    let raf = 0;
    let visible = true;
    const onVisibility = () => {
      visible = !document.hidden;
      if (visible) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      } else {
        cancelAnimationFrame(raf);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    let last = performance.now();
    let elapsed = 0;

    function tick(now: number = performance.now()) {
      const dt = Math.min(60, now - last);
      last = now;
      elapsed += dt;
      // Scale velocities relative to ~16ms frame so motion stays consistent
      const dtScale = dt / 16;

      ctx!.clearRect(0, 0, w, h);

      for (const p of particles) {
        // Twinkle the alpha
        const tw = 0.6 + 0.4 * Math.sin(p.twinklePhase + elapsed * 0.003);
        p.opacity = p.baseOpacity * tw;

        // Random sway
        p.vx += (Math.random() - 0.5) * 0.025 * dtScale;
        p.vy += (Math.random() - 0.5) * 0.015 * dtScale;

        // Mild friction so velocities don't explode
        p.vx *= 0.985;
        p.vy *= 0.985;

        // Cursor repulsion
        if (mx > -1000) {
          const dx = p.x - mx;
          const dy = p.y - my;
          const d2 = dx * dx + dy * dy;
          const rr = cursorRadius * cursorRadius;
          if (d2 < rr && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const f = (1 - d / cursorRadius) * cursorStrength;
            p.vx += (dx / d) * f * dtScale;
            p.vy += (dy / d) * f * dtScale;
          }
        }

        // Apply velocity
        p.x += p.vx * dtScale;
        p.y += p.vy * dtScale;
        p.angle += p.spin * dtScale;

        // Wrap edges (with a small buffer)
        const buf = 30;
        if (p.x < -buf) p.x = w + buf;
        if (p.x > w + buf) p.x = -buf;
        if (p.y < -buf) p.y = h + buf;
        if (p.y > h + buf) p.y = -buf;

        // Draw — small rotated line (spark)
        const color = PALETTE[p.hueIdx];
        ctx!.save();
        ctx!.translate(p.x, p.y);
        ctx!.rotate(p.angle);
        ctx!.strokeStyle = color;
        ctx!.globalAlpha = p.opacity;
        ctx!.lineWidth = p.width;
        ctx!.lineCap = "round";
        ctx!.shadowColor = color;
        ctx!.shadowBlur = 6;
        ctx!.beginPath();
        ctx!.moveTo(-p.length / 2, 0);
        ctx!.lineTo(p.length / 2, 0);
        ctx!.stroke();
        ctx!.restore();
      }

      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      ro.disconnect();
    };
  }, [count, cursorRadius, cursorStrength]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      aria-hidden="true"
    />
  );
}
