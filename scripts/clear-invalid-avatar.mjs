import "dotenv/config";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

function isRenderable(url) {
  if (!url?.trim()) return false;
  const value = url.trim();
  if (value.startsWith("data:image/")) {
    const payload = value.slice(value.indexOf(",") + 1);
    return payload.length >= 32;
  }
  return value.startsWith("/uploads/") || value.startsWith("http");
}

try {
  const result = await pool.query(
    `SELECT "avatarUrl" FROM "AdminProfile" WHERE "id" = 'default'`,
  );
  const current = result.rows[0]?.avatarUrl ?? null;

  if (current && !isRenderable(current)) {
    await pool.query(
      `UPDATE "AdminProfile" SET "avatarUrl" = NULL, "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = 'default'`,
    );
    console.log("cleared invalid avatarUrl");
  } else {
    console.log("avatar ok or already empty", current?.slice(0, 40));
  }
} finally {
  await pool.end();
}
