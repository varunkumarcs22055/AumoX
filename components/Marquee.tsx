"use client";

/**
 * Self-contained horizontal marquee. Keyframes are scoped inline via styled-jsx,
 * the animation is set both via class AND inline style, and content is rendered
 * twice so the loop is seamless. Bypasses any global CSS precedence problems.
 */
export default function Marquee({
  items,
  speedSeconds = 30,
  className = "",
}: {
  items: React.ReactNode[];
  speedSeconds?: number;
  className?: string;
}) {
  return (
    <div className={`marquee-root relative overflow-hidden ${className}`}>
      <div className="marquee-row">
        {[0, 1].map((copy) => (
          <div className="marquee-copy" key={copy} aria-hidden={copy === 1 ? true : undefined}>
            {items.map((it, i) => (
              <span key={`${copy}-${i}`} className="marquee-item">
                {it}
              </span>
            ))}
          </div>
        ))}
      </div>

      <style jsx>{`
        .marquee-root {
          -webkit-mask-image: linear-gradient(90deg, transparent, black 8%, black 92%, transparent);
                  mask-image: linear-gradient(90deg, transparent, black 8%, black 92%, transparent);
        }
        .marquee-row {
          display: flex;
          width: max-content;
          animation: aumoxo-marquee ${speedSeconds}s linear infinite;
          will-change: transform;
        }
        .marquee-row:hover {
          animation-play-state: paused;
        }
        .marquee-copy {
          display: flex;
          align-items: center;
          gap: 3rem;
          padding-right: 3rem;
          flex-shrink: 0;
        }
        .marquee-item {
          display: inline-flex;
          align-items: center;
          white-space: nowrap;
        }
        @keyframes aumoxo-marquee {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(-50%, 0, 0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-row { animation: none; }
        }
      `}</style>
    </div>
  );
}
