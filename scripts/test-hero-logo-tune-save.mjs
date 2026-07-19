/**
 * End-to-end hero-logo-tune Save test against production Vercel.
 * Usage: node --env-file=.env scripts/test-hero-logo-tune-save.mjs
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const BASE =
  process.env.TEST_BASE_URL?.replace(/\/$/, "") ||
  "https://hathor-booking-system.vercel.app";

function loadPassword() {
  if (process.env.ADMIN_PASSWORD?.trim()) return process.env.ADMIN_PASSWORD.trim();
  try {
    const env = readFileSync(resolve(process.cwd(), ".env"), "utf8");
    const match = env.match(/^ADMIN_PASSWORD=(.*)$/m);
    if (match) {
      return match[1].trim().replace(/^["']|["']$/g, "");
    }
  } catch {
    /* ignore */
  }
  throw new Error("ADMIN_PASSWORD not found");
}

function parseSetCookie(header) {
  if (!header) return null;
  const first = Array.isArray(header) ? header[0] : header.split(/,(?=[^;]+?=)/)[0];
  return first.split(";")[0];
}

async function main() {
  const password = loadPassword();
  const marker = 71; // unique small change to prove Save

  console.log(`Base: ${BASE}`);

  const loginRes = await fetch(`${BASE}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  const loginBody = await loginRes.json().catch(() => ({}));
  if (!loginRes.ok) {
    throw new Error(`Login failed ${loginRes.status}: ${JSON.stringify(loginBody)}`);
  }

  const rawCookie =
    loginRes.headers.getSetCookie?.()?.[0] ||
    loginRes.headers.get("set-cookie");
  const cookie = parseSetCookie(rawCookie);
  if (!cookie) throw new Error("No session cookie from login");

  const getRes = await fetch(`${BASE}/api/admin/hero-logo-tune`, {
    headers: { Cookie: cookie },
    cache: "no-store",
  });
  const getData = await getRes.json();
  if (!getRes.ok) {
    throw new Error(`GET tune failed ${getRes.status}: ${JSON.stringify(getData)}`);
  }

  const previous = getData.tune;
  const next = { ...previous, gapTButton: marker };

  const putRes = await fetch(`${BASE}/api/admin/hero-logo-tune`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
    body: JSON.stringify({ tune: next }),
  });
  const putData = await putRes.json().catch(() => ({}));
  if (!putRes.ok) {
    throw new Error(`PUT tune failed ${putRes.status}: ${JSON.stringify(putData)}`);
  }
  console.log("PUT ok:", putData.tune?.gapTButton, putData.savedAt);

  const pubRes = await fetch(`${BASE}/api/hero-logo-tune?t=${Date.now()}`, {
    cache: "no-store",
  });
  const pubData = await pubRes.json();
  if (pubData.tune?.gapTButton !== marker) {
    throw new Error(
      `Public API mismatch: expected gapTButton=${marker}, got ${pubData.tune?.gapTButton}`,
    );
  }
  console.log("Public API ok: gapTButton =", pubData.tune.gapTButton);

  const homeRes = await fetch(`${BASE}/?t=${Date.now()}`, { cache: "no-store" });
  const html = await homeRes.text();
  if (!html.includes(`--hathor-gap-t-btn: ${marker}px`)) {
    throw new Error(`Homepage HTML missing --hathor-gap-t-btn: ${marker}px`);
  }
  console.log("Homepage HTML ok: contains --hathor-gap-t-btn:", marker);

  // Restore previous so we don't leave a random test value
  const restoreRes = await fetch(`${BASE}/api/admin/hero-logo-tune`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
    body: JSON.stringify({ tune: previous }),
  });
  if (!restoreRes.ok) {
    console.warn("Restore previous tune failed", restoreRes.status);
  } else {
    console.log("Restored previous gapTButton =", previous.gapTButton);
  }

  console.log("PASS: Save → public API → homepage SSR all work");
}

main().catch((err) => {
  console.error("FAIL:", err.message || err);
  process.exit(1);
});
