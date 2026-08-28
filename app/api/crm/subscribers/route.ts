import { NextRequest, NextResponse } from "next/server";
import config from "@/config";

// Server-only — ENIGMA_API_URL and ADMIN_PASSWORD have no NEXT_PUBLIC_
// prefix, so neither the backend URL nor the real admin password is ever
// shipped to the browser. The /admin page submits the typed password here
// and only finds out whether it was correct from the response status.
const ENIGMA_API_URL = process.env.ENIGMA_API_URL || "http://localhost:5001";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "pw";

export async function GET(req: NextRequest) {
  const password = req.headers.get("x-admin-password");
  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json(
      { ok: false, message: "Invalid admin password." },
      { status: 401 }
    );
  }

  const res = await fetch(
    `${ENIGMA_API_URL}/api/crm/clients/${config.clientSlug}/subscribers`,
    { headers: { "x-admin-password": ADMIN_PASSWORD } }
  );

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
