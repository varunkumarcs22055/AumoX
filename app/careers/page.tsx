import Link from "next/link";
import {
  ArrowUpRight,
  MapPin,
  Briefcase,
  Heart,
  Sparkles,
  GraduationCap,
  Globe,
  Users,
  TrendingUp,
  Award,
} from "lucide-react";

export const metadata = {
  title: "Careers — Build the Future with AUMOXO",
};

const openRoles = [
  { title: "Senior Cloud Architect", team: "Cloud & Infrastructure", location: "Remote · Global", type: "Full-time", level: "Senior" },
  { title: "Principal AI Engineer", team: "AI & Data", location: "Bangalore · Hybrid", type: "Full-time", level: "Principal" },
  { title: "Staff Platform Engineer", team: "Engineering", location: "Remote · EMEA", type: "Full-time", level: "Staff" },
  { title: "Cybersecurity Consultant", team: "Security", location: "London · Hybrid", type: "Full-time", level: "Senior" },
  { title: "Product Designer", team: "Design", location: "Remote · Americas", type: "Full-time", level: "Mid–Senior" },
  { title: "Engineering Manager", team: "Digital Engineering", location: "Singapore · Hybrid", type: "Full-time", level: "Manager" },
  { title: "Data Platform Engineer", team: "Data", location: "Remote · India", type: "Full-time", level: "Mid" },
  { title: "DevSecOps Lead", team: "Platform", location: "Berlin · Hybrid", type: "Full-time", level: "Lead" },
  { title: "Solutions Director — BFSI", team: "Industry Solutions", location: "New York · Onsite", type: "Full-time", level: "Director" },
  { title: "Customer Success Manager", team: "Customer Success", location: "Remote · APAC", type: "Full-time", level: "Senior" },
  { title: "Technical Writer", team: "Product", location: "Remote · Global", type: "Full-time", level: "Mid" },
  { title: "Talent Acquisition Partner", team: "People", location: "Bangalore · Hybrid", type: "Full-time", level: "Senior" },
];

const benefits = [
  { i: Heart, t: "Health & wellbeing", d: "Comprehensive medical, dental, vision and mental health support — for you and your family." },
  { i: Sparkles, t: "Equity for all", d: "Every employee receives meaningful equity. We grow together." },
  { i: GraduationCap, t: "Learning budget", d: "$3,000 annually for courses, conferences, books and certifications." },
  { i: Globe, t: "Work from anywhere", d: "Most roles are fully remote. Hubs available when you want to gather." },
  { i: Users, t: "Inclusive community", d: "Active ERGs across gender, race, neurodiversity and identity." },
  { i: TrendingUp, t: "Real career paths", d: "Dual ladders (IC + management), clear levels, transparent promotions." },
];

const process = [
  { n: "01", t: "Apply", d: "Submit your application — we read every one. Expect a response within 5 business days." },
  { n: "02", t: "Intro call", d: "30 minutes with a recruiter to align on role, expectations and your aspirations." },
  { n: "03", t: "Skills deep-dive", d: "1–2 conversations with future peers focused on craft, not trivia. Real problems, real discussion." },
  { n: "04", t: "Team & values", d: "Meet your would-be manager and a cross-functional partner. We check culture-add, not culture-fit." },
  { n: "05", t: "Offer", d: "Compensation, equity, start date — designed to be a yes from day one." },
];

export default function CareersPage() {
  return (
    <>
      <section className="relative overflow-hidden hero-gradient pt-32 lg:pt-44 pb-20">
        <div className="absolute inset-0 grid-overlay opacity-60" />
        <div className="container-x relative">
          <div className="max-w-4xl">
            <div className="eyebrow">
              <span className="h-px w-8 bg-gold-400" />
              Careers at AUMOXO
            </div>
            <h1 className="mt-6 font-display text-5xl md:text-7xl leading-[0.95] font-extralight tracking-tight text-ink-100">
              Do the best <span className="gold-text">work of your life</span>.
            </h1>
            <p className="mt-8 max-w-2xl text-lg text-ink-300 font-light">
              We're building the technology partner the next generation of enterprises
              deserves. Join 1,200+ engineers, designers and strategists rewriting what's possible.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link href="#open-roles" className="btn-gold">
                See open roles <ArrowUpRight size={18} />
              </Link>
              <Link href="#culture" className="btn-ghost">Our culture</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-line bg-bg-surface">
        <div className="container-x py-12 grid grid-cols-2 lg:grid-cols-4 gap-px overflow-hidden rounded-2xl border border-line bg-line">
          {[
            { v: "1,200+", l: "Team members" },
            { v: "60+", l: "Countries" },
            { v: "92%", l: "Glassdoor approval" },
            { v: "4.8★", l: "Average tenure rating" },
          ].map((s) => (
            <div key={s.l} className="bg-bg-base p-8">
              <div className="font-display text-4xl font-extralight gold-text">{s.v}</div>
              <div className="text-[11px] uppercase tracking-[0.25em] text-ink-400 mt-2">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Culture */}
      <section id="culture" className="py-24 lg:py-32">
        <div className="container-x">
          <div className="grid lg:grid-cols-[1fr_2fr] gap-12 lg:gap-20 mb-16">
            <div>
              <div className="eyebrow"><span className="h-px w-8 bg-gold-400" />Why AUMOXO</div>
              <h2 className="section-title mt-5">A place where craft and ambition compound.</h2>
            </div>
            <p className="text-lg text-ink-300 font-light leading-relaxed lg:pt-16">
              We hire senior, trust deeply and ship constantly. No surveillance, no theatre,
              no busywork — just talented people solving problems that matter, with the
              support and tools to do it well.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px overflow-hidden rounded-2xl border border-line bg-line">
            {benefits.map(({ i: Icon, t, d }) => (
              <div key={t} className="bg-bg-base p-8">
                <div className="grid h-12 w-12 place-items-center rounded-lg border border-gold-400/30 bg-gold-400/5 text-gold-300">
                  <Icon size={20} />
                </div>
                <h3 className="mt-6 text-lg font-light text-ink-100">{t}</h3>
                <p className="mt-3 text-sm text-ink-300 font-light leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Roles */}
      <section id="open-roles" className="py-24 lg:py-32 bg-bg-surface border-y border-line">
        <div className="container-x">
          <div className="flex items-end justify-between flex-wrap gap-6 mb-12">
            <div>
              <div className="eyebrow"><span className="h-px w-8 bg-gold-400" />Open Roles</div>
              <h2 className="section-title mt-5">Find your next role.</h2>
            </div>
            <div className="text-sm text-ink-300 font-light">
              <Briefcase size={16} className="inline text-gold-400 mr-2" />
              {openRoles.length} open positions worldwide
            </div>
          </div>

          <div className="space-y-3">
            {openRoles.map((r) => (
              <Link
                key={r.title}
                href="/contact"
                className="group grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_auto] items-center gap-4 p-6 rounded-xl border border-line bg-bg-base hover:border-gold-400/50 hover:bg-bg-elevated transition-all"
              >
                <div>
                  <div className="text-lg text-ink-100 font-light group-hover:text-gold-300 transition-colors">
                    {r.title}
                  </div>
                  <div className="text-xs uppercase tracking-[0.2em] text-ink-400 mt-1">
                    {r.team} · {r.level}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-ink-300">
                  <MapPin size={14} className="text-gold-400" />
                  {r.location}
                </div>
                <div className="text-sm text-ink-300">{r.type}</div>
                <div className="text-gold-400 group-hover:translate-x-1 transition-transform">
                  <ArrowUpRight size={20} />
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12 text-sm text-ink-300 font-light">
            Don't see your role?{" "}
            <Link href="/contact" className="text-gold-300 hover:text-gold-200">
              Send us your story →
            </Link>
          </div>
        </div>
      </section>

      {/* Hiring Process */}
      <section className="py-24 lg:py-32">
        <div className="container-x">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="eyebrow justify-center"><span className="h-px w-8 bg-gold-400" />Hiring Process<span className="h-px w-8 bg-gold-400" /></div>
            <h2 className="section-title mt-5">A respectful, transparent process.</h2>
            <p className="section-sub mx-auto text-center">
              From application to offer in 2–3 weeks — clear feedback at every step.
            </p>
          </div>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-px overflow-hidden rounded-2xl border border-line bg-line">
            {process.map((p) => (
              <div key={p.n} className="bg-bg-base p-6 lg:p-8">
                <div className="font-display text-4xl font-extralight gold-text">{p.n}</div>
                <h3 className="mt-4 text-lg font-light text-ink-100">{p.t}</h3>
                <p className="mt-3 text-sm text-ink-300 font-light leading-relaxed">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Awards */}
      <section className="py-24 lg:py-32 bg-bg-surface border-y border-line">
        <div className="container-x text-center">
          <Award className="mx-auto text-gold-400 mb-6" size={32} />
          <h2 className="section-title mx-auto">Recognized as one of the world's best workplaces.</h2>
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              "Great Place to Work · 2026",
              "Fortune Best Workplaces · 2026",
              "LinkedIn Top Companies · 2026",
              "Forbes World's Best Employers · 2025",
            ].map((a) => (
              <div key={a} className="card p-6 text-sm text-ink-200 font-light">{a}</div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
