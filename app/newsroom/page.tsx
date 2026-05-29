import Link from "next/link";
import { ArrowUpRight, Calendar, Newspaper, Mic, Download } from "lucide-react";

export const metadata = { title: "Newsroom — Press & Media" };

const releases = [
  { date: "May 20, 2026", tag: "Product", title: "AUMOXO launches Atlas 2.0 with native GenAI fabric and federated query" },
  { date: "May 6, 2026", tag: "Partnership", title: "AUMOXO named global system integration partner for hyperscaler X" },
  { date: "Apr 22, 2026", tag: "Growth", title: "AUMOXO opens new delivery hub in Lisbon to serve EMEA enterprises" },
  { date: "Apr 9, 2026", tag: "Recognition", title: "AUMOXO recognized as Leader in the 2026 Global Tech Services Quadrant" },
  { date: "Mar 27, 2026", tag: "ESG", title: "AUMOXO publishes inaugural Sustainability Report, commits to net-zero by 2032" },
  { date: "Mar 12, 2026", tag: "Financials", title: "AUMOXO reports record fiscal Q4 — 47% YoY revenue growth" },
];

const coverage = [
  { outlet: "Forbes", title: "How AUMOXO Is Quietly Becoming the Default Enterprise Tech Partner", date: "May 2026" },
  { outlet: "TechCrunch", title: "Inside AUMOXO's Platform Strategy for the Agentic AI Era", date: "Apr 2026" },
  { outlet: "Financial Times", title: "AUMOXO: The Services Firm Built for the Post-Cloud Decade", date: "Mar 2026" },
  { outlet: "Bloomberg", title: "AUMOXO CEO on Scaling Without Losing Engineering Culture", date: "Feb 2026" },
];

const events = [
  { date: "Jun 18, 2026", city: "Singapore", title: "AUMOXO APAC Customer Summit" },
  { date: "Jul 09, 2026", city: "New York", title: "Financial Services Innovation Forum" },
  { date: "Sep 11, 2026", city: "London", title: "Enterprise AI Practitioners' Day" },
  { date: "Nov 04, 2026", city: "Bengaluru", title: "AUMOXO Engineering Conf 2026" },
];

export default function NewsroomPage() {
  return (
    <>
      <section className="relative overflow-hidden hero-gradient pt-32 lg:pt-44 pb-20">
        <div className="absolute inset-0 grid-overlay opacity-60" />
        <div className="container-x relative">
          <div className="max-w-4xl">
            <div className="eyebrow"><span className="h-px w-8 bg-gold-400" />Newsroom</div>
            <h1 className="mt-6 font-display text-5xl md:text-7xl leading-[1.05] font-extralight tracking-tight text-ink-100">
              The latest from <span className="gold-text">AUMOXO</span>.
            </h1>
            <p className="mt-8 max-w-2xl text-lg text-ink-300 font-light">
              Press releases, media coverage, upcoming events and resources for journalists and analysts.
            </p>
          </div>
        </div>
      </section>

      {/* Press releases */}
      <section className="py-24 lg:py-32">
        <div className="container-x">
          <div className="flex items-end justify-between flex-wrap gap-6 mb-10">
            <div>
              <div className="eyebrow"><span className="h-px w-8 bg-gold-400" />Press Releases</div>
              <h2 className="section-title mt-5">Recent announcements.</h2>
            </div>
            <a href="#" className="btn-ghost"><Download size={16} /> Media kit</a>
          </div>
          <div className="space-y-3">
            {releases.map((r) => (
              <Link key={r.title} href="/contact" className="group grid md:grid-cols-[160px_120px_1fr_auto] gap-4 items-center p-6 rounded-xl border border-line bg-bg-surface hover:border-gold-400/50 hover:bg-bg-elevated transition-all">
                <div className="text-xs uppercase tracking-[0.2em] text-ink-400">{r.date}</div>
                <div className="text-[11px] uppercase tracking-[0.3em] text-gold-400 inline-flex items-center gap-1.5">
                  <Newspaper size={12} /> {r.tag}
                </div>
                <div className="text-ink-100 font-light group-hover:text-gold-300 transition-colors">{r.title}</div>
                <ArrowUpRight size={18} className="text-gold-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Media coverage */}
      <section className="py-24 lg:py-32 bg-bg-surface border-y border-line">
        <div className="container-x">
          <div className="eyebrow mb-6"><span className="h-px w-8 bg-gold-400" />In the Press</div>
          <h2 className="section-title">What journalists are saying.</h2>
          <div className="mt-12 grid md:grid-cols-2 gap-6">
            {coverage.map((c) => (
              <div key={c.title} className="card p-8 gold-border">
                <div className="font-display text-xl text-gold-300">{c.outlet}</div>
                <p className="mt-3 text-lg font-light text-ink-100 leading-snug">"{c.title}"</p>
                <div className="mt-4 text-xs uppercase tracking-[0.2em] text-ink-400">{c.date}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Events */}
      <section className="py-24 lg:py-32">
        <div className="container-x">
          <div className="eyebrow mb-6"><span className="h-px w-8 bg-gold-400" />Upcoming Events</div>
          <h2 className="section-title">Where to find us next.</h2>
          <div className="mt-12 grid md:grid-cols-2 gap-6">
            {events.map((e) => (
              <Link key={e.title} href="/contact" className="card p-8 flex items-center gap-6 group">
                <div className="shrink-0 grid h-16 w-16 place-items-center rounded-lg border border-gold-400/30 bg-gold-400/5 text-gold-300">
                  <Calendar size={22} />
                </div>
                <div className="flex-1">
                  <div className="text-[11px] uppercase tracking-[0.25em] text-gold-400">{e.date} · {e.city}</div>
                  <h3 className="mt-1 text-lg font-light text-ink-100 group-hover:text-gold-300 transition-colors">{e.title}</h3>
                </div>
                <ArrowUpRight size={18} className="text-gold-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Media contact */}
      <section className="py-24 lg:py-32 bg-bg-surface border-y border-line">
        <div className="container-x text-center">
          <Mic className="mx-auto text-gold-400 mb-6" size={28} />
          <h2 className="section-title mx-auto">Media inquiries</h2>
          <p className="section-sub mx-auto text-center">For interviews, quotes and briefings, our communications team responds within 24 hours.</p>
          <a href="mailto:harshchakravarti77@gmail.com?subject=Media%20inquiry" className="btn-gold mt-10">
            Contact press team <ArrowUpRight size={18} />
          </a>
        </div>
      </section>
    </>
  );
}
