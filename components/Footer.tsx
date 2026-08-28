import Link from "next/link";
import config from "@/config";
import SocialLinks from "./SocialLinks";

export default function Footer() {
  return (
    <footer className="bg-neutral border-t border-base-300" id="footer">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row md:justify-between gap-10">
          <div>
            <span className="font-display text-2xl tracking-wide text-primary">
              PRETTY KITTY MIAMI-DADE RESCUE
            </span>
            <p className="mt-3 text-sm text-base-content/70 max-w-xs">
              {config.appDescription}
            </p>
            {config.nonprofit && (
              <p className="mt-3 text-xs text-base-content/50">
                {config.nonprofit.legalName} is a 501(c)(3) nonprofit.
                EIN: {config.nonprofit.ein}. Donations are tax-deductible.
              </p>
            )}
            <p className="mt-4 text-xs text-base-content/50">
              Copyright &copy; {new Date().getFullYear()} —{" "}
              <a
                href="https://enigma-labs.com"
                target="_blank"
                rel="noopener noreferrer"
                className="link link-hover"
              >
                Developed by Enigma Labs
              </a>
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-10">
            <div>
              <div className="text-xs uppercase tracking-widest text-base-content/50 mb-3">
                Site
              </div>
              <div className="flex flex-col gap-2 text-sm">
                <Link href="/donate" className="link link-hover">Donate</Link>
                <Link href="/get-involved" className="link link-hover">Get Involved</Link>
                <Link href="/volunteer" className="link link-hover">Volunteer</Link>
                <Link href="/gallery" className="link link-hover">Gallery</Link>
                <Link href="/about" className="link link-hover">About</Link>
                <Link href="/501c3" className="link link-hover">501(c)(3) Non-Profit</Link>
                <Link href="/contact" className="link link-hover">Contact</Link>
                <Link href="/privacy-policy" className="link link-hover">Privacy Policy</Link>
              </div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-widest text-base-content/50 mb-3">
                Visit Us
              </div>
              <div className="flex flex-col gap-2 text-sm text-base-content/70">
                <span>{config.location}</span>
                {config.hours && <span>{config.hours}</span>}
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <div className="text-xs uppercase tracking-widest text-base-content/50 mb-3">
                Connect
              </div>
              <SocialLinks className="flex-col items-start gap-3" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
