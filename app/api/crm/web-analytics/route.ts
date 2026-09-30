import { NextRequest } from "next/server";
import config from "@/config";
import { forwardToBackend, isAdmin, unauthorized } from "@/libs/crmProxy";

// Website Analytics on /admin: GA4 visitors/location/age/gender and Search
// Console SEO data, read on the backend with Enigma's Google service account.
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return unauthorized();
  const days = Number(req.nextUrl.searchParams.get("days")) || 28;
  return forwardToBackend(`/api/crm/clients/${config.clientSlug}/web-analytics?days=${days}`);
}
