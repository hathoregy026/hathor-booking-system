import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { verifyTurnstile } from "../lib/turnstile";
import * as security from "../lib/public-api-security";
import type { TurnstileAction } from "../lib/turnstile-actions";

const fixtureRequire = createRequire(`${process.cwd()}/package.json`);
const holdBody = { cruiseScheduleId: "fixture-sailing", rooms: [{ roomType: "Luxury King Cabin", adults: 1, children: 0 }] };
const guestBody = {
  bookingId: "fixture-booking", accessToken: "fixture-capability", firstName: "Synthetic", lastName: "Guest",
  email: "booking-fixture@example.invalid", phone: "+201234567890", country: "Egypt", paymentMethod: "BANK_TRANSFER",
  termsAccepted: true, passengers: [{ fullName: "Synthetic Guest", isChild: false, roomIndex: 0 }],
};
const request = (path: string, body: unknown, key = "fixture-booking-captcha-key") => new Request(`https://hathor.test/api/bookings/${path}`, {
  method: "POST", headers: { "Content-Type": "application/json", Origin: "https://hathor.test", "Idempotency-Key": key }, body: JSON.stringify(body),
});

async function main() {
  const original = { ...process.env };
  try {
    Object.assign(process.env, { NODE_ENV: "production", TURNSTILE_SECRET_KEY: "fixture-secret", TURNSTILE_ALLOWED_HOSTNAMES: "hathor.test" });
    let holdCalls = 0, submitCalls = 0, emailCalls = 0;
    const spent = new Set<string>();
    const tokenActions = new Map<string, TurnstileAction>([
      ["hold-token", "booking_hold"], ["second-hold-token", "booking_hold"],
      ["request-token", "booking_request"], ["replay-request-token", "booking_request"],
    ]);
    const fakeVerification: typeof fetch = async (_url, options) => {
      const token = (options?.body as URLSearchParams).get("response")!;
      if (spent.has(token) || !tokenActions.has(token)) return Response.json({ success: false, "error-codes": ["timeout-or-duplicate"] });
      spent.add(token);
      return Response.json({ success: true, hostname: "hathor.test", action: tokenActions.get(token), challenge_ts: new Date().toISOString() });
    };
    let submitted = false;
    const overrides: Record<string, unknown> = {
      "@/lib/public-api-security": { ...security, enforcePublicRateLimit: async () => {}, enforceKeyedRateLimit: async () => {} },
      "@/lib/turnstile": { verifyTurnstile: (req: Request, token: string, action: TurnstileAction) => verifyTurnstile(req, token, action, fakeVerification) },
      "@/lib/booking-access-token": { assertBookingAccessTokenConfiguration: () => {}, createBookingAccessToken: () => "fixture-capability", verifyBookingAccessToken: (id: string, token: string) => id === "fixture-booking" && token === "fixture-capability" },
      "@/lib/booking-engine": {
        acquireBookingHold: async (payload: Record<string, unknown>) => {
          assert.equal("turnstileToken" in payload, false); holdCalls++;
          return { id: "fixture-booking", status: "PENDING_HOLD", holdExpiresAt: new Date(Date.now() + 60_000), totalPriceCents: 400000, currency: "USD", bookingRooms: [{ room: { roomType: "Luxury King Cabin" }, adults: 1, children: 0, unitPriceCents: 400000 }], paymentSchedule: [] };
        },
        submitBookingRequest: async (payload: Record<string, unknown>, key: string) => {
          assert.equal("turnstileToken" in payload, false); assert.equal(key, "fixture-booking-captcha-key"); submitCalls++;
          const replay = submitted; submitted = true; return { booking: { id: "fixture-booking", status: "REQUESTED" }, replay };
        },
      },
      "@/lib/booking-guest-mail": { sendRequestEmails: async () => { emailCalls++; } },
    };
    function load(path: string) {
      const code = ts.transpileModule(readFileSync(path, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
      const exports: { POST?: (request: Request) => Promise<Response> } = {};
      runInNewContext(code, { exports, console, require: (name: string) => overrides[name] ?? fixtureRequire(name), Buffer, URL });
      return exports.POST!;
    }
    const hold = load("app/api/bookings/hold/route.ts");
    const confirm = load("app/api/bookings/confirm/route.ts");
    for (const token of [undefined, "invalid-token", "x".repeat(2049)]) {
      assert.equal((await hold(request("hold", { ...holdBody, turnstileToken: token }))).status, 400);
      assert.equal((await confirm(request("confirm", { ...guestBody, turnstileToken: token }))).status, 400);
    }
    assert.equal(holdCalls, 0); assert.equal(submitCalls, 0); assert.equal(emailCalls, 0);
    assert.equal((await hold(request("hold", { ...holdBody, turnstileToken: "request-token" }))).status, 400, "a final-request token cannot create a hold");
    spent.delete("request-token");
    const held = await hold(request("hold", { ...holdBody, turnstileToken: "hold-token" }));
    assert.equal(held.status, 201);
    assert.equal((await held.json()).totalPriceCents, 400000);
    assert.equal((await hold(request("hold", { ...holdBody, turnstileToken: "hold-token" }))).status, 400, "single-use verification cannot be replayed");
    assert.equal(holdCalls, 1);
    assert.equal((await confirm(request("confirm", { ...guestBody, turnstileToken: "second-hold-token" }))).status, 400, "a hold token cannot submit a final request");
    assert.equal((await confirm(request("confirm", { ...guestBody, accessToken: "wrong", turnstileToken: "request-token" }))).status, 401);
    assert.equal(submitCalls, 0); assert.equal(emailCalls, 0);
    const accepted = await confirm(request("confirm", { ...guestBody, turnstileToken: "request-token" }));
    assert.equal(accepted.status, 200); assert.equal((await accepted.json()).status, "REQUESTED");
    assert.equal(emailCalls, 1);
    assert.equal((await confirm(request("confirm", { ...guestBody, turnstileToken: "request-token" }))).status, 400);
    assert.equal(emailCalls, 1);
    assert.equal((await confirm(request("confirm", { ...guestBody, turnstileToken: "replay-request-token" }))).status, 200, "an idempotent retry can use fresh verification");
    assert.equal(emailCalls, 1, "idempotent retries never resend emails");
    process.env.TURNSTILE_SECRET_KEY = "";
    assert.equal((await hold(request("hold", holdBody))).status, 503);
    assert.equal((await confirm(request("confirm", guestBody))).status, 503);
    assert.equal(holdCalls, 1); assert.equal(submitCalls, 2); assert.equal(emailCalls, 1);
    console.log("PASS: booking hold/request gates, missing/invalid/replayed/wrong-action tokens, capability authorization, secure configuration failure, token stripping, unchanged prices/status and idempotent mail behavior. No real bookings or email.");
  } finally {
    for (const key of Object.keys(process.env)) if (!(key in original)) delete process.env[key];
    Object.assign(process.env, original);
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
