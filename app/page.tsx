import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SocialLinks from "@/components/SocialLinks";
import NewsletterForm from "@/components/NewsletterForm";
import PrimaryCta from "@/components/PrimaryCta";
import config from "@/config";
import { getInvolvedOptions } from "@/data/get-involved";
import { getSEOTags } from "@/libs/seo";

const faqs = [
  {
    q: "How do I know this is a legitimate rescue?",
    a: `${config.nonprofit?.legalName} has been rescuing cats since ${config.nonprofit?.foundedYear} and became a registered 501(c)(3) nonprofit in ${config.nonprofit?.established501c3}. We've TNR'd over 1,500 community cats and transported 1,300+ rehabilitated cats and kittens to partner shelters in the Northeast.`,
  },
  {
    q: "Where does my donation go?",
    a: "100% of donations and fundraising go directly toward our cat protection programs, infrastructure, and day-to-day operations.",
  },
  {
    q: "What is your Tax ID / EIN?",
    a: `Our EIN is ${config.nonprofit?.ein}. Donations are tax-deductible.`,
  },
  {
    q: "What are your hours?",
    a: config.hours || "",
  },
  {
    q: "Will I get a donation receipt?",
    a: "Online donations automatically generate an email receipt. If you donated another way, email us and we'll send you one.",
  },
  {
    q: "Do you offer monthly giving?",
    a: "Yes — you can set up a recurring monthly donation directly through our donate page.",
  },
  {
    q: "Can I make an extra one-time donation if I'm already a monthly donor?",
    a: "Yes, existing monthly donors can make additional one-time gifts through the donate page at any time.",
  },
  {
    q: "Do you solicit donations door-to-door?",
    a: "No — we do not run neighborhood or door-to-door donation campaigns. Please be cautious of anyone soliciting on our behalf in person.",
  },
  {
    q: "How do I cancel or change my recurring donation?",
    a: "Email us and we'll update or cancel your recurring donation for you.",
  },
];

export const metadata = getSEOTags({
  title: `${config.appName} | Cat Rescue in North Miami, FL`,
  description: `${config.appDescription} Donate, adopt, foster, or volunteer today.`,
  canonicalUrlRelative: "/",
});

const previewPhotos = [
  "/images/gallery/post-1.jpg",
  "/images/gallery/post-2.jpg",
  "/images/gallery/post-3.jpg",
];

export default function Home() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-base-300">
          <Image
            src="/hero.jpg"
            alt="Pretty Kitty Miami-Dade Rescue"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />

          <div className="relative max-w-6xl mx-auto px-6 py-24 md:py-32 text-center">
            <p className="uppercase tracking-[0.4em] text-white/70 text-xs md:text-sm mb-6">
              {config.cityState} · 501(c)(3) Nonprofit
            </p>
            <h1 className="font-display text-5xl md:text-7xl tracking-wide leading-tight text-white">
              BE A LOCAL HERO.
              <br />
              <span className="text-secondary">SUPPORT YOUR LOCAL CAT RESCUE.</span>
            </h1>
            <p className="mt-6 max-w-xl mx-auto text-white/80 text-lg">
              Since 2015, we&apos;ve rescued, rehabilitated, and rehomed
              community cats and kittens across Miami-Dade County.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <PrimaryCta className="btn btn-primary btn-lg" />
              <a
                href={`tel:${config.phone.tel}`}
                className="btn btn-outline btn-lg text-white border-white hover:bg-white hover:text-black"
              >
                Call {config.phone.display}
              </a>
            </div>

            <div className="mt-12 flex justify-center">
              <SocialLinks variant="light" />
            </div>
          </div>
        </section>

        {/* Impact stats */}
        <section className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="font-display text-4xl text-primary">2015</div>
            <div className="text-sm text-base-content/60 mt-1">Rescuing Since</div>
          </div>
          <div>
            <div className="font-display text-4xl text-primary">1,500+</div>
            <div className="text-sm text-base-content/60 mt-1">Cats TNR&apos;d</div>
          </div>
          <div>
            <div className="font-display text-4xl text-primary">1,300+</div>
            <div className="text-sm text-base-content/60 mt-1">Cats Transported to Shelters</div>
          </div>
          <div>
            <div className="font-display text-4xl text-primary">50+</div>
            <div className="text-sm text-base-content/60 mt-1">Cats in Our Care Now</div>
          </div>
        </section>

        {/* Recent rescues */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl tracking-wide">
              MEET SOME OF OUR CATS
            </h2>
            <p className="text-base-content/60 mt-2">
              A look at who we&apos;ve been caring for.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {previewPhotos.map((src) => (
              <div
                key={src}
                className="relative aspect-[4/5] rounded-lg overflow-hidden border border-base-300"
              >
                <Image
                  src={src}
                  alt={`${config.appName} — rescued cat`}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/gallery" className="btn btn-outline">
              View Full Gallery
            </Link>
          </div>
        </section>

        {/* Ways to help preview */}
        <section className="bg-neutral border-y border-base-300">
          <div className="max-w-6xl mx-auto px-6 py-20">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl tracking-wide">
                WAYS TO HELP
              </h2>
              <p className="text-base-content/60 mt-2">
                Every bit of support makes a difference.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {getInvolvedOptions.map((item) => (
                <div
                  key={item.name}
                  className="rounded-lg border border-base-300 bg-base-100 p-6"
                >
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  <p className="text-sm text-base-content/60 mt-2">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link href="/get-involved" className="btn btn-outline">
                See All Ways to Help
              </Link>
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="bg-primary text-primary-content">
          <div className="max-w-6xl mx-auto px-6 py-20 text-center">
            <h2 className="font-display text-3xl tracking-wide">
              STAY IN THE LOOP
            </h2>
            <p className="text-primary-content/80 mt-2 max-w-md mx-auto">
              Join our list for rescue updates, adoption alerts, and ways
              to help.
            </p>
            <div className="mt-6 flex justify-center">
              <NewsletterForm
                buttonLabel="Sign Up"
                successMessage="You're in — thank you for supporting our cats."
                buttonClassName="btn-neutral"
              />
            </div>
          </div>
        </section>

        {/* Donate embed */}
        <section className="max-w-3xl mx-auto px-6 py-20">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl md:text-4xl tracking-wide">
              DONATE
            </h2>
            <p className="text-base-content/60 mt-2">
              Every dollar goes toward food, litter, medicine, and vet care.
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
        </section>

        {/* FAQ */}
        <section className="bg-neutral border-t border-base-300">
          <div className="max-w-3xl mx-auto px-6 py-20">
            <div className="text-center mb-10">
              <h2 className="font-display text-3xl md:text-4xl tracking-wide">
                FREQUENTLY ASKED QUESTIONS
              </h2>
            </div>
            <div className="flex flex-col gap-3">
              {faqs.map((faq) => (
                <div
                  key={faq.q}
                  tabIndex={0}
                  className="collapse collapse-arrow bg-base-100 border border-base-300"
                >
                  <input type="checkbox" />
                  <div className="collapse-title font-medium">{faq.q}</div>
                  <div className="collapse-content text-base-content/70 text-sm">
                    <p>{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
