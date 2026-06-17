import Link from "next/link";
import BreadcrumbsLd from "@/components/BreadcrumbsLd";
import {
  ArrowUpRight,
  Rocket,
  Building2,
  Briefcase,
  GraduationCap,
  HeartPulse,
  ShoppingBag,
  Home,
} from "lucide-react";
import Reveal from "@/components/anim/Reveal";
import LogoMarquee from "@/components/LogoMarquee";
import { clientLogosDb } from "@/lib/admin/db";

// Logos are managed from Admin → Company Logos — always render the latest.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Industries — Startups, SMEs, Education, Healthcare, E-Commerce",
  description:
    "AUMOXO builds software, AI and automation for startups, small & medium businesses, professional services, education, healthcare and e-commerce.",
  keywords: [
    "software for startups", "MVP development", "build my SaaS",
    "software for SMEs", "CRM for small business",
    "education software development", "LMS development",
    "healthcare software development", "patient management software",
    "e-commerce platform development", "AI for e-commerce",
    "professional services software",
  ],
  alternates: { canonical: "/industries" },
};

const industries = [
  {
    i: Rocket,
    t: "Startups",
    short: "MVPs, SaaS, AI Products, Growth Infrastructure",
    d: "Ship your MVP, build your SaaS product, integrate AI from day one — fast, lean, production-grade.",
  },
  {
    i: Building2,
    t: "Small & Medium Businesses",
    short: "CRM, Automation, Internal Systems",
    d: "Replace spreadsheets with custom CRM, automate operations, and bring intelligence to everyday workflows.",
  },
  {
    i: Briefcase,
    t: "Professional Services",
    short: "Client Management, Reporting, Operations",
    d: "Client portals, project management, billing automation, and the reporting your partners actually use.",
  },
  {
    i: GraduationCap,
    t: "Education",
    short: "Student Portals, LMS, CRM, Admission Systems",
    d: "Admissions, student management, learning management, and engagement platforms for modern institutions.",
  },
  {
    i: HeartPulse,
    t: "Healthcare",
    short: "Patient Systems, Booking Platforms, Automation",
    d: "Appointment scheduling, patient engagement, operations dashboards — built with privacy and reliability first.",
  },
  {
    i: ShoppingBag,
    t: "E-Commerce",
    short: "Store Operations, Analytics, AI Support",
    d: "Commerce platforms, customer analytics, AI customer support, and operations tooling for direct-to-consumer brands.",
  },
  {
    i: Home,
    t: "Real Estate",
    short: "Listings, Lead Capture, CRM, Automation",
    d: "Property portals, lead capture and routing, agent CRM, and automated follow-ups that turn enquiries into deals.",
  },
];

export default async function IndustriesPage() {
  const logos = (await clientLogosDb.list()).sort((a, b) => a.order - b.order);
  const logoItems = logos.map((l) => {
    // eslint-disable-next-line @next/next/no-img-element
    const img = (
      <img
        src={l.logo}
        alt={l.name || "Company logo"}
        title={l.name || undefined}
        className="h-10 lg:h-12 w-auto object-contain opacity-70 transition-opacity duration-300 hover:opacity-100"
      />
    );
    return l.url ? (
      <a href={l.url} target="_blank" rel="noopener noreferrer" className="inline-flex">{img}</a>
    ) : img;
  });

  return (
    <>
      <BreadcrumbsLd items={[{ name: "Industries", path: "/industries" }]} />
      <section className="relative overflow-hidden hero-gradient pt-32 lg:pt-44 pb-20">
        <div className="absolute inset-0 grid-overlay opacity-60" />
        <div className="container-x relative">
          <div className="max-w-4xl">
            <div className="eyebrow">
              <span className="h-px w-8 bg-gold-400" />
              Industries
            </div>
            <h1 className="mt-6 font-display text-5xl md:text-7xl leading-[1.05] font-extralight tracking-tight text-ink-100">
              Technology built around <span className="gold-text">your industry</span>.
            </h1>
            <p className="mt-8 max-w-2xl text-lg text-ink-300 font-light">
              We combine domain understanding with modern software, AI, and
              automation to solve industry-specific challenges.
            </p>
          </div>
        </div>
      </section>

      {/* Company logo marquee — managed from Admin → Company Logos. Auto-scrolls
          and self-adjusts to however many logos exist; hidden until at least one. */}
      {logos.length > 0 && (
        <section className="py-16 border-y border-line bg-bg-surface">
          <div className="container-x">
            <p className="text-center text-[11px] uppercase tracking-[0.3em] text-gold-400 mb-10">
              Trusted by businesses we build for
            </p>
            <LogoMarquee items={logoItems} gapRem={4} />
          </div>
        </section>
      )}

      {/* Industries We Serve */}
      <section className="py-24 lg:py-32">
        <div className="container-x">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="eyebrow justify-center">
              <span className="h-px w-8 bg-gold-400" />
              Industries We Serve
              <span className="h-px w-8 bg-gold-400" />
            </div>
            <h2 className="section-title mt-5">
              Built for businesses across seven sectors.
            </h2>
          </div>

          <Reveal stagger=".industry-tile" staggerGap={0.06} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {industries.map(({ i: Icon, t, short, d }) => (
              <div key={t} className="industry-tile card p-8 flex flex-col gold-border">
                <div className="grid h-14 w-14 place-items-center rounded-lg border border-gold-400/30 bg-gold-400/5 text-gold-300">
                  <Icon size={22} />
                </div>
                <h3 className="mt-6 text-xl font-light text-ink-100 leading-snug">{t}</h3>
                <div className="mt-1 text-[11px] uppercase tracking-[0.2em] text-gold-400">
                  {short}
                </div>
                <p className="mt-4 text-sm text-ink-300 font-light leading-relaxed flex-1">{d}</p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 mt-6 text-xs uppercase tracking-[0.25em] text-gold-300 hover:text-gold-200"
                >
                  Discuss your project <ArrowUpRight size={14} />
                </Link>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 lg:py-32 bg-bg-surface border-y border-line">
        <div className="container-x text-center">
          <h2 className="section-title mx-auto">
            Don't see your industry?
          </h2>
          <p className="section-sub mx-auto text-center">
            Our capabilities translate. Let's talk about your context.
          </p>
          <Link href="/contact" className="btn-gold mt-10">
            Get in Touch <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
