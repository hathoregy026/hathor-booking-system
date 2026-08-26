"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";
import { pathnameToWebsiteTextPage } from "@/lib/website-text-page-key";

/** Tags <html> with the active public page so per-page fonts/sizes can apply. */
export function WebsiteTextPageScope() {
  const pathname = usePathname() ?? "/";

  useLayoutEffect(() => {
    const page = pathnameToWebsiteTextPage(pathname);
    const root = document.documentElement;
    if (page) {
      root.setAttribute("data-wt-page", page);
    } else {
      root.removeAttribute("data-wt-page");
    }
    return () => {
      root.removeAttribute("data-wt-page");
    };
  }, [pathname]);

  return null;
}
