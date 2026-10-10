// Internal preview routes (src/app/design-system). Not served in production.
const PREVIEW_ROUTE_PREFIX = "/design-system";

// Rewrite target with no matching route, so Next.js answers 404.
export const NOT_FOUND_PATH = "/404";

export function isPreviewRoute(pathname: string): boolean {
  let path = pathname;
  try {
    path = decodeURIComponent(pathname);
  } catch {
    // Malformed escapes never match a route; compare the raw value.
  }
  path = path.toLowerCase();
  return (
    path === PREVIEW_ROUTE_PREFIX || path.startsWith(`${PREVIEW_ROUTE_PREFIX}/`)
  );
}
