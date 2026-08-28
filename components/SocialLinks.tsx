import Link from "next/link";
import config from "@/config";

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.98-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z" />
  </svg>
);

const QuoteIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    className="w-5 h-5"
  >
    <path d="M4 17V7a2 2 0 012-2h4l-2 6h3l-2 6H6a2 2 0 01-2-2z" />
    <path d="M13 17V7a2 2 0 012-2h4l-2 6h3l-2 6h-3a2 2 0 01-2-2z" />
  </svg>
);

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1C10.61 21 3 13.39 3 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.25 1.01l-2.2 2.2z" />
  </svg>
);

// Renders Instagram / Google Business / primary CTA / phone as a row of
// icon links. Used on the homepage and in the footer per client request that
// all socials stay visible in both places. Google Business is skipped when
// no link is configured (e.g. a client without a set-up listing yet).
export default function SocialLinks({
  variant = "default",
  className = "",
}: {
  variant?: "default" | "accent" | "light";
  className?: string;
}) {
  const linkClass =
    variant === "accent"
      ? "flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
      : variant === "light"
      ? "flex items-center gap-2 text-white/90 hover:text-white transition-colors"
      : "flex items-center gap-2 text-base-content/70 hover:text-primary transition-colors";

  return (
    <div className={`flex flex-wrap items-center gap-4 ${className}`}>
      <a
        href={config.instagramUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
        title="Instagram"
        className={linkClass}
      >
        <InstagramIcon />
        <span className="text-sm">Instagram</span>
      </a>

      {config.googleBusinessUrl && (
        <a
          href={config.googleBusinessUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Google Reviews"
          title="Google Reviews"
          className={linkClass}
        >
          <GoogleIcon />
          <span className="text-sm">Google Reviews</span>
        </a>
      )}

      {config.primaryCta.external ? (
        <a
          href={config.primaryCta.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={config.primaryCta.label}
          title={config.primaryCta.label}
          className={linkClass}
        >
          <QuoteIcon />
          <span className="text-sm">{config.primaryCta.label}</span>
        </a>
      ) : (
        <Link
          href={config.primaryCta.href}
          aria-label={config.primaryCta.label}
          title={config.primaryCta.label}
          className={linkClass}
        >
          <QuoteIcon />
          <span className="text-sm">{config.primaryCta.label}</span>
        </Link>
      )}

      <a
        href={`tel:${config.phone.tel}`}
        aria-label={config.phone.display}
        title={config.phone.display}
        className={linkClass}
      >
        <PhoneIcon />
        <span className="text-sm">{config.phone.display}</span>
      </a>
    </div>
  );
}
