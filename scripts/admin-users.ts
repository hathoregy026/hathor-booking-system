/**
 * Dashboard account management — the ONLY way to create or reset accounts.
 * There is deliberately no sign-up page and no "forgot password" email: both
 * would be a way in for an attacker. Whoever can run this script already has
 * the database credentials.
 *
 *   npm run admin:users -- list
 *   npm run admin:users -- create --email you@hathorcruise.com --name "Your Name"
 *   npm run admin:users -- reset-password --email you@hathorcruise.com
 *   npm run admin:users -- reset-mfa --email you@hathorcruise.com
 *   npm run admin:users -- disable --email you@hathorcruise.com
 *   npm run admin:users -- enable --email you@hathorcruise.com
 *   npm run admin:users -- revoke-sessions --email you@hathorcruise.com   (or --all)
 *   npm run admin:users -- unlock --email you@hathorcruise.com
 *
 * Passwords are typed at a hidden prompt (never as an argument, which would
 * land in shell history), or generated with --generate and shown once.
 * Uses DATABASE_URL from .env — point it at your LOCAL database for testing.
 */
import "dotenv/config";

import { randomInt } from "crypto";
import { normalizeAdminEmail } from "@/lib/admin-auth";
import { assertAdminAuthConfigured } from "@/lib/admin-auth-crypto";
import { hashAdminPassword, passwordPolicyError } from "@/lib/admin-password";
import { prisma } from "@/lib/prisma";
import { clearKeyedRateLimit } from "@/lib/public-api-security";

type Flags = Record<string, string | true>;

function parseArgs(argv: string[]): { command: string | undefined; flags: Flags } {
  const [command, ...rest] = argv;
  const flags: Flags = {};
  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index]!;
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
    const next = rest[index + 1];
    if (next !== undefined && !next.startsWith("--")) {
      flags[key] = next;
      index += 1;
    } else {
      flags[key] = true;
    }
  }
  return { command, flags };
}

function fail(message: string): never {
  console.error(`\n  ✖ ${message}\n`);
  process.exit(1);
}

function requireEmail(flags: Flags): string {
  const raw = flags.email;
  if (typeof raw !== "string") fail("Pass --email <address>.");
  const email = normalizeAdminEmail(raw);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    fail("That does not look like an email address.");
  }
  return email;
}

let pipedLines: Promise<string[]> | null = null;

/** Piped stdin (automation): one password per line, read once. */
async function nextPipedLine(): Promise<string> {
  pipedLines ??= (async () => {
    let text = "";
    process.stdin.setEncoding("utf8");
    for await (const chunk of process.stdin) text += chunk;
    return text.split(/\r?\n/);
  })();
  const lines = await pipedLines;
  return lines.shift() ?? "";
}

/** Reads a line without echoing it. Falls back to plain stdin when piped. */
function promptHidden(question: string): Promise<string> {
  if (!process.stdin.isTTY) return nextPipedLine();
  return new Promise((resolve) => {
    const stdin = process.stdin;
    process.stdout.write(question);
    let value = "";
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    const onData = (char: string) => {
      if (char === "\u0003") {
        process.stdout.write("\n");
        process.exit(130);
      }
      if (char === "\r" || char === "\n" || char === "\u0004") {
        stdin.setRawMode(false);
        stdin.pause();
        stdin.off("data", onData);
        process.stdout.write("\n");
        resolve(value);
        return;
      }
      if (char === "\u007f" || char === "\b") {
        value = value.slice(0, -1);
        return;
      }
      value += char;
    };
    stdin.on("data", onData);
  });
}

const GENERATED_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789-_!@#%";

function generatePassword(length = 24): string {
  let password = "";
  for (let index = 0; index < length; index += 1) {
    password += GENERATED_ALPHABET[randomInt(GENERATED_ALPHABET.length)];
  }
  return password;
}

async function choosePassword(email: string, flags: Flags): Promise<string> {
  if (flags.generate) {
    const password = generatePassword();
    console.log("\n  Generated password (shown once — store it in a password manager):\n");
    console.log(`    ${password}\n`);
    return password;
  }
  const password = await promptHidden("  New password: ");
  const policyError = passwordPolicyError(password, email);
  if (policyError) fail(policyError);
  const repeat = await promptHidden("  Repeat password: ");
  if (repeat !== password) fail("The passwords do not match.");
  return password;
}

async function findUser(email: string) {
  const user = await prisma.adminUser.findUnique({ where: { email } });
  if (!user) fail(`No dashboard account for ${email}.`);
  return user;
}

async function revokeSessions(userId: string, reason: string): Promise<number> {
  const { count } = await prisma.adminSession.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date(), revokedReason: reason },
  });
  return count;
}

async function main() {
  const { command, flags } = parseArgs(process.argv.slice(2));

  if (!command || command === "help" || flags.help) {
    console.log(
      "\n  Commands: list | create | reset-password | reset-mfa | disable | enable | revoke-sessions | unlock\n" +
        "  Example:  npm run admin:users -- create --email you@hathorcruise.com --name \"Your Name\"\n",
    );
    return;
  }

  // Refuse to touch accounts the running app could not then sign in to.
  try {
    assertAdminAuthConfigured();
  } catch (error) {
    fail(error instanceof Error ? error.message : "Sign-in secrets are not configured.");
  }

  switch (command) {
    case "list": {
      const users = await prisma.adminUser.findMany({ orderBy: { createdAt: "asc" } });
      if (users.length === 0) console.log("\n  No dashboard accounts yet.\n");
      for (const user of users) {
        const status = user.disabledAt ? "DISABLED" : user.mfaEnrolledAt ? "active" : "awaiting authenticator set-up";
        console.log(
          `  ${user.email.padEnd(36)} ${user.displayName.padEnd(24)} ${status}` +
            (user.lastLoginAt ? `  · last sign-in ${user.lastLoginAt.toISOString()}` : ""),
        );
      }
      break;
    }

    case "create": {
      const email = requireEmail(flags);
      const name = typeof flags.name === "string" ? flags.name.trim().slice(0, 80) : "";
      if (!name) fail('Pass --name "Full Name".');
      if (await prisma.adminUser.findUnique({ where: { email } })) {
        fail(`${email} already has an account. Use reset-password instead.`);
      }
      const password = await choosePassword(email, flags);
      await prisma.adminUser.create({
        data: { email, displayName: name, passwordHash: await hashAdminPassword(password) },
      });
      console.log(
        `\n  ✔ Created ${email}. On first sign-in they will be asked to scan a QR code\n` +
          "    with an authenticator app before the dashboard opens.\n",
      );
      break;
    }

    case "reset-password": {
      const email = requireEmail(flags);
      const user = await findUser(email);
      const password = await choosePassword(email, flags);
      await prisma.adminUser.update({
        where: { id: user.id },
        data: { passwordHash: await hashAdminPassword(password), passwordChangedAt: new Date() },
      });
      const revoked = await revokeSessions(user.id, "password-reset");
      await clearKeyedRateLimit("admin-login-account", email);
      console.log(`\n  ✔ Password reset for ${email}. ${revoked} session(s) signed out.\n`);
      break;
    }

    case "reset-mfa": {
      const email = requireEmail(flags);
      const user = await findUser(email);
      await prisma.$transaction([
        prisma.adminRecoveryCode.deleteMany({ where: { userId: user.id } }),
        prisma.adminUser.update({
          where: { id: user.id },
          data: { totpSecretEnc: null, totpPendingEnc: null, totpLastStep: null, mfaEnrolledAt: null },
        }),
      ]);
      const revoked = await revokeSessions(user.id, "mfa-reset");
      console.log(
        `\n  ✔ Authenticator removed for ${email}; ${revoked} session(s) signed out.\n` +
          "    They must scan a new QR code at their next sign-in.\n",
      );
      break;
    }

    case "disable":
    case "enable": {
      const email = requireEmail(flags);
      const user = await findUser(email);
      await prisma.adminUser.update({
        where: { id: user.id },
        data: { disabledAt: command === "disable" ? new Date() : null },
      });
      const revoked = command === "disable" ? await revokeSessions(user.id, "account-disabled") : 0;
      console.log(`\n  ✔ ${email} ${command}d.${command === "disable" ? ` ${revoked} session(s) signed out.` : ""}\n`);
      break;
    }

    case "revoke-sessions": {
      if (flags.all) {
        const { count } = await prisma.adminSession.updateMany({
          where: { revokedAt: null },
          data: { revokedAt: new Date(), revokedReason: "revoked-by-cli" },
        });
        console.log(`\n  ✔ Signed out every dashboard session (${count}).\n`);
        break;
      }
      const email = requireEmail(flags);
      const user = await findUser(email);
      console.log(`\n  ✔ ${await revokeSessions(user.id, "revoked-by-cli")} session(s) signed out for ${email}.\n`);
      break;
    }

    case "unlock": {
      const email = requireEmail(flags);
      const user = await findUser(email);
      await clearKeyedRateLimit("admin-login-account", email);
      await clearKeyedRateLimit("admin-login-code-account", user.id);
      await clearKeyedRateLimit("admin-step-up", user.id);
      console.log(`\n  ✔ Cleared sign-in throttling for ${email}. (Per-IP limits expire on their own.)\n`);
      break;
    }

    default:
      fail(`Unknown command "${command}". Run with "help" for the list.`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error(`\n  ✖ ${error instanceof Error ? error.message : "Command failed"}\n`);
    process.exit(1);
  });
