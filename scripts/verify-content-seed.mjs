import "dotenv/config";
import pg from "pg";

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
const site = await client.query(
  `SELECT section::text, title
   FROM "SiteContent"
   WHERE section::text = ANY($1::text[])
   ORDER BY section::text`,
  [["HERO", "ABOUT", "WELLNESS", "GASTRONOMY", "CHARTER", "CONTACT"]],
);
const blog = await client.query(`SELECT COUNT(*)::int AS count FROM "BlogPost"`);
console.log("SiteContent rows:", site.rowCount);
for (const row of site.rows) {
  console.log(`  ${row.section}: ${row.title}`);
}
console.log("BlogPost count:", blog.rows[0].count);
await client.end();
