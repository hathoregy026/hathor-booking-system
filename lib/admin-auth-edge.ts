export const ADMIN_SESSION_COOKIE = "admin_session";

const SESSION_MESSAGE = "hathor-admin-session";

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function createSessionToken(secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(SESSION_MESSAGE),
  );

  return bufferToHex(signature);
}

export async function verifySessionToken(
  token: string | undefined,
): Promise<boolean> {
  const secret = process.env.ADMIN_PASSWORD;
  if (!token || !secret) return false;

  try {
    const expected = await createSessionToken(secret);
    if (token.length !== expected.length) return false;

    let mismatch = 0;
    for (let index = 0; index < token.length; index += 1) {
      mismatch |= token.charCodeAt(index) ^ expected.charCodeAt(index);
    }

    return mismatch === 0;
  } catch {
    return false;
  }
}
