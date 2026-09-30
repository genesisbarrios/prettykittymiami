import { NextRequest } from "next/server";
import config from "@/config";
import { forwardToBackend, isAdmin, unauthorized } from "@/libs/crmProxy";

// Internal analytics cards on /admin: signups, contact submissions, and
// phone/email/social clicks. ?days=N limits the range (0 = all time).
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return unauthorized();
  const days = Number(req.nextUrl.searchParams.get("days")) || 0;
  return forwardToBackend(`/api/crm/clients/${config.clientSlug}/stats?days=${days}`);
}
