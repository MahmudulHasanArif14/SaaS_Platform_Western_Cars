"use client";

import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { THEMES } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import type { NavGroup } from "./navigation";

// ⌘K / Ctrl+K. Navigation and theme only for now; entity search and quick
// actions join when the modules that own them exist.
export function CommandPalette({ groups }: { groups: readonly NavGroup[] }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { setTheme } = useTheme();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((current) => !current);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  function run(action: () => void) {
    setOpen(false);
    action();
  }

  return (
    <>
      <Button
        variant="outline"
        className="w-full max-w-sm justify-start text-muted-foreground max-md:size-8 max-md:w-8 max-md:justify-center max-md:px-0"
        aria-label="Open command menu"
        aria-keyshortcuts="Meta+K Control+K"
        onClick={() => setOpen(true)}
      >
        <SearchIcon strokeWidth={1.75} />
        <span className="max-md:hidden">Search or jump to…</span>
        <kbd className="ml-auto rounded-sm border bg-surface-2 px-1.5 font-mono text-xs max-md:hidden">
          ⌘K
        </kbd>
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Command menu"
        description="Jump to a page or change a setting."
      >
        <Command>
          <CommandInput placeholder="Type a command or search…" />
          <CommandList>
            <CommandEmpty>No matching commands.</CommandEmpty>
            {groups.map((group) => (
              <CommandGroup key={group.label} heading={group.label}>
                {group.items.map(({ href, label, icon: Icon }) => (
                  <CommandItem
                    key={href}
                    value={`${group.label} ${label}`}
                    onSelect={() => run(() => router.push(href))}
                  >
                    <Icon strokeWidth={1.75} />
                    {label}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
            <CommandGroup heading="Theme">
              {THEMES.map(({ value, label, icon: Icon }) => (
                <CommandItem
                  key={value}
                  value={`Theme ${label}`}
                  onSelect={() => run(() => setTheme(value))}
                >
                  <Icon strokeWidth={1.75} />
                  {label} theme
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
