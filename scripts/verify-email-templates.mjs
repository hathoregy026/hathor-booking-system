import "dotenv/config";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const result = await pool.query(
  'SELECT name, subject FROM "EmailTemplate" ORDER BY name',
);
console.log(result.rows);
await pool.end();
