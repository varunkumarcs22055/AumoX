"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowUpRight } from "lucide-react";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";

const links = [
  { href: "/services", label: "Services" },
  { href: "/industries", label: "Industries" },
  { href: "/products", label: "Solutions" },
  { href: "/insights", label: "Insights" },
  { href: "/about", label: "About" },
  { href: "/careers", label: "Careers" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (pathname?.startsWith("/admin") || pathname?.startsWith("/portal") || pathname?.startsWith("/staff")) return null;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-bg-base/80 backdrop-blur-xl border-b border-line"
            : "bg-transparent"
        }`}
      >
        {/* Top utility bar removed — those pages referenced fake enterprise content
            and don't fit a service-led startup positioning. */}

        {/* Main nav */}
        <div className="container-x flex items-center justify-between h-[80px] lg:h-[96px]">
          <Logo />

          <nav className="hidden lg:flex items-center gap-5 xl:gap-8">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="nav-link whitespace-nowrap">
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3 xl:gap-4 shrink-0">
            <ThemeToggle />
            <Link
              href="/contact"
              className="hidden xl:inline-flex btn-gold !py-2 !px-5 text-sm whitespace-nowrap"
            >
              Get in Touch
              <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            <button
              onClick={() => setOpen(true)}
              className="p-2 -mr-2 text-ink-100"
              aria-label="Open menu"
            >
              <Menu size={26} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-[60] lg:hidden transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-bg-base/85 backdrop-blur-lg"
          onClick={() => setOpen(false)}
        />
        <div
          className={`absolute right-0 top-0 h-full w-[85%] max-w-sm bg-bg-surface border-l border-line p-6 transition-transform duration-300 ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between">
            <Logo />
            <button
              onClick={() => setOpen(false)}
              className="p-2 -mr-2 text-ink-100"
              aria-label="Close menu"
            >
              <X size={26} />
            </button>
          </div>
          <nav className="mt-10 flex flex-col">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="py-4 text-xl font-light text-ink-100 border-b border-line hover:text-gold-300 transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/contact"
            onClick={() => setOpen(false)}
            className="btn-gold mt-8 w-full"
          >
            Get in Touch
            <ArrowUpRight size={16} />
          </Link>
          <div className="mt-10 text-[11px] uppercase tracking-[0.25em] text-ink-400">
            Think Infinite · AUMOXO
          </div>
        </div>
      </div>
    </>
  );
}
