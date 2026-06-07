"use client";

import React from "react";

/**
 * Horizontal infinite marquee. Uses the GLOBAL `marquee` keyframes defined
 * in app/globals.css (translateX 0 → -50%). Content is rendered twice with
 * `aria-hidden` on the duplicate so the loop is seamless.
 *
 * styled-jsx and @layer caused class-purge and scoping issues — this
 * version uses only inline styles + the globally-known keyframe name,
 * so it works regardless of Tailwind layer/purge behaviour.
 */
export default function Marquee({
  items,
  speedSeconds = 28,
  gapRem = 3,
  className = "",
}: {
  items: React.ReactNode[];
  speedSeconds?: number;
  gapRem?: number;
  className?: string;
}) {
  const Row = ({ ariaHidden = false }: { ariaHidden?: boolean }) => (
    <div
      aria-hidden={ariaHidden}
      style={{
        display: "flex",
        alignItems: "center",
        gap: `${gapRem}rem`,
        paddingRight: `${gapRem}rem`,
        flexShrink: 0,
      }}
    >
      {items.map((it, i) => (
        <span key={i} style={{ display: "inline-flex", whiteSpace: "nowrap" }}>
          {it}
        </span>
      ))}
    </div>
  );

  return (
    <div
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
        WebkitMaskImage:
          "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
        maskImage:
          "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
      }}
    >
      <div
        style={{
          display: "flex",
          width: "max-content",
          animation: `marquee ${speedSeconds}s linear infinite`,
          willChange: "transform",
        }}
      >
        <Row />
        <Row ariaHidden />
      </div>
    </div>
  );
}
