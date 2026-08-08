import { headers } from "next/headers";
import type { LiveSiteSettings } from "@/lib/live-site-settings-shared";

/**
 * Hosts where the team keeps working — Coming Soon never applies here,
 * even when Live Site is turned off in admin.
 */
export function isLiveSiteWorkHost(hostname: string): boolean {
  const host = hostname.trim().toLowerCase().replace(/:\d+$/, "");
  if (!host) return false;
  if (host === "localhost" || host === "127.0.0.1" || host === "::1") {
    return true;
  }
  /* All Vercel deployment / production aliases */
  if (host.endsWith(".vercel.app")) return true;
  return false;
}

/**
 * Coming Soon only for client-facing domains (custom domain).
 * Vercel links and localhost always show the real site.
 */
export function resolveComingSoonActive(
  settings: LiveSiteSettings,
  hostname: string | null | undefined,
): boolean {
  if (settings.enabled) return false;
  if (!hostname) return true;
  return !isLiveSiteWorkHost(hostname);
}

export async function getRequestHostname(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = (forwarded || h.get("host") || "").trim();
  return host.replace(/:\d+$/, "").toLowerCase();
}

export async function resolveComingSoonForRequest(
  settings: LiveSiteSettings,
): Promise<boolean> {
  const hostname = await getRequestHostname();
  return resolveComingSoonActive(settings, hostname);
}
