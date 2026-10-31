# German site: notes for the native and legal review

The German pages live under `/de`. **All the German is a machine draft: no native speaker or lawyer
has read it yet.** The pages stay out of search (`LOCALE_INDEXED.de = false` in `lib/i18n/locale.ts`)
until both reviews below are done; that one switch then opens every German page to search at once.

The copy uses the formal "Sie". Product names stay in English (Hathor, Hathor Dahabiya, Luxury Suite,
Royal Suite, Seneb Spa, Historia Fitness). Place names are "Assuan" and "Kairo". Prices read
"7.000 $". Quotation marks are „ “. Headings use no hyphens or dashes because the display font does
not draw them, so running text says "Karnak-Tempel" and a heading says "Tempel von Karnak".

Please read each item in context on the page named, and reply with a corrected sentence or "OK".

## 1. Garbled English sources, rendered by their evident meaning

The English journal posts include some machine-spun sentences. The German versions follow the
Italian reading of them rather than the literal English.

| Article (`/de/blogs/…`) | English source | German as published | Question |
| --- | --- | --- | --- |
| `luxors-sacred-east-bank` | "the Avenue of the Sino-Japanese Peace Bell" | "Durch die Sphingenallee, die zu beiden Seiten von Sphingen gesäumt ist" | Repetitive? |
| `discover-the-valley-of-the-kings` | Several spun sentences throughout | Rendered by meaning | Please read the whole article once for sense and tone. |
| `sailing-to-karnak-temple` | "even dancing upon the decks of your boat" | "fast tanzend vor Freude" | Natural, or too effusive? |
| `golden-gems-of-aswan` | "innocent halls of the temple" | "Die gewaltigen Höfe und unversehrten Hallen des Tempels" (read as "intact halls") | OK? |
| `exploring-luxor-and-aswan-on-a-luxury-dahabiya` | Temples that have "the courtesy" to interrupt the cruise | "Majestätische Tempel unterbrechen Ihre Fahrt." | OK? |

## 2. Corrections kept from the Italian review

The English rows and the Italian copy were corrected in October 2026, and the German says the same:

- `luxors-sacred-east-bank`: the tomb of Ramses VI is across the river, on the West Bank.
- `kom-ombo-temple`: on the east bank, about 45 km north of Aswan.
- `golden-gems-of-aswan`: Edfu is between Luxor and Aswan, about 100 km north of Aswan.
- `niles-hidden-gems-by-dahabiya`: three wonders, not four, and "Beni Hasan".
- `discover-the-timeless-luxor-west-bank`: the Colossi of Memnon are about 3,400 years old.

## 3. Wording to confirm

| Where | Choice | Question |
| --- | --- | --- |
| `best-time-for-dahabiya-nile-cruise` | "Nilkreuzfahrt der absoluten Luxusklasse" for "ultra-luxury Nile cruise" | Is there a more natural phrase? It repeats through the article. |
| Temple names in articles | "Karnak-Tempel", "Luxor-Tempel", "Philae-Tempel" in text; "Tempel von …" in headings | OK together? |
| God and king names | "Hatschepsut", "Tutanchamun", "Sethos I.", "Chons", "Month", "Amun-Re" | Usual German forms? |
| Long journal titles | "Warum der Nil die wichtigste Handelsroute des alten Ägypten war" and two similar titles run past 60 characters | Search results will cut them. Shorter wording? |
| Structured data | Breadcrumb home reads "Startseite" | OK? |

Two points in the English source are carried over as they stand, for Hathor to confirm:

- `nile-cruise-or-luxury-dahabiya-which-one-to-choose` says "6 bis 12 Kabinen"; Hathor has twelve rooms.
- The Suites page's Luxury Cabins card says "OBERDECK", but the deck plan and About page put the cabins and suites on the lower deck.

## 4. Legal page

`/de/terms-and-conditions` is a translation of the English terms, including the October 2026
consumer-protection rewrite. It shows a visible draft notice (`draftNotice` in
`lib/i18n/terms-copy-de.ts`) until a lawyer qualified in German consumer law has approved it. Remove
that notice only after approval. No company detail or registration number was added.

Please check in particular:

- Payment, cancellation and refund sections, and whether the 25% / 50% / 100% fees are acceptable
  under the German rules on package travel (§§ 651a ff. BGB).
- The insolvency protection and pre-contract information requirements for packages (§ 651r BGB,
  Art. 250 EGBGB). Hathor needs an actual policy; the terms do not claim one.
- Limitation of liability, governing law, and the clause that the English text prevails.
- Whether the site needs a German-law legal notice (Impressum, § 5 DDG) and privacy notice before
  it opens to German visitors. Neither has been added.

Guest emails are in German too (`lib/i18n/email-copy-de.ts`, also a machine draft). Dashboard-edited email wording stays English: German emails use built-in text with the dashboard's colours, as Italian does.

## 5. To resolve later

Collected during the line-by-line check of the German against the English on 2026-10-30. Nothing
here was guessed: the German keeps the English meaning until someone decides.

### Decisions for Hathor

- **Terms, section 19.** The English says it is published "in English and Italian" and that "the
  Italian version" prevails or applies (`lib/terms-and-conditions-content.ts:349`). The German says
  "auf Englisch und in Übersetzungen" and "die deutsche Fassung" (`lib/i18n/terms-copy-de.ts:292`).
  The English needs updating before German opens.
- **Price format in the booking journey.** It shows "7.000 USD", mirroring the English "USD 7,000",
  while the rest of the site shows "7.000 $" (`lib/currency.ts`, `deMoney` in `booking-copy-de.ts:29`).
- **Occasions text.** Standard occasions now read in German from built-in text (`lib/i18n/occasions-copy.ts`), and the dashboard has a German field for custom messages. A custom message with neither is left off German pages rather than shown in English.
- **Dashboard edits do not reach German.** German overlays live in `lib/i18n/website-text-de.ts` and
  replace whole sections, so a dashboard change to the English needs a matching change there until the
  planned SEO section exists.
- **Itinerary reading links.** All 12 links in `booking-itineraries-de.ts` open English articles,
  because none has a German version. The nearest German article is `colossi-of-memnon`, not
  `colossi-of-memnon-luxor`.
- **Structured data address.** It stays "Cairo", "Egypt" because one organisation `@id` is shared by
  all languages (`components/seo/SiteStructuredData.tsx:32`, `PageStructuredData.tsx:107`,
  `HomeThreeStructuredData.tsx:139`, `components/layout/Footer.tsx:98`).

### Facts to confirm (English carried over as it stands)

- "6 bis 12 Kabinen" also appears in `how-is-a-dahabiya-different-from-a-nile-cruise`
  (`blog-articles-de/batch-5.ts:12`, `:22`), as well as the article named in section 3.
- `dahabiya-cruise-cost-explained-whats-included`: "8 to 20 guests" and "$300-$800 per night".
- Footer "Daily working hours", Contact "Day off: Friday", structured data "Sa-Th"
  (`components/seo/HomeThreeStructuredData.tsx:140`).
- Deck: Suites card says upper deck; charter and rooms say lower deck.
- Naming: "Luxury Cabins" (dashboard text) against "Luxury Rooms" (nav), and `lib/room-price-unit.ts:16`
  says "pro Zimmer" where the site says "Kabine". The English says "per room".
- The menu's Privacy and Terms links both go to `/contact`, as they do in English.
- "Accessible Hathor Suite" as a name; "an Egyptologist Guide"; "El Ramady" and "Ramadi" for one island.

### Garbled English left out or rendered by meaning (beyond section 1)

| Article | English | German |
| --- | --- | --- |
| `why-a-dahabiya-cruise-feels-like-time-travel` | "made of the finest of mechanical models" | Left out |
| `aswan-nubian-villages` | "giving few Nubians more glamour on offer"; "That's the other way round for the Nubian communities" | Left out |
| `why-the-nile-was-the-most-important-trade-route-in-ancient-egypt` | "complementary backward rush… centrifugal sailing" | North wind upstream, current downstream. The north wind is not in the English (`batch-3.ts:343`) |
| `discover-the-timeless-luxor-west-bank` | "Stendhal Syndrome" sentence | By meaning |
| `luxor-temple-facts` | "more than a century old" | Gone; the entrance is credited to Ramses II |
| `how-to-choose-the-right-cabin-on-a-dahabiya` | "operates without any people on board" | "fern der Menge" |
| `the-magic-of-sleeping-on-the-nile-river` | "completely empty" | By meaning |
| `tips-for-first-time-travelers-on-the-nile` | "excellent hospitality political" | By meaning |
| `the-most-relaxing-way-to-explore-egypt-sailing-the-nile` | "Benefits include:" twice | Once, as in Italian |
| `best-clothes-for-nile-cruise-weather-in-egypt`, `how-to-choose-the-right-cabin-on-a-dahabiya` | Sentence repeated in a block | Once |

### Shortened headings, to lengthen only if they fit

In `lib/i18n/website-text-de.ts` unless noted:

- `:64` "YOUR NILE RESIDENCE AWAITS": "IHRE SUITE WARTET"
- `:100` spa title drops "A Floating Oasis of Wellness"
- `:114` "MADE TO MOVE WITH YOU": "GEMACHT FÜR SIE"
- `:152` SUNRISE: "MORGEN"
- `:163` "SHAPE YOUR CONCIERGE VOYAGE": "EINE REISE NACH MASS"
- `:164` "DINING WITH ROOM TO BREATHE": "TAFELN OHNE EILE"
- Contact `heroSupport` drops "reservations"; `formTitle` is "Wir freuen uns auf Sie"
- `lib/i18n/route-copy-de.ts:195` guide title drops "cruise"
- Charter `form.title`: "Dahabiya Kreuzfahrt im Charter" for "Charter Dahabiya Cruise"

### Wording for the native reader

- "heiter/heitere" for "serene" appears 26 times and reads like an Italianism.
- "Hypostylhalle" (`batch-6.ts:20`) and "Hypostylsaal" (`batch-7.ts:64`) for one hall; "falkenköpfigen
  Gott Horus" and "Falkengott"; "Abu-el-Haggag-Moschee" for "Abu Haggag Mosque".
- `home-copy-de.ts:94-95` "She sails": "Sie fährt". "Sie segelt" may fit the no-engine copy better.
- `details.lede` says "Reservierung" like the English, though it is only a request.
- `noteBox` says "mindestens ein Erwachsener" where the English says "one adult".
- "Die Datenbank ist ausgelastet" is a literal rendering of a technical message.
- The bar button says "Bestätigen" while alerts name "Anfrage bestätigen".
- `rooms-copy-de.ts:334` "oil-drop sunset": "bernsteinfarben"; "inclusive": "barrierefreundlich".
- `rooms-copy-de.ts` "(öffentliche Besichtigungen)" for "public visits", and "Deck / Hauptdeck" for
  "Main / Deck".
- `highlights-copy-de.ts:30` `noteAlt`: "eine Reise mit der Hathor" for "aboard Hathor".
- `chrome-copy-de.ts:38` "Abfahrtstermine" for "Scheduled Voyages"; `:72` "Werkzeuge", "Tag", "Nacht".
- `route-copy-de.ts:19` "Two hundred acres" is converted to "Achtzig Hektar", as in Italian.
- `terms-copy-de.ts:346` "Tower 211 … Flat 111" stays English; Italian translated it.

### Stays English on purpose

- The word "EGYPT" in the homepage's desktop hero. No page code has it, so it appears to be part of
  the video; changing it means a German cut of the video.
- Guest reviews as written; review dates in a format the pattern table does not know
  (Google is called with `languageCode=en`, `lib/guest-reviews.ts:103`, `:124`).
- Room names stored in the database; the stored "Guests:" line on old bookings with no guest counts
  (`lib/booking-success-details.ts:113-115`).
- The charter fallback email, which goes to the reservations desk.
- Browser date and time pickers, which follow the browser language.
- Technical refusals such as "Cross-site request rejected" show the generic German error.

### Italian follow-ups (German now differs)

- New server messages fall back to the generic Italian line (`SERVER_IT` was not extended).
- Italian text added for new shared keys is a machine draft, like the rest.
- `website-text-it.ts` `cabinTitle` says "Luxury Rooms"; `reviews-copy.ts:167` adds LUXOR · ASSUAN.
- `rooms-copy.ts` "visite di gruppo" for "public visits" and `lead` "Luxury Royal Suite";
  `charter-copy.ts` "Libertà" for "Flexibility".

### Not reachable from `/de`, left English

`/booking/cruise/[id]`, `/booking/checkout`, `/ex`, `/home-3`, `/book`, `/site-index` and legacy
components such as `StaggeredMenu`, `ExplorePanel`, `CruisesListing`, `HomeCampaignSection`,
`ResidenceScrollPage` and `MarketingCtaBand`.
