import { hash, verify, type Options } from "@node-rs/argon2";
import { randomBytes } from "crypto";

/*
 * Password storage: Argon2id (RFC 9106 "second recommended" profile —
 * 64 MiB, 3 passes) with a random per-hash salt, encoded as a PHC string so
 * the parameters travel with the hash and can be raised later.
 */
const ARGON2_OPTIONS: Options = {
  algorithm: 2, // Algorithm.Argon2id (a const enum, unusable under isolatedModules)
  memoryCost: 65_536,
  timeCost: 3,
  parallelism: 1,
  outputLen: 32,
};

export const PASSWORD_MIN_LENGTH = 14;
export const PASSWORD_MAX_LENGTH = 128;

export function hashAdminPassword(password: string): Promise<string> {
  return hash(password, ARGON2_OPTIONS);
}

let dummyHash: Promise<string> | null = null;

/**
 * Verifies the password, or burns the same Argon2 time against a throwaway
 * hash when there is no account. Unknown emails and wrong passwords therefore
 * take equally long, so response timing cannot be used to find valid emails.
 */
export async function verifyAdminPassword(
  passwordHash: string | null,
  password: string,
): Promise<boolean> {
  if (password.length === 0 || password.length > PASSWORD_MAX_LENGTH) {
    passwordHash = null;
  }
  if (!passwordHash) {
    dummyHash ??= hash(randomBytes(32).toString("hex"), ARGON2_OPTIONS);
    await verify(await dummyHash, "not-the-password").catch(() => false);
    return false;
  }
  try {
    return await verify(passwordHash, password);
  } catch {
    return false;
  }
}

/** True when a stored hash predates the current Argon2 parameters. */
export function passwordNeedsRehash(passwordHash: string): boolean {
  const match = /^\$argon2id\$v=19\$m=(\d+),t=(\d+),p=(\d+)\$/.exec(passwordHash);
  if (!match) return true;
  return (
    Number(match[1]) < ARGON2_OPTIONS.memoryCost! ||
    Number(match[2]) < ARGON2_OPTIONS.timeCost! ||
    Number(match[3]) !== ARGON2_OPTIONS.parallelism
  );
}

const COMMON_FRAGMENTS = [
  "password",
  "passw0rd",
  "qwerty",
  "letmein",
  "welcome",
  "admin",
  "hathor",
  "dahabiya",
  "123456",
  "abcdef",
  "iloveyou",
];

/**
 * NIST SP 800-63B-style rules: length over composition. Long passphrases are
 * welcome; short, repetitive or guessable ones are not. Returns a message to
 * show, or null when the password is acceptable.
 */
export function passwordPolicyError(password: string, email?: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Use at least ${PASSWORD_MIN_LENGTH} characters. A short sentence works well.`;
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    return `Use at most ${PASSWORD_MAX_LENGTH} characters.`;
  }
  if (new Set(password).size < 6) {
    return "That password repeats too few characters. Mix in more variety.";
  }
  const lower = password.toLowerCase();
  if (COMMON_FRAGMENTS.some((fragment) => lower.includes(fragment))) {
    return "That password contains a commonly guessed word. Choose something less predictable.";
  }
  const localPart = email?.split("@")[0]?.toLowerCase() ?? "";
  if (localPart.length >= 4 && lower.includes(localPart)) {
    return "Your password must not contain your email name.";
  }
  return null;
}
