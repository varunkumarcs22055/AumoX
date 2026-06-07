"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Linkedin, Twitter, Github, Youtube, Mail, MapPin } from "lucide-react";
import { LogoMark } from "./Logo";

const cols = [
  {
    title: "Enterprise Solutions",
    links: [
      { href: "/services", label: "AI Solutions" },
      { href: "/services", label: "CRM Platforms" },
      { href: "/services", label: "Automation Systems" },
      { href: "/services", label: "Enterprise Software" },
    ],
  },
  {
    title: "Product Engineering",
    links: [
      { href: "/services", label: "Web Applications" },
      { href: "/services", label: "Mobile Applications" },
      { href: "/services", label: "SaaS Platforms" },
      { href: "/services", label: "UI/UX Design" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { href: "/products", label: "AUMOXO CRM" },
      { href: "/products", label: "AUMOXO AI Assistant" },
      { href: "/products", label: "AUMOXO Operations Hub" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About AUMOXO" },
      { href: "/industries", label: "Industries" },
      { href: "/partners", label: "Partners" },
      { href: "/contact", label: "Contact" },
    ],
  },
];

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="relative border-t border-line bg-bg-base">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/50 to-transparent" />

      <div className="container-x py-20">
        {/* Top — brand + newsletter */}
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 pb-16 border-b border-line">
          <div>
            <div className="flex items-center gap-4">
              <LogoMark size={48} />
              <div>
                <div className="text-2xl font-semibold tracking-[0.18em] text-ink-100 whitespace-nowrap">
                  AUMOXO
                </div>
                <div className="text-[10px] tracking-[0.35em] uppercase text-gold-600 dark:text-gold-400/80 mt-1">
                  Think Infinite
                </div>
              </div>
            </div>
            <p className="mt-6 text-ink-300 font-light max-w-md leading-relaxed">
              Enterprise technology services and products engineered for the
              next decade. We help global organizations build, modernize, and
              scale with confidence.
            </p>
            <div className="mt-6 flex items-center gap-5 text-sm text-ink-300">
              <a
                href="mailto:harshchakravarti77@gmail.com"
                className="inline-flex items-center gap-2 hover:text-gold-300 transition-colors"
              >
                <Mail size={16} className="text-gold-400" />
                harshchakravarti77@gmail.com
              </a>
            </div>
            <div className="mt-2 inline-flex items-center gap-2 text-sm text-ink-300">
              <MapPin size={16} className="text-gold-400" />
              Serving businesses worldwide
            </div>
          </div>

          <div>
            <div className="eyebrow">Newsletter</div>
            <h3 className="mt-3 text-2xl font-light text-ink-100">
              Insights for leaders building the next decade
            </h3>
            <form className="mt-6 flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="your@company.com"
                className="input flex-1"
                aria-label="Email"
              />
              <button type="button" className="btn-gold whitespace-nowrap">
                Subscribe
              </button>
            </form>
            <p className="mt-3 text-xs text-ink-400">
              By subscribing you agree to our privacy policy. Unsubscribe any
              time.
            </p>
          </div>
        </div>

        {/* Link grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 py-16">
          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="text-[11px] uppercase tracking-[0.3em] text-gold-400 font-medium">
                {col.title}
              </h4>
              <ul className="mt-5 space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-ink-300 hover:text-gold-300 transition-colors font-light"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pt-10 border-t border-line">
          <div className="text-xs text-ink-400 font-light">
            © {new Date().getFullYear()} AUMOXO Technologies. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-xs text-ink-400">
            <Link href="/privacy" className="hover:text-gold-300 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gold-300 transition-colors">Terms of Service</Link>
            <Link href="/cookies" className="hover:text-gold-300 transition-colors">Cookies</Link>
          </div>
          <div className="flex items-center gap-4 text-ink-300">
            <a aria-label="LinkedIn" href="#" className="hover:text-gold-300 transition-colors">
              <Linkedin size={18} />
            </a>
            <a aria-label="Twitter" href="#" className="hover:text-gold-300 transition-colors">
              <Twitter size={18} />
            </a>
            <a aria-label="GitHub" href="#" className="hover:text-gold-300 transition-colors">
              <Github size={18} />
            </a>
            <a aria-label="YouTube" href="#" className="hover:text-gold-300 transition-colors">
              <Youtube size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
