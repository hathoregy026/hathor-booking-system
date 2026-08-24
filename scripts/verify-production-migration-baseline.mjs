import "dotenv/config";
import pg from "pg";

const rawUrl = process.env.DATABASE_URL?.replace(/^['\"]|['\"]$/g, "");
if (!rawUrl) throw new Error("DATABASE_URL is required");

const client = new pg.Client({
  connectionString: rawUrl,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 30_000,
});

const expectedTables = ["BlogPost", "SiteImage", "SiteSetting"];
const expectedColumns = [
  ["Booking", "totalPriceCents"],
  ["Booking", "currency"],
  ["Booking", "priceSnapshotAt"],
  ["BookingRoom", "unitPriceCents"],
  ["BookingTicket", "unitPriceCents"],
];
const expectedIndexes = [
  "BlogPost_slug_key",
  "BlogPost_publishedAt_idx",
  "Booking_deletedAt_createdAt_idx",
  "Booking_status_deletedAt_createdAt_idx",
  "SiteImage_pagePath_category_idx",
];
const expectedConstraints = [
  "Booking_totalPriceCents_nonnegative",
  "BookingRoom_unitPriceCents_nonnegative",
  "BookingTicket_unitPriceCents_nonnegative",
];

await client.connect();
try {
  for (const table of expectedTables) {
    const result = await client.query("SELECT to_regclass($1) IS NOT NULL AS present", [
      `public.\"${table}\"`,
    ]);
    if (!result.rows[0]?.present) throw new Error(`Missing baseline table: ${table}`);
  }

  for (const [table, column] of expectedColumns) {
    const result = await client.query(
      `SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2`,
      [table, column],
    );
    if (!result.rowCount) throw new Error(`Missing baseline column: ${table}.${column}`);
  }

  for (const index of expectedIndexes) {
    const result = await client.query(
      "SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = $1",
      [index],
    );
    if (!result.rowCount) throw new Error(`Missing baseline index: ${index}`);
  }

  for (const constraint of expectedConstraints) {
    const result = await client.query("SELECT 1 FROM pg_constraint WHERE conname = $1", [
      constraint,
    ]);
    if (!result.rowCount) throw new Error(`Missing baseline constraint: ${constraint}`);
  }

  const rls = await client.query(
    "SELECT relrowsecurity FROM pg_class WHERE oid = 'public.\"SiteSetting\"'::regclass",
  );
  if (!rls.rows[0]?.relrowsecurity) throw new Error("SiteSetting RLS is not enabled");

  console.log("Production schema matches all five baseline migrations.");
} finally {
  await client.end();
}
