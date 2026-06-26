export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

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
  } catch (error) {
    console.error("[db] pool warmup failed:", error);
  }
}
