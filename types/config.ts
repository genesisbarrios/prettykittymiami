export type Theme =
  | "light"
  | "dark"
  | "corporate"
  | "luxury"
  | "black"
  | "dracula"
  | "jajasplate"
  | "prettykitty"
  | "";

export interface ConfigProps {
  appName: string;
  appDescription: string;
  domainName: string;
  clientSlug: string;
  phone: {
    display: string;
    tel: string;
  };
  location: string;
  cityState: string;
  // Cities/areas served, used to build SEO keywords, meta descriptions, and
  // the LocalBusiness structured data's areaServed list.
  serviceAreas: string[];
  // Primary conversion action for the homepage/nav CTA. This client has no
  // booking platform (unlike Monark's Booksy link), so it points at the
  // contact form instead — swap `external: true` + a real URL for clients
  // that do have an online booking tool.
  primaryCta: {
    label: string;
    href: string;
    external: boolean;
  };
  instagramUrl: string;
  facebookUrl?: string;
  tiktokUrl?: string;
  googleBusinessUrl?: string;
  contactEmail: string;
  // Nonprofit-specific fields (used by the LocalBusiness/NGO schema and the
  // About/Donate content). Leave undefined for a for-profit client.
  nonprofit?: {
    legalName: string;
    ein: string;
    foundedYear: string;
    established501c3: string;
  };
  hours?: string;
  colors: {
    theme: Theme;
    main: string;
  };
  crm: {
    apiUrl: string;
  };
}
