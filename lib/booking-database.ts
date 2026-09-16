import pg from "pg";
import { resolveDatabaseUrl } from "@/lib/database-config";
// One atomic statement per connection. A dropped transport cannot strand checkout
// between writes; database functions and exclusion constraints own the transaction.
const shared = globalThis as unknown as { bookingSqlPool?: pg.Pool };
export async function bookingQuery<T extends pg.QueryResultRow>(text: string, values: unknown[] = []): Promise<T[]> {
 const pool = shared.bookingSqlPool ??= new pg.Pool({
  connectionString: resolveDatabaseUrl(), max: 4, maxUses: 1,
  connectionTimeoutMillis: 8000, query_timeout: 20000, idleTimeoutMillis: 1000,
  allowExitOnIdle: true, application_name: "hathor-booking",
  ssl: { rejectUnauthorized: false },
  types: { getTypeParser: (oid: number) => oid === 1114 ? (s: string) => new Date(s.replace(" ","T")+"Z") : pg.types.getTypeParser(oid) },
 });
 // Dates travel as UTC text: node-pg would otherwise send the host's local
 // offset, which a zone-less timestamp column drops, shifting every comparison.
 return (await pool.query<T>(text, values.map(value => value instanceof Date ? value.toISOString() : value))).rows;
}
