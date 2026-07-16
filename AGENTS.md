# AGENTS.md

## Cursor Cloud specific instructions

This is a single **Next.js 16 (App Router) + React 19 + Prisma 7** app (`hathor-booking-system`) — a luxury Nile cruise marketing site, booking flow, and password-protected admin dashboard. Package manager is **npm**. Standard commands live in `package.json` (`dev`, `build`, `lint`, `start`, `seed:*`).

### Services

| Service | Start command | Notes |
|---------|---------------|-------|
| Next.js dev server (port 3000) | `npm run dev` | Serves public site, `/booking`, `/admin`, and all `/api/*` routes. |
| Local PostgreSQL 16 (port 5432) | `sudo pg_ctlcluster 16 main start` | Required. Does **not** auto-start on VM boot — start it before running the app or any `seed:*`/prisma command. |

### Local environment (already configured in the VM snapshot)

- `.env` (gitignored) points `DATABASE_URL`/`DIRECT_URL` at the local Postgres (`postgres:postgres@localhost:5432/hathor`). SSL is auto-disabled for `localhost` connections (see `lib/pg-pool.ts`), so no certs are needed.
- Admin login password (`ADMIN_PASSWORD`) is `admin123` — log in at `/admin/login`.
- `RESEND_API_KEY` and `SUPABASE_*` are intentionally unset. The app degrades gracefully: transactional emails are skipped and admin image uploads are disabled. This is expected in local dev, not an error.

### Database setup gotcha

`prisma/migrations` contains only **incremental** migrations — there is **no baseline migration** that creates the core tables. On a fresh database, use `npx prisma db push` (schema-first sync), not `prisma migrate deploy` alone. Seed realistic data with `npm run seed:hathor` (cruises/rooms/content), and optionally `npm run seed:content`, `npm run seed:blogs`, `npm run seed:site-images`, `npm run seed:email-templates`.

### Known pre-existing issues (not environment problems — do not "fix" as part of setup)

- **`npm run lint` fails** with `TypeError: Converting circular structure to JSON`. This is an incompatibility between `eslint-config-next@16` via `@eslint/eslintrc` `FlatCompat` and ESLint 9; it is reproducible from the pinned lockfile and unrelated to the environment.
- **Booking confirmation UI throws** `Rendered fewer hooks than expected` in `components/booking/BookingFlow` after submitting. The backend flow is unaffected: `POST /api/bookings/hold` (201) and `POST /api/bookings/confirm` (200) both succeed and the booking IS persisted as `CONFIRMED` (verify in the DB or the `/admin/bookings` list). This is a client-side React hooks bug in the app code, not a setup issue.
