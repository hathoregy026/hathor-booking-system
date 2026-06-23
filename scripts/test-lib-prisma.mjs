import "dotenv/config";
import { prisma } from "../lib/prisma.ts";

const slug = `tsx-test-${Date.now()}`;

try {
  const cruise = await prisma.cruise.create({
    data: { name: "tsx test", slug, basePriceCents: 1 },
  });
  console.log("created:", cruise.id);
  await prisma.cruise.delete({ where: { id: cruise.id } });
  console.log("deleted");
} catch (error) {
  console.error("FAILED:", error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
