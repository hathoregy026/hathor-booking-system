import { createCipheriv, createDecipheriv, createHmac, randomBytes, randomUUID } from "node:crypto";
import { mkdir, open, readFile, readdir, rename, unlink } from "node:fs/promises";
import path from "node:path";
import { bookingQuery } from "@/lib/booking-database";

type RecordEnvelope = { version: number; payload: string; updatedAt: string };
const localDirectory = () => {
  const name = process.env.BULK_EMAIL_LOCAL_DIRECTORY || ".tmp-bulk-email";
  if (!/^\.tmp-bulk-email(?:-[A-Za-z\d-]+)?$/.test(name)) throw new Error("Invalid preview directory.");
  return path.join(process.cwd(), name);
};
export function bulkUsesLocalStorage() {
  const local = process.env.BULK_EMAIL_STORAGE === "local" || (!process.env.BULK_EMAIL_STORAGE && process.env.NODE_ENV === "development");
  if (local && (process.env.VERCEL || process.env.NODE_ENV === "production" || process.env.BULK_EMAIL_MODE === "send")) throw new Error("Local storage is limited to simulated development previews.");
  return local;
}

async function encryptionKey(): Promise<Buffer> {
  if (!bulkUsesLocalStorage()) {
    const key = process.env.BULK_EMAIL_ENCRYPTION_KEY || "";
    if (!/^[a-f\d]{64}$/i.test(key)) throw new Error("Bulk email encryption is not configured.");
    return Buffer.from(key, "hex");
  }
  const directory = localDirectory();
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const filename = path.join(directory, "key");
  try { return await readFile(filename); }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
  const key = randomBytes(32);
  try {
    const handle = await open(filename, "wx", 0o600);
    try { await handle.writeFile(key); } finally { await handle.close(); }
    return key;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
    // Another preview process may be finishing the key write.
    for (let i = 0; i < 10; i++) {
      const existing = await readFile(filename);
      if (existing.length === 32) return existing;
      await new Promise(resolve => setTimeout(resolve, 30));
    }
    throw new Error("Preview storage unavailable.");
  }
}

export async function sealBulkValue(value: unknown, context: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", await encryptionKey(), iv);
  cipher.setAAD(Buffer.from(context));
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(value), "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString("base64url");
}
export async function openBulkValue<T>(value: string, context: string): Promise<T> {
  const data = Buffer.from(value, "base64url");
  if (data.length < 29) throw new Error("Invalid encrypted value.");
  const cipher = createDecipheriv("aes-256-gcm", await encryptionKey(), data.subarray(0, 12));
  cipher.setAuthTag(data.subarray(12, 28)); cipher.setAAD(Buffer.from(context));
  return JSON.parse(Buffer.concat([cipher.update(data.subarray(28)), cipher.final()]).toString("utf8")) as T;
}
export async function suppressionId(email: string) {
  return `suppression:${createHmac("sha256", await encryptionKey()).update(email.toLowerCase()).digest("hex")}`;
}
function recordPath(id: string) {
  if (!/^(campaign:[a-f\d-]{36}|suppression:[a-f\d]{64})$/.test(id)) throw new Error("Invalid record identifier.");
  return path.join(localDirectory(), `${id.replace(":", "-")}.json`);
}
async function readEnvelope(id: string): Promise<RecordEnvelope | null> {
  recordPath(id);
  if (!bulkUsesLocalStorage()) {
    const rows = await bookingQuery<RecordEnvelope>('SELECT version, payload, "updatedAt" FROM bulk_mail.records WHERE id = $1', [id]);
    return rows[0] ?? null;
  }
  try { return JSON.parse(await readFile(recordPath(id), "utf8")) as RecordEnvelope; }
  catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return null; throw error; }
}
export async function readBulkRecord<T>(id: string): Promise<T | null> {
  const row = await readEnvelope(id);
  return row ? openBulkValue<T>(row.payload, id) : null;
}

async function compareAndSwap(id: string, previous: RecordEnvelope | null, next: RecordEnvelope): Promise<boolean> {
  if (!bulkUsesLocalStorage()) {
    const rows = previous
      ? await bookingQuery('UPDATE bulk_mail.records SET payload = $2, version = $3, "updatedAt" = NOW() WHERE id = $1 AND version = $4 RETURNING id', [id, next.payload, next.version, previous.version])
      : await bookingQuery('INSERT INTO bulk_mail.records (id, payload, version) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING RETURNING id', [id, next.payload, next.version]);
    return rows.length === 1;
  }
  await mkdir(localDirectory(), { recursive: true, mode: 0o700 });
  const filename = recordPath(id);
  let handle;
  try { handle = await open(`${filename}.lock`, "wx", 0o600); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === "EEXIST") return false; throw error; }
  const temporary = `${filename}.${randomUUID()}.tmp`;
  try {
    const current = await readEnvelope(id);
    if ((current?.version ?? 0) !== (previous?.version ?? 0)) return false;
    const output = await open(temporary, "wx", 0o600);
    try { await output.writeFile(JSON.stringify(next)); await output.sync(); } finally { await output.close(); }
    // Windows readers/antivirus may briefly hold the destination open. Keep the
    // exclusive writer lock and retry the atomic replace, never delete the old file.
    for (let attempt = 0; ; attempt++) {
      try { await rename(temporary, filename); break; }
      catch (error) {
        if (!["EPERM", "EBUSY", "EACCES"].includes((error as NodeJS.ErrnoException).code || "") || attempt >= 15) throw error;
        await new Promise(resolve => setTimeout(resolve, 30));
      }
    }
    return true;
  } finally {
    await handle.close(); await unlink(`${filename}.lock`);
    await unlink(temporary).catch(() => {});
  }
}

/** Optimistic concurrency: mutation callbacks must be pure and never send mail. */
export async function updateBulkRecord<T>(id: string, mutation: (current: T | null) => T): Promise<T> {
  for (let attempt = 0; attempt < 20; attempt++) {
    const previous = await readEnvelope(id);
    const current = previous ? await openBulkValue<T>(previous.payload, id) : null;
    const next = mutation(current);
    const envelope = { version: (previous?.version ?? 0) + 1, payload: await sealBulkValue(next, id), updatedAt: new Date().toISOString() };
    if (await compareAndSwap(id, previous, envelope)) return next;
    await new Promise(resolve => setTimeout(resolve, 25 + Math.random() * 50));
  }
  throw new Error("Bulk email history is busy. Please retry.");
}

export async function listBulkRecords<T>(): Promise<T[]> {
  if (!bulkUsesLocalStorage()) {
    const rows = await bookingQuery<{ id: string; payload: string }>('SELECT id, payload FROM bulk_mail.records WHERE id LIKE $1 ORDER BY "updatedAt" DESC LIMIT 50', ["campaign:%"]);
    return Promise.all(rows.map(row => openBulkValue<T>(row.payload, row.id)));
  }
  await mkdir(localDirectory(), { recursive: true, mode: 0o700 });
  const filenames = (await readdir(localDirectory())).filter(name => /^campaign-[a-f\d-]{36}\.json$/.test(name));
  const records = await Promise.all(filenames.map(async name => {
    const row = JSON.parse(await readFile(path.join(localDirectory(), name), "utf8")) as RecordEnvelope;
    return { updatedAt: row.updatedAt, value: await openBulkValue<T>(row.payload, `campaign:${name.slice(9, -5)}`) };
  }));
  return records.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 50).map(row => row.value);
}

export async function suppressedBulkEmails(emails: string[]): Promise<Set<string>> {
  const ids = await Promise.all(emails.map(suppressionId));
  if (!bulkUsesLocalStorage()) {
    const rows = await bookingQuery<{ id: string }>('SELECT id FROM bulk_mail.records WHERE id = ANY($1::text[])', [ids]);
    const found = new Set(rows.map(row => row.id));
    return new Set(emails.filter((_, index) => found.has(ids[index])));
  }
  const found = await Promise.all(ids.map(id => readEnvelope(id)));
  return new Set(emails.filter((_, index) => !!found[index]));
}
