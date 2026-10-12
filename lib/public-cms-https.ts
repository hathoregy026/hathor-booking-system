import { z } from "zod";
import { resolveDatabaseUrl } from "@/lib/database-config";

/** Server-only fallback for large result stalls on the PostgreSQL network path.
 * Reads the same allowlisted rows; never changes content or accepts client keys.
 */
export async function readPublicCmsOverHttps(keys: readonly string[]) {
  z.array(z.string().min(1).max(128).regex(/^[a-z\d-]+$/)).min(1).max(32).parse(keys);
  const endpoint = new URL(process.env.SUPABASE_URL || "");
  const project = /^([a-z\d]+)\.supabase\.co$/.exec(endpoint.hostname)?.[1];
  const database = new URL(resolveDatabaseUrl());
  const sameProject = project && (database.hostname === `db.${project}.supabase.co` || decodeURIComponent(database.username).endsWith(`.${project}`));
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!sameProject || endpoint.protocol !== "https:" || endpoint.username || endpoint.password || !secret) throw new Error("CMS HTTPS connection is unavailable.");
  endpoint.pathname = "/rest/v1/SiteSetting";
  endpoint.search = "";
  endpoint.hash = "";
  endpoint.searchParams.set("select", "key,value");
  endpoint.searchParams.set("key", `in.(${keys.join(",")})`);
  const response = await fetch(endpoint, {
    headers: { apikey: secret, Authorization: `Bearer ${secret}` },
    cache: "no-store", redirect: "error", signal: AbortSignal.timeout(8000),
  });
  if (!response.ok || !response.body) throw new Error("CMS HTTPS read failed.");
  const reader = response.body.getReader();
  const buffers: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const part = await reader.read();
      if (part.done) break;
      size += part.value.byteLength;
      if (size > 4 * 1024 * 1024) { await reader.cancel(); throw new Error("CMS response exceeds the limit."); }
      buffers.push(part.value);
    }
  } finally { reader.releaseLock(); }
  const rows = z.array(z.object({ key: z.string().refine(key => keys.includes(key)), value: z.string().max(256000) }).strict()).max(keys.length).parse(JSON.parse(Buffer.concat(buffers).toString("utf8")));
  if (new Set(rows.map(row => row.key)).size !== rows.length) throw new Error("CMS response contains duplicate keys.");
  return rows;
}
