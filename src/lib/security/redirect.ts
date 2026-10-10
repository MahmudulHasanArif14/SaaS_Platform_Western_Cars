// SEC-A07: a post-login destination must be a path on this site.
const BASE = "http://internal.invalid";

export function safeNextPath(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  // Must start with a single "/"; "//host" and "/\host" leave the site.
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  if (/[\\\u0000-\u001f\u007f]/.test(value)) return fallback;

  let url: URL;
  try {
    url = new URL(value, BASE);
  } catch {
    return fallback;
  }
  if (url.origin !== BASE) return fallback;
  // Dot segments can collapse into "//host" ("/..//host").
  if (url.pathname.startsWith("//")) return fallback;

  return `${url.pathname}${url.search}${url.hash}`;
}
