import Link from "next/link";
import config from "@/config";

// Renders config.primaryCta as either an internal <Link> (e.g. /contact) or
// an external <a> (e.g. a Booksy-style booking link), depending on
// primaryCta.external. Centralizes that branch so every CTA button on the
// site stays consistent when a client's booking setup changes.
export default function PrimaryCta({
  className = "btn btn-primary",
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const label = children || config.primaryCta.label;

  if (config.primaryCta.external) {
    return (
      <a
        href={config.primaryCta.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {label}
      </a>
    );
  }

  return (
    <Link href={config.primaryCta.href} className={className}>
      {label}
    </Link>
  );
}
