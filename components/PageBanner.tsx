import Image from "next/image";

// Shared page-title banner: a signature photo with a dark overlay, used
// behind the heading on every page. Centralized here so every page uses
// the exact same image + opacity — change it once, it changes everywhere.
export default function PageBanner({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
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

      <div className="relative max-w-6xl mx-auto px-6 py-16 text-center">
        <h1 className="font-display text-4xl md:text-5xl tracking-wide text-white">
          {title}
        </h1>
        {description && (
          <p className="text-white/80 mt-3 max-w-lg mx-auto">{description}</p>
        )}
      </div>
    </section>
  );
}
