import "dotenv/config";
import pg from "pg";

const base = "http://localhost:3000";
const roomId = "cm0seed0001room0000002";
const scheduleId = "cm0seed0001schedule00001";

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

const holdExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
const insert = await client.query(
  `INSERT INTO "Booking" (id, "cruiseScheduleId", status, "holdExpiresAt", "createdAt", "updatedAt")
   VALUES (gen_random_uuid()::text, $1, 'PENDING_HOLD', $2, NOW(), NOW())
   RETURNING id`,
  [scheduleId, holdExpiresAt],
);
const bookingId = insert.rows[0].id;
await client.end();

console.log("bookingId", bookingId);

const confirm = await fetch(`${base}/api/bookings/confirm`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    bookingId,
    customerName: "KHLID",
    customerEmail: "khlid@example.com",
    roomIds: [roomId],
    tickets: [],
  }),
});
const data = await confirm.json();
console.log("confirm", confirm.status, data);
