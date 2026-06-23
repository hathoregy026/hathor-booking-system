import pg from "pg";

type PoolGlobal = {
  pgPool: pg.Pool | undefined;
  pgPoolUrl: string | undefined;
  pgPoolGeneration: number | undefined;
};

const globalForPool = globalThis as unknown as PoolGlobal;

function poolSsl(connectionString: string): false | { rejectUnauthorized: boolean } {
  if (connectionString.includes("localhost")) return false;
  return { rejectUnauthorized: false };
}

/** Incremented whenever a new pool instance is created — Prisma must rebind to it. */
export function getPgPoolGeneration(): number {
  return globalForPool.pgPoolGeneration ?? 0;
}

/** One shared pool for the whole Node process (critical for Supabase ~15 slot limit). */
export function getSharedPgPool(connectionString: string): pg.Pool {
  const existing = globalForPool.pgPool;
  if (
    existing &&
    globalForPool.pgPoolUrl === connectionString &&
    !existing.ended
  ) {
    return existing;
  }

  // Never call pool.end() here — other Prisma clients may still reference the old pool.
  const pool = new pg.Pool({
    connectionString,
    max: process.env.NODE_ENV === "development" ? 2 : 2,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 8_000,
    keepAlive: true,
    ssl: poolSsl(connectionString),
  });

  pool.on("error", (error) => {
    console.error("[pg-pool] idle client error:", error);
  });

  globalForPool.pgPool = pool;
  globalForPool.pgPoolUrl = connectionString;
  globalForPool.pgPoolGeneration = (globalForPool.pgPoolGeneration ?? 0) + 1;

  return pool;
}

/** Process shutdown only — not for request-time retries. */
export async function resetSharedPgPool(): Promise<void> {
  if (!globalForPool.pgPool) return;
  await globalForPool.pgPool.end().catch(() => {});
  globalForPool.pgPool = undefined;
  globalForPool.pgPoolUrl = undefined;
  globalForPool.pgPoolGeneration = (globalForPool.pgPoolGeneration ?? 0) + 1;
}
