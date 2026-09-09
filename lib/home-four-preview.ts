import "server-only";
import { headers } from "next/headers";

/** Explicit server opt-in AND loopback host. Never use NEXT_PUBLIC for this gate. */
export async function homeFourPreviewEnabled(): Promise<boolean> {
  if (process.env.HATHOR_HOME4_LOCAL_PREVIEW !== "1") return false;
  if (process.env.VERCEL || process.env.NETLIFY || process.env.CF_PAGES) return false;
  const host = (await headers()).get("host")?.toLowerCase() ?? "";
  return /^(localhost|127\.0\.0\.1|\[::1\])(?::\d{1,5})?$/.test(host);
}
