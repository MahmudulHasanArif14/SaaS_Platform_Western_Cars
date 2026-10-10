import { CircleIcon } from "lucide-react";
import { describe, expect, it } from "vitest";

import { activeHref, type NavGroup } from "@/components/app-shell/navigation";

const item = (href: string) => ({ label: href, href, icon: CircleIcon });

const groups: NavGroup[] = [
  { label: "A", items: [item("/app"), item("/app/domains")] },
  { label: "B", items: [item("/app/domains/dns"), item("/app/tasks")] },
];

describe("activeHref", () => {
  it("matches an exact path", () => {
    expect(activeHref(groups, "/app/tasks")).toBe("/app/tasks");
  });

  it("picks the most specific item for a nested path", () => {
    expect(activeHref(groups, "/app/domains/dns/records/1")).toBe(
      "/app/domains/dns",
    );
    expect(activeHref(groups, "/app/domains/example.com")).toBe("/app/domains");
  });

  it("does not match on a shared name prefix", () => {
    expect(activeHref(groups, "/app/tasks-archive")).toBe("/app");
    expect(activeHref(groups, "/application")).toBeUndefined();
  });

  it("returns undefined when nothing matches", () => {
    expect(activeHref(groups, "/other")).toBeUndefined();
  });
});
