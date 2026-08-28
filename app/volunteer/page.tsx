import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";
import PageBanner from "@/components/PageBanner";
import config from "@/config";
import { getSEOTags } from "@/libs/seo";

export const metadata = getSEOTags({
  title: `Volunteer — ${config.appName}`,
  description:
    "Volunteer with Pretty Kitty Miami-Dade Rescue — help with TNR, transport, socializing kittens, and more in North Miami, FL.",
  canonicalUrlRelative: "/volunteer",
});

export default function VolunteerPage() {
  return (
    <>
      <Header />
      <main>
        <PageBanner
          title="VOLUNTEER"
          description="Have a heart for cats and hands ready to help?"
        />

        <section className="max-w-4xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12">
          <div className="flex flex-col gap-4 text-base-content/80 leading-relaxed">
            <p>
              We&apos;re always looking for people who care about cats and
              want to make a real difference. Whether it&apos;s helping with
              TNR runs, transporting cats to vet appointments, socializing
              kittens, or lending a hand around the rescue, every bit of
              help matters.
            </p>
            <p>
              We recently relocated, which nearly doubled our housing
              costs — making hands-on volunteer support more valuable than
              ever. There&apos;s no set list of roles; if you&apos;re
              willing to help, we&apos;ll find a way to put that to good
              use.
            </p>
            <p>
              Ready to get involved? Send us a message and tell us a bit
              about yourself, and we&apos;ll follow up with next steps.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl tracking-wide mb-6">
              SIGN UP TO VOLUNTEER
            </h2>
            <ContactForm />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
