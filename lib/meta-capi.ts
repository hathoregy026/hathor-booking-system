import { createHash } from "node:crypto";
import { META_PIXEL_ID } from "@/lib/meta-pixel";
import { isCustomDomainLive } from "@/lib/public-url";

/*
 * Server copy of the two events that matter most — booking requests and
 * enquiry forms — sent to Meta's Conversions API, so they are counted even when
 * a browser blocks the pixel. The browser sends the same event id, so Meta
 * keeps one of each.
 *
 * Personal details leave this server only as SHA-256 hashes, as Meta requires,
 * and are never logged. Dormant until META_CAPI_ACCESS_TOKEN is set in Vercel
 * (Production) and only on the hathorcruise.com build. Best-effort: a failure
 * here never affects the booking or the message.
 */

const GRAPH_VERSION = "v21.0";
const TIMEOUT_MS = 4000;

export type MetaServerEvent = {
  eventName: "Purchase" | "Lead";
  eventId: string;
  request: Request;
  /** Page the event belongs to. Never a URL that carries an access token. */
  sourcePath: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  /** Meta click id from the ad that brought the visitor, if any. */
  fbclid?: string;
  /** When that click happened (ms). */
  clickTs?: number;
  value?: number;
  currency?: string;
  contentName?: string;
};

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function hashed(value: string | undefined, normalize: (v: string) => string): string[] | undefined {
  if (!value) return undefined;
  const normalized = normalize(value);
  return normalized ? [sha256(normalized)] : undefined;
}

const normalizeEmail = (v: string) => v.trim().toLowerCase();
const normalizePhone = (v: string) => v.replace(/[^0-9]/g, "");
const normalizeName = (v: string) => v.trim().toLowerCase();

function readCookie(request: Request, name: string): string | undefined {
  const header = request.headers.get("cookie");
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) {
      const value = rest.join("=").trim();
      return /^fb\.\d\.\d+\.[A-Za-z0-9_\-.]{1,500}$/.test(value) ? value : undefined;
    }
  }
  return undefined;
}

function clientIp(request: Request): string | undefined {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip")?.trim();
  return ip && ip.length <= 45 ? ip : undefined;
}

export function isMetaServerTrackingOn(): boolean {
  return Boolean(process.env.META_CAPI_ACCESS_TOKEN?.trim()) && isCustomDomainLive();
}

export async function sendMetaServerEvent(event: MetaServerEvent): Promise<void> {
  const token = process.env.META_CAPI_ACCESS_TOKEN?.trim();
  if (!token || !isCustomDomainLive()) return;
  try {
    const fbp = readCookie(event.request, "_fbp");
    const fbc =
      readCookie(event.request, "_fbc") ??
      (event.fbclid ? `fb.1.${event.clickTs ?? Date.now()}.${event.fbclid}` : undefined);
    const userAgent = event.request.headers.get("user-agent")?.slice(0, 512) || undefined;

    const userData: Record<string, unknown> = {
      em: hashed(event.email, normalizeEmail),
      ph: hashed(event.phone, normalizePhone),
      fn: hashed(event.firstName, normalizeName),
      ln: hashed(event.lastName, normalizeName),
      client_ip_address: clientIp(event.request),
      client_user_agent: userAgent,
      fbp,
      fbc,
    };
    for (const key of Object.keys(userData)) if (userData[key] === undefined) delete userData[key];

    const customData: Record<string, unknown> = {};
    if (typeof event.value === "number" && event.value > 0) {
      customData.value = Math.round(event.value * 100) / 100;
      customData.currency = (event.currency || "USD").toUpperCase();
    }
    if (event.contentName) customData.content_name = event.contentName;

    const origin = "https://www.hathorcruise.com";
    const body = {
      data: [
        {
          event_name: event.eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: event.eventId,
          action_source: "website",
          event_source_url: `${origin}${event.sourcePath}`,
          user_data: userData,
          custom_data: customData,
        },
      ],
      access_token: token,
    };

    const pixelId = process.env.META_PIXEL_ID?.trim() || META_PIXEL_ID;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const response = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${pixelId}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      if (!response.ok) console.warn(`[meta] server event not accepted (${response.status})`);
    } finally {
      clearTimeout(timer);
    }
  } catch (error) {
    console.warn(`[meta] server event failed (${error instanceof Error ? error.name : "unknown"})`);
  }
}
