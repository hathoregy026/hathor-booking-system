import {
  DEFAULT_PAGE_VISIBILITY_SETTINGS,
  type PageVisibilitySettings,
} from "@/lib/page-visibility-shared";
import type { LiveSiteSettings } from "@/lib/live-site-settings-shared";

/**
 * Hosts where the team keeps working — visitor gates never apply here,
 * even when Live Site / Pages toggles hide content on the main domain.
 *
 * Custom domains (e.g. easytravegypt.com) enforce admin page gates.
 * Only Vercel deployment aliases and localhost bypass them for preview.
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
 * True on the client-facing custom domain — Coming Soon + per-page
 * Coming Soon apply. False on Vercel links and localhost.
 */
export function shouldEnforceVisitorGates(
  hostname: string | null | undefined,
): boolean {
  if (!hostname) return true;
  return !isLiveSiteWorkHost(hostname);
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
  return shouldEnforceVisitorGates(hostname);
}

/**
 * Per-page Coming Soon only on the main domain.
 * Work hosts always receive all-live settings so editors can keep previewing.
 */
export function resolvePageVisibilityForHost(
  settings: PageVisibilitySettings,
  hostname: string | null | undefined,
): PageVisibilitySettings {
  if (!shouldEnforceVisitorGates(hostname)) {
    return DEFAULT_PAGE_VISIBILITY_SETTINGS;
  }
  return settings;
}
