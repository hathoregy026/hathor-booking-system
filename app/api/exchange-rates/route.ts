import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { getExchangeRates } from "@/lib/exchange-rates";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const key = createHash("sha256").update(getClientIp(request)).digest("hex");
  const limit = checkRateLimit(`exchange-rates:${key}`, 30, 60_000);
  if (!limit.allowed) return NextResponse.json({ error: "Please wait before refreshing exchange rates." }, {
    status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds), "Cache-Control": "no-store" },
  });
  try {
    return NextResponse.json(await getExchangeRates(), {
      headers: { "Cache-Control": "public, max-age=300, s-maxage=3600", "X-Content-Type-Options": "nosniff" },
    });
  } catch {
    console.error("[exchange-rates] Valid daily rates are unavailable");
    return NextResponse.json({ error: "Currency conversion is temporarily unavailable. Prices are shown in USD." }, {
      status: 503, headers: { "Cache-Control": "no-store", "Retry-After": "60" },
    });
  }
}
