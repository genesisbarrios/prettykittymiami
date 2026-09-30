"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    fbq?: (...args: unknown[]) => void;
  }
}

// Social/review profiles counted as "social media link clicks".
const SOCIAL_HOSTS: [RegExp, string][] = [
  [/(^|\.)instagram\.com$/, "instagram"],
  [/(^|\.)(facebook|fb)\.com$|(^|\.)fb\.me$/, "facebook"],
  [/(^|\.)tiktok\.com$/, "tiktok"],
  [/(^|\.)yelp\.com$/, "yelp"],
  [/(^|\.)youtube\.com$|(^|\.)youtu\.be$/, "youtube"],
  [/(^|\.)(x|twitter)\.com$/, "x"],
  [/(^|\.)linkedin\.com$/, "linkedin"],
  [/(^|\.)threads\.net$/, "threads"],
  [/(^|\.)pinterest\.com$/, "pinterest"],
  [/^share\.google$|^g\.page$|^maps\.app\.goo\.gl$|^g\.co$/, "google"],
];

function classify(anchor: HTMLAnchorElement): { type: string; label: string } | null {
  const href = anchor.getAttribute("href") || "";
  if (href.startsWith("tel:")) return { type: "phone_click", label: "phone" };
  if (href.startsWith("mailto:")) return { type: "email_click", label: "email" };
  try {
    const url = new URL(href, window.location.href);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "google.com" && url.pathname.startsWith("/maps")) return { type: "social_click", label: "google" };
    const match = SOCIAL_HOSTS.find(([re]) => re.test(host));
    return match ? { type: "social_click", label: match[1] } : null;
  } catch {
    return null;
  }
}

// One document-level listener for the whole site: every tel:, mailto:, and
// social link is counted, wherever it's rendered, with no per-component
// wiring. Each click goes to our own CRM (admin cards) and, when connected,
// to GTM/GA4 (dataLayer event) and Meta Pixel ("Contact" for phone/email).
export default function ClickTracker() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as Element | null)?.closest?.("a");
      if (!anchor) return;
      const event = classify(anchor);
      if (!event) return;

      const payload = JSON.stringify({ ...event, path: window.location.pathname });
      // sendBeacon survives the page navigating away (tel:/external links).
      const sent = navigator.sendBeacon?.("/api/crm/events", new Blob([payload], { type: "application/json" }));
      if (!sent) {
        fetch("/api/crm/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }

      window.dataLayer?.push({ event: event.type, link_label: event.label, link_url: anchor.href });
      if (event.type !== "social_click") window.fbq?.("track", "Contact");
    };

    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
