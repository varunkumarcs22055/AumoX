/**
 * BreadcrumbList structured data — helps Google show "aumoxo.tech › Services"
 * style breadcrumb trails in search results. Renders no visible UI.
 */
export default function BreadcrumbsLd({
  items,
}: {
  items: { name: string; path: string }[];
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aumoxo.tech";
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      ...items.map((it, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: it.name,
        item: `${siteUrl}${it.path}`,
      })),
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
