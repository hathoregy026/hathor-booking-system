import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { PrismaClient } from "@/app/generated/prisma/client";
import {
  EMAIL_TEMPLATE_NAMES,
  getDefaultEmailTemplate,
} from "@/lib/email-templates";

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL or DIRECT_URL is required");
}

const pool = new pg.Pool({
  connectionString,
  ssl: connectionString.includes("localhost")
    ? false
    : { rejectUnauthorized: false },
});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  for (const name of EMAIL_TEMPLATE_NAMES) {
    const defaults = getDefaultEmailTemplate(name);
    await prisma.emailTemplate.upsert({
      where: { name },
      create: {
        name,
        subject: defaults.subject,
        logoUrl: defaults.logoUrl,
        primaryColor: defaults.primaryColor,
        backgroundColor: defaults.backgroundColor,
        heroHeading: defaults.heroHeading,
        bodyText: defaults.bodyText,
      },
      update: {},
    });
    console.log(`Seeded email template: ${name}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
