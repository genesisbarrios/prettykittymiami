import PrimaryCta from "@/components/PrimaryCta";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageBanner from "@/components/PageBanner";
import config from "@/config";
import { getSEOTags } from "@/libs/seo";

export const metadata = getSEOTags({
  title: `501(c)(3) Non-Profit — ${config.appName}`,
  description:
    "Pretty Kitty Miami-Dade Rescue Inc is a registered 501(c)(3) nonprofit (EIN 85-3004159). Donations are tax-deductible.",
  canonicalUrlRelative: "/501c3",
});

export default function NonProfitPage() {
  return (
    <>
      <Header />
      <main>
        <PageBanner
          title="501(C)(3) NON-PROFIT"
          description="Your donations are tax-deductible."
        />

        <section className="max-w-3xl mx-auto px-6 py-16">
          <div className="flex flex-col gap-4 text-base-content/80 leading-relaxed">
            <p>
              {config.nonprofit?.legalName} is a registered 501(c)(3)
              nonprofit organization. EIN: {config.nonprofit?.ein}. We&apos;ve
              been rescuing cats in Miami since{" "}
              {config.nonprofit?.foundedYear}, and became officially
              registered as a nonprofit in{" "}
              {config.nonprofit?.established501c3}.
            </p>
            <p>
              Our focus is on cats and kittens born outdoors and facing
              health challenges like ringworm, respiratory infections, and
              mange. We provide deworming, vaccination, microchipping,
              nursing care for sick animals, bottle-feeding for orphaned
              kittens, and rehabilitation for injured cats — funding
              treatment for even the most complex medical cases.
            </p>
            <p>
              Since our founding, we&apos;ve TNR&apos;d (trap-neuter-return)
              over 1,500 community cats and transported 1,300+
              rehabilitated cats and kittens to partner shelters in the
              Northeast. We currently care for 50+ cats and kittens at any
              given time.
            </p>
            <p>
              The rescue is entirely donation-based. A recent relocation
              nearly doubled our housing costs, making every contribution
              more important than ever.
            </p>
          </div>

          <div className="mt-12 rounded-lg border border-base-300 bg-base-200 p-8">
            <h2 className="font-display text-2xl tracking-wide mb-4">
              WAYS TO DONATE
            </h2>
            <div className="flex flex-col gap-2 text-base-content/80 text-sm">
              <p>Donate online, or mail a check to:</p>
              <p>
                {config.nonprofit?.legalName}
                <br />
                {config.location}
              </p>
              <p className="mt-2">
                Questions? Email{" "}
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
            <div className="mt-6">
              <PrimaryCta className="btn btn-primary btn-lg" />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
