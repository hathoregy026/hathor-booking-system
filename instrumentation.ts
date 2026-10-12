export async function register() {
  // Keep Node-only imports inside the positive runtime branch so Edge builds
  // can remove them without attempting to bundle database drivers.
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { resolveDatabaseUrl } = await import("@/lib/database-config");
    let connectionString: string;
    try {
      connectionString = resolveDatabaseUrl();
    } catch {
      return;
    }

    const { getSharedPgPool } = await import("@/lib/pg-pool");
    const pool = getSharedPgPool(connectionString);

    try {
      await pool.query("SELECT 1");
      console.log("[db] connection pool warmed");
    } catch {
      console.error("[db] pool warmup failed");
    }

    try {
      const { ensureCmsWarmup } = await import("@/lib/public-cms-client");
      ensureCmsWarmup();
    } catch {
      /* optional */
    }
  }
}
