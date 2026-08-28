import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageBanner from "@/components/PageBanner";
import config from "@/config";
import { getSEOTags } from "@/libs/seo";

export const metadata = getSEOTags({
  title: `Cat Gallery — ${config.appName}`,
  description:
    "Cats and kittens rescued by Pretty Kitty Miami-Dade Rescue — a 501(c)(3) nonprofit in North Miami, FL.",
  canonicalUrlRelative: "/gallery",
});

// Real photos pulled from the rescue's website. Add more to this array
// (and the /public/images/gallery folder) as new cats are rescued.
const photos = [
  "/images/gallery/post-1.jpg",
  "/images/gallery/post-2.jpg",
  "/images/gallery/post-3.jpg",
  "/images/gallery/post-4.jpg",
  "/images/gallery/post-5.jpg",
  "/images/gallery/post-6.jpg",
  "/images/gallery/post-7.jpg",
  "/images/gallery/post-8.jpg",
  "/images/gallery/post-9.jpg",
  "/images/gallery/post-10.jpg",
];

export default function GalleryPage() {
  return (
    <>
      <Header />
      <main>
        <PageBanner
          title="GALLERY"
          description="Some of the cats and kittens we've rescued and cared for."
        />

        <section className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {photos.map((src) => (
              <div
                key={src}
                className="relative aspect-square rounded-lg overflow-hidden border border-base-300"
              >
                <Image
                  src={src}
                  alt={`${config.appName} — rescued cat`}
                  fill
                  sizes="(max-width: 640px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <a
              href={config.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-lg"
            >
              See More Photos
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
