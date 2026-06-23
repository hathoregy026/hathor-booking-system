import "dotenv/config";
import crypto from "node:crypto";
import pg from "pg";
import {
  formatRoomDescription,
  HATHOR_CRUISES,
  HATHOR_SITE_CONTENT,
} from "../lib/hathor-catalog-data.mjs";

const CONTENT_SECTIONS = [
  "ITINERARIES",
  "ROOMS",
  "WELLNESS",
  "GASTRONOMY",
];

function getDmlConnectionString() {
  return process.env.DATABASE_DIRECT_URL ?? process.env.DATABASE_URL;
}

function getDdlConnectionString() {
  if (process.env.DATABASE_DIRECT_URL) {
    return process.env.DATABASE_DIRECT_URL;
  }

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  return url
    .replace(":6543/", ":5432/")
    .replace("pgbouncer=true&", "")
    .replace("&pgbouncer=true", "")
    .replace("?pgbouncer=true", "");
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function query(connectionString, sql, params = []) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const client = new pg.Client({
      connectionString,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 60_000,
      application_name: "hathor-seed",
    });
    client.on("error", () => {});
    try {
      await client.connect();
      const result = await client.query(sql, params);
      await client.end();
      return result;
    } catch (error) {
      lastError = error;
      await client.end().catch(() => {});
      if (attempt < 3) {
        await sleep(attempt * 1000);
      }
    }
  }
  throw lastError;
}

const dml = (sql, params) => query(getDmlConnectionString(), sql, params);
const ddl = (sql, params) => query(getDdlConnectionString(), sql, params);

function createId() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 25);
}

async function ensureContentSections() {
  const existing = await ddl(
    `SELECT e.enumlabel
     FROM pg_type t
     JOIN pg_enum e ON t.oid = e.enumtypid
     WHERE t.typname = 'ContentSection'`,
  );
  const labels = new Set(existing.rows.map((row) => row.enumlabel));
  const missing = CONTENT_SECTIONS.filter((value) => !labels.has(value));

  if (missing.length === 0) {
    console.log("ContentSection enum values already present.");
    return;
  }

  for (const value of missing) {
    await ddl(
      `ALTER TYPE "ContentSection" ADD VALUE IF NOT EXISTS '${value}'`,
    );
  }
  console.log("ContentSection enum values ensured.");
}

function nextDepartureUtc(departureDay, nights) {
  const dayIndex = departureDay === "Wednesday" ? 3 : 6;
  const now = new Date();
  const cursor = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );

  for (let offset = 0; offset < 14; offset += 1) {
    const candidate = new Date(cursor);
    candidate.setUTCDate(candidate.getUTCDate() + offset);
    if (candidate.getUTCDay() === dayIndex && candidate >= cursor) {
      const departureTime = candidate;
      const arrivalTime = new Date(candidate);
      arrivalTime.setUTCDate(arrivalTime.getUTCDate() + nights);
      return { departureTime, arrivalTime };
    }
  }

  const fallback = new Date(cursor);
  fallback.setUTCDate(fallback.getUTCDate() + 7);
  const arrivalTime = new Date(fallback);
  arrivalTime.setUTCDate(arrivalTime.getUTCDate() + nights);
  return { departureTime: fallback, arrivalTime };
}

async function upsertCruise(cruiseSeed) {
  const existing = await dml(
    `SELECT id FROM "Cruise" WHERE slug = $1 LIMIT 1`,
    [cruiseSeed.slug],
  );

  let cruiseId = existing.rows[0]?.id;

  if (cruiseId) {
    await dml(
      `UPDATE "Cruise"
       SET name = $2,
           description = $3,
           ports = $4,
           "basePriceCents" = $5,
           "updatedAt" = NOW()
       WHERE id = $1`,
      [
        cruiseId,
        cruiseSeed.name,
        cruiseSeed.description,
        cruiseSeed.ports,
        cruiseSeed.basePriceCents,
      ],
    );
  } else {
    cruiseId = createId();
    await dml(
      `INSERT INTO "Cruise"
        (id, name, slug, description, ports, "basePriceCents", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
      [
        cruiseId,
        cruiseSeed.name,
        cruiseSeed.slug,
        cruiseSeed.description,
        cruiseSeed.ports,
        cruiseSeed.basePriceCents,
      ],
    );
  }

  const ticket = await dml(
    `SELECT id FROM "TicketType" WHERE "cruiseId" = $1 AND name = 'Per Cabin' LIMIT 1`,
    [cruiseId],
  );

  if (ticket.rows[0]?.id) {
    await dml(
      `UPDATE "TicketType"
       SET description = $2, "priceCents" = $3, "updatedAt" = NOW()
       WHERE id = $1`,
      [
        ticket.rows[0].id,
        "Price per cabin or suite for the full itinerary",
        cruiseSeed.basePriceCents,
      ],
    );
  } else {
    await dml(
      `INSERT INTO "TicketType"
        (id, "cruiseId", name, description, "priceCents", "createdAt", "updatedAt")
       VALUES ($1, $2, 'Per Cabin', $3, $4, NOW(), NOW())`,
      [
        createId(),
        cruiseId,
        "Price per cabin or suite for the full itinerary",
        cruiseSeed.basePriceCents,
      ],
    );
  }

  for (const roomSeed of cruiseSeed.rooms) {
    const priceMultiplier =
      cruiseSeed.basePriceCents > 0
        ? roomSeed.priceCents / cruiseSeed.basePriceCents
        : 1;
    const description = formatRoomDescription(
      roomSeed.description,
      roomSeed.amenities,
    );

    const room = await dml(
      `SELECT id FROM "Room" WHERE "cruiseId" = $1 AND "roomNumber" = $2 LIMIT 1`,
      [cruiseId, roomSeed.roomNumber],
    );

    if (room.rows[0]?.id) {
      await dml(
        `UPDATE "Room"
         SET name = $2,
             "roomType" = $3,
             capacity = $4,
             "priceMultiplier" = $5,
             description = $6,
             "updatedAt" = NOW()
         WHERE id = $1`,
        [
          room.rows[0].id,
          roomSeed.name,
          roomSeed.roomType,
          roomSeed.capacity,
          priceMultiplier,
          description,
        ],
      );
    } else {
      await dml(
        `INSERT INTO "Room"
          (id, "cruiseId", name, "roomNumber", "roomType", capacity, "priceMultiplier", description, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
        [
          createId(),
          cruiseId,
          roomSeed.name,
          roomSeed.roomNumber,
          roomSeed.roomType,
          roomSeed.capacity,
          priceMultiplier,
          description,
        ],
      );
    }
  }

  const { departureTime, arrivalTime } = nextDepartureUtc(
    cruiseSeed.departureDay,
    cruiseSeed.nights,
  );

  const schedule = await dml(
    `SELECT id FROM "CruiseSchedule" WHERE "cruiseId" = $1 ORDER BY "departureTime" ASC LIMIT 1`,
    [cruiseId],
  );

  if (schedule.rows[0]?.id) {
    await dml(
      `UPDATE "CruiseSchedule"
       SET "departureTime" = $2, "arrivalTime" = $3, "updatedAt" = NOW()
       WHERE id = $1`,
      [schedule.rows[0].id, departureTime, arrivalTime],
    );
  } else {
    await dml(
      `INSERT INTO "CruiseSchedule"
        (id, "cruiseId", "departureTime", "arrivalTime", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, NOW(), NOW())`,
      [createId(), cruiseId, departureTime, arrivalTime],
    );
  }

  console.log(
    `Seeded cruise ${cruiseSeed.slug} (${cruiseSeed.rooms.length} rooms)`,
  );
}

async function upsertSiteContent(section, content) {
  const existing = await dml(
    `SELECT id FROM "SiteContent" WHERE section = $1::"ContentSection" LIMIT 1`,
    [section],
  );

  if (existing.rows[0]?.id) {
    await dml(
      `UPDATE "SiteContent"
       SET title = $2,
           subtitle = $3,
           "bodyText" = $4,
           "imageUrl" = $5,
           "updatedAt" = NOW()
       WHERE id = $1`,
      [
        existing.rows[0].id,
        content.title,
        content.subtitle,
        content.bodyText,
        content.imageUrl,
      ],
    );
  } else {
    await dml(
      `INSERT INTO "SiteContent"
        (id, section, title, subtitle, "bodyText", "imageUrl", "createdAt", "updatedAt")
       VALUES ($1, $2::"ContentSection", $3, $4, $5, $6, NOW(), NOW())`,
      [
        createId(),
        section,
        content.title,
        content.subtitle,
        content.bodyText,
        content.imageUrl,
      ],
    );
  }

  console.log(`Seeded SiteContent section ${section}`);
}

try {
  console.log("Seeding Hathor catalog (one connection per query)...");
  await ensureContentSections();

  for (const cruiseSeed of HATHOR_CRUISES) {
    await upsertCruise(cruiseSeed);
  }

  for (const [section, content] of Object.entries(HATHOR_SITE_CONTENT)) {
    await upsertSiteContent(section, content);
  }

  console.log("Hathor seed completed successfully.");
} catch (error) {
  console.error("Seed failed:", error);
  process.exit(1);
}
