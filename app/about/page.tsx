import Image from "next/image";
import Script from "next/script";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsletterForm from "@/components/NewsletterForm";
import PageBanner from "@/components/PageBanner";
import SocialLinks from "@/components/SocialLinks";
import config from "@/config";
import { getSEOTags } from "@/libs/seo";

export const metadata = getSEOTags({
  title: `About Us — ${config.appName}`,
  description:
    "Founded in 2015, Pretty Kitty Miami-Dade Rescue became a 501(c)(3) nonprofit in 2020, rescuing community cats across Miami-Dade County.",
  canonicalUrlRelative: "/about",
});

export default function AboutPage() {
  return (
    <>
      <Header />
      <main>
        <PageBanner
          title="ABOUT PRETTY KITTY"
          description="Rescuing, rehabilitating, and rehoming Miami-Dade's community cats since 2015."
        />

        <section className="max-w-3xl mx-auto px-6 py-16">
          <div className="flex flex-col gap-4 text-base-content/80 leading-relaxed">
            <p>
              {config.nonprofit?.legalName} has been rescuing cats in Miami
              since {config.nonprofit?.foundedYear}, and became an officially
              registered 501(c)(3) nonprofit in{" "}
              {config.nonprofit?.established501c3}. Since then, we&apos;ve
              trapped, neutered, and returned (TNR) over 1,500 community
              cats, and transported 1,300+ rehabilitated cats and kittens to
              partner shelters in the Northeast.
            </p>
            <p>
              We currently care for 50+ cats and kittens — treating sick
              animals, bottle-feeding orphans, and finding every one of them
              a safe path forward, whether that&apos;s adoption, fostering,
              or a healthy return to their colony.
            </p>
          </div>

          <div className="relative aspect-video rounded-lg overflow-hidden border border-base-300 mt-10">
            <Image
              src="/founder.jpg"
              alt="Pretty Kitty Miami-Dade Rescue founder"
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>

          <div className="mt-10">
            <h2 className="font-display text-2xl tracking-wide mb-4">
              FOUNDER
            </h2>
            <blockquote className="border-l-4 border-primary pl-6 text-base-content/80 italic leading-relaxed">
              &ldquo;Our rescue is small but mighty. Pretty Kitty Miami-Dade
              Rescue makes constant investments in medications and medical
              supplies and maintains good relationships with other cat
              rescues.&rdquo;
              <footer className="mt-3 text-sm not-italic text-base-content/60">
                — Deb Pachano, PKMDR Founder
              </footer>
            </blockquote>
          </div>

          <div className="mt-10 flex flex-wrap gap-6">
            <SocialLinks variant="accent" />
          </div>

          <div className="mt-12 grid sm:grid-cols-2 gap-8">
            <div>
              <h2 className="font-display text-2xl tracking-wide mb-4">
                VISIT US
              </h2>
              <p className="text-base-content/80">{config.location}</p>
              {config.hours && (
                <p className="text-base-content/60 text-sm mt-2">
                  {config.hours}
                </p>
              )}
            </div>
            {config.nonprofit && (
              <div>
                <h2 className="font-display text-2xl tracking-wide mb-4">
                  501(C)(3) STATUS
                </h2>
                <p className="text-base-content/80 text-sm">
                  {config.nonprofit.legalName} is a registered 501(c)(3)
                  nonprofit. EIN: {config.nonprofit.ein}. Donations are
                  tax-deductible.
                </p>
              </div>
            )}
          </div>

          <div className="mt-12 rounded-lg border border-base-300 bg-base-200 p-8 text-center">
            <h2 className="font-display text-2xl tracking-wide">
              STAY IN THE LOOP
            </h2>
            <p className="text-sm text-base-content/60 mt-2 mb-6">
              Sign up for rescue updates, adoption alerts, and ways to help.
            </p>
            <div className="flex justify-center">
              <NewsletterForm
                buttonLabel="Sign Up"
                successMessage="You're in — thank you for supporting our cats."
              />
            </div>
          </div>

          <div className="mt-12">
            <div className="text-center mb-10">
              <h2 className="font-display text-3xl tracking-wide">
                DONATE
              </h2>
              <p className="text-base-content/60 mt-2">
                Every dollar goes toward food, litter, medicine, and vet
                care.
              </p>
            </div>
            <Script
              src="https://donorbox.org/widget.js"
              strategy="afterInteractive"
              {...{ paypalExpress: "false" }}
            />
            <iframe
              src="https://donorbox.org/embed/generic-donation-4?default_interval=m&show_content=true&enable_auto_scroll=false"
              name="donorbox"
              seamless
              frameBorder="0"
              scrolling="no"
              height="900px"
              width="100%"
              style={{ maxWidth: "100%", minWidth: "100%", maxHeight: "none" }}
              {...{ allowpaymentrequest: "true" }}
            />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
