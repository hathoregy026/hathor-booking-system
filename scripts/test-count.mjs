import "dotenv/config";
import { prisma } from "../lib/prisma.ts";
console.log("count", await prisma.cruise.count());
await prisma.$disconnect();
