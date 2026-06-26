import type { PrismaClient } from "@/app/generated/prisma/client";

export type PrismaGlobalState = {
  prisma: PrismaClient | undefined;
  dbUrl: string | undefined;
  prismaSchemaVersion: number | undefined;
  prismaPoolGeneration: number | undefined;
};

export const prismaGlobal = globalThis as unknown as PrismaGlobalState;

/** Drop cached Prisma client after connection failures. Does not close the shared pool. */
export function invalidatePrismaClient(): void {
  prismaGlobal.prisma = undefined;
  prismaGlobal.prismaPoolGeneration = undefined;
}
