import { createClient } from "@supabase/supabase-js";

// Helpers for E2E tests that need a real Supabase Auth server. They run
// against the local stack (`npx supabase start`); see
// scripts/supabase-local-env.mjs. Never point these at a hosted project:
// they create and delete users.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;
const mailboxUrl = process.env.E2E_MAILBOX_URL;

const LOCAL_HOSTS = new Set(["127.0.0.1", "localhost"]);
const isLocal = url ? LOCAL_HOSTS.has(new URL(url).hostname) : false;

export const supabaseAvailable = Boolean(url && secretKey && isLocal);
export const mailboxAvailable = supabaseAvailable && Boolean(mailboxUrl);
export const SKIP_REASON =
  "needs the local Supabase stack (npx supabase start + scripts/supabase-local-env.mjs)";

function admin() {
  if (!supabaseAvailable) throw new Error(SKIP_REASON);
  return createClient(url!, secretKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// Creates a confirmed user, replacing any earlier one with the same address.
export async function resetUser(email: string, password: string) {
  const client = admin();
  const { data, error } = await client.auth.admin.listUsers({ perPage: 1000 });
  if (error) throw error;
  for (const user of data.users.filter((user) => user.email === email)) {
    await client.auth.admin.deleteUser(user.id);
  }

  const created = await client.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (created.error) throw created.error;
}

// Waits for the newest email to `address` and returns the first link in it.
export async function latestEmailLink(address: string): Promise<string> {
  if (!mailboxUrl) throw new Error(SKIP_REASON);
  const deadline = Date.now() + 15_000;

  while (Date.now() < deadline) {
    const search = await fetch(
      `${mailboxUrl}/api/v1/search?query=${encodeURIComponent(`to:${address}`)}`,
    );
    const { messages } = (await search.json()) as {
      messages?: { ID: string }[];
    };
    const id = messages?.[0]?.ID;
    if (id) {
      const message = (await (
        await fetch(`${mailboxUrl}/api/v1/message/${id}`)
      ).json()) as { HTML?: string };
      const href = message.HTML?.match(/href="([^"]+)"/)?.[1];
      if (href) return href.replaceAll("&amp;", "&");
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`No email arrived for ${address}`);
}
