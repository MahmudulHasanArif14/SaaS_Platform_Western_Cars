"use client";

import { setNonce } from "get-nonce";
import { useEffect } from "react";

// Radix dialogs, sheets and menus lock page scroll with a <style> element
// injected at runtime. This gives that element the CSP nonce.
export function StyleNonce({ nonce }: { nonce?: string }) {
  useEffect(() => {
    if (nonce) setNonce(nonce);
  }, [nonce]);

  return null;
}
