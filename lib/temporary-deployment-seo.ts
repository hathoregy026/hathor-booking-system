import type { Metadata } from "next";

/**
 * Hosts serving the redesigned Hathor site before production launch.
 * These must stay crawlable for QA but must not be indexed as competing copies.
 */
export function isTemporaryDeploymentHost(hostname: string): boolean {
  const host = hostname.trim().toLowerCase().replace(/:\d+$/, "");
  if (!host) return false;

  if (host === "localhost" || host === "127.0.0.1" || host === "::1") {
    return false;
  }

  if (host.endsWith(".vercel.app")) {
    return true;
  }

  if (host === "easytravegypt.com" || host === "www.easytravegypt.com") {
    return true;
  }

  return false;
}

export const TEMPORARY_DEPLOYMENT_ROBOTS: NonNullable<Metadata["robots"]> = {
  index: false,
  follow: true,
};

export function robotsForHost(hostname: string): NonNullable<Metadata["robots"]> {
  if (isTemporaryDeploymentHost(hostname)) {
    return TEMPORARY_DEPLOYMENT_ROBOTS;
  }

  return { index: true, follow: true };
}

export const TEMPORARY_DEPLOYMENT_ROBOTS_HEADER = "noindex, follow";
