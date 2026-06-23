import "dotenv/config";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  const columns = await pool.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'AdminProfile' ORDER BY ordinal_position`,
  );
  console.log("columns:", columns.rows);

  const row = await pool.query(`SELECT * FROM "AdminProfile" WHERE id = 'default'`);
  console.log("row:", row.rows);
} catch (error) {
  console.error("ERROR:", error.message);
} finally {
  await pool.end();
}
