import Script from "next/script";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageBanner from "@/components/PageBanner";
import config from "@/config";
import { getSEOTags } from "@/libs/seo";

export const metadata = getSEOTags({
  title: `Donate — ${config.appName}`,
  description:
    "Donate to Pretty Kitty Miami-Dade Rescue, a 501(c)(3) nonprofit. Every dollar goes toward food, litter, medicine, and vet care for rescued cats.",
  canonicalUrlRelative: "/donate",
});

export default function DonatePage() {
  return (
    <>
      <Header />
      <main>
        <PageBanner
          title="DONATE"
          description="Every dollar goes toward food, litter, medicine, and vet care."
        />

        <section className="max-w-3xl mx-auto px-6 py-16">
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

          {config.nonprofit && (
            <div className="mt-12 rounded-lg border border-base-300 bg-base-200 p-8">
              <h2 className="font-display text-2xl tracking-wide mb-4">
                OTHER WAYS TO GIVE
              </h2>
              <div className="flex flex-col gap-2 text-base-content/80 text-sm">
                <p>
                  Prefer to mail a check? Send it to:
                  <br />
                  {config.nonprofit.legalName}
                  <br />
                  {config.location}
                </p>
                <p className="mt-2">
                  {config.nonprofit.legalName} is a registered 501(c)(3)
                  nonprofit. EIN: {config.nonprofit.ein}. Donations are
                  tax-deductible.
                </p>
                <p className="mt-2">
                  Questions about donating? Call{" "}
                  <a href={`tel:${config.phone.tel}`} className="link text-primary">
                    {config.phone.display}
                  </a>{" "}
                  or{" "}
                  <a href="/contact" className="link text-primary">
                    send us a message
                  </a>
                  .
                </p>
              </div>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
