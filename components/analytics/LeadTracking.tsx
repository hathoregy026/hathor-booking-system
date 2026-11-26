"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { captureAttribution } from "@/lib/ad-attribution";
import { trackGaEvent } from "@/lib/ga-browser";
import { trackMetaEvent } from "@/lib/meta-pixel";

/*
 * Site-wide lead signals for Google Analytics (and the Google Ads goals that
 * import them): WhatsApp, phone and email taps, plus where the visitor came
 * from. Renders nothing. Staff pages under /admin are never tracked.
 */

function leadEventFor(href: string): string | null {
  const value = href.trim().toLowerCase();
  if (value.startsWith("https://wa.me") || value.startsWith("http://wa.me") || value.includes("api.whatsapp.com") || value.startsWith("whatsapp:")) {
    return "whatsapp_click";
  }
  if (value.startsWith("tel:")) return "phone_click";
  if (value.startsWith("mailto:")) return "email_click";
  return null;
}

export function LeadTracking() {
  const pathname = usePathname();

  useEffect(() => {
    captureAttribution();
    /* One Meta page view per route; skipped on staff pages and token links. */
    trackMetaEvent("PageView");
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      try {
        if (window.location.pathname.startsWith("/admin")) return;
        const target = event.target as Element | null;
        const link = target?.closest?.("a[href]") as HTMLAnchorElement | null;
        if (!link) return;
        const name = leadEventFor(link.getAttribute("href") ?? "");
        if (!name) return;
        trackGaEvent(name, { link_location: window.location.pathname.slice(0, 100) });
      } catch {
        /* never block the tap */
      }
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
