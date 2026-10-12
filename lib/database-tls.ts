import type { PoolConfig } from "pg";
import { SUPABASE_DATABASE_CA } from "@/lib/supabase-database-ca";

/** Authenticate remote database certificates and hostnames; URL flags cannot downgrade TLS. */
export function verifiedDatabaseTransport(connectionString: string): Pick<PoolConfig, "connectionString" | "ssl"> {
  const url = new URL(connectionString);
  if (url.protocol !== "postgres:" && url.protocol !== "postgresql:") throw new Error("Invalid database configuration");
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  for (const key of ["ssl", "sslmode", "sslcert", "sslkey", "sslrootcert", "uselibpqcompat"]) url.searchParams.delete(key);
  if (local && process.env.NODE_ENV !== "production") return { connectionString: url.href, ssl: false };
  const configuredCa = process.env.DATABASE_SSL_CA?.replace(/\\n/g, "\n").trim();
  const supabase = url.hostname.endsWith(".pooler.supabase.com") || /^db\.[a-z0-9]+\.supabase\.co$/.test(url.hostname);
  const ca = configuredCa || (supabase ? SUPABASE_DATABASE_CA : undefined);
  return { connectionString: url.href, ssl: { rejectUnauthorized: true, minVersion: "TLSv1.2", ...(ca ? { ca } : {}) } };
}
