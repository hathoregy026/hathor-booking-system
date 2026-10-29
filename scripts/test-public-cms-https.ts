import assert from "node:assert/strict";
import { readPublicCmsOverHttps } from "@/lib/public-cms-https";

Object.assign(process.env, { SUPABASE_URL: "https://syntheticproject.supabase.co", SUPABASE_SERVICE_ROLE_KEY: "synthetic-server-secret", DATABASE_URL: "postgresql://postgres.syntheticproject:synthetic@aws-1-eu-north-1.pooler.supabase.com:6543/postgres" });
const original = globalThis.fetch;
let requests = 0;
try {
  const value = JSON.stringify({ heading: "Saved website text", translated: "النص الأصلي", content: "x".repeat(21000) });
  globalThis.fetch = async (url, options) => {
    requests++;
    assert.equal(new URL(String(url)).hostname, "syntheticproject.supabase.co");
    assert.equal(new URL(String(url)).searchParams.get("key"), "in.(website-text)");
    assert.equal(options?.cache, "no-store");
    assert.equal(options?.redirect, "error");
    return Response.json([{ key: "website-text", value }]);
  };
  assert.deepEqual(await readPublicCmsOverHttps(["website-text"]), [{ key: "website-text", value }]);
  process.env.SUPABASE_URL = "https://wrongproject.supabase.co";
  await assert.rejects(() => readPublicCmsOverHttps(["website-text"]), /unavailable/);
  assert.equal(requests, 1, "No credential sent to a different project");
  process.env.SUPABASE_URL = "https://syntheticproject.supabase.co";
  await assert.rejects(() => readPublicCmsOverHttps(['bad,key']));
  globalThis.fetch = async () => Response.json([{ key: "private-admin-setting", value: "synthetic" }]);
  await assert.rejects(() => readPublicCmsOverHttps(["website-text"]));
  globalThis.fetch = async () => Response.json([{ key: "website-text", value }, { key: "website-text", value }]);
  await assert.rejects(() => readPublicCmsOverHttps(["website-text"]));
  globalThis.fetch = async () => new Response("x".repeat(4 * 1024 * 1024 + 1));
  await assert.rejects(() => readPublicCmsOverHttps(["website-text"]), /exceeds/);
  globalThis.fetch = async () => new Response(null, { status: 503 });
  await assert.rejects(() => readPublicCmsOverHttps(["website-text"]), /failed/);
  console.log("PASS: CMS HTTPS preserves large saved text and Unicode, enforces project identity and key allowlists, rejects invalid/oversized responses and fails securely.");
} finally { globalThis.fetch = original; }
