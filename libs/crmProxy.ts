import { NextRequest, NextResponse } from "next/server";

// Server-only helpers for the app/api/crm/* proxy routes. ENIGMA_API_URL and
// ADMIN_PASSWORD have no NEXT_PUBLIC_ prefix on purpose: neither the backend
// URL nor the admin password is ever shipped to the browser. The /admin page
// sends the password the user typed, and only learns whether it was right
// from the response status.
export const ENIGMA_API_URL = process.env.ENIGMA_API_URL || "http://localhost:5000";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";

// Fails closed: with no ADMIN_PASSWORD set, nobody gets in.
export function isAdmin(req: NextRequest) {
  return ADMIN_PASSWORD !== "" && req.headers.get("x-admin-password") === ADMIN_PASSWORD;
}

export function unauthorized() {
  return NextResponse.json({ ok: false, message: "Invalid admin password." }, { status: 401 });
}

// Calls the backend with the real admin password and relays its response.
export async function forwardToBackend(path: string, init: { method?: string; body?: unknown } = {}) {
  const res = await fetch(`${ENIGMA_API_URL}${path}`, {
    method: init.method || "GET",
    headers: { "Content-Type": "application/json", "x-admin-password": ADMIN_PASSWORD },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({ ok: false, message: "Bad response from backend." }));
  return NextResponse.json(data, { status: res.status });
}
