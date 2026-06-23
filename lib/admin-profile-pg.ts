import { ADMIN_PROFILE_ID } from "@/lib/admin-profile-constants";
import { withDb } from "@/lib/db-safe";
import { prisma } from "@/lib/prisma";

type AdminProfileRow = {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  lastSeenBookingAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

async function getAdminProfileRowInternal(): Promise<AdminProfileRow> {
  const existing = await prisma.adminProfile.findUnique({
    where: { id: ADMIN_PROFILE_ID },
  });

  if (existing) {
    return existing;
  }

  return prisma.adminProfile.create({
    data: {
      id: ADMIN_PROFILE_ID,
      displayName: "Admin",
    },
  });
}

export async function getAdminProfileRow(): Promise<AdminProfileRow> {
  return withDb(getAdminProfileRowInternal);
}

export async function updateAdminProfileRow(data: {
  displayName?: string;
  avatarUrl?: string | null;
}): Promise<AdminProfileRow> {
  return withDb(async () => {
    await getAdminProfileRowInternal();

    return prisma.adminProfile.update({
      where: { id: ADMIN_PROFILE_ID },
      data: {
        ...(data.displayName !== undefined
          ? { displayName: data.displayName }
          : {}),
        ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl } : {}),
      },
    });
  });
}

export async function markBookingsSeenNow(): Promise<void> {
  await withDb(() =>
    prisma.adminProfile.upsert({
      where: { id: ADMIN_PROFILE_ID },
      create: {
        id: ADMIN_PROFILE_ID,
        displayName: "Admin",
        lastSeenBookingAt: new Date(),
      },
      update: {
        lastSeenBookingAt: new Date(),
      },
    }),
  );
}

export type { AdminProfileRow };
