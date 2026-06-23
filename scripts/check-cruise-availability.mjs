import "dotenv/config";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const cruiseName = process.argv[2];

try {
  const cruises = cruiseName
    ? await pool.query(`SELECT id, name FROM "Cruise" WHERE name ILIKE $1`, [
        `%${cruiseName}%`,
      ])
    : await pool.query(`SELECT id, name FROM "Cruise" ORDER BY name`);

  for (const cruise of cruises.rows) {
    const rooms = await pool.query(
      `SELECT COUNT(*)::int AS count FROM "Room" WHERE "cruiseId" = $1`,
      [cruise.id],
    );
    const schedules = await pool.query(
      `SELECT id, "departureTime", "arrivalTime" FROM "CruiseSchedule" WHERE "cruiseId" = $1 ORDER BY "departureTime"`,
      [cruise.id],
    );
    const tickets = await pool.query(
      `SELECT COUNT(*)::int AS count FROM "TicketType" WHERE "cruiseId" = $1`,
      [cruise.id],
    );

    console.log(
      JSON.stringify(
        {
          cruise: cruise.name,
          id: cruise.id,
          rooms: rooms.rows[0].count,
          ticketTypes: tickets.rows[0].count,
          schedules: schedules.rows,
        },
        null,
        2,
      ),
    );
  }
} finally {
  await pool.end();
}
