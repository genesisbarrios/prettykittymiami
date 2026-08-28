import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageBanner from "@/components/PageBanner";
import PrimaryCta from "@/components/PrimaryCta";
import config from "@/config";
import { getInvolvedOptions } from "@/data/get-involved";
import { getSEOTags } from "@/libs/seo";

export const metadata = getSEOTags({
  title: `Get Involved — ${config.appName}`,
  description:
    "Adopt, foster, volunteer, or donate to Pretty Kitty Miami-Dade Rescue — a 501(c)(3) nonprofit cat rescue in North Miami, FL.",
  canonicalUrlRelative: "/get-involved",
});

// Real photos, cycled across the cards below so every option gets a photo.
const galleryPhotos = [
  "/images/gallery/post-1.jpg",
  "/images/gallery/post-2.jpg",
  "/images/gallery/post-3.jpg",
  "/images/gallery/post-5.jpg",
];

// Specific photo overrides for cards where a matching photo exists.
const photoOverrides: Record<string, string> = {
  "Care & Nursing": "/care.jpg",
  Volunteer: "/get-involved.jpg",
  "TNR (Trap-Neuter-Return)": "/transport.jpg",
};

export default function GetInvolvedPage() {
  return (
    <>
      <Header />
      <main>
        <PageBanner
          title="GET INVOLVED"
          description="Every bit of support helps a cat in need."
        />

        <section className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {getInvolvedOptions.map((item, i) => {
              const href = item.name === "Donate" ? "/donate" : "/volunteer";
              return (
                <Link
                  key={item.name}
                  href={href}
                  className="rounded-lg overflow-hidden border border-base-300 bg-base-200 transition-transform hover:-translate-y-1"
                >
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={
                        photoOverrides[item.name] ||
                        galleryPhotos[i % galleryPhotos.length]
                      }
                      alt={`${item.name} — ${config.appName}`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-sm text-base-content/60 mt-1">
                      {item.description}
                    </p>
                    <span className="inline-block mt-3 font-display text-primary">
                      {item.price}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <PrimaryCta className="btn btn-primary btn-lg" />
          </div>
        </section>

        {/* Donate embed */}
        <section className="bg-neutral border-t border-base-300">
          <div className="max-w-3xl mx-auto px-6 py-20">
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
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
