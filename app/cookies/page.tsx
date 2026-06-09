export const metadata = { title: "Cookie Policy" };

export default function CookiesPage() {
  return (
    <div className="pt-32 lg:pt-44 pb-24">
      <article className="container-x max-w-3xl">
        <div className="eyebrow"><span className="h-px w-8 bg-gold-400" />Legal</div>
        <h1 className="mt-6 font-display text-4xl md:text-5xl font-extralight text-ink-100 leading-tight">Cookie Policy</h1>
        <p className="mt-3 text-sm text-ink-400">Last updated: May 25, 2026</p>

        <div className="mt-12 space-y-10 text-ink-300 font-light leading-relaxed">
          <section>
            <h2 className="text-xl text-ink-100 font-light mb-3">What are cookies?</h2>
            <p>Cookies are small text files placed on your device by websites you visit. They are widely used to make websites work more efficiently and to provide reporting information.</p>
          </section>
          <section>
            <h2 className="text-xl text-ink-100 font-light mb-3">How we use cookies</h2>
            <p>We use strictly necessary cookies to operate the Site, performance cookies to understand how visitors interact with our content, and functional cookies to remember your preferences. We do not use cookies for advertising tracking without your consent.</p>
          </section>
          <section>
            <h2 className="text-xl text-ink-100 font-light mb-3">Managing cookies</h2>
            <p>You can control cookies through your browser settings. Disabling certain cookies may affect Site functionality.</p>
          </section>
          <section>
            <h2 className="text-xl text-ink-100 font-light mb-3">Contact</h2>
            <p>For questions about our cookie practices, email <a href="mailto:hello@aumoxo.tech" className="text-gold-300 hover:text-gold-200">hello@aumoxo.tech</a>.</p>
          </section>
        </div>
      </article>
    </div>
  );
}
