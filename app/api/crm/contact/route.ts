import { NextRequest, NextResponse } from "next/server";
import { isFormTokenEnabled, isValidFormToken } from "@/libs/formToken";

// Server-only proxy to enigma-node-server. ENIGMA_API_URL has no
// NEXT_PUBLIC_ prefix on purpose — this file only ever runs server-side, so
// the backend's real URL is never shipped to the browser. ContactForm and
// NewsletterForm call this same-origin route instead of the backend directly.
const ENIGMA_API_URL = process.env.ENIGMA_API_URL || "http://localhost:5001";

// Cloudflare Turnstile — only enforced once TURNSTILE_SECRET_KEY is set (with
// NEXT_PUBLIC_TURNSTILE_SITE_KEY for the widget), so the forms keep working
// until both keys are added in Vercel.
const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY || "";

function getClientIp(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "";
}

async function passesTurnstile(token: unknown, ip: string) {
  if (typeof token !== "string" || !token) return false;
  const form = new URLSearchParams({ secret: TURNSTILE_SECRET_KEY, response: token });
  if (ip) form.set("remoteip", ip);
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: form,
    });
    const data = await res.json();
    return data.success === true;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const { formToken, turnstileToken, ...body } = await req.json();

  // Same silent "success" the backend gives spam, so a scripted bot gets no
  // signal to adapt to — it just never becomes a subscriber.
  if (isFormTokenEnabled() && !isValidFormToken(formToken)) {
    return NextResponse.json({ ok: true, message: "Submission received." }, { status: 201 });
  }

  if (TURNSTILE_SECRET_KEY && !(await passesTurnstile(turnstileToken, getClientIp(req)))) {
    return NextResponse.json(
      { ok: false, message: "Verification failed — please try again." },
      { status: 400 }
    );
  }

  const res = await fetch(`${ENIGMA_API_URL}/api/crm/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
