import Link from "next/link";
import config from "@/config";

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.98-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M22 12.06C22 6.505 17.523 2 12 2S2 6.505 2 12.06c0 5.02 3.657 9.184 8.438 9.94v-7.03H7.898v-2.91h2.54V9.845c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.878h2.773l-.443 2.91h-2.33V22c4.78-.756 8.437-4.92 8.437-9.94z" />
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M16.6 5.82c-.9-.98-1.4-2.26-1.4-3.62h-3.1v13.44a2.9 2.9 0 11-2.05-2.77V9.7a5.98 5.98 0 00-1-.09 6 6 0 106 6V9.94a8.5 8.5 0 004.9 1.56V8.4a5.6 5.6 0 01-3.35-2.58z" />
  </svg>
);

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z" />
  </svg>
);

// A heart — fits "Donate Now" far better than the old quotation-marks glyph.
const QuoteIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1C10.61 21 3 13.39 3 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.25 1.01l-2.2 2.2z" />
  </svg>
);

const EmailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0-.828.672-1.5 1.5-1.5h16.5c.828 0 1.5.672 1.5 1.5v10.5a1.5 1.5 0 01-1.5 1.5H3.75a1.5 1.5 0 01-1.5-1.5V6.75z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75l9.75 6.75 9.75-6.75" />
  </svg>
);

type LinkKey = "instagram" | "facebook" | "tiktok" | "google" | "cta" | "phone" | "email";

// Renders Instagram / Facebook / TikTok / Google Business / primary CTA /
// phone / email as a row of icon links. Used on the homepage and in the
// footer per client request that all socials stay visible in both places.
// Facebook/TikTok/Google Business/email are skipped when no link is
// configured for a given client. Pass `only` to render a subset, and
// `iconOnly` to drop the text label next to each icon (e.g. the hero wants
// every icon but no platform-name clutter).
//
// The wrapping div only sets `flex flex-wrap gap-4` by default (no
// items-center) so a caller's own alignment class (e.g. Footer/Contact's
// `items-start`) always applies cleanly — putting items-center in the base
// string and items-start in `className` at the same time is a genuine
// conflict: Tailwind's generated stylesheet order (not className string
// order) decides which one wins, and items-center was winning, silently
// breaking every "left-justify the connect column" attempt. Callers that
// want the default centered row (Home hero, About) pass `items-center`
// themselves instead.
export default function SocialLinks({
  variant = "default",
  className = "",
  only,
  iconOnly = false,
}: {
  variant?: "default" | "accent" | "light";
  className?: string;
  only?: LinkKey[];
  iconOnly?: boolean;
}) {
  const show = (key: LinkKey) => !only || only.includes(key);

  const linkClass =
    variant === "accent"
      ? "flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
      : variant === "light"
      ? "flex items-center gap-2 text-white/90 hover:text-white transition-colors"
      : "flex items-center gap-2 text-base-content/70 hover:text-primary transition-colors";

  const Label = ({ children }: { children: React.ReactNode }) =>
    iconOnly ? null : <span className="text-sm">{children}</span>;

  return (
    <div className={`flex flex-wrap gap-4 ${className}`}>
      {show("instagram") && (
        <a
          href={config.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          title="Instagram"
          className={linkClass}
        >
          <InstagramIcon />
          <Label>Instagram</Label>
        </a>
      )}

      {show("facebook") && config.facebookUrl && (
        <a
          href={config.facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
          title="Facebook"
          className={linkClass}
        >
          <FacebookIcon />
          <Label>Facebook</Label>
        </a>
      )}

      {show("tiktok") && config.tiktokUrl && (
        <a
          href={config.tiktokUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="TikTok"
          title="TikTok"
          className={linkClass}
        >
          <TikTokIcon />
          <Label>TikTok</Label>
        </a>
      )}

      {show("google") && config.googleBusinessUrl && (
        <a
          href={config.googleBusinessUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Google Reviews"
          title="Google Reviews"
          className={linkClass}
        >
          <GoogleIcon />
          <Label>Google Reviews</Label>
        </a>
      )}

      {show("cta") &&
        (config.primaryCta.external ? (
          <a
            href={config.primaryCta.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={config.primaryCta.label}
            title={config.primaryCta.label}
            className={linkClass}
          >
            <QuoteIcon />
            <Label>{config.primaryCta.label}</Label>
          </a>
        ) : (
          <Link
            href={config.primaryCta.href}
            aria-label={config.primaryCta.label}
            title={config.primaryCta.label}
            className={linkClass}
          >
            <QuoteIcon />
            <Label>{config.primaryCta.label}</Label>
          </Link>
        ))}

      {show("phone") && (
        <a
          href={`tel:${config.phone.tel}`}
          aria-label={config.phone.display}
          title={config.phone.display}
          className={linkClass}
        >
          <PhoneIcon />
          <Label>{config.phone.display}</Label>
        </a>
      )}

      {show("email") && config.contactEmail && (
        <a
          href={`mailto:${config.contactEmail}`}
          aria-label={config.contactEmail}
          title={config.contactEmail}
          className={linkClass}
        >
          <EmailIcon />
          <Label>{config.contactEmail}</Label>
        </a>
      )}
    </div>
  );
}
