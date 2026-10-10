"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

import { CommandPalette } from "./command-palette";
import { activeHref, type NavGroup } from "./navigation";

type AppShellProps = {
  appName: string;
  groups: readonly NavGroup[];
  // Org switcher, notifications and user menu slot in here once the
  // modules behind them exist (T-104, T-107).
  topBarEnd?: React.ReactNode;
  children: React.ReactNode;
};

function NavLink({
  item,
  active,
}: {
  item: NavGroup["items"][number];
  active: boolean;
}) {
  const { isMobile, setOpenMobile } = useSidebar();
  const Icon = item.icon;

  return (
    <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        onClick={() => isMobile && setOpenMobile(false)}
      >
        <Icon strokeWidth={1.75} />
        <span>{item.label}</span>
      </Link>
    </SidebarMenuButton>
  );
}

export function AppShell({
  appName,
  groups,
  topBarEnd,
  children,
}: AppShellProps) {
  const current = activeHref(groups, usePathname());

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "15rem",
          "--sidebar-width-icon": "4rem",
        } as React.CSSProperties
      }
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-surface focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <Sidebar collapsible="icon">
        <SidebarHeader className="h-14 justify-center border-b px-4 group-data-[collapsible=icon]:px-2">
          <span className="truncate font-semibold group-data-[collapsible=icon]:hidden">
            {appName}
          </span>
          <span
            aria-hidden
            className="hidden text-center font-semibold group-data-[collapsible=icon]:block"
          >
            {appName.charAt(0)}
          </span>
        </SidebarHeader>
        <SidebarContent>
          <nav aria-label="Main">
            {groups.map((group) => (
              <SidebarGroup key={group.label}>
                <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.href}>
                        <NavLink item={item} active={item.href === current} />
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </nav>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b bg-background px-4 md:px-6">
          <SidebarTrigger aria-label="Toggle navigation" />
          <div className="flex-1">
            <CommandPalette groups={groups} />
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            {topBarEnd}
          </div>
        </header>
        <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
