"use client";

import {
  CircleDotIcon,
  LayoutListIcon,
  PaletteIcon,
  TableIcon,
} from "lucide-react";

import { AppShell } from "@/components/app-shell/app-shell";
import type { NavGroup } from "@/components/app-shell/navigation";
import { APP_NAME } from "@/lib/app";

const GROUPS: NavGroup[] = [
  {
    label: "Foundations",
    items: [{ label: "Tokens", href: "/design-system", icon: PaletteIcon }],
  },
  {
    label: "Components",
    items: [
      {
        label: "Status and actions",
        href: "/design-system/components",
        icon: CircleDotIcon,
      },
      {
        label: "Data table",
        href: "/design-system/data-table",
        icon: TableIcon,
      },
      {
        label: "Page states",
        href: "/design-system/states",
        icon: LayoutListIcon,
      },
    ],
  },
];

export function DesignSystemShell({ children }: { children: React.ReactNode }) {
  return (
    <AppShell appName={APP_NAME} groups={GROUPS}>
      {children}
    </AppShell>
  );
}
