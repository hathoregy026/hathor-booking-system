# Dashboard sign-in (`/admin`)

The dashboard no longer opens with one shared `ADMIN_PASSWORD`. Every person
has their own account, and signing in takes two steps:

1. **Email + password**
2. **A 6-digit code from an authenticator app** (or a one-time recovery code)

The first time someone signs in, they scan a QR code with an authenticator
app (Google Authenticator, Microsoft Authenticator, 1Password, Authy, …) and
are given 10 single-use recovery codes before the dashboard opens.

> **Status: local testing only.** Nothing here has been deployed. See
> "Before going live" at the bottom before it goes anywhere near Vercel.

## How it protects the dashboard

| Threat | Protection |
| --- | --- |
| Stolen or guessed password | A code from the person's phone is also required. |
| Password database leak | Argon2id hashes (64 MiB, 3 passes, unique salt). Authenticator secrets are AES-256-GCM encrypted with a key that is not in the database. Recovery codes and session tokens are stored only as keyed hashes. |
| Brute force | Durable Postgres throttles: 10 password attempts per IP and 5 per account every 15 min; 5 codes per sign-in, 10 per account, 20 per IP. |
| Finding out which emails have accounts | Same message, same status and the same Argon2 timing for unknown emails, wrong passwords and disabled accounts. |
| Code read over a shoulder / replayed | Each 30-second code is accepted once per account. |
| Stolen session cookie | `HttpOnly`, `SameSite=Strict`, `Secure` + `__Host-` prefix in production. Sessions live in the database: logout, "sign out everywhere", password changes and disabled accounts take effect on the next request. Idle timeout 30 min, hard limit 12 h. |
| Session fixation | A brand-new token at every step; half-finished sign-ins can never open the dashboard. |
| Cross-site request forgery | Strict cookies, plus same-origin/JSON checks on every sign-in and admin API call. |
| Someone with a hijacked session locking the owner out | Changing the password needs the current password **and** a code; new recovery codes need a code. |
| Middleware bypass bugs | Every `/api/admin` handler and the dashboard layout re-check the session in the database. |
| Silent misuse | `AdminAuthEvent` audit log (never stores passwords, codes or tokens), visible under **Settings → Security → Recent activity**. |

There is no sign-up page and no password-reset email on purpose. Accounts are
created and reset from the command line by someone with database access.

Until someone finishes their first sign-in (or after `reset-mfa`), their
account is protected by the password alone, because the authenticator is
set up during that first sign-in. Sign in and scan the QR code straight after
an account is created or reset.

## Test it locally

### 1. Use a local database

Point `DATABASE_URL` at a database you can throw away, **not** the live
Supabase database. The quickest option is Docker:

```bash
docker run --name hathor-pg -e POSTGRES_PASSWORD=localdev -p 5432:5432 -d postgres:16
```

Then in `.env` (use the host name `localhost`; that is what turns off TLS
for local connections):

```bash
DATABASE_URL="postgresql://postgres:localdev@localhost:5432/postgres"
DIRECT_URL="postgresql://postgres:localdev@localhost:5432/postgres"
```

Create the tables:

```bash
npm install
npx prisma db push        # brand-new empty database: builds every table from the schema
```

If instead you point at a copy of the real database that already has the
other tables, apply just the new migration with `npx prisma migrate deploy`.

### 2. Add the two secrets to `.env`

Run `openssl rand -hex 32` twice and paste the two outputs:

```bash
ADMIN_SESSION_SECRET="<first 64-character value>"
ADMIN_MFA_ENCRYPTION_KEY="<second 64-character value>"
```

`.env` files are git-ignored. Sign-in refuses to run without both, and the
server says so clearly.

### 3. Create your account

```bash
npm run admin:users -- create --email you@hathorcruise.com --name "Your Name"
```

You will be asked for the password twice (nothing is shown as you type). It
needs at least 14 characters; a short sentence works well. Add
`--generate` to have a strong one generated and shown once instead.

### 4. Sign in

```bash
npm run dev
```

Open <http://localhost:3000/admin/login>, enter your email and password, scan
the QR code, enter the code, save the recovery codes, and you're in.

### Things worth trying

- Wrong password → generic error; 6 tries in a row → "Too many attempts".
  `npm run admin:users -- unlock --email …` clears it.
- Wrong codes → after 5 the sign-in starts over from the password.
- Use the same 6-digit code twice → refused the second time.
- Sign in with a recovery code → it never works again.
- Copy the session cookie, sign out, put the cookie back → it no longer works.
- Sign in from a second browser, then **Settings → Security → Sign out
  everywhere else** → the other browser is thrown out.
- Leave the dashboard idle for 30 minutes → you're asked to sign in again.

## Command-line reference

```bash
npm run admin:users -- list
npm run admin:users -- create --email you@hathorcruise.com --name "Your Name" [--generate]
npm run admin:users -- reset-password --email you@hathorcruise.com [--generate]
npm run admin:users -- reset-mfa --email you@hathorcruise.com      # lost phone AND recovery codes
npm run admin:users -- disable --email you@hathorcruise.com        # also signs them out
npm run admin:users -- enable --email you@hathorcruise.com
npm run admin:users -- revoke-sessions --email you@hathorcruise.com
npm run admin:users -- revoke-sessions --all
npm run admin:users -- unlock --email you@hathorcruise.com
npm run verify:admin-auth                                         # offline crypto self-test
```

## Before going live (not done yet)

1. In Vercel, set `ADMIN_SESSION_SECRET` and `ADMIN_MFA_ENCRYPTION_KEY`
   (fresh values, different for Production and Preview). Back up the MFA
   key: losing it means every account re-scans a QR code.
2. Set `BOOKING_ACCESS_SECRET` before you ever rotate `ADMIN_SESSION_SECRET`.
   Guest booking links fall back to it, so rotating it without that would
   break links already emailed to guests.
3. The migration `20261009120000_admin_accounts_mfa` is additive (four new
   tables, nothing changed). Vercel's build runs `prisma migrate deploy`, so
   it applies on the first deploy that includes it.
4. Create the real accounts against the production database with
   `npm run admin:users -- create …` **before** deploying, or nobody can
   sign in afterwards. `ADMIN_PASSWORD` no longer opens the dashboard.
5. Remove the `git.deploymentEnabled` entry for this branch from
   `vercel.json` (it stops preview builds while this is local-only).
6. Old helper scripts that logged in with `ADMIN_PASSWORD`
   (`scripts/test-profile-base64.mjs`, `scripts/test-hero-logo-tune-save.mjs`,
   `scripts/test-ship-experience.cjs`) need updating to the new flow.
