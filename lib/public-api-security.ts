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

/** Atomic, durable throttling shared by every Vercel instance. */
export async function enforcePublicRateLimit(input: {
  request: Request;
  scope: string;
  limit: number;
  windowMs: number;
}): Promise<void> {
  const key = rateLimitKey(input.scope, input.request);
  const resetAt = new Date(Date.now() + input.windowMs);

  const rows = await prisma.$queryRaw<Array<{ count: number; resetAt: Date }>>(
    Prisma.sql`
      INSERT INTO "ApiRateLimit" ("key", "count", "resetAt", "updatedAt")
      VALUES (${key}, 1, ${resetAt}, NOW())
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE
          WHEN "ApiRateLimit"."resetAt" <= NOW() THEN 1
          ELSE "ApiRateLimit"."count" + 1
        END,
        "resetAt" = CASE
          WHEN "ApiRateLimit"."resetAt" <= NOW() THEN EXCLUDED."resetAt"
          ELSE "ApiRateLimit"."resetAt"
        END,
        "updatedAt" = NOW()
      RETURNING "count", "resetAt"
    `,
  );

  const row = rows[0];
  if (row && row.count > input.limit) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((row.resetAt.getTime() - Date.now()) / 1000),
    );
    throw new RateLimitExceededError(retryAfterSeconds);
  }
}
