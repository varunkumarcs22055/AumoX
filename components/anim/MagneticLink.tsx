"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";

type Props = React.ComponentPropsWithoutRef<typeof Link> & {
  /** Magnetic pull strength (0–1). Default 0.35 */
  strength?: number;
  /** Disable below this viewport width (px). Default 1024 */
  desktopOnly?: number;
};

/**
 * A Next.js Link that subtly follows the cursor when hovered — premium "magnetic"
 * micro-interaction common on FAANG / agency sites. Disabled on touch devices.
 */
export default function MagneticLink({
  children,
  className = "",
  strength = 0.35,
  desktopOnly = 1024,
  ...linkProps
}: Props) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.innerWidth < desktopOnly) return;

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      gsap.to(el, {
        x: x * strength,
        y: y * strength,
        duration: 0.5,
        ease: "power3.out",
      });
    };
    const onLeave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.45)" });
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [strength, desktopOnly]);

  return (
    <Link ref={ref} className={className} {...linkProps}>
      {children}
    </Link>
  );
}
