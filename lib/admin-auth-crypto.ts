import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  hkdfSync,
  randomBytes,
  randomInt,
  timingSafeEqual,
} from "crypto";
import {
  ADMIN_TOKEN_SIGNING_CONTEXT,
  ADMIN_TOKEN_VERSION,
  adminSessionSecret,
  type AdminTokenKind,
} from "@/lib/admin-auth-edge";

/*
 * Node-side cryptography for the dashboard sign-in. Only standard primitives
 * from node:crypto: HMAC-SHA256 for cookies, SHA-256 for stored token
 * fingerprints, AES-256-GCM for authenticator secrets at rest and HKDF to keep
 * each purpose on its own key.
 */

export class AdminAuthConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminAuthConfigError";
  }
}

function requireSessionSecret(): string {
  const secret = adminSessionSecret();
  if (!secret) {
    throw new AdminAuthConfigError(
      "ADMIN_SESSION_SECRET must be set to at least 32 random characters (openssl rand -hex 32)",
    );
  }
  return secret;
}

/** Throws a readable error when either required secret is missing or weak. */
export function assertAdminAuthConfigured(): void {
  requireSessionSecret();
  masterMfaKey();
}

// ---------------------------------------------------------------------------
// Session / challenge cookies
// ---------------------------------------------------------------------------

function signToken(data: string): string {
  return createHmac("sha256", requireSessionSecret())
    .update(`${ADMIN_TOKEN_SIGNING_CONTEXT}.${data}`)
    .digest("base64url");
}

function safeEqualText(a: string, b: string): boolean {
  const left = createHash("sha256").update(a).digest();
  const right = createHash("sha256").update(b).digest();
  return timingSafeEqual(left, right) && a.length === b.length;
}

/** Fingerprint stored in the database instead of the raw cookie secret. */
export function hashTokenSecret(secret: string): string {
  return createHash("sha256").update(secret, "utf8").digest("hex");
}

export type IssuedAdminToken = {
  /** Cookie value. */
  token: string;
  /** What the database stores to find the session again. */
  tokenHash: string;
};

export function issueAdminToken(
  kind: AdminTokenKind,
  expiresAt: Date,
): IssuedAdminToken {
  const secret = randomBytes(32).toString("base64url");
  const payload = {
    k: kind,
    x: Math.floor(expiresAt.getTime() / 1000),
    t: secret,
  };
  const body = `${ADMIN_TOKEN_VERSION}.${Buffer.from(JSON.stringify(payload), "utf8").toString("base64url")}`;
  return { token: `${body}.${signToken(body)}`, tokenHash: hashTokenSecret(secret) };
}

/**
 * Returns the stored fingerprint for a correctly signed, unexpired token of
 * the expected kind, or null. The caller still has to find a live database
 * row for it.
 */
export function readAdminToken(
  token: string | undefined,
  kind: AdminTokenKind,
): string | null {
  if (!token || token.length > 512 || !adminSessionSecret()) return null;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [version, payloadPart, signaturePart] = parts;
    if (version !== ADMIN_TOKEN_VERSION) return null;
    if (!safeEqualText(signToken(`${version}.${payloadPart}`), signaturePart!)) {
      return null;
    }

    const payload = JSON.parse(
      Buffer.from(payloadPart!, "base64url").toString("utf8"),
    ) as { k?: unknown; x?: unknown; t?: unknown };
    if (payload.k !== kind) return null;
    if (typeof payload.x !== "number" || payload.x <= Math.floor(Date.now() / 1000)) {
      return null;
    }
    if (typeof payload.t !== "string" || payload.t.length < 40) return null;

    return hashTokenSecret(payload.t);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Authenticator secrets at rest
// ---------------------------------------------------------------------------

function masterMfaKey(): Buffer {
  const raw = process.env.ADMIN_MFA_ENCRYPTION_KEY?.trim() ?? "";
  let key: Buffer | null = null;
  if (/^[0-9a-f]{64}$/i.test(raw)) {
    key = Buffer.from(raw, "hex");
  } else if (/^[A-Za-z0-9+/_-]{43,44}=?$/.test(raw)) {
    const decoded = Buffer.from(raw.replace(/-/g, "+").replace(/_/g, "/"), "base64");
    if (decoded.length === 32) key = decoded;
  }
  if (!key) {
    throw new AdminAuthConfigError(
      "ADMIN_MFA_ENCRYPTION_KEY must be 32 random bytes as 64 hex characters (openssl rand -hex 32)",
    );
  }
  return key;
}

function derivedKey(purpose: string): Buffer {
  return Buffer.from(
    hkdfSync("sha256", masterMfaKey(), Buffer.alloc(0), `hathor-admin:${purpose}`, 32),
  );
}

const SECRET_BOX_VERSION = "v1";

/**
 * AES-256-GCM with the owning user's id as associated data, so a ciphertext
 * copied onto another account's row fails to decrypt.
 */
export function encryptMfaSecret(plaintext: string, userId: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", derivedKey("totp-secret-v1"), iv);
  cipher.setAAD(Buffer.from(`totp:${userId}`, "utf8"));
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [
    SECRET_BOX_VERSION,
    iv.toString("base64url"),
    ciphertext.toString("base64url"),
    tag.toString("base64url"),
  ].join(".");
}

export function decryptMfaSecret(sealed: string, userId: string): string {
  const [version, ivPart, ciphertextPart, tagPart] = sealed.split(".");
  if (version !== SECRET_BOX_VERSION || !ivPart || !ciphertextPart || !tagPart) {
    throw new Error("Unrecognised authenticator secret format");
  }
  const decipher = createDecipheriv(
    "aes-256-gcm",
    derivedKey("totp-secret-v1"),
    Buffer.from(ivPart, "base64url"),
  );
  decipher.setAAD(Buffer.from(`totp:${userId}`, "utf8"));
  decipher.setAuthTag(Buffer.from(tagPart, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(ciphertextPart, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

// ---------------------------------------------------------------------------
// Recovery codes
// ---------------------------------------------------------------------------

/* No 0/o, 1/l/i: codes get read off paper and typed by hand. */
const RECOVERY_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";
export const RECOVERY_CODE_COUNT = 10;

/** 10 characters from a 31-symbol alphabet: ~49 bits each, single use. */
export function generateRecoveryCodes(count = RECOVERY_CODE_COUNT): string[] {
  return Array.from({ length: count }, () => {
    let code = "";
    for (let index = 0; index < 10; index += 1) {
      code += RECOVERY_ALPHABET[randomInt(RECOVERY_ALPHABET.length)];
    }
    return `${code.slice(0, 5)}-${code.slice(5)}`;
  });
}

export function normalizeRecoveryCode(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function looksLikeRecoveryCode(input: string): boolean {
  const normalized = normalizeRecoveryCode(input);
  return normalized.length === 10 && [...normalized].every((char) => RECOVERY_ALPHABET.includes(char));
}

/** Keyed hash: a leaked table cannot be brute-forced without the server key. */
export function hashRecoveryCode(code: string, userId: string): string {
  return createHmac("sha256", derivedKey("recovery-code-v1"))
    .update(`${userId}:${normalizeRecoveryCode(code)}`)
    .digest("hex");
}
