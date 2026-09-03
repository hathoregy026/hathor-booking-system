"use client";

import { useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { PublicLanguageToggle } from "@/components/public/PublicLanguageToggle";
import { SelectionHeaderControls } from "@/components/selection/SelectionHeaderControls";

/**
 * Site-wide phone bottom dock (Saved / Voyage / Language).
 *
 * Mounted once from SiteBookingChrome so every public route gets the same
 * fixed stripe — independent of whether a page shells PublicNavbar.
 * Portal to <body> so header backdrop-filter cannot trap position:fixed.
 */
export function SitePhoneDock() {
  const pathname = usePathname() ?? "/";
  const [host, setHost] = useState<HTMLElement | null>(null);

  const isAdmin =
    pathname === "/admin" || pathname.startsWith("/admin/");

  useLayoutEffect(() => {
    setHost(document.body);
  }, []);

  if (isAdmin || !host) return null;

  return createPortal(
    <div
      className="hathor-phone-dock"
      role="toolbar"
      aria-label="Selections and language"
      data-hathor-phone-dock=""
    >
      <SelectionHeaderControls />
      <PublicLanguageToggle />
    </div>,
    host,
  );
}
