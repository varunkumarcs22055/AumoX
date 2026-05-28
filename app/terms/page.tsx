export const metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <div className="pt-32 lg:pt-44 pb-24">
      <article className="container-x max-w-3xl">
        <div className="eyebrow"><span className="h-px w-8 bg-gold-400" />Legal</div>
        <h1 className="mt-6 font-display text-4xl md:text-5xl font-extralight text-ink-100 leading-tight">Terms of Service</h1>
        <p className="mt-3 text-sm text-ink-400">Last updated: May 25, 2026</p>

        <div className="mt-12 space-y-10 text-ink-300 font-light leading-relaxed">
          <section>
            <h2 className="text-xl text-ink-100 font-light mb-3">1. Agreement</h2>
            <p>By accessing aumox.com (the "Site") or using any AUMO.X service, you agree to these Terms of Service. If you do not agree, please do not use the Site or services.</p>
          </section>
          <section>
            <h2 className="text-xl text-ink-100 font-light mb-3">2. Use of the Site</h2>
            <p>You agree to use the Site only for lawful purposes and not to attempt to gain unauthorized access, disrupt our infrastructure, or use the Site in any manner that could damage AUMO.X or impair other users' use.</p>
          </section>
          <section>
            <h2 className="text-xl text-ink-100 font-light mb-3">3. Intellectual Property</h2>
            <p>All content on the Site — including text, design, logos, graphics, software and trademarks — is owned by AUMO.X or its licensors. You may not reproduce, modify or distribute any portion without written permission.</p>
          </section>
          <section>
            <h2 className="text-xl text-ink-100 font-light mb-3">4. Disclaimers</h2>
            <p>The Site and all content are provided "as is" without warranties of any kind. To the maximum extent permitted by law, AUMO.X disclaims all express and implied warranties, including merchantability, fitness for purpose and non-infringement.</p>
          </section>
          <section>
            <h2 className="text-xl text-ink-100 font-light mb-3">5. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, AUMO.X shall not be liable for any indirect, incidental, special, consequential or punitive damages arising out of your use of the Site.</p>
          </section>
          <section>
            <h2 className="text-xl text-ink-100 font-light mb-3">6. Governing Law</h2>
            <p>These Terms are governed by the laws of the jurisdiction in which AUMO.X is headquartered, without regard to conflict-of-laws principles.</p>
          </section>
          <section>
            <h2 className="text-xl text-ink-100 font-light mb-3">7. Changes</h2>
            <p>We may update these Terms from time to time. Continued use of the Site following changes constitutes acceptance of the updated Terms.</p>
          </section>
        </div>
      </article>
    </div>
  );
}
