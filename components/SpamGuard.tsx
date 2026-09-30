"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, options: Record<string, unknown>) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

// Spam defense shared by ContactForm and NewsletterForm:
//   - fetches the server-signed form token (see libs/formToken.ts) on mount
//   - renders the Cloudflare Turnstile widget once
//     NEXT_PUBLIC_TURNSTILE_SITE_KEY is set; its token lands in the form as
//     the hidden "cf-turnstile-response" input
// Call getFields(formData) in the submit handler and spread the result into
// the request body; call reset() after a failed submit, since both tokens
// are single-use from the form's point of view.
export function useSpamGuard() {
  const [formToken, setFormToken] = useState("");

  const fetchToken = useCallback(async () => {
    try {
      const res = await fetch("/api/crm/form-token", { cache: "no-store" });
      const json = await res.json();
      setFormToken(json.token || "");
    } catch {
      setFormToken("");
    }
  }, []);

  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  const widgetIdRef = useRef<string | null>(null);

  const getFields = (data: FormData) => ({
    formToken,
    turnstileToken: data.get("cf-turnstile-response") || "",
  });

  const reset = () => {
    fetchToken();
    if (widgetIdRef.current) window.turnstile?.reset(widgetIdRef.current);
  };

  return { getFields, reset, widgetIdRef };
}

export function TurnstileWidget({
  widgetIdRef,
}: {
  widgetIdRef: React.MutableRefObject<string | null>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !scriptReady || !containerRef.current || !window.turnstile) return;
    const id = window.turnstile.render(containerRef.current, {
      sitekey: TURNSTILE_SITE_KEY,
      size: "flexible",
    });
    widgetIdRef.current = id;
    return () => {
      window.turnstile?.remove(id);
      widgetIdRef.current = null;
    };
  }, [scriptReady, widgetIdRef]);

  if (!TURNSTILE_SITE_KEY) return null;

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
      />
      <div ref={containerRef} />
    </>
  );
}
