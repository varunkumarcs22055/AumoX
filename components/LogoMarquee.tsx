"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

// useLayoutEffect on the client, useEffect on the server (avoids the SSR warning).
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Logo strip that adapts to how many logos there are:
 *  - Few enough to fit the row  → shown ONCE, centered, no animation, no clone.
 *  - Too many to fit on screen  → duplicated and auto-scrolled (seamless loop),
 *    with edge fades + pause-on-hover.
 *
 * Whether it overflows is measured on the client and re-measured on resize and
 * when the logo images finish loading — so it works for 1 logo or 50.
 */
export default function LogoMarquee({
  items,
  gapRem = 4,
  pxPerSecond = 55,
  className = "",
}: {
  items: React.ReactNode[];
  gapRem?: number;
  pxPerSecond?: number;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = useState(false);
  const [duration, setDuration] = useState(24);
  const [paused, setPaused] = useState(false);

  useIsoLayoutEffect(() => {
    const measure = () => {
      const c = containerRef.current;
      const r = rowRef.current;
      if (!c || !r) return;
      const single = r.scrollWidth;     // width of one copy of the row
      const avail = c.clientWidth;       // visible width
      const over = single > avail + 1;   // +1 guards against sub-pixel rounding
      setOverflowing(over);
      if (over) setDuration(Math.max(12, single / pxPerSecond));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    if (rowRef.current) ro.observe(rowRef.current); // fires as images load → re-measure
    window.addEventListener("resize", measure);
    return () => { ro.disconnect(); window.removeEventListener("resize", measure); };
  }, [items, pxPerSecond, overflowing]);

  const Row = ({
    ariaHidden = false,
    innerRef,
    trailing = false,
  }: {
    ariaHidden?: boolean;
    innerRef?: React.Ref<HTMLDivElement>;
    trailing?: boolean;
  }) => (
    <div
      ref={innerRef}
      aria-hidden={ariaHidden}
      style={{
        display: "flex",
        alignItems: "center",
        gap: `${gapRem}rem`,
        paddingRight: trailing ? `${gapRem}rem` : undefined,
        flexShrink: 0,
      }}
    >
      {items.map((it, i) => (
        <span key={i} style={{ display: "inline-flex", whiteSpace: "nowrap" }}>{it}</span>
      ))}
    </div>
  );

  const maskStyle: React.CSSProperties = overflowing
    ? {
        WebkitMaskImage: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
        maskImage: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
      }
    : {};

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: "relative", overflow: "hidden", ...maskStyle }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {overflowing ? (
        <div
          style={{
            display: "flex",
            width: "max-content",
            animation: `marquee ${duration}s linear infinite`,
            animationPlayState: paused ? "paused" : "running",
            willChange: "transform",
          }}
        >
          <Row innerRef={rowRef} trailing />
          <Row ariaHidden trailing />
        </div>
      ) : (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Row innerRef={rowRef} />
        </div>
      )}
    </div>
  );
}
