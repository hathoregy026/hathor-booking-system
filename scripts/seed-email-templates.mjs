import "dotenv/config";
import crypto from "node:crypto";
import pg from "pg";

const DEFAULTS = [
  {
    name: "BookingReceived",
    subject: "Your Hathor booking request has been received",
    logoUrl:
      "https://hathor-booking-system.vercel.app/assets/e-mail-logo-egypttoor-booking-cruise-honeymoon.png",
    primaryColor: "#C9A96E",
    backgroundColor: "#FAF8F5",
    heroHeading: "Thank You, {guestName}",
    bodyText:
      "Your booking request has been received. Our team is reviewing your reservation and will contact you within 24 hours to confirm your luxury Nile cruise experience.",
  },
  {
    name: "BookingConfirmed",
    subject: "Your Hathor Dahabiya cruise is confirmed",
    logoUrl:
      "https://hathor-booking-system.vercel.app/assets/e-mail-logo-egypttoor-booking-cruise-honeymoon.png",
    primaryColor: "#C9A96E",
    backgroundColor: "#FAF8F5",
    heroHeading: "Welcome Aboard, {guestName}",
    bodyText:
      "Your Hathor Dahabiya cruise is officially confirmed. We are preparing an unforgettable journey along the Nile, just for you.",
  },
  {
    name: "AdminAlert",
    subject: "New booking request — {guestName}",
    logoUrl:
      "https://hathor-booking-system.vercel.app/assets/e-mail-logo-egypttoor-booking-cruise-honeymoon.png",
    primaryColor: "#C9A96E",
    backgroundColor: "#FAF8F5",
    heroHeading: "New Booking Request",
    bodyText:
      "Please log in to the admin dashboard to review and confirm this booking.",
  },
];

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new pg.Pool({
  connectionString,
  ssl: connectionString.includes("localhost")
    ? false
    : { rejectUnauthorized: false },
});

const upsertSql = `
INSERT INTO "EmailTemplate" (
  "id", "name", "subject", "logoUrl", "primaryColor", "backgroundColor",
  "heroHeading", "bodyText", "updatedAt"
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
ON CONFLICT ("name") DO NOTHING
`;

try {
  for (const template of DEFAULTS) {
    await pool.query(upsertSql, [
      `et_${crypto.randomUUID().replace(/-/g, "").slice(0, 20)}`,
      template.name,
      template.subject,
      template.logoUrl,
      template.primaryColor,
      template.backgroundColor,
      template.heroHeading,
      template.bodyText,
    ]);
    console.log(`Seeded email template: ${template.name}`);
  }
} finally {
  await pool.end();
}
