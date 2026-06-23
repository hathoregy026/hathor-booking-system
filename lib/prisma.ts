import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma/client";
import {
  getPgPoolGeneration,
  getSharedPgPool,
  resetSharedPgPool,
} from "@/lib/pg-pool";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  dbUrl: string | undefined;
  prismaSchemaVersion: number | undefined;
  prismaPoolGeneration: number | undefined;
};

const PRISMA_SCHEMA_VERSION = 16;

function resolveDatabaseUrl(): string {
  const pooled = process.env.DATABASE_URL?.trim();
  if (pooled) return pooled;

  throw new Error("DATABASE_URL is not set");
}

function createPrismaClient(connectionString: string): PrismaClient {
  const pool = getSharedPgPool(connectionString);
  const adapter = new PrismaPg(pool, { disposeExternalPool: false });

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function getPrismaClient(): PrismaClient {
  const connectionString = resolveDatabaseUrl();
  const poolGeneration = getPgPoolGeneration();
  const needsNewClient =
    !globalForPrisma.prisma ||
    globalForPrisma.prismaSchemaVersion !== PRISMA_SCHEMA_VERSION ||
    globalForPrisma.dbUrl !== connectionString ||
    globalForPrisma.prismaPoolGeneration !== poolGeneration;

  if (!needsNewClient && globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  // Drop cached client only — never $disconnect(); that can poison the shared pool.
  globalForPrisma.prisma = createPrismaClient(connectionString);
  globalForPrisma.dbUrl = connectionString;
  globalForPrisma.prismaSchemaVersion = PRISMA_SCHEMA_VERSION;
  globalForPrisma.prismaPoolGeneration = poolGeneration;

  return globalForPrisma.prisma;
}

/** Drop cached Prisma client after connection failures. Does not close the shared pool. */
export function invalidatePrismaClient(): void {
  globalForPrisma.prisma = undefined;
  globalForPrisma.prismaPoolGeneration = undefined;
}

/** @deprecated Use invalidatePrismaClient — kept for call-site compatibility. */
export async function resetDbConnection(): Promise<void> {
  invalidatePrismaClient();
}

/** Full pool teardown — use only on shutdown or manual recovery, not during retries. */
export async function resetDbConnectionHard(): Promise<void> {
  invalidatePrismaClient();
  await resetSharedPgPool();
}

/** Always resolves the live singleton — survives hot reload and pool resets. */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient();
    const value = Reflect.get(client, prop, client) as unknown;
    if (typeof value === "function") {
      return (value as (...args: unknown[]) => unknown).bind(client);
    }
    return value;
  },
});
