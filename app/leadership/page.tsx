import Link from "next/link";
import { Linkedin, Twitter, ArrowUpRight } from "lucide-react";

export const metadata = { title: "Leadership — The People Behind AUMO.X" };

const leaders = [
  { name: "Harsh Chakravarti", role: "Founder & Chief Executive Officer", initials: "HC", bio: "Two decades architecting enterprise platforms for global Fortune 500 organizations. Previously led technology at three publicly listed firms." },
  { name: "Anika Sharma", role: "Chief Artificial Intelligence Officer", initials: "AS", bio: "Former research lead at a top-3 AI lab. Author of 40+ peer-reviewed papers on agentic systems and applied ML." },
  { name: "David Okafor", role: "Chief Operating Officer", initials: "DO", bio: "Scaled global delivery for two services giants from $200M to $2B+ run rate. Operational rigor meets human leadership." },
  { name: "Marina Volkov", role: "Chief Technology Officer", initials: "MV", bio: "Distributed systems veteran. Built planet-scale platforms at three of the largest cloud providers." },
  { name: "Rajiv Menon", role: "Chief Revenue Officer", initials: "RM", bio: "20+ years building enterprise sales organizations across the Americas, EMEA and APAC." },
  { name: "Sofia Linder", role: "Chief People Officer", initials: "SL", bio: "Designed people systems for some of the world's most respected employers. Believes craft and humanity compound." },
  { name: "Yusuf Karim", role: "Chief Financial Officer", initials: "YK", bio: "Former CFO of two NASDAQ-listed technology companies. Stewardship, transparency and long-term capital allocation." },
  { name: "Priya Iyer", role: "Chief Information Security Officer", initials: "PI", bio: "Built and led security organizations for two systemically important financial institutions and one hyperscaler." },
];

const board = [
  { name: "Dr. Eleanor Whitfield", role: "Independent Director · Audit Chair", bio: "Former partner at a Big 4 audit firm. Board roles at three FTSE 100 companies." },
  { name: "Carlos Reyes", role: "Independent Director · Compensation Chair", bio: "Veteran technology executive. Currently chairs the board of a leading SaaS firm." },
  { name: "Aiko Tanaka", role: "Independent Director · Nominations Chair", bio: "30+ years in global enterprise technology leadership across APAC and the Americas." },
];

export default function LeadershipPage() {
  return (
    <>
      <section className="relative overflow-hidden hero-gradient pt-32 lg:pt-44 pb-20">
        <div className="absolute inset-0 grid-overlay opacity-60" />
        <div className="container-x relative">
          <div className="max-w-4xl">
            <div className="eyebrow"><span className="h-px w-8 bg-gold-400" />Leadership</div>
            <h1 className="mt-6 font-display text-5xl md:text-7xl leading-[0.95] font-extralight tracking-tight text-ink-100">
              The team setting the <span className="gold-text">course</span>.
            </h1>
            <p className="mt-8 max-w-2xl text-lg text-ink-300 font-light">
              Experienced operators and builders who've shaped some of the world's most respected technology organizations.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 lg:py-32">
        <div className="container-x">
          <div className="eyebrow mb-10"><span className="h-px w-8 bg-gold-400" />Executive Team</div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {leaders.map((p) => (
              <div key={p.name} className="card p-8 group">
                <div className="aspect-square -mx-8 -mt-8 mb-6 relative overflow-hidden bg-gradient-to-br from-gold-400/30 via-bg-elevated to-bg-base">
                  <div className="absolute inset-0 grid-overlay opacity-50" />
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="font-display text-6xl font-extralight gold-text">{p.initials}</div>
                  </div>
                </div>
                <h3 className="text-lg text-ink-100 font-light">{p.name}</h3>
                <div className="mt-1 text-[11px] uppercase tracking-[0.2em] text-gold-400">{p.role}</div>
                <p className="mt-3 text-sm text-ink-300 font-light leading-relaxed">{p.bio}</p>
                <div className="mt-5 flex items-center gap-3 text-ink-400">
                  <a href="#" aria-label="LinkedIn" className="hover:text-gold-300 transition-colors"><Linkedin size={16} /></a>
                  <a href="#" aria-label="Twitter" className="hover:text-gold-300 transition-colors"><Twitter size={16} /></a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 lg:py-32 bg-bg-surface border-y border-line">
        <div className="container-x">
          <div className="eyebrow mb-10"><span className="h-px w-8 bg-gold-400" />Board of Directors</div>
          <div className="grid md:grid-cols-3 gap-6">
            {board.map((b) => (
              <div key={b.name} className="card p-8 gold-border">
                <h3 className="text-lg text-ink-100 font-light">{b.name}</h3>
                <div className="mt-1 text-[11px] uppercase tracking-[0.2em] text-gold-400">{b.role}</div>
                <p className="mt-4 text-sm text-ink-300 font-light leading-relaxed">{b.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 lg:py-32">
        <div className="container-x text-center">
          <h2 className="section-title mx-auto">Join the team building what's next.</h2>
          <Link href="/careers" className="btn-gold mt-10">View open roles <ArrowUpRight size={18} /></Link>
        </div>
      </section>
    </>
  );
}
