import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { verifyInquiryTurnstile } from "../lib/turnstile";
import { publicTurnstileSiteKey } from "../lib/turnstile-public";
import * as security from "../lib/public-api-security";

const fixtureRequire = createRequire(`${process.cwd()}/package.json`);
const request = (token?: string, extra = {}) => new Request("https://hathor.test/api/contact", {
  method: "POST", headers: { "Content-Type": "application/json", Origin: "https://hathor.test" },
  body: JSON.stringify({ type: "contact", name: "Amira Hassan", email: "guest@example.com", message: "Please help plan our voyage.", turnstileToken: token, ...extra }),
});
const rejectsWith = (status: number) => (error: unknown) => error instanceof security.PublicRequestError && error.status === status;

async function main() {
  const original = { ...process.env };
  try {
    Object.assign(process.env, { NODE_ENV: "production" });
    process.env.TURNSTILE_SECRET_KEY = "fixture-secret";
    process.env.TURNSTILE_ALLOWED_HOSTNAMES = "hathor.test";
    let verificationCalls = 0, verificationResult: Record<string, unknown> = {};
    const valid = () => ({ success: true, hostname: "hathor.test", action: "contact_inquiry", challenge_ts: new Date().toISOString() });
    const fakeFetch: typeof fetch = async (url, options) => {
      verificationCalls++;
      assert.equal(url, "https://challenges.cloudflare.com/turnstile/v0/siteverify");
      assert.equal(options?.redirect, "error");
      assert.equal(options?.cache, "no-store");
      assert.equal((options?.body as URLSearchParams).get("response"), "valid-token");
      return Response.json(verificationResult);
    };
    await assert.rejects(verifyInquiryTurnstile(request(), undefined, "contact", fakeFetch), rejectsWith(400));
    assert.equal(verificationCalls, 0);
    verificationResult = valid();
    await verifyInquiryTurnstile(request(), "valid-token", "contact", fakeFetch);
    for (const override of [
      { success: false, "error-codes": ["timeout-or-duplicate"] },
      { hostname: "attacker.test" }, { action: "charter_inquiry" },
      { challenge_ts: new Date(Date.now() - 301_000).toISOString() },
      { challenge_ts: new Date(Date.now() + 61_000).toISOString() },
      { challenge_ts: undefined },
    ]) {
      verificationResult = { ...valid(), ...override };
      await assert.rejects(verifyInquiryTurnstile(request(), "valid-token", "contact", fakeFetch), rejectsWith(400));
    }
    for (const response of [new Response("invalid JSON"), new Response("x".repeat(16385)), Response.json({ success: "true" }), new Response(null, { status: 502 })]) {
      await assert.rejects(verifyInquiryTurnstile(request(), "valid-token", "contact", async () => response), rejectsWith(503));
    }
    await assert.rejects(verifyInquiryTurnstile(request(), "valid-token", "contact", async () => { throw new Error("offline"); }), rejectsWith(503));
    const before = verificationCalls;
    for (const secret of ["", "1x0000000000000000000000000000000AA", "2x0000000000000000000000000000000AA", "3x0000000000000000000000000000000AA"]) {
      process.env.TURNSTILE_SECRET_KEY = secret;
      await assert.rejects(verifyInquiryTurnstile(request(), "valid-token", "contact", fakeFetch), rejectsWith(503));
    }
    process.env.TURNSTILE_SECRET_KEY = "fixture-secret";
    process.env.TURNSTILE_ALLOWED_HOSTNAMES = "other.test";
    await assert.rejects(verifyInquiryTurnstile(request(), "valid-token", "contact", fakeFetch), rejectsWith(503));
    assert.equal(verificationCalls, before);
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "1x00000000000000000000AA";
    assert.equal(publicTurnstileSiteKey(), "");

    process.env.TURNSTILE_ALLOWED_HOSTNAMES = "hathor.test";
    verificationResult = valid();
    let sent = 0, quarantined = 0;
    const routeExports: { POST?: (request: Request) => Promise<Response> } = {};
    const overrides: Record<string, unknown> = {
      "@/lib/inquiry-email": { sendInquiryEmail: async (payload: Record<string, unknown>) => {
        assert.equal("turnstileToken" in payload, false); sent++; return { receiptSent: true };
      } },
      "@/lib/inquiry-quarantine": { quarantineInquiry: async (payload: Record<string, unknown>) => { assert.equal("turnstileToken" in payload, false); quarantined++; } },
      "@/lib/mail-screening": { screenInquiry: (payload: Record<string, unknown>) => ({ folder: payload.website ? "spam" : "inbox", reasons: [] }) },
      "@/lib/turnstile": { verifyInquiryTurnstile: (req: Request, token: string, type: "contact" | "charter") => verifyInquiryTurnstile(req, token, type, fakeFetch) },
      "@/lib/public-api-security": { ...security, enforcePublicRateLimit: async () => {}, enforceKeyedRateLimit: async () => {} },
      "@/lib/selection-catalog": { isKnownResidenceSlug: () => false, isKnownVoyageSlug: () => false },
      "@/lib/selection-enquiry": { SELECTION_ENQUIRY_LIMITS: { maxSlugLength: 120, maxGuests: 50, maxFavorites: 10 } },
      "@/lib/page-content": { CHARTER_PAGE: { overview: { routes: [] } } },
    };
    const code = ts.transpileModule(readFileSync("app/api/contact/route.ts", "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    runInNewContext(code, { exports: routeExports, console, require: (name: string) => overrides[name] ?? fixtureRequire(name), Buffer, URL });
    assert.equal((await routeExports.POST!(request())).status, 400);
    assert.equal(sent, 0); assert.equal(quarantined, 0);
    verificationResult = { success: false };
    assert.equal((await routeExports.POST!(request("valid-token"))).status, 400);
    assert.equal(sent, 0); assert.equal(quarantined, 0);
    verificationResult = valid();
    assert.equal((await routeExports.POST!(request("valid-token"))).status, 200);
    assert.equal(sent, 1);
    assert.equal((await routeExports.POST!(request(undefined, { website: "bot.test" }))).status, 200);
    assert.equal(sent, 1); assert.equal(quarantined, 1);
    console.log("PASS: Turnstile validates host/action/age, rejects replay and configuration/provider failures, blocks unverified mail, and never stores tokens.");
  } finally {
    for (const key of Object.keys(process.env)) if (!(key in original)) delete process.env[key];
    Object.assign(process.env, original);
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
