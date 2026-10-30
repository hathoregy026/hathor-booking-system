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

Guest emails stay in English, as for Italian.
