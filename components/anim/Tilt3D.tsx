"use client";

import { useRef } from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
  /** Max rotation in degrees. Default 8 */
  max?: number;
  /** Lift on hover (px). Default 6 */
  lift?: number;
};

/**
 * Premium 3D tilt: the element rotates toward the cursor in perspective and
 * lifts slightly, with a soft gold glare that tracks the pointer. Pure CSS
 * transforms (translate/rotate) updated via rAF — compositor-only, so it stays
 * smooth even on modest hardware. No-ops on touch / reduced-motion.
 */
export default function Tilt3D({ children, className = "", max = 8, lift = 6 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const raf = useRef(0);
  const pending = useRef<{ rx: number; ry: number; px: number; py: number } | null>(null);

  const enabled = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function apply() {
    raf.current = 0;
    const el = ref.current;
    if (!el || !pending.current) return;
    const { rx, ry, px, py } = pending.current;
    el.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateZ(0)`;
    el.style.setProperty("--spx", `${px}%`);
    el.style.setProperty("--spy", `${py}%`);
  }

  function onMove(e: React.PointerEvent) {
    if (!enabled()) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width;
    const ny = (e.clientY - r.top) / r.height;
    pending.current = {
      ry: (nx - 0.5) * max * 2,
      rx: -(ny - 0.5) * max * 2,
      px: nx * 100,
      py: ny * 100,
    };
    if (!raf.current) raf.current = requestAnimationFrame(apply);
  }

  function onEnter() {
    const el = ref.current;
    if (el && enabled()) el.style.transform = `perspective(900px) translateY(-${lift}px) translateZ(0)`;
  }
  function onLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(900px) rotateX(0) rotateY(0) translateZ(0)";
  }

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      className={`tilt3d ${className}`}
      style={{ transition: "transform 0.35s cubic-bezier(0.22,1,0.36,1)", willChange: "transform" }}
    >
      {children}
    </div>
  );
}
