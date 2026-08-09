import { headers } from "next/headers";
import type { LiveSiteSettings } from "@/lib/live-site-settings-shared";
import type { PageVisibilitySettings } from "@/lib/page-visibility-shared";
import {
  isLiveSiteWorkHost,
  resolveComingSoonActive,
  resolvePageVisibilityForHost,
  shouldEnforceVisitorGates,
} from "@/lib/live-site-gate-shared";

export {
  isLiveSiteWorkHost,
  resolveComingSoonActive,
  resolvePageVisibilityForHost,
  shouldEnforceVisitorGates,
} from "@/lib/live-site-gate-shared";

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

export async function resolvePageVisibilityForRequest(
  settings: PageVisibilitySettings,
): Promise<PageVisibilitySettings> {
  const hostname = await getRequestHostname();
  return resolvePageVisibilityForHost(settings, hostname);
}
