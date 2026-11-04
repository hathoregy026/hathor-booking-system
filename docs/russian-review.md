# Russian site: notes

The Russian pages live under `/ru`. They are on the local branch `claude/russian-site` only: nothing is pushed, merged or
deployed (the owner's instruction of 3 November 2026: "do not go live yet, just translate and keep it local"). The Russian was
translated from the English and checked by a second, independent pass against the English, string by string. **Hathor decided
that no native reader, copywriter or lawyer will review it.** The pages stay out of search while `LOCALE_INDEXED.ru` in
`lib/i18n/locale.ts` is false.

Scope as for Italian and German: every public page, the booking journey and all 44 journal articles. The dashboard and all
emails stay English.

## 1. English fixes made first

Before translating, the English mistakes were fixed, with the same fixes in Italian and German where they repeated them.
Every change is listed before → after in `docs/english-fixes.md`.

- **Terms (code, all three languages, local only):** the tax line showed a drafting note to guests ("The client-supplied Terms
  & Conditions state that…"); it now reads "This includes 14% VAT and service charge." The office address now matches the
  Contact page.
- **Journal (English rows live in the database):** 379 fixes across the 44 posts — 31 facts (no "VIP Suite"; Hathor has 12
  rooms; the Avenue of Sphinxes, not a "Peace Bell"; Nubia is Egypt's far south; Hatshepsut's temple has three terraces;
  boats sail downstream to Luxor; …), 143 garbled sentences, 200 clear grammar errors, 5 duplicated lines. Italian and German
  copied 40 of the factual errors; those are fixed in code.
- **/suites cabin card (dashboard Website Text, database):** "UPPER DECK" → "LOWER DECK".

**Waiting for the owner:** the two database changes above. The auto-mode safety check blocks live database writes, so they
are a ready script: `russian-work/english-fixes/apply-to-live.cjs` (run without `--apply` for a dry run; on 3 November all 379
fixes matched the live rows). It skips any post edited in the dashboard since the backup
(`russian-work/backup/BlogPost.backup-2026-11-03.json`) and writes everything in one transaction.

## 2. How the Russian reads

- Polite «вы», lowercase; buttons and links in the infinitive («Забронировать», «Подробнее», «Отправить запрос»).
- Product names stay in Latin letters: Hathor, Hathor Dahabiya, Luxury Rooms, Luxury Suite, Royal Suite, Luxury King Bed,
  Luxury Twin Bed, Seneb Spa, Historia Fitness, Hathor Flavors, Nile Majesty, Soft All-Inclusive.
- dahabiya «дахабия»; cabin «каюта»; suite «люкс»; Nile cruise «круиз по Нилу»; charter «чартер дахабии по Нилу»;
  "My Voyage" «Мое путешествие»; "Favorites" «Избранное»; "Highlights" «Достопримечательности» (menu) / «Что увидеть» (hero).
- Places and names in their usual Russian forms: Луксор, Асуан, Каир, Эдфу, Ком-Омбо, Филе, Карнак, Долина царей, Хатшепсут,
  Рамсес II, Аменхотеп III. Headings cannot show a hyphen (see 4), so they write «Ком Омбо», «Мединет Абу», «Бени Хасан».
- Prices «7 000 $» (booking journey «7 000 USD»); dates «вторник, 3 ноября 2026 г.»; Russian's three plural forms everywhere
  (1 ночь / 2 ночи / 5 ночей, до 21 гостя).
- Guest reviews from the live review feed stay in their original English. The two quotes written into the charter page are
  translated, as Italian and German do.
- Terms: an exact clause-by-clause translation of the live English, formal register, «Условия и положения» throughout; no
  clause was softened or added and none says which language prevails, because the English has none.

## 3. Fonts

None of the brand faces draw Cyrillic. `app/hathor-fonts-cyrillic.css` adds, under each existing family name, a face that
covers only Cyrillic letters, with exactly the weight and style of the face it extends:

- display, script and serif faces → **Forum** (the owner asked for the closest font to Italiana);
- body text (Plus Jakarta Sans) → **Manrope**, variable 400–600.

Browsers fetch these files only when a page contains Cyrillic, so English, Italian and German keep their fonts. The one
exception: the language menu's «Русский» is Cyrillic, so every page loads the 14 KB Manrope file. The `/suites` frame gets the
same faces in `public/hathor-fonts.css`; the booking journey's Inter and Playfair already draw Cyrillic.

The homepage hero's second line is a script face laid over the first line in Latin. Forum draws Cyrillic upright, which
would collide, so on Russian pages that line sits just under the first at a smaller size (`home-three.css`).

## 4. Headings shortened or reworded to fit

Russian runs longer than English and the display face draws no hyphens, dashes or quotation marks, so these are freer than a
word-for-word translation (most follow the cuts German made for the same panels):

| Where | English | Russian |
| --- | --- | --- |
| Wellness essay | Rest is not / the absence of / the voyage | Отдых не / прерывает / путешествие |
| Wellness ritual | Recovery | Отдых |
| Spa title | … A Floating Oasis of Wellness | Seneb Spa на Ниле |
| Gastronomy statement (4 lines) | … | ЗАДЕРЖИТЕСЬ / ЗА СТОЛОМ / У РЕКИ |
| Highlights | Cruise in true elegance | Изящный круиз |
| Journal lyric | Stories written / for the journey / ahead | Истории для / предстоящего / путешествия |
| Footer | YOUR NILE STORY / BEGINS HERE | ВАШ НИЛ / НАЧИНАЕТСЯ ЗДЕСЬ |
| Charter | Your Journey, Redefined. | Ваше путешествие, / в новом свете. |
| Charter | Quiet proof / The vessel is yours | Тихие / доводы · Это судно / ваше |
| Voyages hero | Our Voyages / Shaped by / The Nile | Наши путешествия / по воле / Нила |
| Suites closing card | … | Где каждый / вид на Нил / принадлежит / вашему люксу |
| Concierge / dining panels | Shape your concierge voyage · Dining with room to breathe | ПУТЕШЕСТВИЕ / ПО МЕРКЕ · ТРАПЕЗА / БЕЗ / СПЕШКИ |
| Booking band | A slower way to see a greater Egypt | Чем медленнее путь, / тем больше Египта |

## 5. To confirm (the Russian says what the English says)

- "Accessible Hathor Suite" → «Люкс Hathor с доступной средой»; and "inclusive cabins" «инклюзивные». Is the suite really
  accessible?
- One island, two names: "El Ramady" (4-night itinerary) and "Ramadi" (7-night).
- Aswan → Luxor search description and route statement list Edfu; the 3-night day-by-day itinerary has no Edfu stop.
- Gastronomy story card says breakfast on the "UPPER DECK"; Hathor's decks are lower, main and sun deck.
- Suites ledger "1 Residence · Lower deck" against "2 Luxury Suites aboard".
- Journal posts: "downstream towards Luxor" then "cruise southward" (Hatshepsut); Beni Hasan offered on the 3-night trip though
  far off that route (hidden gems); "all Egyptian historical sites" on the 7-night trip; "more than eighteen pharaohs" against
  "30 or so rulers" for Karnak; October–April "high season" but March–April crowds "sparse"; the Aswan excerpt promises Abu
  Simbel, which the article never covers; luxor-temple-facts says the temple "was not dedicated to a single god" yet held
  Amun's sanctuary; Kom Ombo photo alt "crocodile museum aswan".
- Footer script line "Adventures the Nile" (a word is missing) → «Приключения на Ниле».
- Contact: "Daily working hours … Day off: Friday" says both daily and a day off; translated as written.
- Booking alerts say "cart" while the header says "My Voyage"; "Availability is unavailable."
- General market figures carried as they stand: dahabiyas "6 to 12 cabins", "8 to 20 guests", "$300–$800 per person per
  night".

## 6. Layout

Checked with Playwright at 1440×900, 1920×1080, 1024×1366, 768×1024, 390×844 and 375×667 on every page, each Russian page
compared with its English (`russian-work/tools/layout-check.cjs`): no page overflow and no clipped text that English does not
also have. Found and fixed: the homepage hero overlap, English phone-dock captions (they are CSS text per language, now in
Russian), the deck plan's "Booked" tag.

Not changed, because English and German have it too: on the room collection pages at 1440 the floating booking pill covers
the hero's inline booking button. The room page's section tabs scroll sideways by design, so the fourth tab is partly hidden at
phone width in every language.

## 7. Before going live

1. The owner runs or approves `apply-to-live.cjs` (English journal + /suites deck) — independent of the Russian.
2. Merge `claude/russian-site` into a branch cut from the then-current GitHub main (local main is far behind), run
   `npx tsc --noEmit -p .` and the production build, push to main only with the owner's go-ahead (push = deploy).
3. Keep `LOCALE_INDEXED.ru` false until Hathor wants Russian in search.
4. Dashboard edits do not reach Russian: overlays in `lib/i18n/website-text-ru.ts` replace whole sections, as for Italian
   and German, until the planned dashboard SEO section exists.
