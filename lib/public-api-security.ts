import { bookingQuery } from "@/lib/booking-database";
import { createHash } from "crypto";
import { Prisma } from "@/app/generated/prisma/client";
import { getClientIp } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";

const MAX_PUBLIC_JSON_BYTES = 32 * 1024;

export class PublicRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "PublicRequestError";
  }
}

export class RateLimitExceededError extends Error {
  constructor(readonly retryAfterSeconds: number) {
    super("Too many requests. Please wait and try again.");
    this.name = "RateLimitExceededError";
  }
}

export function assertTrustedPublicJsonRequest(request: Request): void {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.startsWith("application/json")) {
    throw new PublicRequestError("Content-Type must be application/json", 415);
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_PUBLIC_JSON_BYTES) {
    throw new PublicRequestError("Request body is too large", 413);
  }

  const fetchSite = request.headers.get("sec-fetch-site")?.toLowerCase();
  if (fetchSite === "cross-site") {
    throw new PublicRequestError("Cross-site request rejected", 403);
  }

  const origin = request.headers.get("origin");
  if (!origin) return;

  let requestOrigin: string;
  try {
    requestOrigin = new URL(request.url).origin;
  } catch {
    throw new PublicRequestError("Invalid request origin", 400);
  }

  if (origin !== requestOrigin) {
    throw new PublicRequestError("Cross-origin request rejected", 403);
  }
}

/** Read JSON with an actual byte limit, including chunked requests without Content-Length. */
export async function readPublicJsonBody(request: Request): Promise<unknown> {
  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).byteLength > MAX_PUBLIC_JSON_BYTES) {
    throw new PublicRequestError("Request body is too large", 413);
  }

  try {
    return JSON.parse(rawBody) as unknown;
  } catch {
    throw new PublicRequestError("Invalid request body", 400);
  }
}

export function requireIdempotencyKey(request: Request): string {
  const value = request.headers.get("idempotency-key")?.trim() ?? "";
  if (!/^[A-Za-z0-9._:-]{16,128}$/.test(value)) {
    throw new PublicRequestError("A valid Idempotency-Key header is required", 400);
  }
  return value;
}

function rateLimitKey(scope: string, request: Request): string {
  const ip = getClientIp(request);
  return createHash("sha256").update(`${scope}:${ip}`).digest("hex");
}

/** Same durable counter, keyed by an arbitrary value instead of the caller's IP. */
export async function enforceKeyedRateLimit(input: {
  scope: string;
  keyValue: string;
  limit: number;
  windowMs: number;
  weight?: number;
  bookingScoped?: boolean;
}): Promise<void> {
  const key = createHash("sha256")
    .update(`${input.scope}:${input.keyValue}`)
    .digest("hex");
  return runRateLimitQuery(key, input.limit, input.windowMs, input.weight, input.bookingScoped ?? false);
}

/**
 * Atomic, durable throttling shared by every Vercel instance.
 *
 * `weight` lets one call consume more than one unit of budget — e.g. a hold
 * request for N cabins should cost N units, not 1, or an attacker can take
 * out the whole calendar in a handful of requests that each individually
 * look cheap.
 */
export async function enforcePublicRateLimit(input: {
  request: Request;
  scope: string;
  limit: number;
  windowMs: number;
  weight?: number;
}): Promise<void> {
  const key = rateLimitKey(input.scope, input.request);
  return runRateLimitQuery(
    key,
    input.limit,
    input.windowMs,
    input.weight,
    input.scope.startsWith("booking"),
  );
}

async function runRateLimitQuery(
  key: string,
  limit: number,
  windowMs: number,
  weightInput: number | undefined,
  bookingScoped: boolean,
): Promise<void> {
  const resetAt = new Date(Date.now() + windowMs);
  const weight = Math.max(1, Math.trunc(weightInput ?? 1));

  const query = Prisma.sql`
      INSERT INTO "ApiRateLimit" ("key", "count", "resetAt", "updatedAt")
      VALUES (${key}, ${weight}, ${resetAt}, NOW())
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE
          WHEN "ApiRateLimit"."resetAt" <= NOW() THEN ${weight}
          ELSE "ApiRateLimit"."count" + ${weight}
        END,
        "resetAt" = CASE
          WHEN "ApiRateLimit"."resetAt" <= NOW() THEN EXCLUDED."resetAt"
          ELSE "ApiRateLimit"."resetAt"
        END,
        "updatedAt" = NOW()
      RETURNING "count", "resetAt"
    `;
  const rows = bookingScoped
    ? await bookingQuery<{count:number;resetAt:Date}>(query.text,query.values)
    : await prisma.$queryRaw<Array<{count:number;resetAt:Date}>>(query);

  const row = rows[0];
  if (row && row.count > limit) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((row.resetAt.getTime() - Date.now()) / 1000),
    );
    throw new RateLimitExceededError(retryAfterSeconds);
  }
}
