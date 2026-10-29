import { NextRequest, NextResponse } from "next/server";
import { bulkUnsubscribe } from "@/lib/bulk-email-service";
import { assertBulkSameOrigin, readBulkBody } from "@/lib/bulk-email-api";
import { bulkUsesLocalStorage } from "@/lib/bulk-email-store";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { createHash } from "node:crypto";
import { enforcePublicRateLimit } from "@/lib/public-api-security";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "Referrer-Policy": "no-referrer", "X-Frame-Options": "DENY", "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'" };
function page(title: string, message: string, form = "", status = 200) {
  return new NextResponse(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title} | Hathor</title><style>body{margin:0;background:#faf8f5;color:#302b24;font:16px Georgia,serif;min-height:100vh;display:grid;place-items:center}main{max-width:520px;padding:48px 24px}h1{font-weight:400;font-size:36px}p{line-height:1.8}small{color:#8f733f;letter-spacing:.18em}button{padding:14px 24px;background:#b69f64;color:#1a1a1a;border:0;cursor:pointer;font-size:15px;min-height:44px}</style></head><body><main><small>HATHOR CORRESPONDENCE</small><h1>${title}</h1><p>${message}</p>${form}</main></body></html>`, { status, headers });
}
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") || "";
  if (!/^[A-Za-z\d_-]{40,1200}$/.test(token)) return page("Link unavailable", "This unsubscribe link is invalid. Please contact the Hathor team for assistance.", "", 400);
  // GET does not change subscription state: mail security scanners follow links automatically.
  return page("Unsubscribe from bulk emails?", "You can stop receiving bulk messages from Hathor. Booking confirmations and personal replies will continue.", `<form method="post"><input type="hidden" name="token" value="${token}"><button type="submit">Confirm unsubscribe</button></form>`);
}
export async function POST(request: NextRequest) {
  try {
    if (!request.headers.get("content-type")?.startsWith("application/x-www-form-urlencoded")) return page("Unable to confirm", "Please open the unsubscribe link in your email and try again.", "", 403);
    const form = new URLSearchParams(new TextDecoder("utf-8", { fatal: true }).decode(await readBulkBody(request, 2048)));
    const oneClick = form.size === 1 && form.get("List-Unsubscribe") === "One-Click";
    // RFC 8058 provider POSTs have no browser Origin/cookies. They must present
    // the encrypted, recipient-bound opt-out capability from List-Unsubscribe.
    // Normal browser confirmation keeps its existing same-origin protection.
    if (!oneClick) assertBulkSameOrigin(request);
    if (bulkUsesLocalStorage()) {
      const key = createHash("sha256").update(getClientIp(request)).digest("hex");
      if (!checkRateLimit(`bulk-unsubscribe:${key}`, 20).allowed) return page("Please wait", "Please try again in a minute.", "", 429);
    } else await enforcePublicRateLimit({ request, scope: "booking-bulk-unsubscribe", limit: 20, windowMs: 60000 });
    await bulkUnsubscribe((oneClick ? request.nextUrl.searchParams.get("token") : form.get("token")) || "");
    return page("You are unsubscribed.", "You will no longer receive bulk emails from Hathor. Your booking emails and direct correspondence are unaffected.");
  } catch { return page("Unable to confirm", "This link could not be processed. Please try again or contact the Hathor team.", "", 400); }
}
