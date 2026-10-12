import pg from "pg";
import { resolveDatabaseUrl } from "@/lib/database-config";
import { verifiedDatabaseTransport } from "@/lib/database-tls";

// A dedicated pool keeps bulk-mail TLS and connection settings scoped to bulk mail.
const shared = globalThis as unknown as { bulkMailPool?: pg.Pool };
export async function bulkQuery<T extends pg.QueryResultRow>(text: string, values: unknown[] = []): Promise<T[]> {
  const pool = shared.bulkMailPool ??= new pg.Pool({
    ...verifiedDatabaseTransport(resolveDatabaseUrl()),
    max: 4, maxUses: 1, connectionTimeoutMillis: 8000, query_timeout: 20000,
    idleTimeoutMillis: 1000, allowExitOnIdle: true, application_name: "hathor-bulk-mail",
  });
  return (await pool.query<T>(text, values)).rows;
}
