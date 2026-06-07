import Link from "next/link";
import Image from "next/image";
import LogoO from "./LogoO";

type LogoProps = {
  variant?: "full" | "mark";
  className?: string;
  size?: number;
};

/**
 * Brand mark — the user-supplied transparent PNG. No blend tricks, no
 * black background, scales to any size cleanly on light or dark themes.
 */
export function LogoMark({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    <Image
      src="/logo-mark.png"
      alt=""
      width={size}
      height={size}
      className={`block object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

/**
 * Navbar / site logo — transparent mark beside the AUMOXO wordmark.
 */
export default function Logo({ className = "" }: LogoProps) {
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-3 ${className}`}
      aria-label="AUMOXO home"
    >
      <span
        className="relative inline-block shrink-0 transition-transform duration-300 group-hover:scale-[1.05]"
        style={{ filter: "drop-shadow(0 0 12px rgba(212,175,55,0.35))" }}
      >
        <Image
          src="/logo-mark.png"
          alt=""
          width={80}
          height={80}
          priority
          className="block object-contain h-16 w-16 lg:h-20 lg:w-20"
        />
      </span>

      <span className="flex flex-col leading-none">
        <span className="text-[22px] lg:text-[26px] font-semibold tracking-[0.16em] text-ink-100 whitespace-nowrap inline-flex items-center">
          AUM<LogoO size={0.9} spacing={0.04} />X<LogoO size={0.9} spacing={0.04} />
        </span>
        <span className="mt-[3px] text-[10px] tracking-[0.4em] uppercase text-gold-600 dark:text-gold-400/90">
          Think Infinite
        </span>
      </span>
    </Link>
  );
}
