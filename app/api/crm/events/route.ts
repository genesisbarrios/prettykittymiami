import { NextRequest, NextResponse } from "next/server";
import config from "@/config";
import { ENIGMA_API_URL } from "@/libs/crmProxy";

// Public: ClickTracker beacons phone/email/social link clicks here. The
// client slug comes from config, so a request can only count clicks for
// this site.
const TYPES = ["phone_click", "email_click", "social_click"];

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  if (!TYPES.includes(body.type)) {
    return NextResponse.json({ ok: false }, { status: 400 });
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
      }),
    });
  } catch {
    // Tracking is best-effort — never surface an error to the visitor.
  }
  return NextResponse.json({ ok: true }, { status: 202 });
}
