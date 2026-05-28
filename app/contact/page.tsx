import { Suspense } from "react";
import ContactForm from "./ContactForm";
import { Mail, MapPin, Phone, Clock, ArrowUpRight } from "lucide-react";

export const metadata = {
  title: "Contact — Start a Conversation",
};

export default function ContactPage() {
  return (
    <>
      <section className="relative overflow-hidden hero-gradient pt-32 lg:pt-44 pb-20">
        <div className="absolute inset-0 grid-overlay opacity-60" />
        <div className="container-x relative">
          <div className="max-w-4xl">
            <div className="eyebrow">
              <span className="h-px w-8 bg-gold-400" />
              Contact
            </div>
            <h1 className="mt-6 font-display text-5xl md:text-7xl leading-[0.95] font-extralight tracking-tight text-ink-100">
              Let's build what's <span className="gold-text">next</span>.
            </h1>
            <p className="mt-8 max-w-2xl text-lg text-ink-300 font-light">
              Tell us about your business. A specialist from our team will respond
              within one working day.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 lg:py-32">
        <div className="container-x">
          <div className="grid lg:grid-cols-[2fr_1fr] gap-12 lg:gap-20">
            <div className="card p-8 lg:p-12 gold-border">
              <Suspense fallback={<div className="text-ink-400">Loading…</div>}>
                <ContactForm />
              </Suspense>
            </div>

            <aside className="space-y-10">
              <div>
                <div className="eyebrow">
                  <span className="h-px w-8 bg-gold-400" />
                  Reach Us
                </div>
                <h3 className="mt-4 font-display text-2xl font-light text-ink-100">
                  Direct lines for every kind of conversation.
                </h3>
              </div>

              <ul className="space-y-6">
                <li className="flex gap-4">
                  <div className="shrink-0 grid h-11 w-11 place-items-center rounded-lg border border-gold-400/30 bg-gold-400/5 text-gold-300">
                    <Mail size={18} />
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.3em] text-ink-400">Email</div>
                    <a
                      href="mailto:harshchakravarti77@gmail.com"
                      className="text-ink-100 hover:text-gold-300 transition-colors"
                    >
                      harshchakravarti77@gmail.com
                    </a>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="shrink-0 grid h-11 w-11 place-items-center rounded-lg border border-gold-400/30 bg-gold-400/5 text-gold-300">
                    <Phone size={18} />
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.3em] text-ink-400">Phone</div>
                    <div className="text-ink-100">+91 · By appointment</div>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="shrink-0 grid h-11 w-11 place-items-center rounded-lg border border-gold-400/30 bg-gold-400/5 text-gold-300">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.3em] text-ink-400">Headquarters</div>
                    <div className="text-ink-100">Global · Remote-first</div>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="shrink-0 grid h-11 w-11 place-items-center rounded-lg border border-gold-400/30 bg-gold-400/5 text-gold-300">
                    <Clock size={18} />
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.3em] text-ink-400">Response Time</div>
                    <div className="text-ink-100">Within 1 working day</div>
                  </div>
                </li>
              </ul>

              <div className="card p-6 gold-border">
                <div className="text-[11px] uppercase tracking-[0.3em] text-gold-400">
                  For Media & Analysts
                </div>
                <p className="mt-3 text-sm text-ink-300 font-light leading-relaxed">
                  Press and analyst inquiries are handled by our communications team.
                </p>
                <a
                  href="mailto:harshchakravarti77@gmail.com?subject=Media%20inquiry"
                  className="inline-flex items-center gap-1.5 mt-4 text-xs uppercase tracking-[0.25em] text-gold-300 hover:text-gold-200"
                >
                  Media contact <ArrowUpRight size={14} />
                </a>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
