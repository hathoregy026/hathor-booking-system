/**
 * Offline checks for the dashboard sign-in primitives (no database needed):
 *   npm run verify:admin-auth
 *
 * Covers the RFC 4226 / RFC 6238 test vectors, cookie signing and tamper
 * detection (Node and edge implementations must agree), authenticator-secret
 * encryption, recovery codes and the password policy.
 */
import assert from "node:assert/strict";
import { randomBytes } from "crypto";

process.env.ADMIN_SESSION_SECRET = randomBytes(32).toString("hex");
process.env.ADMIN_MFA_ENCRYPTION_KEY = randomBytes(32).toString("hex");

async function main() {
  const totp = await import("@/lib/admin-totp");
  const crypto = await import("@/lib/admin-auth-crypto");
  const edge = await import("@/lib/admin-auth-edge");
  const password = await import("@/lib/admin-password");

  let passed = 0;
  const check = async (name: string, run: () => void | Promise<void>) => {
    await run();
    passed += 1;
    console.log(`  ✔ ${name}`);
  };

  const rfcKey = Buffer.from("12345678901234567890", "ascii");

  await check("RFC 4226 HOTP vectors", () => {
    const expected = ["755224", "287082", "359152", "969429", "338314", "254676", "287922", "162583", "399871", "520489"];
    expected.forEach((code, counter) => assert.equal(totp.hotp(rfcKey, counter), code));
  });

  await check("RFC 6238 TOTP (SHA-1) vectors", () => {
    const vectors: Array<[number, string]> = [
      [59, "94287082"],
      [1111111109, "07081804"],
      [1111111111, "14050471"],
      [1234567890, "89005924"],
      [2000000000, "69279037"],
      [20000000000, "65353130"],
    ];
    for (const [seconds, code] of vectors) {
      assert.equal(totp.hotp(rfcKey, totp.totpStep(seconds * 1000), 8), code);
    }
  });

  await check("base32 matches RFC 4648 and round-trips", () => {
    assert.equal(totp.base32Encode(rfcKey), "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ");
    const secret = totp.generateTotpSecret();
    assert.equal(secret.length, 32);
    assert.equal(totp.base32Encode(totp.base32Decode(secret)), secret);
  });

  await check("TOTP accepts ±1 step only, rejects junk", () => {
    const secret = totp.generateTotpSecret();
    const key = totp.base32Decode(secret);
    const now = Date.now();
    const step = totp.totpStep(now);
    assert.equal(totp.verifyTotp(secret, totp.hotp(key, step), now), step);
    assert.equal(totp.verifyTotp(secret, totp.hotp(key, step - 1), now), step - 1);
    assert.equal(totp.verifyTotp(secret, totp.hotp(key, step + 1), now), step + 1);
    assert.equal(totp.verifyTotp(secret, totp.hotp(key, step - 2), now), null);
    assert.equal(totp.verifyTotp(secret, "12345", now), null);
    assert.equal(totp.verifyTotp(secret, "12345a", now), null);
  });

  await check("otpauth URI is well-formed", () => {
    const uri = new URL(totp.totpKeyUri("JBSWY3DPEHPK3PXP", "a@b.com"));
    assert.equal(uri.protocol, "otpauth:");
    assert.equal(uri.searchParams.get("secret"), "JBSWY3DPEHPK3PXP");
    assert.equal(uri.searchParams.get("issuer"), totp.TOTP_ISSUER);
  });

  await check("session tokens: valid, tampered, wrong kind, expired", async () => {
    const future = new Date(Date.now() + 60_000);
    const { token, tokenHash } = crypto.issueAdminToken("s", future);
    assert.equal(crypto.readAdminToken(token, "s"), tokenHash);
    assert.equal(await edge.hasSignedAdminToken(token, "s"), true);

    assert.equal(crypto.readAdminToken(token, "c"), null, "a session token is not a challenge token");
    assert.equal(await edge.hasSignedAdminToken(token, "c"), false);

    const [version, payload, signature] = token.split(".");
    const forged = JSON.parse(Buffer.from(payload!, "base64url").toString("utf8"));
    forged.x += 3600;
    const tampered = `${version}.${Buffer.from(JSON.stringify(forged)).toString("base64url")}.${signature}`;
    assert.equal(crypto.readAdminToken(tampered, "s"), null);
    assert.equal(await edge.hasSignedAdminToken(tampered, "s"), false);

    const flipped = `${token.slice(0, -2)}${token.endsWith("A") ? "BB" : "AA"}`;
    assert.equal(crypto.readAdminToken(flipped, "s"), null);

    const expired = crypto.issueAdminToken("s", new Date(Date.now() - 1000)).token;
    assert.equal(crypto.readAdminToken(expired, "s"), null);
    assert.equal(await edge.hasSignedAdminToken(expired, "s"), false);

    const original = process.env.ADMIN_SESSION_SECRET;
    process.env.ADMIN_SESSION_SECRET = randomBytes(32).toString("hex");
    assert.equal(crypto.readAdminToken(token, "s"), null, "rotating the secret kills old cookies");
    process.env.ADMIN_SESSION_SECRET = "too-short";
    assert.equal(await edge.hasSignedAdminToken(token, "s"), false, "weak secret fails closed");
    assert.throws(() => crypto.issueAdminToken("s", future), crypto.AdminAuthConfigError);
    process.env.ADMIN_SESSION_SECRET = original;
  });

  await check("authenticator secrets: AES-256-GCM bound to the user", () => {
    const sealed = crypto.encryptMfaSecret("JBSWY3DPEHPK3PXP", "user-a");
    assert.notEqual(sealed, crypto.encryptMfaSecret("JBSWY3DPEHPK3PXP", "user-a"), "fresh IV each time");
    assert.equal(crypto.decryptMfaSecret(sealed, "user-a"), "JBSWY3DPEHPK3PXP");
    assert.throws(() => crypto.decryptMfaSecret(sealed, "user-b"));
    const parts = sealed.split(".");
    parts[2] = Buffer.from("tampered").toString("base64url");
    assert.throws(() => crypto.decryptMfaSecret(parts.join("."), "user-a"));
    const original = process.env.ADMIN_MFA_ENCRYPTION_KEY;
    process.env.ADMIN_MFA_ENCRYPTION_KEY = "short";
    assert.throws(() => crypto.encryptMfaSecret("x", "user-a"), crypto.AdminAuthConfigError);
    process.env.ADMIN_MFA_ENCRYPTION_KEY = original;
  });

  await check("recovery codes: format, uniqueness, forgiving input", () => {
    const codes = crypto.generateRecoveryCodes();
    assert.equal(codes.length, 10);
    assert.equal(new Set(codes).size, 10);
    for (const code of codes) {
      assert.match(code, /^[a-z2-9]{5}-[a-z2-9]{5}$/);
      assert.equal(crypto.looksLikeRecoveryCode(code), true);
    }
    const hash = crypto.hashRecoveryCode(codes[0]!, "user-a");
    assert.equal(crypto.hashRecoveryCode(codes[0]!.toUpperCase().replace("-", " "), "user-a"), hash);
    assert.notEqual(crypto.hashRecoveryCode(codes[0]!, "user-b"), hash);
    assert.equal(crypto.looksLikeRecoveryCode("123456"), false);
  });

  await check("password policy", () => {
    assert.ok(password.passwordPolicyError("short"));
    assert.ok(password.passwordPolicyError("aaaaaaaaaaaaaaaaaa"));
    assert.ok(password.passwordPolicyError("my hathor boat ride 2026"));
    assert.ok(password.passwordPolicyError("correct horse password battery"));
    assert.ok(password.passwordPolicyError("mohamed-likes-long-walks", "mohamed@hathorcruise.com"));
    assert.equal(password.passwordPolicyError("Nile sunsets taste of mint tea"), null);
  });

  await check("Argon2id hashing, verification and rehash detection", async () => {
    const hash = await password.hashAdminPassword("Nile sunsets taste of mint tea");
    assert.match(hash, /^\$argon2id\$v=19\$m=65536,t=3,p=1\$/);
    assert.equal(await password.verifyAdminPassword(hash, "Nile sunsets taste of mint tea"), true);
    assert.equal(await password.verifyAdminPassword(hash, "nile sunsets taste of mint tea"), false);
    assert.equal(await password.verifyAdminPassword(null, "anything"), false);
    assert.equal(await password.verifyAdminPassword(hash, "x".repeat(200)), false);
    assert.equal(password.passwordNeedsRehash(hash), false);
    assert.equal(password.passwordNeedsRehash("$argon2id$v=19$m=19456,t=2,p=1$abc$def"), true);
    assert.equal(password.passwordNeedsRehash("$2b$10$bcrypt"), true);
  });

  console.log(`\n  ${passed} checks passed.\n`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
