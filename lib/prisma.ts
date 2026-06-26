import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma/client";
import { resolveDatabaseUrl } from "@/lib/database-config";
import {
  getPgPoolGeneration,
  getSharedPgPool,
  resetSharedPgPool,
} from "@/lib/pg-pool";
import {
  invalidatePrismaClient,
  prismaGlobal,
} from "@/lib/prisma-state";

export { invalidatePrismaClient } from "@/lib/prisma-state";

const PRISMA_SCHEMA_VERSION = 17;

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
    !prismaGlobal.prisma ||
    prismaGlobal.prismaSchemaVersion !== PRISMA_SCHEMA_VERSION ||
    prismaGlobal.dbUrl !== connectionString ||
    prismaGlobal.prismaPoolGeneration !== poolGeneration;

  if (!needsNewClient && prismaGlobal.prisma) {
    return prismaGlobal.prisma;
  }

  // Drop cached client only — never $disconnect(); that can poison the shared pool.
  prismaGlobal.prisma = createPrismaClient(connectionString);
  prismaGlobal.dbUrl = connectionString;
  prismaGlobal.prismaSchemaVersion = PRISMA_SCHEMA_VERSION;
  prismaGlobal.prismaPoolGeneration = poolGeneration;

  return prismaGlobal.prisma;
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
