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
| `luxors-sacred-east-bank` | "Connected to the sprawling Karnak complex by the Avenue of the Sino-Japanese Peace Bell and lined with Sphinxes on both sides" | "Collegato al vasto complesso di Karnak dal Viale delle Sfingi, con le due lunghe file di statue che lo fiancheggiano…" | Decided: "Viale delle Sfingi" is the name; the rest avoids repeating "sfingi". |
| `discover-the-valley-of-the-kings` | Several spun sentences throughout | Rendered by meaning | Please read the whole article once for sense and tone. |
| `sailing-to-karnak-temple` | "Probably, even dancing upon the decks of your boat, there will be that very moment when you spot the monstrous entrances" | "…con il cuore leggero…" | Decided: "quasi a danzare di gioia" was too effusive. |
| `golden-gems-of-aswan` | "The huge courtyards and innocent halls of the temple" | "Gli immensi cortili e le sale intatte del tempio" | Decided: "sale intatte" stands. |

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

`/it/terms-and-conditions` is an exact translation of the live English terms, clause by clause. The
English terms are unchanged. Hathor asked for a translation only, with no change to the wording.

## 4. Other choices to confirm

| Where | Choice | Question |
| --- | --- | --- |
| Amenity captions on `/it/cruises-list`, `/it/luxury-cabins-Nile-Cruise`, `/it/royal-suites` | Decided: "Non fumatori" in both the short and long slots | Closed. |
| Breadcrumbs and menus | Decided: "Home" stays as the first breadcrumb | Closed. |
| `/it/gastronomy` | Decided: "Servizio in suite" on the story card and in the concierge text, because the card is set in the guest's suite. Amenity lists keep "Servizio in camera". | Closed. |
| `/it/wellness` | Decided: "Historia" stays, as part of the product name Historia Fitness | Closed. |
| Image descriptions (alt text) | Some English image descriptions were internal labels ("Dining — Wine pairing", "Hathor plated course 3"). The Italian alt text describes the photo instead ("Vini in abbinamento a bordo di Hathor", "Una portata servita a bordo di Hathor"). The list is in `lib/i18n/site-image-alts-it.ts`. | Please skim the list for tone. |
| `/it` 404 page | Decided: "Pagina non trovata · La pagina che cerca non esiste o è stata spostata. Può tornare alla pagina iniziale o scegliere il Suo viaggio sul Nilo." Buttons: "Torna alla home", "Scopri i viaggi". | Closed. |
| Booking pages | Titles "Richiesta di prenotazione inviata" (after sending) and "Segua la Sua prenotazione" (booking lookup) | OK? |
| `/it/gastronomy` closing title | Decided: "A TAVOLA / SENZA / FRETTA" stands (English: "Dining with room to breathe"). The longer "Una cucina che lascia respirare" ran off a phone screen. | Closed. |
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
| Place names | Decided: "Ramadi" in the Italian text. "El Ramady" remains only in English pages. |
| Small wording | Decided: "Voci discrete" for "Quiet proof", "Navigare adagio", lowercase "champagne", "Servizio in camera e lavanderia". The short captions "Clima" and "Phon" stay. |
| Photo descriptions | Decided: neutral "Relax in accappatoio…" and "Lettura in poltrona…", so no gender is assumed. |
| Long journal titles | Decided: the search titles were shortened where they ran past what search results show. |
| Tone | Please read the short-imperative buttons next to the "Lei" sentences on a few pages (`/it/charter`, `/it/booking`) and say whether the mix feels natural. |

## 6. Legal page: translation notes

Decided by Hathor on 31 October 2026: the English terms stay exactly as they are live, and the Italian
says the same thing, no more and no less. An earlier rewrite of the terms in both languages was
removed.

Three lines of the English are translated as they stand:

- the VAT note, "The client-supplied Terms & Conditions state that this includes 14% VAT and service
  charge";
- the office address, which includes Nasr City and differs from the contact page;
- "Soft All-Inclusive service", with no further definition.

## 7. `/it/suites` (machine-drafted, October 2026)

This page was added after the rest of the Italian site, at Hathor's request. **The Italian below was machine-drafted and
then revised by AI; no native speaker has read it yet.** A read of the whole page at desktop and phone width is still welcome.
The English page's words are unchanged.

The words live in `lib/i18n/website-text-it.ts` (section `suites`, translated from the live dashboard
text, not the code defaults), `lib/i18n/suites-copy.ts` (hero labels and carousel captions),
`lib/i18n/pages-seo-it.ts` (title and description) and `lib/i18n/site-image-alts-it.ts` (four photo
descriptions). The footer reuses the site footer's wording.

| Where | English | Italian | Status |
| --- | --- | --- | --- |
| Hero title | "River Suites" | "Suite sul Nilo" | Decided |
| Hero label | "Made for living" | "Spazi da vivere" | Decided |
| Hero label above the photo | "Nile dahabiya suites" | "Suite in dahabiya" (phone: "Suite in dahabiya sul Nilo") | "sul Nilo" is dropped on desktop because a longer line ran across the photo. OK? |
| Hero sentence | "Quiet, crafted comfort; river light; the Nile just beyond the glass." | "Comfort discreto e curato, luce del fiume, il Nilo appena oltre il vetro." | Decided |
| Story title | "Rooms composed for quiet with the Nile always near" | "Camere pensate per la quiete con il Nilo sempre vicino"; the caption reads "Camere su misura" | Decided |
| Quality titles | "River Light", "Private Calm", "Egyptian Craft" | "Luce del fiume", "Quiete privata", "Artigianato egiziano" | Decided |
| Carousel caption | "Craft / Nile living" | "Artigianato / Vivere il Nilo" | Decided |
| Collection cards | "Luxury Cabins", "Ensuite Calm", "Nile at Night" | "Luxury Rooms" (the menu's product name), "Bagno privato", "Il Nilo di notte" | Decided |
| Card labels | "EN SUITE", "PRIVATE" | "IN SUITE", "IN PRIVATO" | Decided |
| Collection closing title | "Where every Nile horizon belongs to your suite" | "Ogni vista del Nilo è della Sua suite" | Decided |
| Reservations title | "Your Nile residence awaits" | "La Sua suite La attende" | Decided: "Residenza" broke in two on phones. |
| Closing | "Begin Your Journey" and "Join our exclusive circle…" | "Inizi il Suo viaggio" and "Entri nella nostra cerchia ristretta di ospiti…" | Decided |
| Button | "Request Suite Availability" | "Richiedi la disponibilità" | Decided |
| Search result | "Luxury Nile Cruise Suites \| Hathor Dahabiya" | "Suite di lusso per la crociera sul Nilo \| Hathor Dahabiya" | Decided |

Decided by Hathor on 31 October 2026: the cabins are on the lower deck ("PONTE INFERIORE"). The English
card's words come from the dashboard's Website Text, so Hathor's team changes that line there.

## 8. Wording decisions (October 2026)

These were decided by AI to finish the site, in place of the open questions above. They are applied on
the site. A native speaker may overrule any of them.

| Area | Decision |
| --- | --- |
| `/it/suites` | "Suite sul Nilo", "Spazi da vivere", "Camere su misura", "Artigianato egiziano", "Bagno privato", "IN SUITE", "IN PRIVATO", "Ogni vista del Nilo è della Sua suite", "cerchia ristretta di ospiti" |
| Selling pages | "Non fumatori", "Home" stays, "Voci discrete", "Navigare adagio", "Servizio in camera e lavanderia", "Ramadi", lowercase "champagne" |
| Editorial pages | "Servizio in suite" on `/it/gastronomy`, "Historia" stays, the 404 wording in section 4, "A TAVOLA / SENZA / FRETTA", "I templi" for the highlights note, "che amano come noi i viaggi autentici sul Nilo" for the partners strip (the longer line ran past its column), "Prossimamente" for the coming-soon placeholder |
| Journal | "Viale delle Sfingi … con le due lunghe file di statue che lo fiancheggiano", "con il cuore leggero", "sale intatte" |
| Occasions | "Fino a Capodanno", "Conto alla rovescia" |
| Search and photo text | Neutral "Relax in accappatoio…" and "Lettura in poltrona…", shortened titles |
| Reviews | Ratings use the Italian comma ("4,9"). The platforms' dates are put in Italian ("2 mesi fa", "marzo 2026"); the reviews themselves stay as the guests wrote them. |
| Links | Links use "Scrivici"; headings and sentences keep "Ci scriva". |
