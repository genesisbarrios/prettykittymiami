import { NextRequest } from "next/server";
import config from "@/config";
import { forwardToBackend, isAdmin, unauthorized } from "@/libs/crmProxy";

// The admin's "Connect accounts" panel: GTM / GA4 / Meta Pixel IDs, GA4
// property ID, and Search Console site. Stored on the CRM backend, which
// validates every field.
export const dynamic = "force-dynamic";

const FIELDS = ["gtmId", "gaMeasurementId", "metaPixelId", "gaPropertyId", "searchConsoleSiteUrl"];

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return unauthorized();
  return forwardToBackend(`/api/crm/clients/${config.clientSlug}/settings`);
}

export async function PATCH(req: NextRequest) {
  if (!isAdmin(req)) return unauthorized();
  const body = await req.json().catch(() => ({}));
  const updates = Object.fromEntries(FIELDS.filter((f) => f in body).map((f) => [f, String(body[f] ?? "")]));
  return forwardToBackend(`/api/crm/clients/${config.clientSlug}/settings`, { method: "PATCH", body: updates });
}
