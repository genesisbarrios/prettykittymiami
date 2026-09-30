import Script from "next/script";
import config from "@/config";
import ClickTracker from "@/components/ClickTracker";

// Loads the client's own Google Tag Manager, GA4, and Meta Pixel tags, using
// the IDs they connected in the admin's "Connect accounts" panel (stored on
// the Enigma CRM backend, not in this repo). Re-checked every 5 minutes, so
// connecting an account in the admin takes effect without a redeploy.
const ENIGMA_API_URL = process.env.ENIGMA_API_URL || "http://localhost:5000";

// The backend already validates these, but they end up inside <script>
// tags, so check again here before rendering anything.
const PATTERNS = {
  gtmId: /^GTM-[A-Z0-9]{4,12}$/,
  gaMeasurementId: /^G-[A-Z0-9]{4,15}$/,
  metaPixelId: /^\d{8,20}$/,
};

async function getTrackingIds() {
  try {
    const res = await fetch(`${ENIGMA_API_URL}/api/crm/clients/${config.clientSlug}/tracking`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return {};
    const data = await res.json();
    const valid = (key: keyof typeof PATTERNS) =>
      typeof data[key] === "string" && PATTERNS[key].test(data[key]) ? (data[key] as string) : "";
    return { gtmId: valid("gtmId"), gaMeasurementId: valid("gaMeasurementId"), metaPixelId: valid("metaPixelId") };
  } catch {
    // Backend unreachable (e.g. during a build) — render the site without tags.
    return {};
  }
}

export default async function Tracking() {
  const { gtmId, gaMeasurementId, metaPixelId } = await getTrackingIds();

  return (
    <>
      {gtmId && (
        <>
          <Script id="gtm" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
          </Script>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        </>
      )}

      {gaMeasurementId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${gaMeasurementId}');`}
          </Script>
        </>
      )}

      {metaPixelId && (
        <>
          <Script id="meta-pixel" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${metaPixelId}');fbq('track','PageView');`}
          </Script>
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      )}

      <ClickTracker />
    </>
  );
}
