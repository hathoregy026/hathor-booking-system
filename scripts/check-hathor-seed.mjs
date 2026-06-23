import "dotenv/config";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 1,
});

try {
  const cruises = await pool.query(
    `SELECT slug, name FROM "Cruise" ORDER BY name`,
  );
  const content = await pool.query(
    `SELECT section::text, title FROM "SiteContent" ORDER BY section::text`,
  );

  console.log(
    JSON.stringify(
      {
        cruises: cruises.rows,
        siteContent: content.rows,
        hathorSlugsPresent: cruises.rows.map((r) => r.slug).filter((s) =>
          [
            "3-nights-aswan-luxor",
            "4-nights-luxor-aswan",
            "7-nights-luxor-aswan-luxor",
          ].includes(s),
        ),
      },
      null,
      2,
    ),
  );
} catch (error) {
  console.error("ERROR:", error.message);
  process.exit(1);
} finally {
  await pool.end();
}
