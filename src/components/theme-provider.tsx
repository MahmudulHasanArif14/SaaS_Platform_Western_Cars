"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

// Staff UI defaults to dark (design brief §2); "system" stays selectable.
// `nonce` lets the pre-paint theme script run under the CSP (ISSUE-008).
export function ThemeProvider({
  children,
  nonce,
}: {
  children: React.ReactNode;
  nonce?: string;
}) {
  return (
    <NextThemesProvider
      nonce={nonce}
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
