"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { captureAttribution, readAttribution } from "@/lib/ad-attribution";
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

const TAP_KINDS: Record<string, "whatsapp" | "phone" | "email"> = {
  whatsapp_click: "whatsapp",
  phone_click: "phone",
  email_click: "email",
};

/* Saves the tap for the team (kind, page, ad source). Fire-and-forget: survives the tap leaving the page. */
function saveContactTap(eventName: string, page: string): void {
  const kind = TAP_KINDS[eventName];
  if (!kind) return;
  const attribution = readAttribution();
  void fetch("/api/contact-tap", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, page, ...(attribution ? { attribution } : {}) }),
    keepalive: true,
    credentials: "same-origin",
  }).catch(() => {
    /* never block the tap */
  });
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
        const page = window.location.pathname.slice(0, 100);
        trackGaEvent(name, { link_location: page });
        saveContactTap(name, page);
      } catch {
        /* never block the tap */
      }
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
