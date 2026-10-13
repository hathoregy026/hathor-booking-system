# Dashboard sign-in (`/admin`)

The dashboard no longer opens with one shared `ADMIN_PASSWORD`. Every person
has their own account, and signing in takes two steps:

1. **Email + password**
2. **A 6-digit code from an authenticator app** (or a one-time recovery code)

The first time someone signs in, they scan a QR code with an authenticator
app (Google Authenticator, Microsoft Authenticator, 1Password, Authy, …) and
are given 10 single-use recovery codes before the dashboard opens.

> **Status: isolated login preview approved.** Production is not enabled. See
> "Before going live" at the bottom before it goes anywhere near Vercel.

## How it protects the dashboard

| Threat | Protection |
| --- | --- |
| Stolen or guessed password | A code from the person's phone is also required. |
| Password database leak | Argon2id hashes (64 MiB, 3 passes, unique salt). Authenticator secrets are AES-256-GCM encrypted with a key that is not in the database. Recovery codes are stored as keyed hashes; session tokens are stored as SHA-256 fingerprints. |
| Brute force | Durable Postgres throttles: 10 password attempts per IP and 5 per account every 15 min; 5 codes per sign-in, 10 per account, 20 per IP. |
| Finding out which emails have accounts | Same message, same status and the same Argon2 timing for unknown emails, wrong passwords and disabled accounts. |
| Code read over a shoulder / replayed | Each 30-second code is accepted once per account. |
| Stolen session cookie | `HttpOnly`, `SameSite=Strict`, `Secure` + `__Host-` prefix in production. Sessions live in the database: logout, "sign out everywhere", password changes and disabled accounts take effect on the next request. Idle timeout 30 min, hard limit 12 h. |
| Session fixation | A brand-new token at every step; half-finished sign-ins can never open the dashboard. |
| Cross-site request forgery | Strict cookies, plus same-origin/JSON checks on every sign-in and admin API call. |
| Someone with a hijacked session locking the owner out | Changing the password needs the current password **and** a code; new recovery codes need a code. |
| Middleware bypass bugs | Every `/api/admin` handler and the dashboard layout re-check the session in the database. |
| Silent misuse | `AdminAuthEvent` audit log (never stores passwords, codes or tokens), visible under **Settings → Security → Recent activity**. |

There is no public sign-up page or automatic password-reset email. An
administrator invites people from **People & roles** and privately shares a
48-hour, single-use password setup link. The person chooses their own password,
then signs in and enrolls an authenticator. Only the link fingerprint is stored;
the URL keeps its secret in the fragment, never a server query string.
The CLI remains available for first-administrator setup and emergency recovery.

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

Then in `.env` (use the host name `localhost`: local connections skip TLS,
every other host must verify its certificate via `DATABASE_CA_CERT`):

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

### 3. Create your first administrator

```bash
npm run admin:users -- create --email you@hathorcruise.com --name "Your Name" --administrator
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
npm run admin:users -- create --email you@hathorcruise.com --name "Your Name" [--generate] [--administrator]
npm run admin:users -- make-administrator --email you@hathorcruise.com
npm run admin:users -- reset-password --email you@hathorcruise.com [--generate]
npm run admin:users -- reset-mfa --email you@hathorcruise.com      # lost phone AND recovery codes
npm run admin:users -- disable --email you@hathorcruise.com        # also signs them out
npm run admin:users -- enable --email you@hathorcruise.com
npm run admin:users -- revoke-sessions --email you@hathorcruise.com
npm run admin:users -- revoke-sessions --all
npm run admin:users -- unlock --email you@hathorcruise.com
npm run verify:admin-auth                                         # offline crypto self-test
npm run verify:admin-permissions                                  # permission coverage
```

## Before going live (not done yet)

1. In Vercel, set `ADMIN_SESSION_SECRET` and `ADMIN_MFA_ENCRYPTION_KEY`.
   Keep an existing Production session secret if it is at least 32 characters.
   **Environments that share a database must use the same
   `ADMIN_MFA_ENCRYPTION_KEY`**, including a local account-management CLI
   connected to that database. Use separate MFA keys only for separate
   databases. Back up the key securely: losing or changing it means every
   enrolled account needs `reset-mfa` and must re-scan a QR code.
2. Preserve already emailed guest booking links when setting Production's
   `ADMIN_SESSION_SECRET`. When neither `BOOKING_ACCESS_SECRET` nor
   `BOOKING_HOLD_SECRET` is set, guest links use `ADMIN_SESSION_SECRET`.
   If that existing value is shorter than 32 characters and must change,
   first set `BOOKING_ACCESS_SECRET` to the **old value** in Production,
   then replace `ADMIN_SESSION_SECRET`. If a dedicated guest signing secret
   already exists, keep it unchanged. Do this privately in environment
   settings; never paste secret values into a chat.
3. The migration `20261009120000_admin_accounts_mfa` is additive (four new
   tables). Vercel's build runs `prisma migrate deploy`, so it applies on the
   first deploy that includes it. Migrations cannot build an empty database:
   a separate preview database needs an existing baseline/schema.
4. After an explicitly approved preview applies the two additive migrations,
   explicitly create/promote your named first administrator against the chosen
   database using `create … --administrator` or `make-administrator --email …`.
   Complete its MFA enrollment and save recovery codes before go-live.
   Existing accounts receive **no business access by default**: assign their
   roles in People & roles before release. Never automatically promote every
   old account. `ADMIN_PASSWORD` no longer opens the dashboard.
5. Set `DATABASE_CA_CERT` in each enabled Vercel environment to the database
   provider's CA (Supabase: Project Settings → Database → SSL Configuration).
   Connections verify the certificate and refuse remote connections without
   it. See the [Supabase connection guide](https://supabase.com/docs/guides/database/connecting-to-postgres#connecting-with-ssl).
   Local helper tests below must never target Supabase or another remote DB.
6. Keep the `git.deploymentEnabled` block for `claude/festive-cori-17uol4`
   in `vercel.json` until the owner explicitly says **start the preview**,
   selects its database, and configures Preview's environment variables.
   Removing it and pushing starts a build that runs `prisma migrate deploy`
   against that database. Starting a preview requires separate approval.
7. When a preview is approved, use the **branch alias URL containing `-git-`**
   from Vercel. A per-deployment URL without `-git-` redirects to Production
   through `lib/public-url.ts`. On a shared database, keep preview testing
   to sign-in/security: other dashboard actions operate on real bookings
   and can email guests.

## Repeatable local regression helpers

These scripts refuse Production/Vercel, remote website URLs, remote database
hosts, database names other than `hathor_admin_auth_test`, and connection
override parameters. They never run migrations or change booking rows.

Use a disposable local database with PostgreSQL configured for UTC (Docker
uses UTC by default). For example, use the Docker instructions
above, then create a dedicated database:

```bash
docker exec hathor-pg createdb -U postgres hathor_admin_auth_test
```

Set these in the **isolated checkout's** `.env` (not your live checkout):

```bash
DATABASE_URL="postgresql://postgres:localdev@localhost:5432/hathor_admin_auth_test"
DIRECT_URL="postgresql://postgres:localdev@localhost:5432/hathor_admin_auth_test"
TEST_BASE_URL="http://localhost:3000"
# Add fresh local ADMIN_SESSION_SECRET and ADMIN_MFA_ENCRYPTION_KEY too.
```

With only that local database selected, run `npx prisma db push`, then start
`npm run dev`. Scripts and dev server must use the same database and auth
secrets. Each helper creates a random, enrolled test account and a real
database session. A security probe checks the server uses the same fixture
before any HTTP mutation. Its own auth rows are removed in `finally`, even
on failure. A forcibly killed process can leave fixtures: discard the
throwaway database after testing.

```bash
node scripts/test-profile-base64.mjs
node scripts/test-hero-logo-tune-save.mjs
node scripts/test-ship-experience.cjs --browser
node scripts/test-admin-login-e2e.mjs --browser
node --test scripts/test-local-admin-test.mjs
```

The profile helper tests the remaining profile persistence module; the old
`/api/admin/profile` endpoint no longer exists. It generates a tiny WebP
fixture and restores the prior profile. The hero helper restores its original
tune in `finally`. The ship helper still intercepts its save APIs, and writes
screenshots to `output/ship-plan-qa`, never the frozen `_local` directory.

The login regression exercises the real HTTP sign-in/security endpoints,
including enrollment, token/cookie boundaries, throttling, revocation,
password changes and recovery codes. It uses only synthetic auth rows.
The inbox browser test remains fully mocked; its synthetic cookie is now
named `hathor_admin_session`, matching the dev session cookie.


## People & roles

Administrators have full dashboard access, including account and role controls.
Staff roles are configurable: each of the 12 sections can be Hidden, View or Edit.
All sections start Hidden. Manage rights also allow reading. An account without
a role can use only its personal Security settings and its access landing page.
CMS links show only allowed editors. Sidebar, phone navigation, search and booking
notifications respect the same permissions.

Permissions are loaded from the database on each protected request, never from
editable browser state or cookie role claims. Every protected API handler checks
an explicit permission; request-based helpers also use a fail-closed route map.
Each dashboard page checks access independently, including the server-rendered
booking detail, and all blog Server Actions require Edit in Blog posts. New routes
must be mapped and guarded or the coverage check fails.

View-only pages show a banner. The server refuses writes even if a person tries a
button, calls the API directly, or changes the browser. Edit in Media storage is
also needed for generic image uploads used by website/blog editors. Dashboard
access includes revenue and recent guest details; Availability includes guest
names. Edit in Bookings, Emails or Email templates can send emails. Assign those
permissions deliberately when we choose the real roles together.

Every account/role mutation requires the administrator's password plus a fresh
authenticator or recovery code, with durable throttling. Staff cannot promote
themselves; administrators cannot change their own access in this screen. A
transaction lock protects membership changes and the last enabled, enrolled
administrator. An assigned role cannot be deleted. Role edits, assignments,
disabling, password links and MFA resets revoke affected sessions. The menu
refreshes on navigation/focus and every minute; server checks apply immediately.

People & roles also offers Disable/Enable, Password link, Reset authenticator,
Sign out and Unlock. Resetting an authenticator removes that person's old recovery
codes, so verify their identity privately before doing it. Password links preserve
an already enrolled authenticator. Disabling cancels pending setup links. Reissuing
a link invalidates its predecessor and the old password. Changes are recorded in
an access audit history containing actor/target IDs and action names, never proofs.
Emergency recovery with the CLI requires trusted database access; keep it private.

The additive migration `20261011120000_admin_roles_and_invitations` adds the roles
and invitation tables and two account fields. Private tables enable RLS and revoke
public/anonymous/authenticated Data API access, following the
[Supabase RLS guidance](https://supabase.com/docs/guides/database/postgres/row-level-security).
There are no booking-schema or booking-lifecycle changes.

Local verification after the throwaway DB and server are running:

```bash
npm run verify:admin-permissions
node scripts/test-admin-permissions.mjs --browser
node scripts/test-admin-role-migration.mjs
node scripts/test-admin-login-e2e.mjs --browser
```

The role regression covers direct API denials, forbidden privilege fields,
read/edit separation, live revocation, setup-link reuse and disabling, step-up
proofs, self/last-administrator protection, and six desktop/tablet/phone sizes.
The migration regression applies the additive SQL only inside a rolled-back local
test schema, checks existing-account defaults, and tests Data API role restrictions.

The People & roles screen extends the existing dashboard design: gold #b69f64,
cream #faf8f5 and the existing night surfaces, using the theme's --accent,
--bg-primary, --bg-glass, --border and --text-secondary variables. Georgia headings
and the existing Geist body font provide contrast; asymmetric 24px/4px corners,
44px controls and stacked phone permission rows keep it consistent and usable.

### Preview setup and remaining manual steps

An isolated Free test database has been prepared without production records.
Its existing tables were built from the pre-login Prisma schema, the two login
and role migrations were applied, and the baseline history was recorded only
in this test database. All test tables have RLS and no public/anonymous access.
This baseline is for login/roles testing; it is not a production database copy.

The login branch has its own Preview database URLs, session/MFA keys, CA and
Supabase URL. For Prisma's migration engine, its branch-specific DIRECT_URL
uses `sslmode=require`, `sslaccept=strict` and
`sslcert=prisma/certs/supabase-prod-ca-2021.crt`. The public CA is bundled under
`prisma/certs`; runtime pools still verify against `DATABASE_CA_CERT`.
The existing Vercel build command is unchanged.

The owner explicitly approved starting this preview. Its branch deployment
guard is now removed. Complete the named test administrator's authenticator
enrollment, save recovery codes privately, and test staff roles before go-live.
Production keys, the latest live-code baseline and named real accounts still
require a separate production release review and approval.
