import "dotenv/config";
import { prisma } from "../lib/prisma.ts";

try {
  const profile = await prisma.adminProfile.update({
    where: { id: "default" },
    data: {
      avatarUrl: "/uploads/admin-profile/test.webp",
      displayName: "Admin",
    },
  });
  console.log("ok", profile);
} catch (error) {
  console.error("fail", error);
} finally {
  await prisma.$disconnect();
}
