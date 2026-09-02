import { NextRequest, NextResponse } from "next/server";
import config from "@/config";

// Server-only — see app/api/crm/subscribers/route.ts for why these env vars
// are unprefixed. Edit/delete for a single subscriber, used by the admin
// table's Edit and Delete buttons.
const ENIGMA_API_URL = process.env.ENIGMA_API_URL || "http://localhost:5001";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "pw";

function checkPassword(req: NextRequest) {
  const password = req.headers.get("x-admin-password");
  return password === ADMIN_PASSWORD;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!checkPassword(req)) {
    return NextResponse.json({ ok: false, message: "Invalid admin password." }, { status: 401 });
  }

  const body = await req.json();

  const res = await fetch(`${ENIGMA_API_URL}/api/crm/subscribers/${params.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-admin-password": ADMIN_PASSWORD,
    },
    body: JSON.stringify({ ...body, clientSlug: config.clientSlug }),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!checkPassword(req)) {
    return NextResponse.json({ ok: false, message: "Invalid admin password." }, { status: 401 });
  }

  const res = await fetch(`${ENIGMA_API_URL}/api/crm/subscribers/${params.id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "x-admin-password": ADMIN_PASSWORD,
    },
    body: JSON.stringify({ clientSlug: config.clientSlug }),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
