import Link from "next/link";
import config from "@/config";
import { otherRescues } from "@/data/other-rescues";

// "We're full" messaging, switched on/off with config.atCapacity.enabled.
// Banner: a pink strip at the top of the homepage linking to the full section. Section: the
// About page block listing other rescues people can reach out to instead.

export function AtCapacityBanner() {
  if (!config.atCapacity?.enabled) return null;
  return (
    <section className="bg-primary text-primary-content border-b border-base-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-center sm:text-left">
        {/* One line on mobile: no wrapping, font scales with screen width so
            the full message fits (button drops to its own line below). */}
        <p className="font-medium whitespace-nowrap text-[length:clamp(0.625rem,calc((100vw-2rem)/34),1rem)] sm:whitespace-normal sm:text-base">
          {config.atCapacity.message}
        </p>
        <Link href="/about#other-rescues" className="btn btn-sm btn-neutral shrink-0">
          Other rescues that can help
        </Link>
      </div>
    </section>
  );
}

export function AtCapacitySection() {
  if (!config.atCapacity?.enabled) return null;
  return (
    <div id="other-rescues" className="mt-12 scroll-mt-24 rounded-lg border-2 border-primary bg-primary/10 p-8">
      <h2 className="font-display text-2xl tracking-wide">
        WE&apos;RE CURRENTLY FULL
      </h2>
      <p className="text-base-content/80 mt-2 leading-relaxed">
        {config.atCapacity.message} If you&apos;ve found a cat that needs
        help, please reach out to one of these rescues instead:
      </p>
      <ul className="mt-6 flex flex-col gap-4">
        {otherRescues.map((r) => (
          <li key={r.name} className="rounded-lg border border-base-300 bg-base-100 p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{r.name}</h3>
              <p className="text-sm text-base-content/70 mt-1">{r.description}</p>
            </div>
            <a href={r.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm shrink-0">
              {r.cta}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
