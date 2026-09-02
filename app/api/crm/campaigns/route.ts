import { NextRequest, NextResponse } from "next/server";
import config from "@/config";

// Server-only — see app/api/crm/subscribers/route.ts for why these env vars
// are unprefixed. Backs the admin OUTREACH panel: GET lists past sends,
// POST sends a new campaign (or a 1:1 reply — same pipeline, one recipient).
const ENIGMA_API_URL = process.env.ENIGMA_API_URL || "http://localhost:5001";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "pw";

export async function GET(req: NextRequest) {
  const password = req.headers.get("x-admin-password");
  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ ok: false, message: "Invalid admin password." }, { status: 401 });
  }

  const res = await fetch(`${ENIGMA_API_URL}/api/crm/clients/${config.clientSlug}/campaigns`, {
    headers: { "x-admin-password": ADMIN_PASSWORD },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: NextRequest) {
  const password = req.headers.get("x-admin-password");
  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ ok: false, message: "Invalid admin password." }, { status: 401 });
  }

  const body = await req.json();

  const res = await fetch(`${ENIGMA_API_URL}/api/crm/campaigns/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-password": ADMIN_PASSWORD,
    },
    body: JSON.stringify({ ...body, clientSlug: config.clientSlug }),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
