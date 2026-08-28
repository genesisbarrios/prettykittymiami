import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";
import PageBanner from "@/components/PageBanner";
import PrimaryCta from "@/components/PrimaryCta";
import SocialLinks from "@/components/SocialLinks";
import config from "@/config";
import { getSEOTags } from "@/libs/seo";

export const metadata = getSEOTags({
  title: `Contact Us — ${config.appName}`,
  description:
    "Questions about adopting, fostering, or volunteering with Pretty Kitty Miami-Dade Rescue? Send us a message.",
  canonicalUrlRelative: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <Header />
      <main>
        <PageBanner
          title="CONTACT US"
          description="Questions about adopting, fostering, or volunteering? Send us a message."
        />

        <section className="max-w-4xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="font-display text-2xl tracking-wide mb-6">
              SEND A MESSAGE
            </h2>
            <ContactForm />
          </div>

          <div>
            <h2 className="font-display text-2xl tracking-wide mb-6">
              GET IN TOUCH
            </h2>
            <div className="flex flex-col gap-4 text-base-content/80">
              <p>{config.location}</p>
              {config.hours && <p className="text-sm">{config.hours}</p>}
              <p>
                For the fastest response, call{" "}
                <a href={`tel:${config.phone.tel}`} className="link text-primary">
                  {config.phone.display}
                </a>
                .
              </p>
              <div>
                <PrimaryCta className="btn btn-primary" />
              </div>
            </div>
            <div className="mt-6">
              <SocialLinks variant="accent" className="flex-col items-start gap-4" />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
