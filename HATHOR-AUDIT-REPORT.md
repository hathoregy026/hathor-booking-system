# Hathor Booking System — Initial Audit

**Date:** 20 Aug 2026 · **Mode:** read-only audit, no code changed
**Reviewed by:** Senior UI/UX Designer · Lead Full-Stack Engineer · Chief Security Engineer

---

## 0. Roles & objective — acknowledged

We act as your three-person team. This pass is **audit only**: we read configuration, auth, API routes, and the file tree. We did **not** run the app, run a build, or open a browser, so every "responsiveness" item below is a *structural* finding (from code shape), not a measured one. Runtime verification is proposed in §6.

---

## 1. Tech stack (detected — please confirm)

Your project brief had the stack as `[Insert ...]`. Here is what the code actually says:

| Layer | Detected |
|---|---|
| Framework | **Next.js 16.2.9** (App Router) + **React 19.2** |
| Language | TypeScript 5, `strict: true` |
| Styling | **Tailwind CSS v4** (`@tailwindcss/postcss`) + ~50 hand-written CSS files in `app/` |
| Motion | GSAP 3.15, Framer Motion 12, Lenis 1.3, split-type, 29 custom scroll hooks |
| Back-end | Next.js Route Handlers (`app/api/**`) — 60+ endpoints |
| Database | **PostgreSQL via Supabase** (Prisma 7.8 + `@prisma/adapter-pg`, pgbouncer pooler) |
| Storage | Supabase Storage (`website-images`, `email-images` buckets) |
| Email | Resend 6.14 + React Email |
| Validation | Zod 4 |
| State | Zustand 5 |
| Hosting | **Vercel** (`vercel.json`, `.vercel/`, deploy-id healing routes) |
| Auth | Custom cookie session, single shared `ADMIN_PASSWORD` |

**Verdict:** this is a substantial, real production app — a public marketing site + a booking engine + a full admin CMS. Yes, we can absolutely work on it and edit files directly on your machine.

---

## 2. Application map

- **Public site:** home, cruises, rooms, suites (`Luxury-Royal-Suites-Nile-Dahabiya-Cruise`), `luxury-cabins-Nile-Cruise`, gastronomy, wellness, charter, about, contact, blog, highlights.
- **Booking flow:** `/book` → `/booking` → API `bookings/hold` → `bookings/checkout` → `bookings/confirm`, with hold tokens, availability lookup, calendar validation, and cron cleanup of stale holds.
- **Admin CMS (`/admin`):** bookings, cruises, rooms, blog posts, images/storage, email templates, typography, page visibility, live-site gate, hero/hieroglyph tuning, welcome splash. ~26 admin API groups.
- **Cron:** `/api/cron/cleanup`, `/api/cron/validate-availability` (Bearer `CRON_SECRET`).

---

## 3. Security findings

Ranked by exposure. Nothing here is fixed yet.

### 🔴 High

**H1 — Session token is a static value derived from the password.**
`lib/admin-auth.ts` computes `HMAC-SHA256(ADMIN_PASSWORD, "hathor-admin-session")` — a **constant**. Every session for all time gets the identical cookie value. Consequences: no expiry (cookie `maxAge` is cosmetic — the token stays valid forever), no revocation, no logout-everywhere, no per-session identity, no audit trail. One leaked cookie (a shared browser, an extension, a proxy log) = permanent admin access until you rotate `ADMIN_PASSWORD` — which invalidates *everyone*.

**H2 — Login endpoint has no rate limiting or lockout.**
`app/api/admin/login/route.ts` accepts unlimited POSTs. You *have* a limiter (`lib/rate-limit.ts`) and use it on `/api/contact` — but not here, on the one endpoint that guards the whole CMS. Combined with a single shared password (no username, no 2FA, no failed-attempt logging), this is directly brute-forceable.

**H3 — No security headers anywhere.**
`next.config.ts` `headers()` is ~150 lines of *cache* policy only. There is no `Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options` / `frame-ancestors`, `X-Content-Type-Options`, `Referrer-Policy`, or `Permissions-Policy` — in `next.config.ts`, `vercel.json`, or `middleware.ts`. The admin panel is clickjackable and the app has no XSS defence-in-depth layer.

**H4 — `sslmode=no-verify` on the database connection.**
`.env.example` ships `DATABASE_URL=...&sslmode=no-verify`, which encrypts but does **not verify** Supabase's certificate — no protection against an active MITM. If production uses the same string, every booking record and guest PII in transit is at risk. Should be `sslmode=require` at minimum, `verify-full` ideally.

### 🟠 Medium

**M1 — In-memory rate limiter is ineffective on Vercel.**
`lib/rate-limit.ts` uses a module-level `Map`. On serverless each instance has its own copy and cold starts wipe it. The contact-form "5 per minute" limit is, in practice, 5-per-minute-per-lambda-instance — trivially bypassed by concurrency. Needs Upstash/Redis or Vercel KV.

**M2 — `?fresh` on any URL triggers `Clear-Site-Data`.**
`middleware.ts`: `if (pathname === "/purge" || searchParams.has("fresh"))` → sends `Clear-Site-Data: "cache", "storage", "executionContexts"`. Anyone can post `yoursite.com/?fresh` and wipe visitors' cache/storage for the origin — a griefing vector and a self-inflicted performance hit. Should be gated (admin session, or a secret token).

**M3 — Route-level auth relies entirely on middleware.**
`app/api/admin/upload/route.ts` (and peers) perform **no** in-route auth check; they trust the `/api/admin` prefix match in `middleware.ts`. `lib/admin-server-auth.ts` (`assertAdminSession`) exists but is unused in the routes we read. Any future endpoint placed outside the `/api/admin` prefix, or any middleware matcher edit, silently exposes it. The upload route in particular accepts multipart uploads and writes to Supabase with the **service-role key**.

**M4 — Debug/dev/test endpoints and pages present.**
`app/api/dev/cms-timing`, `app/api/debug-email`, `app/api/test-email`, plus `app/dev`, `app/test-create`, `app/test-scroll-reveal`, `app/test-slide`, `app/preview`, `app/transition`. None appear gated by `NODE_ENV`. These leak internals and provide unauthenticated surface in production.

**M5 — Timing/length side channel in password comparison.**
Both `verifyAdminPassword` and `verifySessionToken` do `if (actual.length !== reference.length) return false` *before* `timingSafeEqual`. This leaks the exact password length. Hash both sides to a fixed width first, then compare.

**M6 — Hand-rolled HTML sanitizer.**
`lib/blog-html.ts` sanitizes admin blog HTML with cheerio and an allow-list. It's better than most attempts (blocks `script`/`iframe`, strips unknown attributes so `onerror`/`onclick` die, checks `javascript:`/`data:text/html`). But it allows `class` and `target` without `rel` on non-http links, and custom sanitizers historically fail to mutation-XSS. Use `isomorphic-dompurify` or `sanitize-html`.

### 🟡 Low / hygiene

- **L1** — `.env`, `.env.vercel.production`, `.env.vercel.tmp` sit in the project root with live secrets. `.gitignore` covers `.env*`, so likely safe — but git history should be scanned to confirm they were never committed before that rule existed.
- **L2** — No CSRF token. `SameSite=Lax` blocks cross-site POSTs, so this is acceptable today, but it means no admin action may ever be a state-changing `GET`.
- **L3** — `ADMIN_EMAIL` is a hardcoded Gmail address in `.env.example`; `BOOKING_HOLD_SECRET` silently falls back to `CRON_SECRET` then `ADMIN_PASSWORD` — secret reuse across three trust domains.
- **L4** — No dependency audit in the pipeline (`npm audit` / Dependabot). Stack is otherwise commendably current.

---

## 4. Front-end / performance findings

**F1 — CSS payload is very large.** `app/` holds ~50 top-level stylesheets. Notable:

| File | Size |
|---|---|
| `gastronomy-springs-global.scoped.css` | **573 KB** |
| `gastronomy-springs-global.raw.css` | **392 KB** |
| `public.css` | 156 KB |
| `admin.css` | 77 KB |
| `booking.css` | 79 KB |
| `venetian-redesign.css` | 63 KB |

Over **1.5 MB of hand-written CSS**, much of it scraped from a cloned reference site (`springs.estate`), with `.raw`/`.scoped` duplicate pairs of the same content. This is the single biggest lever on mobile load time, and duplicated cascades are the most likely root cause of "broken alignment" bugs.

**F2 — Motion system is enormous and JS-driven.** 29 hooks in `hooks/`, including `useExScrollMotion.ts` at **79 KB**, plus GSAP + Framer Motion + Lenis + a custom `lib/hero-scroll-stage.ts` (29 KB) and `lib/springs-parallax-engine.ts`. JS-measured scroll layout is the classic source of **layout shift and mobile jank** — which matches the symptoms in your brief.

**F3 — Viewport detection happens in JavaScript.** `useIsPhoneViewport.ts` / `useMediaQuery.ts` drive layout decisions. In an SSR app this guarantees a first paint at the wrong breakpoint, then a shift after hydration. `mobile-touch.css` (15.7 KB) reads as a corrective patch layer over that problem rather than a mobile-first foundation.

**F4 — Cloned-markup-in-TypeScript.** `lib/gastronomy-springs-html.ts` is **126 KB** of HTML string embedded in a `.ts` file, shipped through the bundle. Several pages are Springs-clone iframes served from `public/*-springs/`.

**F5 — Repo hygiene.** Root contains files that appear **not** to be gitignored:
`repomix-output.xml` (**131 MB**), `pages_only.txt` (1 MB), `cruises` (126 KB, no extension), `springs-layout.md`, `transition-for-pages.js`, and eleven `_tmp_*` scratch files. Plus ~35 `.tmp-suites-*` QA directories, an `OLD DASHBOARD BACK UP/` tree, `archive/`, and `_local/`. `.gitignore` covers `scripts/_tmp-*` and `redesign/` but not the root-level ones.

**F6 — Two docs already flag this.** `CONTENT-RESPONSIVE-PERFORMANCE-AUDIT.md` (23 KB) and `MASTER_PLAN.md` exist in-repo. We should read them before proposing anything, so we build on your prior work instead of duplicating it.

---

## 5. What's genuinely good

Worth saying, because it changes how we should proceed — this is not a codebase to rewrite:

- Zod validation on public inputs, with generic error messages that don't leak schema detail.
- `timingSafeEqual` used for password and cron-secret comparison (the intent is right, the length pre-check is the flaw).
- Cron routes **fail closed** when `CRON_SECRET` is unset.
- HttpOnly + Secure-in-production + SameSite cookie flags all correct.
- Upload validation checks MIME **and** extension against an allow-list, then re-encodes through `sharp` — which neutralises most polyglot-file attacks.
- Prisma throughout: no raw SQL string concatenation seen, so SQL injection surface is minimal.
- `strict: true` TypeScript, current dependencies, thoughtful and well-commented cache strategy.

---

## 6. Proposed plan (your call on order)

**Phase 0 — Establish ground truth (½ day).** Read `CONTENT-RESPONSIVE-PERFORMANCE-AUDIT.md` + `MASTER_PLAN.md`; run `npm run typecheck`, `npm run lint`, `npm run build`; capture real console errors and bundle sizes. *No fixes yet — measure first.*

**Phase 1 — Security quick wins (1 day, low risk).** Security headers + CSP in `next.config.ts`; rate-limit the login route; gate `?fresh`; gate/remove dev+debug endpoints; `sslmode=require`.

**Phase 2 — Auth hardening (1–2 days).** Real session tokens: random ID + expiry + server-side store, so logout and rotation work. Add `assertAdminSession()` in every admin route as defence in depth.

**Phase 3 — Responsive audit, measured (2–3 days).** Playwright is already a dependency and you have QA scripts (`qa-mobile-site.mjs`, `qa-home-chapters-responsive.mjs`). Screenshot every route at 375 / 768 / 1024 / 1440 / 1920, record CLS, catalogue actual breakage — then fix from evidence.

**Phase 4 — CSS consolidation (ongoing).** De-duplicate `.raw`/`.scoped` pairs, purge dead Springs-clone CSS, move JS breakpoints to CSS media queries.

**Phase 5 — Repo cleanup.** Extend `.gitignore`, remove the 131 MB artefact, archive the backup trees.

---

### Two questions before we start

1. **Is this repo already deployed and taking real bookings?** That decides whether Phase 1 ships today or waits for a staging branch.
2. **Which comes first — security or responsiveness?** Our recommendation is Phase 0 + Phase 1 first: they're low-risk, and Phase 3 needs the build running cleanly anyway.

*Nothing in this report has been changed on disk. Say the word and we start with Phase 0.*
