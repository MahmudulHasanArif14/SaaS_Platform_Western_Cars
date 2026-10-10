import { type NextRequest, NextResponse } from "next/server";

import { FORGOT_PASSWORD_PATH, RESET_PASSWORD_PATH } from "@/lib/routes";
import { emailTokenSchema } from "@/modules/auth/auth.schema";
import { verifyEmailToken } from "@/modules/auth/auth.service";

// Target of emailed links: exchanges the single-use token hash for a session,
// then redirects so the token does not stay in the address bar.
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const parsed = emailTokenSchema.safeParse({
    tokenHash: searchParams.get("token_hash"),
    type: searchParams.get("type"),
  });

  if (parsed.success && (await verifyEmailToken(parsed.data)).ok) {
    return NextResponse.redirect(new URL(RESET_PASSWORD_PATH, request.url));
  }

  const retry = new URL(FORGOT_PASSWORD_PATH, request.url);
  retry.searchParams.set("error", "link");
  return NextResponse.redirect(retry);
}
