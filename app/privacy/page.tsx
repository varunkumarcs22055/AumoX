export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="pt-32 lg:pt-44 pb-24">
      <article className="container-x max-w-3xl">
        <div className="eyebrow"><span className="h-px w-8 bg-gold-400" />Legal</div>
        <h1 className="mt-6 font-display text-4xl md:text-5xl font-extralight text-ink-100 leading-tight">Privacy Policy</h1>
        <p className="mt-3 text-sm text-ink-400">Last updated: May 25, 2026</p>

        <div className="mt-12 space-y-10 text-ink-300 font-light leading-relaxed">
          <section>
            <h2 className="text-xl text-ink-100 font-light mb-3">1. Introduction</h2>
            <p>AUMOXO Technologies ("AUMOXO", "we", "our", "us") respects your privacy. This Policy explains what personal information we collect when you interact with our website, products and services, and how we use, share and protect it.</p>
          </section>
          <section>
            <h2 className="text-xl text-ink-100 font-light mb-3">2. Information We Collect</h2>
            <p>We collect information you provide directly (such as via our contact forms or product registrations), information collected automatically (such as device data, IP address, and browsing behavior) and information from third parties (such as our marketing partners and public records).</p>
          </section>
          <section>
            <h2 className="text-xl text-ink-100 font-light mb-3">3. How We Use Your Information</h2>
            <p>We use the information we collect to operate, maintain and improve our services, communicate with you, comply with our legal obligations, and as otherwise described to you at the point of collection.</p>
          </section>
          <section>
            <h2 className="text-xl text-ink-100 font-light mb-3">4. Sharing & Disclosure</h2>
            <p>We do not sell your personal information. We share information with service providers under contract, in the context of a corporate transaction, when required by law, or with your consent.</p>
          </section>
          <section>
            <h2 className="text-xl text-ink-100 font-light mb-3">5. Your Rights</h2>
            <p>Subject to applicable law, you may have rights to access, correct, delete, restrict or object to processing of your personal information, and to data portability. Contact us at the address below to exercise these rights.</p>
          </section>
          <section>
            <h2 className="text-xl text-ink-100 font-light mb-3">6. Security</h2>
            <p>We maintain administrative, technical and physical safeguards consistent with our ISO 27001 and SOC 2 Type II programs. No method of transmission over the internet is, however, fully secure.</p>
          </section>
          <section>
            <h2 className="text-xl text-ink-100 font-light mb-3">7. International Transfers</h2>
            <p>As a global organization, we may transfer information across jurisdictions. We rely on Standard Contractual Clauses and other lawful mechanisms where required.</p>
          </section>
          <section>
            <h2 className="text-xl text-ink-100 font-light mb-3">8. Contact</h2>
            <p>Questions about this Policy? Email <a href="mailto:hello@aumoxo.tech" className="text-gold-300 hover:text-gold-200">hello@aumoxo.tech</a>.</p>
          </section>
        </div>
      </article>
    </div>
  );
}
