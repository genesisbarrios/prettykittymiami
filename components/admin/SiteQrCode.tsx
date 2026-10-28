"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import config from "@/config";

// QR code linking to this client's website, shown top-right on /admin so the
// client can download it for flyers, business cards, signs, etc. Generated in
// the browser from config.domainName — nothing to upload or keep in sync.
const SITE_URL = `https://${config.domainName}`;

export default function SiteQrCode() {
  const [preview, setPreview] = useState("");

  useEffect(() => {
    QRCode.toDataURL(SITE_URL, { width: 160, margin: 1 })
      .then(setPreview)
      .catch(() => setPreview(""));
  }, []);

  // Print-quality PNG (1024px, black on white) generated on click.
  const download = async () => {
    const dataUrl = await QRCode.toDataURL(SITE_URL, {
      width: 1024,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    });
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${config.domainName.replace(/^www\./, "")}-qr-code.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  if (!preview) return null;

  return (
    <div className="ml-auto flex items-center gap-3" title={`QR code for ${SITE_URL}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={preview}
        alt={`QR code linking to ${SITE_URL}`}
        width={64}
        height={64}
        className="h-16 w-16 rounded bg-white p-1"
      />
      <div className="flex flex-col items-start gap-1">
        <span className="text-xs text-base-content/60">Website QR code</span>
        <button type="button" onClick={download} className="btn btn-outline btn-xs">
          Download QR
        </button>
      </div>
    </div>
  );
}
