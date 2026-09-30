import { NextRequest, NextResponse } from "next/server";

// Server-only — see app/api/crm/subscribers/route.ts for why these env
// vars are unprefixed.
const ENIGMA_API_URL = process.env.ENIGMA_API_URL || "http://localhost:5001";
// Fails closed: with no ADMIN_PASSWORD set, nobody gets in.
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";

export async function POST(req: NextRequest) {
  const password = req.headers.get("x-admin-password");
  if (!ADMIN_PASSWORD || password !== ADMIN_PASSWORD) {
    return NextResponse.json(
      { ok: false, message: "Invalid admin password." },
      { status: 401 }
    );
  }

  const body = await req.json();

  const res = await fetch(`${ENIGMA_API_URL}/api/crm/subscribers/import`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-password": ADMIN_PASSWORD,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
