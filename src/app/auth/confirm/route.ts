import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

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

  // Path-only redirects: `request.url` can carry the server's bind host
  // instead of the one the browser used, and the session cookies would not
  // follow the user to a different host.
  if (parsed.success && (await verifyEmailToken(parsed.data)).ok) {
    redirect(RESET_PASSWORD_PATH);
  }
  redirect(`${FORGOT_PASSWORD_PATH}?error=link`);
}
