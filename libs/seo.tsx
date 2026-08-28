import type { Metadata } from "next";
import config from "@/config";

// Base keyword set: nonprofit/rescue terms + every area served. Individual
// pages can extend this via the `keywords` param for page-specific terms
// (see get-involved/gallery/etc pages).
const baseKeywords = [
  config.appName,
  "cat rescue",
  "kitten rescue",
  "TNR",
  "trap neuter return",
  "cat adoption",
  "501c3 nonprofit",
  config.cityState,
  ...config.serviceAreas,
  ...config.serviceAreas.map((area) => `cat rescue ${area}`),
  ...config.serviceAreas.map((area) => `cat adoption ${area}`),
];

// Prefills SEO tags with sensible defaults from config.ts. Override per-page
// via `export const metadata = getSEOTags({ title: "...", canonicalUrlRelative: "/about" })`.
export const getSEOTags = ({
  title,
  description,
  keywords,
  openGraph,
  canonicalUrlRelative,
}: Metadata & { canonicalUrlRelative?: string } = {}) => {
  return {
    title: title || config.appName,
    description: description || config.appDescription,
    keywords: keywords || baseKeywords,
    applicationName: config.appName,
    metadataBase: new URL(
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000/"
        : `https://${config.domainName}/`
    ),
    robots: { index: true, follow: true },
    openGraph: {
      title: openGraph?.title || title || config.appName,
      description: openGraph?.description || description || config.appDescription,
      url: openGraph?.url || `https://${config.domainName}/`,
      siteName: config.appName,
      locale: "en_US",
      type: "website",
    },
    twitter: {
      title: openGraph?.title || title || config.appName,
      description: openGraph?.description || description || config.appDescription,
      card: "summary_large_image",
    },
    ...(canonicalUrlRelative && {
      alternates: { canonical: canonicalUrlRelative },
    }),
  };
};

// NGO structured data so Google can show rich results (hours, phone,
// address, service area) for the nonprofit. Edit the fields as real
// details come in.
export const renderLocalBusinessSchema = () => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "NGO",
          name: config.nonprofit?.legalName || config.appName,
          alternateName: config.appName,
          description: config.appDescription,
          image: `https://${config.domainName}/logo.png`,
          url: `https://${config.domainName}/`,
          telephone: config.phone.tel,
          email: config.contactEmail,
          address: {
            "@type": "PostalAddress",
            streetAddress: "12865 West Dixie Highway, Suite 102",
            addressLocality: "North Miami",
            addressRegion: "FL",
            postalCode: "33161",
            addressCountry: "US",
          },
          areaServed: config.serviceAreas.map((area) => ({
            "@type": "Place",
            name: `${area}, FL`,
          })),
          sameAs: [config.instagramUrl, config.googleBusinessUrl].filter(Boolean),
        }),
      }}
    ></script>
  );
};
