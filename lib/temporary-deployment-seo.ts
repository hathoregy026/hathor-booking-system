import type { Metadata } from "next";

/**
 * Vercel preview / hash hosts. Crawlable for QA; X-Robots-Tag keeps them out of the index.
 * www.easytravegypt.com is production and must remain indexable.
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

  return false;
}

/** Preview / hash deploys stay out of the index. Production is indexable. */
export const TEMPORARY_DEPLOYMENT_ROBOTS: NonNullable<Metadata["robots"]> = {
  index: true,
  follow: true,
};

export const PREVIEW_DEPLOYMENT_ROBOTS: NonNullable<Metadata["robots"]> = {
  index: false,
  follow: true,
};

export function robotsForHost(hostname: string): NonNullable<Metadata["robots"]> {
  if (isTemporaryDeploymentHost(hostname)) {
    return PREVIEW_DEPLOYMENT_ROBOTS;
  }

  return { index: true, follow: true };
}

export const TEMPORARY_DEPLOYMENT_ROBOTS_HEADER = "noindex, follow";
