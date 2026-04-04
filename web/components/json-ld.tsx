export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function webApplicationJsonLd(args: {
  name: string;
  description: string;
  url: string;
  category?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: args.name,
    description: args.description,
    url: args.url,
    applicationCategory: args.category ?? "UtilitiesApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}
