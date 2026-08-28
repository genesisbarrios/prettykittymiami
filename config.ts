import { ConfigProps } from "./types/config";

// ---------------------------------------------------------------------------
// This file is the single source of truth for everything client-specific.
// To reuse this template for a new web design client, fork the repo and only
// edit this file (plus the theme colors in tailwind.config.js) — every page
// and component reads from here instead of hardcoding client details.
// ---------------------------------------------------------------------------
const config = {
  appName: "Pretty Kitty Miami-Dade Rescue",
  appDescription:
    "Pretty Kitty Miami-Dade Rescue — a 501(c)(3) nonprofit rescuing, rehabilitating, and rehoming community cats and kittens in Miami-Dade County since 2015.",
  domainName: "prettykittymiamirescue.org",

  // Unique identifier sent to the Enigma CRM backend so every submission from
  // this site is scoped to this client. Must be unique per client site.
  clientSlug: "pretty-kitty-miami-dade-rescue",

  phone: {
    display: "(305) 528-4651",
    tel: "3055284651",
  },

  location: "12865 West Dixie Highway, Suite 102, North Miami, FL 33161",
  cityState: "North Miami, FL",

  // Areas served, used for SEO keywords and structured data.
  serviceAreas: [
    "North Miami",
    "Miami",
    "Miami-Dade County",
    "North Miami Beach",
    "Aventura",
    "Miami Shores",
  ],

  // This is a donation-driven nonprofit, not a booking/ordering business —
  // the primary CTA points at this site's own /donate page (Donorbox embed),
  // not out to the original prettykittymiamirescue.org.
  primaryCta: {
    label: "Donate Now",
    href: "/donate",
    external: false,
  },

  instagramUrl: "https://instagram.com/prettykittymiami",
  facebookUrl: "https://www.facebook.com/prettykittymiami",
  tiktokUrl: "https://www.tiktok.com/@prettykittymiamirescue",
  googleBusinessUrl: "",
  contactEmail: "prettykittymiamirescue@gmail.com",

  hours: "Mon–Fri 8am–6pm ET · Sat–Sun 8am–1pm ET",

  nonprofit: {
    legalName: "Pretty Kitty Miami-Dade Rescue Inc",
    ein: "85-3004159",
    foundedYear: "2015",
    established501c3: "2020",
  },

  colors: {
    // See tailwind.config.js daisyui.themes for the "prettykitty" theme definition.
    theme: "prettykitty",
    main: "#d1638a",
  },

  crm: {
    apiUrl:
      process.env.ENIGMA_API_URL || "http://localhost:5000",
  },
} as ConfigProps;

export default config;
