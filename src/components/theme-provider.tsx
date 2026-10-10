"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

// Staff UI defaults to dark (design brief §2); "system" stays selectable.
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
