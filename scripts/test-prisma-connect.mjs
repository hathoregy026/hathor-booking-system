import "dotenv/config";

const { PrismaClient } = await import("../app/generated/prisma/client.ts");
const { PrismaPg } = await import("@prisma/adapter-pg");
const pg = (await import("pg")).default;

const start = Date.now();
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,
  connectionTimeoutMillis: 20_000,
});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

try {
  const count = await prisma.booking.count({ where: { deletedAt: null } });
  console.log(`Prisma OK — ${count} bookings (${Date.now() - start}ms)`);
} catch (error) {
  console.log(
    `Prisma FAIL — ${error instanceof Error ? error.message : error} (${Date.now() - start}ms)`,
  );
} finally {
  await prisma.$disconnect();
  await pool.end();
}
