import { describe, expect, it } from "vitest";

import { isPreviewRoute } from "@/lib/preview-routes";

describe("isPreviewRoute", () => {
  it.each([
    "/design-system",
    "/design-system/",
    "/design-system/data-table",
    "/Design-System/states",
    "/design%2Dsystem",
    "/design-system%2Fstates",
  ])("matches %s", (pathname) => {
    expect(isPreviewRoute(pathname)).toBe(true);
  });

  it.each(["/", "/design-systems", "/app/design-system", "/%E0%A4%A"])(
    "does not match %s",
    (pathname) => {
      expect(isPreviewRoute(pathname)).toBe(false);
    },
  );
});
