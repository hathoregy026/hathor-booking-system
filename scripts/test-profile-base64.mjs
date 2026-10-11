/**
 * Local profile-storage regression. The former /api/admin/profile endpoint
 * no longer exists; exercise the remaining persistence module instead.
 * Usage: node scripts/test-profile-base64.mjs (see docs/admin-login.md).
 */
import assert from "node:assert/strict";
import sharp from "sharp";
import { withLocalAdminTest, reportLocalAdminTestFailure } from "./local-admin-test.mjs";

withLocalAdminTest(async ({ prisma }) => {
  const { updateAdminProfileRow } = await import("../lib/admin-profile-pg.ts");
  const { resetDbConnectionHard } = await import("../lib/prisma.ts");
  const previous = await prisma.adminProfile.findUnique({ where: { id: "default" } });
  const webp = await sharp({ create: { width: 1, height: 1, channels: 3, background: "#c9a96e" } }).webp().toBuffer();
  const avatarUrl = "data:image/webp;base64," + webp.toString("base64");
  try {
    await updateAdminProfileRow({ displayName: "Local test profile", avatarUrl });
    const saved = await prisma.adminProfile.findUniqueOrThrow({ where: { id: "default" } });
    assert.equal(saved.avatarUrl, avatarUrl);
    assert.equal(saved.displayName, "Local test profile");
    console.log("PASS: local profile stores a WebP data URL.");
  } finally {
    try {
      if (previous) await prisma.adminProfile.update({ where: { id: previous.id }, data: previous });
      else await prisma.adminProfile.deleteMany({ where: { id: "default" } });
    } finally {
      await resetDbConnectionHard();
    }
  }
}).catch(reportLocalAdminTestFailure);
