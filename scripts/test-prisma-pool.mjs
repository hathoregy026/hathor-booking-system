import "dotenv/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client.ts";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 3,
});

pool.on("error", (error) => {
  console.error("pool error:", error.message);
});

const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

try {
  const count = await prisma.cruise.count();
  console.log("count:", count);

  const slug = `test-${Date.now()}`;
  const cruise = await prisma.cruise.create({
    data: {
      name: "Prisma pool test",
      slug,
      basePriceCents: 100,
    },
  });
  console.log("created:", cruise.id);

  await prisma.cruise.delete({ where: { id: cruise.id } });
  console.log("deleted test row");
} catch (error) {
  console.error("FAILED:", error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
  await pool.end();
}
