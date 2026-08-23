/**
 * Database URL + pool settings for Prisma (driver adapter) and node-pg.
 *
 * Prisma URL params (documented in schema.prisma):
 * - connection_limit — maps to pg Pool `max`
 * - pool_timeout — seconds to wait when acquiring a connection (ms internally)
 * - connect_timeout — seconds to wait when opening a new connection (ms internally)
 *
 * Override via env: DATABASE_CONNECTION_LIMIT, DATABASE_POOL_TIMEOUT,
 * DATABASE_CONNECT_TIMEOUT, DATABASE_IDLE_TIMEOUT_MS
 */

export type DatabasePoolConfig = {
  connectionLimit: number;
  poolTimeoutMs: number;
  connectTimeoutMs: number;
  idleTimeoutMs: number;
  maxUses: number;
};

/**
 * Raised from 5. With 5, a single Next page render (layout CMS read + page
 * data + parallel component queries) could saturate the pool, and callers then
 * waited pool_timeout before failing. The database itself allows 60.
 */
const DEFAULT_CONNECTION_LIMIT = 10;
const DEFAULT_POOL_TIMEOUT_SEC = 15;
const DEFAULT_CONNECT_TIMEOUT_SEC = 10;
/**
 * Raised from 5_000. A 5-second idle timeout discarded every connection
 * between page loads, so almost every request had to open new ones. Where
 * opening a connection is slow or unreliable, that turned an occasional
 * problem into a constant one. 30s keeps connections warm across a browsing
 * session while still releasing them well before the pooler would.
 */
const DEFAULT_IDLE_TIMEOUT_MS = 30_000;
const DEFAULT_MAX_USES = 100;

function parsePositiveInt(
  value: string | undefined,
  fallback: number,
  max?: number,
): number {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  if (max !== undefined) return Math.min(parsed, max);
  return parsed;
}

function readUrlInt(url: URL, key: string): number | undefined {
  const raw = url.searchParams.get(key);
  if (!raw) return undefined;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

export function getDatabasePoolConfig(connectionString?: string): DatabasePoolConfig {
  let urlLimit: number | undefined;
  let urlPoolTimeoutSec: number | undefined;
  let urlConnectTimeoutSec: number | undefined;

  if (connectionString) {
    try {
      const url = new URL(connectionString);
      urlLimit = readUrlInt(url, "connection_limit");
      urlPoolTimeoutSec = readUrlInt(url, "pool_timeout");
      urlConnectTimeoutSec = readUrlInt(url, "connect_timeout");
    } catch {
      // Non-URL connection strings fall back to env defaults.
    }
  }

  const connectionLimit = parsePositiveInt(
    process.env.DATABASE_CONNECTION_LIMIT,
    urlLimit ?? DEFAULT_CONNECTION_LIMIT,
    10,
  );

  const poolTimeoutSec = parsePositiveInt(
    process.env.DATABASE_POOL_TIMEOUT,
    urlPoolTimeoutSec ?? DEFAULT_POOL_TIMEOUT_SEC,
    60,
  );

  const connectTimeoutSec = parsePositiveInt(
    process.env.DATABASE_CONNECT_TIMEOUT,
    urlConnectTimeoutSec ?? DEFAULT_CONNECT_TIMEOUT_SEC,
    60,
  );

  const idleTimeoutMs = parsePositiveInt(
    process.env.DATABASE_IDLE_TIMEOUT_MS,
    DEFAULT_IDLE_TIMEOUT_MS,
    60_000,
  );

  return {
    connectionLimit,
    poolTimeoutMs: poolTimeoutSec * 1000,
    connectTimeoutMs: connectTimeoutSec * 1000,
    idleTimeoutMs,
    maxUses: DEFAULT_MAX_USES,
  };
}

/** Ensure Prisma-compatible pool params exist on the connection URL. */
export function normalizeDatabaseUrl(connectionString: string): string {
  try {
    const url = new URL(connectionString);
    const config = getDatabasePoolConfig(connectionString);

    if (!url.searchParams.has("connection_limit")) {
      url.searchParams.set(
        "connection_limit",
        String(config.connectionLimit),
      );
    }

    if (!url.searchParams.has("pool_timeout")) {
      url.searchParams.set(
        "pool_timeout",
        String(Math.ceil(config.poolTimeoutMs / 1000)),
      );
    }

    if (!url.searchParams.has("connect_timeout")) {
      url.searchParams.set(
        "connect_timeout",
        String(Math.ceil(config.connectTimeoutMs / 1000)),
      );
    }

    if (!url.searchParams.has("pgbouncer") && url.port === "6543") {
      url.searchParams.set("pgbouncer", "true");
    }

    return url.toString();
  } catch {
    return connectionString;
  }
}

function stripEnvQuotes(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  // Orphan leading quote (broken .env line) — common on Windows editors.
  if (trimmed.startsWith('"') || trimmed.startsWith("'")) {
    const withoutLeading = trimmed.slice(1);
    if (withoutLeading.endsWith('"') || withoutLeading.endsWith("'")) {
      return withoutLeading.slice(0, -1);
    }
    return withoutLeading;
  }
  return trimmed;
}

export function resolveDatabaseUrl(): string {
  const pooled = process.env.DATABASE_URL
    ? stripEnvQuotes(process.env.DATABASE_URL)
    : "";
  if (!pooled) {
    throw new Error("DATABASE_URL is not set");
  }

  return normalizeDatabaseUrl(pooled);
}

/** Direct (non-pooler) URL for migrations — strip editor quotes the same way. */
export function resolveDirectUrl(): string | undefined {
  const direct = process.env.DIRECT_URL
    ? stripEnvQuotes(process.env.DIRECT_URL)
    : "";
  return direct || undefined;
}
