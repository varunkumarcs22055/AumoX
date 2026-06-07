import Link from "next/link";
import Image from "next/image";

type LogoProps = {
  variant?: "full" | "mark";
  className?: string;
  size?: number;
};

/**
 * SVG fallback recreation of the mark — kept only for places where a clean
 * transparent vector is preferable (the favicon path, for example).
 * The visible site logo uses the REAL `logo.jpeg` image (see Logo below).
 */
export function LogoMark({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    <span
      className={`relative inline-block overflow-hidden rounded-md ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {/* Dark mode — black bg blends invisibly with dark page via `lighten` */}
      <Image
        src="/logo.jpeg"
        alt=""
        width={size * 2}
        height={size * 2}
        className="hidden dark:block h-full w-full object-cover"
        style={{ objectPosition: "center 22%", mixBlendMode: "lighten" }}
      />
      {/* Light mode — show as a small branded card */}
      <Image
        src="/logo.jpeg"
        alt=""
        width={size * 2}
        height={size * 2}
        className="dark:hidden h-full w-full object-cover"
        style={{ objectPosition: "center 22%" }}
      />
    </span>
  );
}

/**
 * Navbar / site logo — the actual brand image (cropped to the mark) +
 * "AUMOXO" wordmark + "Think Infinite" tagline beside it.
 */
export default function Logo({ className = "" }: LogoProps) {
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-3 ${className}`}
      aria-label="AUMOXO home"
    >
      <span className="relative block h-16 w-16 lg:h-20 lg:w-20 overflow-hidden rounded-md shrink-0 transition-transform duration-300 group-hover:scale-[1.05]">
        {/* Dark mode — black bleeds via mix-blend-mode */}
        <Image
          src="/logo.jpeg"
          alt=""
          width={160}
          height={160}
          priority
          className="hidden dark:block h-full w-full object-cover"
          style={{ objectPosition: "center 22%", mixBlendMode: "lighten" }}
        />
        {/* Light mode — shown as a branded card */}
        <Image
          src="/logo.jpeg"
          alt=""
          width={160}
          height={160}
          priority
          className="dark:hidden h-full w-full object-cover shadow-[0_2px_8px_rgba(0,0,0,0.18)]"
          style={{ objectPosition: "center 22%" }}
        />
      </span>

      <span className="flex flex-col leading-none">
        <span className="text-[22px] lg:text-[26px] font-semibold tracking-[0.18em] text-ink-100 whitespace-nowrap">
          AUMOXO
        </span>
        <span className="mt-1 text-[10px] tracking-[0.4em] uppercase text-gold-600 dark:text-gold-400/90">
          Think Infinite
        </span>
      </span>
    </Link>
  );
}
