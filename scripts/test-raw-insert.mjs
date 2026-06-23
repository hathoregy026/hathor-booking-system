import "dotenv/config";
import pg from "pg";

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

await client.connect();

const slug = `raw-test-${Date.now()}`;
const id = `test${Date.now()}`;

try {
  await client.query(
    `INSERT INTO "Cruise" (id, name, slug, "basePriceCents", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, NOW(), NOW())`,
    [id, "Raw insert test", slug, 100],
  );
  console.log("INSERT ok", id);

  await client.query(`DELETE FROM "Cruise" WHERE id = $1`, [id]);
  console.log("DELETE ok");
} catch (error) {
  console.error("FAILED:", error.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
