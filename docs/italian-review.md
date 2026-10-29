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

## 2. Factual slips copied from English (decision needed in both languages)

These errors are in the English source, and the Italian keeps them so both languages say the same
thing. None of them has been corrected. Each needs a decision from Hathor before the English row
(in the database) and the Italian copy (in `lib/i18n/blog-articles-it/`) are both changed.

| Article | What it says | What is correct | Italian wording today |
| --- | --- | --- | --- |
| `luxors-sacred-east-bank` | Lists the Tomb of Ramses VI among the East Bank wonders | The tomb is in the Valley of the Kings, on the **West** Bank | "Tra le meraviglie della riva orientale, la tomba di Ramses VI nella Valle dei Re…" |
| `kom-ombo-temple` | "This remarkable structure sits on Luxor east bank" | Kom Ombo is about 45 km north of Assuan, far from Luxor (it does stand on the east bank of the Nile) | "Questa straordinaria costruzione sorge sulla riva orientale di Luxor" |
| `golden-gems-of-aswan` | "As one of the top Aswan attractions, the Edfu Temple…" | Edfu lies between Luxor and Assuan, about 100 km north of Assuan | "Tra le principali attrazioni di Assuan, il Tempio di Edfu…" |
| `niles-hidden-gems-by-dahabiya` | "Here are four scenic wonders", then lists three | Either add a fourth or say three | "Ecco quattro meraviglie panoramiche…" |
| `discover-the-timeless-luxor-west-bank` | The Colossi of Memnon are "centuries old" | About 3,400 years old (Amenhotep III) | "…i due Colossi di Memnone, antiche di secoli." |
| `niles-hidden-gems-by-dahabiya` | "Bani Hassan" | The usual spelling is **Beni Hasan** (Italian sources also use "Beni Hasan") | "Bani Hassan" |

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
