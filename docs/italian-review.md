# Italian site: notes for the native review

The Italian pages live under `/it`. The copy is written in the formal "Lei", with gender-neutral
wording toward the reader. Product names stay in English (Hathor, Hathor Dahabiya, Luxury Suite,
Royal Suite, Luxury King Bed, Luxury Rooms, Hathor Flavors, Seneb Spa, Historia Fitness). Place
names are "Assuan" and "Il Cairo", prices are in USD, and the apostrophe is the curly ’.
Headings use no hyphens or dashes because the display font does not draw them.

Please read each item below in context on the page named, and reply with a corrected sentence or
"OK". Nothing listed here has been changed in the English pages.

## 1. Garbled English sources, rendered by their evident meaning

The English journal posts include some machine-spun sentences. The Italian versions give what the
sentence evidently means rather than a literal translation. Please check that each one reads
naturally and is not misleading.

| Article (`/it/blogs/…`) | English source | Italian as published | Question |
| --- | --- | --- | --- |
| `luxors-sacred-east-bank` | "Connected to the sprawling Karnak complex by the Avenue of the Sino-Japanese Peace Bell and lined with Sphinxes on both sides" | "Collegato al vasto complesso di Karnak dal Viale delle Sfingi, fiancheggiato da sfingi su entrambi i lati" | "Sino-Japanese Peace Bell" is a spinning error for the Avenue of Sphinxes. Is "Viale delle Sfingi" the right Italian name, and does "Viale delle Sfingi … fiancheggiato da sfingi" sound repetitive? |
| `discover-the-valley-of-the-kings` | Several spun sentences throughout | Rendered by meaning | Please read the whole article once for sense and tone. |
| `sailing-to-karnak-temple` | "Probably, even dancing upon the decks of your boat, there will be that very moment when you spot the monstrous entrances" | "Probabilmente sarà ancora sul ponte della Sua imbarcazione, quasi a danzare di gioia, nel momento in cui scorgerà in lontananza gli ingressi…" | Is "quasi a danzare di gioia" natural, or too effusive? |
| `golden-gems-of-aswan` | "The huge courtyards and innocent halls of the temple" | "Gli immensi cortili e le sale intatte del tempio" | "innocent halls" was read as "intact halls" ("sale intatte"). OK? |

## 2. Factual slips (fixed in both languages, October 2026)

These errors came from the English source. Hathor approved the corrections, and both the English
rows (database) and the Italian copy (`lib/i18n/blog-articles-it/`) now say the same, correct
thing. No action is needed beyond reading the new Italian sentences for tone.

| Article | Was | Now (Italian) |
| --- | --- | --- |
| `luxors-sacred-east-bank` | Tomb of Ramses VI listed among the East Bank wonders | "Dall’altra parte del fiume, sulla riva occidentale, la tomba di Ramses VI nella Valle dei Re…" |
| `kom-ombo-temple` | "sits on Luxor east bank" | "…sorge sulla riva orientale del Nilo, circa 45 km a nord di Assuan…" (the link to the Luxor East Bank article was dropped) |
| `golden-gems-of-aswan` | Edfu called one of the top Aswan attractions (twice) | "Tra Luxor e Assuan, circa 100 km a nord di Assuan, il Tempio di Edfu…" and "…dei luoghi più belli tra Luxor e Assuan…" |
| `niles-hidden-gems-by-dahabiya` | "four scenic wonders", three listed | "Ecco tre meraviglie panoramiche…" |
| `discover-the-timeless-luxor-west-bank` | Colossi of Memnon "centuries old" | "…antiche di circa 3.400 anni." |
| `niles-hidden-gems-by-dahabiya` | "Bani Hassan" | "Beni Hasan" |

## 3. Legal page

`/it/terms-and-conditions` is a full translation of the English terms. A legal check by someone
qualified in Italian consumer law is needed before relying on it. In particular, please confirm:

- which text prevails if the English and Italian versions differ (the page does not say yet);
- the payment, cancellation and refund sections;
- the limitation of liability and governing law sections.

## 4. Other choices to confirm

| Where | Choice | Question |
| --- | --- | --- |
| Amenity captions on `/it/cruises-list`, `/it/luxury-cabins-Nile-Cruise`, `/it/royal-suites` | The short caption under the no-smoking icon reads "No fumo" (the long form is "Non fumatori") | The short slot has room for about 8 characters. Is "No fumo" acceptable, or is "Non fumatori" better even if it wraps? |
| Breadcrumbs and menus | "Home" is kept as the first breadcrumb | Common on Italian sites. OK, or "Pagina iniziale"? |
| `/it/gastronomy` | "Room service" kept in English | OK? |
| `/it/wellness` | "Historia" is the fitness room's name and stays as is | OK? |
| Image descriptions (alt text) | Some English image descriptions were internal labels ("Dining — Wine pairing", "Hathor plated course 3"). The Italian alt text describes the photo instead ("Vini in abbinamento a bordo di Hathor", "Una portata servita a bordo di Hathor"). The list is in `lib/i18n/site-image-alts-it.ts`. | Please skim the list for tone. |
| `/it` 404 page | "Pagina non trovata · L’indirizzo che ha aperto non esiste o è stato spostato. Può tornare alla pagina iniziale o scegliere il Suo viaggio sul Nilo." Buttons: "Pagina iniziale", "I viaggi". | OK? |
| Booking pages | Titles "Richiesta di prenotazione inviata" (after sending) and "Segua la Sua prenotazione" (booking lookup) | OK? |
| `/it/gastronomy` closing title | "UNA CUCINA / CHE LASCIA / RESPIRARE" ran off a phone screen, so it now reads "A TAVOLA / SENZA / FRETTA" (English: "Dining with room to breathe") | OK? |
| Footer button | "Noleggia la dahabiya" overflowed on phones; it now reads "Charter privato" | OK? |

## 5. Points raised by the proofreading pass (October 2026)

### Decided by Hathor (applied on the site)

- **Buttons:** buttons, links and their screen-reader labels use the short imperative ("Prenota ora",
  "Scopri", "Prosegui", "Richiedi un charter privato", "Contatta Hathor", "Riprova"), and so do the
  scroll hints ("Scorri"). Sentences, headings, step lists, hints and form messages keep the formal
  "Lei" ("Scelga il Suo paese.", "Prenoti la Sua suite").
- **"il Cairo":** lowercase in running text ("Luxor, Assuan e il Cairo"); standalone place labels and
  address lines keep "Il Cairo".
- **Room and suite names:** one invariable form, "Luxury Suite" and "Royal Suite" (as in "le Royal
  Suite"). The catalog tier "Luxury Room" stays as it is.
- **Menus:** "Crociere" is `/it/cruises-list` (the scheduled sailings) and "Viaggi" is `/it/voyages`,
  in the header, footer and breadcrumbs alike.
- **Place names:** "Philae" everywhere (no more "File").
- **Welcome drink:** "Aperitivo di benvenuto".
- **Odd journal sentences** now say something true, in Italian only (the English rows are unchanged):
  the Valley of the Queens is contrasted with "i grandi monumenti dei faraoni"; Medinet Habu's
  colours "raccontano la sua storia con una chiarezza rara anche tra i grandi templi di Tebe"; the
  Nubian houses are "in tradizionale stile nubiano"; the High Dam "ha domato il Nilo, mettendo fine
  alle sue piene annuali"; and on the Nile "un silenzio che non è mai solitudine".

### Still open for the native speaker

| Where | Question |
| --- | --- |
| Place names | "El Ramady" and "Ramadi" both appear (as in English). Which one? |
| Small wording | "Prove discrete" for "Quiet proof" (or "Garanzie discrete"?), "Navigare lenti" (or "Navigare piano"?), "Champagne" capitalised, "Camera e lavanderia" for room and laundry service, the short captions "Clima" and "Phon". |
| Photo descriptions | "Un ospite in accappatoio…" and "Un ospite legge in poltrona…" use the masculine; please check against the photos. |
| Long journal titles | Some Italian article titles exceed 60 characters on their own (for example "Perché il Nilo fu la via commerciale più importante dell’antico Egitto"), so search results will cut them. Shorter titles would need new wording. |
| Tone | Please read the short-imperative buttons next to the "Lei" sentences on a few pages (`/it/charter`, `/it/booking`) and say whether the mix feels natural. |

## 6. Legal page: points for the legal check

### Fixed in both languages (wording only, October 2026)

- **VAT note:** it no longer reads like an internal comment. Section 7 now says the published price
  includes taxes and service charges, then "These include **14% VAT and the service charge**." /
  "Sono compresi **l’IVA al 14% e il costo del servizio**." The meaning is unchanged.
- **Office address:** the terms now match the contact page, footer and structured data: "One Kattamiya,
  Tower 211, Floor 11, Flat 111, Ring Road, Cairo, Egypt" / "One Kattamiya, Torre 211, 11º piano,
  int. 111, Ring Road, Il Cairo, Egitto" ("Nasr City" dropped, as Hathor confirmed).
- **Soft All-Inclusive (section 5)** is now defined: all meals and soft drinks (tea, coffee, soft
  drinks and fresh juices); alcoholic drinks are not included (see section 6, Exclusions).

### Still for the lawyer

- Section 1: "i pagamenti complessivi devono essere pari al 50%" could mean exactly or at least 50%.
- Section 13: a non-refundable credit voucher, and "I rimborsi in denaro non sono garantiti" when
  Hathor itself cancels, need a view under EU package-travel and Italian consumer law; so do the
  broad exclusions in sections 9, 12, 15 and 17. These clauses have not been changed.
- Which language prevails. A draft for the lawyer to review. It is **not published** on the site:

  > **English:** These Terms & Conditions are published in English and Italian. The Italian version
  > is provided for convenience. If the two versions differ, the English version prevails, unless
  > the law that applies to your booking requires otherwise.
  >
  > **Italiano:** I presenti Termini e condizioni sono pubblicati in inglese e in italiano. La
  > versione italiana è fornita per comodità di consultazione. In caso di differenze tra le due
  > versioni prevale la versione inglese, salvo che la legge applicabile alla Sua prenotazione
  > disponga diversamente.
