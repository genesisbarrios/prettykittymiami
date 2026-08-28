import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageBanner from "@/components/PageBanner";
import config from "@/config";
import { getSEOTags } from "@/libs/seo";

export const metadata = getSEOTags({
  title: `Privacy Policy — ${config.appName}`,
  description: `How ${config.appName} collects, uses, and protects your information.`,
  canonicalUrlRelative: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main>
        <PageBanner title="PRIVACY POLICY" />

        <section className="max-w-3xl mx-auto px-6 py-16">
          <div className="flex flex-col gap-8 text-base-content/80 leading-relaxed text-sm">
            <p className="text-base-content/60">
              Last updated: {new Date().getFullYear()}. This policy explains
              how {config.nonprofit?.legalName} collects, uses, and protects
              the information you share with us.
            </p>

            <div>
              <h2 className="font-display text-xl tracking-wide text-base-content mb-2">
                Information We Collect
              </h2>
              <p>
                When you visit our site, donate, sign up for updates, or
                contact us, we may collect information you provide
                voluntarily — such as your name, mailing address, email
                address, phone number, and payment details for donations.
                We also automatically collect some technical information,
                like IP addresses and general browsing behavior, and we use
                email tracking (opens/clicks) to understand which updates
                are useful to our supporters.
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl tracking-wide text-base-content mb-2">
                How We Use Your Information
              </h2>
              <p>
                We use the information we collect to communicate with you
                about our rescue work, share program updates, process
                donations, and invite you to support our initiatives. We do
                not sell your credit card information or newsletter
                opt-in data.
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl tracking-wide text-base-content mb-2">
                Sharing With Third Parties
              </h2>
              <p>
                Aside from payment and opt-in data, some information may be
                shared with trusted partners — such as affiliate
                organizations, sponsors, or service providers — for
                marketing purposes. You can request that your information
                not be shared, or ask to be removed entirely, at any time
                by contacting us.
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl tracking-wide text-base-content mb-2">
                Cookies & Tracking
              </h2>
              <p>
                We use cookies to support on-site search functionality, and
                we use tools like Google Ads remarketing and analytics to
                understand site traffic. You can adjust cookie settings in
                your browser, or opt out of Google&apos;s ad personalization
                through Google&apos;s Ads Settings.
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl tracking-wide text-base-content mb-2">
                Data Security
              </h2>
              <p>
                We use industry-standard security measures, including SSL
                encryption, to protect your information — especially
                payment details submitted for donations.
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl tracking-wide text-base-content mb-2">
                Your Choices
              </h2>
              <p>
                You can unsubscribe from our emails at any time using the
                link included in each message. To correct or remove your
                information from our records, just email us and we&apos;ll
                take care of it.
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl tracking-wide text-base-content mb-2">
                Contact Us
              </h2>
              <p>
                Questions about this policy or your information? Email{" "}
                <a href={`mailto:${config.contactEmail}`} className="link text-primary">
                  {config.contactEmail}
                </a>{" "}
                or call{" "}
                <a href={`tel:${config.phone?.tel}`} className="link text-primary">
                  {config.phone?.display}
                </a>
                .
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
