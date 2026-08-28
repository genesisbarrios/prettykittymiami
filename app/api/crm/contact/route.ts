import { NextRequest, NextResponse } from "next/server";

// Server-only proxy to enigma-node-server. ENIGMA_API_URL has no
// NEXT_PUBLIC_ prefix on purpose — this file only ever runs server-side, so
// the backend's real URL is never shipped to the browser. ContactForm and
// NewsletterForm call this same-origin route instead of the backend directly.
const ENIGMA_API_URL = process.env.ENIGMA_API_URL || "http://localhost:5001";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const res = await fetch(`${ENIGMA_API_URL}/api/crm/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
