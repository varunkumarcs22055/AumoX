import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { LogoMark } from "@/components/Logo";

export default function NotFound() {
  return (
    <section className="min-h-[80vh] hero-gradient relative overflow-hidden grid place-items-center pt-32">
      <div className="absolute inset-0 grid-overlay opacity-60" />
      <div className="container-x relative text-center">
        <LogoMark size={64} className="mx-auto opacity-60" />
        <div className="font-display text-[140px] lg:text-[200px] font-extralight gold-text leading-none mt-4">404</div>
        <h1 className="font-display text-3xl md:text-4xl font-extralight text-ink-100 mt-2">
          The page you're looking for has gone to think infinite.
        </h1>
        <p className="mt-4 text-ink-300 font-light max-w-md mx-auto">
          The link may be outdated, or the page may have moved. Let's get you back on track.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="btn-gold">Back to home <ArrowUpRight size={18} /></Link>
          <Link href="/contact" className="btn-ghost">Contact support</Link>
        </div>
      </div>
    </section>
  );
}
