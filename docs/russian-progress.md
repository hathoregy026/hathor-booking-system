# Russian site: plan and progress

This checklist drives the unattended run. Approved by the owner on 2026-11-03: fix the English mistakes (and the same ones in
Italian and German), then translate the public site into Russian at `/ru`. **Keep everything local: no push, no pull request,
no merge, no deploy.** The dashboard and all emails stay English.

- Worktree: `C:\Users\Uer\Desktop\HATHOR\hathor-russian`, branch `claude/russian-site` (from GitHub main 8cdc351b). Commit locally only.
- Working files outside git: `C:\Users\Uer\Desktop\HATHOR\russian-work\` (live-database backup, English fix lists, briefs).
- Never write to the live database without the owner present: the auto-mode check blocks it, and the owner approves those
  writes when back. Every database change waits in `russian-work/english-fixes/` as a ready script.

## Rules for any session that resumes this work

1. Read this file first, then the step's brief. Do the first unchecked step, tick it here, commit locally, move on.
2. Never ask the owner a question; decide with the defaults below and note each decision in `docs/russian-review.md`.
3. Never push, open a PR, merge, deploy, or change the dashboard or emails.
4. If another session is already working on this (check `git log` time and file times in the last 30 minutes), stop.

## Russian defaults

- Polite «вы» (lowercase) in sentences; buttons and links in the infinitive («Забронировать», «Подробнее»).
- Product names stay in Latin: Hathor, Hathor Dahabiya, Luxury Suite, Royal Suite, Luxury King Bed, Luxury Twin Bed,
  Seneb Spa, Historia Fitness. The generic word dahabiya is «дахабия» (declined: дахабии, дахабию, на дахабии).
- Places: Луксор, Асуан, Каир, Эдфу, Ком-Омбо, Филе, Карнак, Эсна, Абу-Симбел, Долина царей, Западный/Восточный берег.
  Gods/kings: Амон-Ра, Хатшепсут, Тутанхамон, Рамсес II, Аменхотеп III, Гор, Хнум, Собек, Хатхор (goddess only).
- Prices «7 000 $» (no-break spaces), booking journey «7 000 USD». Dates via `Intl` ru-RU («3 ноября 2026 г.»).
- Three plural forms with `Intl.PluralRules("ru")` (1 ночь / 2 ночи / 5 ночей).
- «Ёлочки» quotes, „лапки“ inside; spaced em dash « — ». Use «е» for «ё» except where meaning needs «ё».
- Guest reviews stay in their original English. Legal Terms: exact clause-by-clause translation, nothing added or softened.
- Search off: `LOCALE_INDEXED.ru = false`.
- Fonts on Russian pages: Forum for every heading, display and script face (closest Cyrillic to Italiana), Manrope for body text.
  Self-hosted, loaded only when Cyrillic text is on the page. English, Italian and German fonts unchanged.

## Phase 1: English fixes

- [x] Back up the live journal posts and website text (`russian-work/backup/*.backup-2026-11-03.json`, read-only).
- [x] Terms: remove the drafting note from the tax line; office address = Contact page address (EN, IT, DE). Local commit.
- [x] Four agents list the journal mistakes (`russian-work/english-fixes/BRIEF.md` → `group-1..4-fixes.json`).
- [x] Merge and check the lists; apply the Italian and German fixes in code; write `docs/english-fixes.md` (before → after).
- [x] Write corrected English to `russian-work/english-fixes/BlogPost.corrected.json` (translators use this, not the live rows).
- [x] OWNER (approved and applied 2026-11-04): the live database script `russian-work/english-fixes/apply-to-live.cjs` (journal rows + `/suites` cabin deck
      "UPPER DECK" → "LOWER DECK"). Dry run passed 2026-11-03: 379 of 379 fixes match the live rows. Blocked by the auto-mode check on 2026-11-03; does not block Phase 2.

## Phase 2: Russian

- [x] Groundwork: `ru` locale, `/ru` routes, formats, plurals, fonts, language menu, `-ru` copy files as typed templates.
- [x] Translate (10 agents — all done except booking-copy/selection/catalog/cruises and rooms/rooms-seo/website-text/deck-atlas/suites as of 03:20;, started 2026-11-03 ~22:30; site agents write the -ru files, journal agents write
      blog-articles-ru batches + russian-work/journal/posts-J1..4.json, which the coordinator merges into blog-posts-ru.ts.
      A resumed run: check which -ru files still hold German with russian-work/tools/scan-ru.cjs and redo only those;
      briefs in russian-work/ru-brief.md and russian-work/journal-brief.md. Assignment, `russian-work/ru-brief.md`): chrome+home+SEO, booking, rooms+suites+website text, voyages+route+
      highlights+charter, about+contact+gastronomy+wellness+partners+alts+system pages, Terms, journal ×4.
- [x] Proofread against English — 6 agents instead of 2 (each must fit English + Russian side by side): journal A (batches 5, 1),
      B (7, 3, 6), C (2, 8, 4) started 2026-11-04 ~03:20; site proofreaders start when booking + rooms/suites translators finish.
      Brief: russian-work/proof-brief.md. A resumed run: proofread any part not listed as done in russian-work/review-notes.md.
- [x] Layout check at 1440×900, 1920×1080, 1024×1366, 768×1024, 390×844, 375×667; shorten overflowing headings.
- [x] Type-check and production build; leftover-English/German scan of every `-ru` file.
- [x] `docs/russian-review.md` written; final local commit. Stop and leave it for the owner.

## Done (2026-11-04)

All steps finished except the OWNER item. Production build passed (`next build --webpack`, first attempt failed on a
Google Fonts download on this network and passed on retry). Everything is local on `claude/russian-site`.
