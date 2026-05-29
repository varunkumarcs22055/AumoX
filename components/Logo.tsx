import Link from "next/link";
import LogoO from "./LogoO";

type LogoProps = {
  variant?: "full" | "mark";
  className?: string;
  size?: number;
};

export function LogoMark({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="aumox-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F0DDA0" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#B8941F" />
        </linearGradient>
        <linearGradient id="aumox-gold-soft" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E5C76B" />
          <stop offset="100%" stopColor="#B8941F" />
        </linearGradient>
      </defs>

      {/* Outer ring with stylized break */}
      <circle
        cx="100"
        cy="108"
        r="56"
        fill="none"
        stroke="url(#aumox-gold)"
        strokeWidth="3.5"
        strokeDasharray="330 22"
        strokeDashoffset="-90"
        strokeLinecap="round"
      />

      {/* Floating top dot */}
      <circle cx="100" cy="38" r="5.5" fill="url(#aumox-gold)" />

      {/* Stylized A — two strokes meeting at apex */}
      <path
        d="M 74 138 L 100 76 L 126 138"
        stroke="url(#aumox-gold)"
        strokeWidth="4.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Center dot inside A */}
      <circle cx="100" cy="120" r="4" fill="url(#aumox-gold-soft)" />
    </svg>
  );
}

export default function Logo({ variant = "full", className = "" }: LogoProps) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-3 group ${className}`}
      aria-label="AUMOXO home"
    >
      <LogoMark size={36} className="transition-transform duration-300 group-hover:rotate-[8deg]" />
      {variant === "full" && (
        <div className="flex flex-col leading-none">
          <span className="wordmark text-[17px] text-ink-100 inline-flex items-center">
            <span>AUM</span>
            <LogoO />
            <span>X</span>
            <LogoO />
          </span>
          <span className="mt-[3px] text-[8px] tracking-[0.35em] uppercase text-gold-400/80">
            Think Infinite
          </span>
        </div>
      )}
    </Link>
  );
}
