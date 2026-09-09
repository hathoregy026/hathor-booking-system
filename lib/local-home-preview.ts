import "server-only";
import { headers } from "next/headers";

/**
 * Former live homepage at `/home-2` ("Main Home 2").
 * Localhost only — never on Vercel / Netlify / Cloudflare Pages.
 */
export async function mainHomeTwoPreviewEnabled(): Promise<boolean> {
  if (process.env.VERCEL || process.env.NETLIFY || process.env.CF_PAGES) {
    return false;
  }
  const host = (await headers()).get("host")?.toLowerCase() ?? "";
  return /^(localhost|127\.0\.0\.1|\[::1\])(?::\d{1,5})?$/.test(host);
}
