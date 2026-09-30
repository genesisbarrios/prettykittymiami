import { NextResponse } from "next/server";
import { createFormToken } from "@/libs/formToken";

// Issues the signed token ContactForm/NewsletterForm send back on submit —
// see libs/formToken.ts.
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    { token: createFormToken() },
    { headers: { "Cache-Control": "no-store" } }
  );
}
