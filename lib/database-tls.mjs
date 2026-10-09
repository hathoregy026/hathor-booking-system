/**
 * TLS for every Postgres connection this project opens with node-postgres —
 * the app's pools (lib/pg-pool.ts, lib/booking-database.ts,
 * lib/public-cms-client.ts) and the maintenance scripts in scripts/.
 * Plain JS so both the Next app and `node scripts/*.mjs` share ONE copy.
 *
 * Rules:
 *   · localhost / 127.0.0.1 / ::1 → no TLS (local Docker or Postgres.app).
 *   · anything else → TLS that verifies the server certificate against
 *     DATABASE_CA_CERT and checks the host name. There is no "encrypt but
 *     don't verify" mode: that is what let any machine on the network path
 *     pose as the database and collect its password.
 *
 * Supabase signs database and pooler certificates with its own CA, which is
 * not in Node's built-in trust store. Download it from Supabase → Project
 * Settings → Database → SSL Configuration → "Download certificate"
 * (prod-ca-2021.crt) and put its contents in DATABASE_CA_CERT. For a host
 * with a publicly trusted certificate, set DATABASE_CA_CERT=system instead.
 *
 * TLS parameters inside the URL (sslmode, sslrootcert, …) are removed before
 * the URL reaches node-postgres. node-postgres lets them override the `ssl`
 * option, so `sslmode=no-verify` — or `require`, which it now treats as
 * "verify against the built-in CAs only" — would otherwise silently replace
 * the settings below.
 */

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

const URL_TLS_PARAMS = [
  "ssl",
  "sslmode",
  "sslrootcert",
  "sslcert",
  "sslkey",
  "sslcrl",
  "sslpassword",
  "uselibpqcompat",
];

export class DatabaseTlsConfigError extends Error {
  /** @param {string} message */
  constructor(message) {
    super(message);
    this.name = "DatabaseTlsConfigError";
  }
}

/**
 * Host name from a postgres:// URL, or null when it cannot be parsed.
 * @param {string} connectionString
 * @returns {string | null}
 */
export function databaseHost(connectionString) {
  try {
    return new URL(connectionString).hostname.toLowerCase() || null;
  } catch {
    return null;
  }
}

/**
 * True only when the URL's host really is this machine. (The old check looked
 * for "localhost" anywhere in the URL, so a password or database name
 * containing that word switched TLS off for a remote server.)
 * @param {string} connectionString
 */
export function isLocalDatabase(connectionString) {
  const host = databaseHost(connectionString);
  return host !== null && LOCAL_HOSTS.has(host);
}

/** @returns {string | "system" | null} */
function configuredCa() {
  let raw = process.env.DATABASE_CA_CERT?.trim() ?? "";
  if (
    (raw.startsWith('"') && raw.endsWith('"')) ||
    (raw.startsWith("'") && raw.endsWith("'"))
  ) {
    raw = raw.slice(1, -1).trim();
  }
  if (!raw) return null;
  if (raw.toLowerCase() === "system") return "system";

  const pem = raw.includes("-----BEGIN CERTIFICATE-----")
    ? raw.replace(/\\n/g, "\n")
    : Buffer.from(raw, "base64").toString("utf8");
  if (!pem.includes("-----BEGIN CERTIFICATE-----")) {
    throw new DatabaseTlsConfigError(
      "DATABASE_CA_CERT must be a PEM certificate (the contents of prod-ca-2021.crt), its base64 encoding, or the word system.",
    );
  }
  return pem;
}

/**
 * The `ssl` option for node-postgres.
 * @param {string} connectionString
 * @returns {false | { ca?: string; rejectUnauthorized: true }}
 */
export function databaseTlsOptions(connectionString) {
  if (isLocalDatabase(connectionString)) return false;

  const ca = configuredCa();
  if (!ca) {
    const host = databaseHost(connectionString) ?? "the database";
    throw new DatabaseTlsConfigError(
      `DATABASE_CA_CERT is not set, so the connection to ${host} cannot be verified and was refused. ` +
        "Download the CA from Supabase → Project Settings → Database → SSL Configuration and paste it into DATABASE_CA_CERT " +
        "(or set DATABASE_CA_CERT=system for a publicly trusted certificate).",
    );
  }
  // Node verifies the chain and the host name (pg sets servername to the host).
  return ca === "system" ? { rejectUnauthorized: true } : { ca, rejectUnauthorized: true };
}

/**
 * Spread into `new pg.Pool({...})` / `new pg.Client({...})`.
 * @param {string | undefined} connectionString
 * @returns {{ connectionString: string; ssl: false | { ca?: string; rejectUnauthorized: true } }}
 */
export function pgConnectionOptions(connectionString) {
  if (!connectionString) {
    throw new DatabaseTlsConfigError("DATABASE_URL is not set");
  }
  const ssl = databaseTlsOptions(connectionString);
  let cleaned = connectionString;
  try {
    const url = new URL(connectionString);
    for (const param of URL_TLS_PARAMS) url.searchParams.delete(param);
    cleaned = url.toString();
  } catch {
    // Not URL-shaped (e.g. key=value form); pg parses it as-is.
  }
  return { connectionString: cleaned, ssl };
}
