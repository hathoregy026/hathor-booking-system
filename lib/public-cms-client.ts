import dns from "node:dns";
import pg from "pg";
import { resolveDatabaseUrl } from "@/lib/database-config";

/** Prefer IPv4 to avoid multi-second Happy-Eyeballs stalls on some Windows/DNS paths. */
try {
  dns.setDefaultResultOrder("ipv4first");
} catch {
  /* Node < 17 — ignore */
}

export const CMS_CONNECT_TIMEOUT_MS = 8_000;
export const CMS_STATEMENT_TIMEOUT_MS = 6_000;
export const CMS_QUERY_TIMEOUT_MS = 8_000;
/** No application-level retries — fail once and use stale/defaults. */
export const CMS_RETRY_COUNT = 0;
/** Hard cap: one CMS Client in flight per process (no connection stampede). */
export const CMS_MAX_SIMULTANEOUS_CONNECTIONS = 1;
const CMS_CLIENT_END_TIMEOUT_MS = 1_500;

type CmsGlobal = {
  cmsInflight?: Promise<unknown>;
  cmsLastGood?: unknown;
  cmsWarmPromise?: Promise<void>;
  cmsClientChain?: Promise<unknown>;
};

const cmsGlobal = globalThis as unknown as CmsGlobal;

export type CmsTimingStages = {
  connectMs: number;
  settingsMs: number;
  imagesMs: number;
  totalMs: number;
  settingsCount: number;
  imagesCount: number;
  fromStale: boolean;
  fromDefaults: boolean;
};

function withTimeout<T>(
  promise: Promise<T>,
  label: string,
  timeoutMs: number,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`[public-cms] ${label} timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function forceDestroyClient(client: pg.Client): void {
  try {
    const conn = (
      client as unknown as {
        connection?: { stream?: { destroy?: () => void } };
      }
    ).connection;
    conn?.stream?.destroy?.();
  } catch {
    /* ignore */
  }
}

/**
 * Dedicated short-lived pooler Client for CMS (never DIRECT_URL).
 * Isolated from the Prisma shared pool so abandoned Prisma work cannot stall CMS.
 * Always ended in finally; destroy on timeout. Max one CMS client at a time.
 */
export async function withPublicCmsClient<T>(
  run: (client: pg.Client) => Promise<T>,
): Promise<T> {
  const previous = cmsGlobal.cmsClientChain ?? Promise.resolve();
  let releaseGate!: () => void;
  const gate = new Promise<void>((resolve) => {
    releaseGate = resolve;
  });
  cmsGlobal.cmsClientChain = previous.then(() => gate).catch(() => gate);

  await previous.catch(() => {});

  const connectionString = resolveDatabaseUrl();
  const client = new pg.Client({
    connectionString,
    connectionTimeoutMillis: CMS_CONNECT_TIMEOUT_MS,
    ssl: connectionString.includes("localhost")
      ? false
      : { rejectUnauthorized: false },
  });
  client.on("error", () => {});

  let ended = false;
  const endClient = async (destroy: boolean) => {
    if (ended) return;
    ended = true;
    if (destroy) forceDestroyClient(client);
    try {
      await withTimeout(client.end(), "client-end", CMS_CLIENT_END_TIMEOUT_MS);
    } catch {
      forceDestroyClient(client);
    }
  };

  try {
    await withTimeout(client.connect(), "connect", CMS_CONNECT_TIMEOUT_MS);
    await withTimeout(
      client.query(`SET statement_timeout TO ${CMS_STATEMENT_TIMEOUT_MS}`),
      "set-statement-timeout",
      CMS_QUERY_TIMEOUT_MS,
    );
    return await run(client);
  } catch (error) {
    await endClient(true);
    throw error;
  } finally {
    if (!ended) {
      await endClient(false);
    }
    releaseGate();
  }
}

export function singleFlightCms<T>(factory: () => Promise<T>): Promise<T> {
  if (cmsGlobal.cmsInflight) {
    return cmsGlobal.cmsInflight as Promise<T>;
  }
  const pending = factory().finally(() => {
    if (cmsGlobal.cmsInflight === pending) {
      cmsGlobal.cmsInflight = undefined;
    }
  });
  cmsGlobal.cmsInflight = pending;
  return pending;
}

export function getCmsLastGood<T>(): T | undefined {
  return cmsGlobal.cmsLastGood as T | undefined;
}

export function setCmsLastGood<T>(value: T): void {
  cmsGlobal.cmsLastGood = value;
}

/** Best-effort wake via dedicated Client (serialized with other CMS ops). */
export function ensureCmsWarmup(): void {
  if (cmsGlobal.cmsWarmPromise) return;
  cmsGlobal.cmsWarmPromise = (async () => {
    try {
      await withPublicCmsClient(async (client) => {
        await client.query("SELECT 1");
      });
    } catch {
      /* optional */
    }
  })();
}

export { withTimeout };
