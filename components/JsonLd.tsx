/**
 * JSON-LD structured data for AUMOXO. Helps Google understand:
 *   - Who the organization is
 *   - What services we offer
 *   - Where to find us
 *   - Site-search box hint
 * Renders a single <script type="application/ld+json"> tag with a graph
 * combining Organization, WebSite and ProfessionalService schemas.
 */
export default function JsonLd() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://aumoxo.tech";

  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "AUMOXO",
        alternateName: ["AUMOXO Technologies", "Aumoxo"],
        url: siteUrl,
        logo: `${siteUrl}/logo-mark.png`,
        image: `${siteUrl}/logo.jpeg`,
        description:
          "AUMOXO develops enterprise-grade software, AI solutions, automation systems, and digital products that help organizations innovate faster, operate smarter, and scale confidently.",
        slogan: "Think Infinite",
        foundingDate: "2026",
        founder: [
          { "@type": "Person", name: "Aditya Singh", jobTitle: "Founder & CEO" },
          { "@type": "Person", name: "Varun Thakur", jobTitle: "Co-Founder & CTO" },
        ],
        email: "hello@aumoxo.tech",
        sameAs: [
          // add real social handles here later
        ],
        contactPoint: {
          "@type": "ContactPoint",
          email: "hello@aumoxo.tech",
          contactType: "customer support",
          areaServed: "Worldwide",
          availableLanguage: ["English"],
        },
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "AUMOXO — Think Infinite",
        description:
          "Enterprise software, AI solutions, CRM platforms, automation systems and digital products.",
        publisher: { "@id": `${siteUrl}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "ProfessionalService",
        "@id": `${siteUrl}/#service`,
        name: "AUMOXO — Software, AI & Automation",
        url: siteUrl,
        image: `${siteUrl}/logo.jpeg`,
        description:
          "Custom software development, AI agents and chatbots, CRM platforms, automation systems, web and mobile applications, SaaS engineering and UI/UX design.",
        priceRange: "$$",
        areaServed: { "@type": "Place", name: "Worldwide" },
        provider: { "@id": `${siteUrl}/#organization` },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "AUMOXO Services",
          itemListElement: [
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "AI Solutions",          description: "Production-grade AI agents, copilots and ML systems built on leading large language models and open models." } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "CRM Platforms",         description: "Custom CRM systems built around your sales process and customer lifecycle." } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Automation Systems",    description: "Workflow automation, AI-powered process orchestration, internal tools and integrations." } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Enterprise Software",   description: "Internal systems, operations platforms, dashboards and business management software." } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Web Applications",      description: "Modern web apps built on Next.js + React — fast, accessible, SEO-ready." } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "SaaS Platforms",        description: "End-to-end multi-tenant SaaS engineering — auth, billing, admin and analytics." } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Mobile Applications",   description: "Native Android in Kotlin and cross-platform with Flutter / React Native." } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "UI / UX Design",        description: "Research, design systems, prototypes and pixel-perfect Figma handoff." } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Technology Consulting", description: "Strategy, process optimization, digital transformation planning and architecture." } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Chatbots",              description: "Website chatbots, WhatsApp bots and conversational AI trained on your knowledge base." } },
          ],
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // Next.js renders this once in <head>; safe for static JSON.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
