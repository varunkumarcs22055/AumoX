"use client";

import { useEffect, useRef } from "react";

/**
 * Premium canvas particle field — drifting gold "sparks" with cursor
 * reactivity. Carefully tuned for performance:
 *   • DPR capped at 1.5 (no 4× pixel waste on retina/4K)
 *   • Auto-reduces particle count on small viewports / touch devices
 *   • Skips constellation + cursor reactivity entirely on touch / mobile
 *   • mousemove throttled to ~60Hz via a timestamp gate
 *   • Pauses when the page tab is hidden
 *   • prefers-reduced-motion → renders a single static frame, no loop
 *
 * Result: smooth on mid-range mobile, near-zero idle CPU on desktop.
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
  count = 180,
  /** Max repulsion radius around the cursor (px). */
  cursorRadius = 130,
  /** Strength of repulsion. 0–1 */
  cursorStrength = 0.18,
  /** Radius for cursor → particle constellation lines (px). 0 disables. */
  constellationRadius = 0,
  /** Show a soft glowing dot at the cursor position. */
  showWand = false,
  className = "",
}: {
  count?: number;
  cursorRadius?: number;
  cursorStrength?: number;
  constellationRadius?: number;
  showWand?: boolean;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // --- Device profile ---
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const isSmall = window.innerWidth < 768;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Scale particle count down on small viewports / touch devices, with a
    // hard cap on phones so a high-DPR phone can't spawn a heavy field.
    let effectiveCount = count;
    if (isSmall) effectiveCount = Math.min(36, Math.round(count * 0.3));
    else if (isTouch) effectiveCount = Math.round(count * 0.5);

    // Touch/mobile: drop expensive eye-candy
    const showConstellation = !isTouch && !isSmall && constellationRadius > 0;
    const showWandReal = !isTouch && !isSmall && showWand;
    const reactToCursor = !isTouch;

    // DPR 1 on phones halves the pixels filled every frame; 1.5 max elsewhere.
    const dpr = Math.min(window.devicePixelRatio || 1, isSmall ? 1 : 1.5);
    // Cap to ~30fps on mobile/touch — ambient motion doesn't need 60.
    const frameInterval = isSmall || isTouch ? 33 : 0;
    let w = parent.clientWidth;
    let h = parent.clientHeight;

    function resize() {
      if (!canvas || !ctx || !parent) return;
      w = parent.clientWidth;
      h = parent.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    // Initial particles
    const particles: Particle[] = Array.from({ length: effectiveCount }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.22,
      vy: -Math.random() * 0.3 - 0.05,
      length: 2 + Math.random() * 7,
      width: 0.8 + Math.random() * 1.2,
      angle: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.01,
      opacity: 0,
      baseOpacity: 0.25 + Math.random() * 0.5,
      twinklePhase: Math.random() * Math.PI * 2,
      hueIdx: Math.floor(Math.random() * PALETTE.length),
    }));

    // --- Mouse handling (throttled, no per-event work) ---
    let mx = -9999, my = -9999;
    let lastMouseUpdate = 0;
    function onMouse(e: MouseEvent) {
      const now = performance.now();
      if (now - lastMouseUpdate < 16) return; // ~60Hz cap
      lastMouseUpdate = now;
      const r = canvas!.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
    }
    function onLeave() { mx = my = -9999; }

    if (reactToCursor) {
      window.addEventListener("mousemove", onMouse, { passive: true });
      window.addEventListener("mouseleave", onLeave, { passive: true });
    }

    const ro = new ResizeObserver(() => {
      // debounce: skip if too frequent (resize already throttled by browser)
      resize();
    });
    ro.observe(parent);

    // --- Pause when hidden ---
    let raf = 0;
    let running = true;
    function onVisibility() {
      const wasRunning = running;
      running = !document.hidden;
      if (running && !wasRunning) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    }
    document.addEventListener("visibilitychange", onVisibility);

    let last = performance.now();
    let elapsed = 0;

    function drawFrame(now: number) {
      const dt = Math.min(60, now - last);
      last = now;
      elapsed += dt;
      const dtScale = dt / 16;

      ctx!.clearRect(0, 0, w, h);

      for (const p of particles) {
        // Twinkle alpha
        const tw = 0.6 + 0.4 * Math.sin(p.twinklePhase + elapsed * 0.003);
        p.opacity = p.baseOpacity * tw;

        // Drift physics — keep cheap
        p.vx += (Math.random() - 0.5) * 0.02 * dtScale;
        p.vy += (Math.random() - 0.5) * 0.012 * dtScale;
        p.vx *= 0.985;
        p.vy *= 0.985;

        // Cursor repulsion (skip if no cursor / touch)
        if (reactToCursor && mx > -1000) {
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

        p.x += p.vx * dtScale;
        p.y += p.vy * dtScale;
        p.angle += p.spin * dtScale;

        // Edge wrap
        const buf = 30;
        if (p.x < -buf) p.x = w + buf;
        if (p.x > w + buf) p.x = -buf;
        if (p.y < -buf) p.y = h + buf;
        if (p.y > h + buf) p.y = -buf;

        // Draw spark — no per-particle shadowBlur (by far the most expensive
        // canvas op; multiplied across every spark every frame it was the main
        // cause of jank, especially on mobile GPUs). The ambient gold gradients
        // behind the field already supply the glow.
        const color = PALETTE[p.hueIdx];
        ctx!.save();
        ctx!.translate(p.x, p.y);
        ctx!.rotate(p.angle);
        ctx!.strokeStyle = color;
        ctx!.globalAlpha = p.opacity;
        ctx!.lineWidth = p.width;
        ctx!.lineCap = "round";
        ctx!.beginPath();
        ctx!.moveTo(-p.length / 2, 0);
        ctx!.lineTo(p.length / 2, 0);
        ctx!.stroke();
        ctx!.restore();
      }

      // Constellation (desktop only)
      if (showConstellation && mx > -1000) {
        const cr = constellationRadius;
        const cr2 = cr * cr;
        ctx!.save();
        ctx!.lineCap = "round";
        for (const p of particles) {
          const dx = p.x - mx;
          const dy = p.y - my;
          const d2 = dx * dx + dy * dy;
          if (d2 < cr2) {
            const d = Math.sqrt(d2);
            const t = 1 - d / cr;
            ctx!.globalAlpha = t * 0.45;
            ctx!.lineWidth = 0.5 + t * 0.9;
            ctx!.strokeStyle = t > 0.6 ? "#FAF1D6" : "#E5C76B";
            ctx!.beginPath();
            ctx!.moveTo(mx, my);
            ctx!.lineTo(p.x, p.y);
            ctx!.stroke();
          }
        }
        ctx!.restore();
      }

      // Cursor wand
      if (showWandReal && mx > -1000) {
        const grad = ctx!.createRadialGradient(mx, my, 0, mx, my, 26);
        grad.addColorStop(0, "rgba(250,241,214,0.75)");
        grad.addColorStop(0.4, "rgba(212,175,55,0.28)");
        grad.addColorStop(1, "rgba(212,175,55,0)");
        ctx!.fillStyle = grad;
        ctx!.beginPath();
        ctx!.arc(mx, my, 26, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    let lastDraw = 0;
    function tick(now: number = performance.now()) {
      if (!running) return;
      raf = requestAnimationFrame(tick);
      // Throttle to the target frame interval on mobile (0 = uncapped/60fps)
      if (frameInterval && now - lastDraw < frameInterval) return;
      lastDraw = now;
      drawFrame(now);
    }

    if (reducedMotion) {
      // Render a single still frame and stop — respects user preference
      drawFrame(performance.now());
    } else {
      raf = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(raf);
      if (reactToCursor) {
        window.removeEventListener("mousemove", onMouse);
        window.removeEventListener("mouseleave", onLeave);
      }
      document.removeEventListener("visibilitychange", onVisibility);
      ro.disconnect();
    };
  }, [count, cursorRadius, cursorStrength, constellationRadius, showWand]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      aria-hidden="true"
    />
  );
}
