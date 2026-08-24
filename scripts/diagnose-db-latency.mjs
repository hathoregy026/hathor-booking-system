/**
 * Times each phase of connecting to the database, to find where ~20 seconds
 * is going. The database itself answers the calendar's main query in 0.086 ms,
 * so the delay is in DNS, TCP, TLS, or auth.
 *
 * Run:  node --env-file=.env scripts/diagnose-db-latency.mjs
 *
 * Prints timings and the hostname only. No username, password, or full URL is
 * ever printed.
 */
import dns from "node:dns";
import net from "node:net";
import tls from "node:tls";
import { performance } from "node:perf_hooks";

const raw = process.env.DATABASE_URL;
if (!raw) {
  console.error("DATABASE_URL is not set. Run with: node --env-file=.env ...");
  process.exit(1);
}

const url = new URL(raw.replace(/^"|"$/g, ""));
const host = url.hostname;
const port = Number(url.port || 5432);

const ms = (t) => `${(performance.now() - t).toFixed(0)} ms`;

console.log(`host: ${host}`);
console.log(`port: ${port}`);
console.log(`node: ${process.version}`);
console.log(`platform: ${process.platform}`);
console.log("");

// ---------------------------------------------------------------- DNS
async function resolve(label, fn) {
  const t = performance.now();
  try {
    const result = await fn();
    console.log(`DNS ${label.padEnd(22)} ${ms(t).padStart(9)}  ${result}`);
  } catch (error) {
    console.log(`DNS ${label.padEnd(22)} ${ms(t).padStart(9)}  FAILED: ${error.code ?? error.message}`);
  }
}

await resolve("A records (IPv4)", () =>
  dns.promises.resolve4(host).then((a) => a.join(", ")),
);
await resolve("AAAA records (IPv6)", () =>
  dns.promises.resolve6(host).then((a) => a.join(", ")),
);
await resolve("lookup default", () =>
  dns.promises.lookup(host).then((r) => `${r.address} (family ${r.family})`),
);
await resolve("lookup all", () =>
  dns.promises
    .lookup(host, { all: true })
    .then((r) => r.map((x) => `${x.address}/v${x.family}`).join(", ")),
);

console.log("");

// ---------------------------------------------------------------- TCP
function tcpConnect(family) {
  return new Promise((resolve) => {
    const t = performance.now();
    const socket = net.connect({ host, port, family, timeout: 25000 });
    socket.on("connect", () => {
      console.log(`TCP  family ${family || "auto"}`.padEnd(26) + ms(t).padStart(9) + "  connected");
      socket.destroy();
      resolve();
    });
    socket.on("timeout", () => {
      console.log(`TCP  family ${family || "auto"}`.padEnd(26) + ms(t).padStart(9) + "  TIMED OUT");
      socket.destroy();
      resolve();
    });
    socket.on("error", (error) => {
      console.log(`TCP  family ${family || "auto"}`.padEnd(26) + ms(t).padStart(9) + `  FAILED: ${error.code}`);
      resolve();
    });
  });
}

await tcpConnect(0);
await tcpConnect(4);
await tcpConnect(6);

console.log("");

// ---------------------------------------------------------------- TLS
await new Promise((resolve) => {
  const t = performance.now();
  const socket = tls.connect(
    { host, port, servername: host, rejectUnauthorized: false, timeout: 25000 },
    () => {
      console.log(`TLS  handshake`.padEnd(26) + ms(t).padStart(9) + "  ok");
      socket.destroy();
      resolve();
    },
  );
  socket.on("timeout", () => {
    console.log(`TLS  handshake`.padEnd(26) + ms(t).padStart(9) + "  TIMED OUT");
    socket.destroy();
    resolve();
  });
  socket.on("error", (error) => {
    console.log(`TLS  handshake`.padEnd(26) + ms(t).padStart(9) + `  FAILED: ${error.code ?? error.message}`);
    resolve();
  });
});

console.log("");

// ------------------------------------------------- Postgres connect + query
const pg = (await import("pg")).default;

for (let i = 1; i <= 3; i += 1) {
  const client = new pg.Client({
    connectionString: url.toString(),
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 25000,
  });
  const tConnect = performance.now();
  try {
    await client.connect();
    const connectMs = ms(tConnect);
    const tQuery = performance.now();
    await client.query("select 1");
    console.log(
      `PG   attempt ${i}: connect ${connectMs.padStart(9)}   select1 ${ms(tQuery).padStart(9)}`,
    );
    await client.end();
  } catch (error) {
    console.log(`PG   attempt ${i}: FAILED after ${ms(tConnect)} — ${error.message}`);
    try {
      await client.end();
    } catch {}
  }
}

console.log("");
console.log("Interpretation:");
console.log("  ~10s or ~20s on AAAA / TCP family 6  -> IPv6 is black-holing");
console.log("  ~10s+ on TLS handshake               -> TLS inspection (antivirus/firewall)");
console.log("  fast everywhere but slow PG connect  -> auth / pooler side");
console.log("  fast everywhere including PG         -> the delay is inside Next.js, not the network");
