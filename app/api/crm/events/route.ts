import { NextRequest, NextResponse } from "next/server";
import config from "@/config";
import { ENIGMA_API_URL } from "@/libs/crmProxy";

// Public: ClickTracker beacons page views and phone/email/social link clicks
// here. The client slug comes from config, so a request can only count
// events for this site.
const TYPES = ["page_view", "phone_click", "email_click", "social_click"];
const BOT_UA = /bot|crawl|spider|slurp|headless|lighthouse|pingdom|uptime|preview|facebookexternalhit/i;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  if (!TYPES.includes(body.type)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  // Don't count crawlers and link-preview bots as visitors.
  if (BOT_UA.test(req.headers.get("user-agent") || "")) {
    return NextResponse.json({ ok: true }, { status: 202 });
  }
  try {
    await fetch(`${ENIGMA_API_URL}/api/crm/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientSlug: config.clientSlug,
        clientName: config.appName,
        type: body.type,
        label: String(body.label || "").slice(0, 60),
        path: String(body.path || "").slice(0, 200),
        visitorId: String(body.visitorId || "").slice(0, 40),
      }),
    });
  } catch {
    // Tracking is best-effort — never surface an error to the visitor.
  }
  return NextResponse.json({ ok: true }, { status: 202 });
}
