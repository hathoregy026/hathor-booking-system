import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../app/generated/prisma/client.js";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 2,
});

const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const slug = `test-cruise-${Date.now()}`;

try {
  const cruise = await prisma.cruise.create({
    data: {
      name: "Connection test cruise",
      slug,
      basePriceCents: 10000,
    },
  });
  console.log("Created:", cruise.id, cruise.slug);
  await prisma.cruise.delete({ where: { id: cruise.id } });
  console.log("Deleted test cruise — create works.");
} catch (error) {
  console.error("Create failed:", error);
  process.exit(1);
} finally {
  await prisma.$disconnect();
  await pool.end();
}
