export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) return;

  const { getSharedPgPool } = await import("@/lib/pg-pool");
  const pool = getSharedPgPool(connectionString);

  try {
    await pool.query("SELECT 1");
    console.log("[db] connection pool warmed");
  } catch (error) {
    console.error("[db] pool warmup failed:", error);
  }
}
