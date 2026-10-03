/**
 * Journal posts in Italian, keyed by slug. The posts themselves live in the
 * database (BlogPost); a translation is kept here so the English rows stay
 * exactly as the team writes them. A post with no entry, or one added later
 * in the dashboard, shows its English text on Italian pages.
 *
 * `title` and `excerpt` serve the journal index. A post's article opens in
 * Italian only once its slug is in TRANSLATED_BLOG_SLUGS_IT; until then its
 * links lead to the English article.
 */

import type { PublicLocale } from "@/lib/i18n/locale";

type PostWords = { title: string; excerpt: string };

export const BLOG_POSTS_IT: Record<string, PostWords> = {
  "unplugged-travel-no-wifi-experience-on-a-dahabiya": {
    /* No "Wi-Fi" in the title: large type breaks it at the hyphen. */
    title: "Senza connessione: viaggiare offline in dahabiya",
    excerpt:
      "Viva un viaggio offline in Egitto a bordo di una crociera di lusso in dahabiya: slow travel, una disintossicazione digitale senza Wi-Fi e un viaggio sereno lungo il Nilo, tra esperienze culturali autentiche e paesaggi senza tempo.",
  },
  "the-magic-of-sleeping-on-the-nile-river": {
    title: "La magia di dormire sul Nilo",
    excerpt:
      "Scopra la magia di dormire sul Nilo, in Egitto: una notte di navigazione serena lungo il fiume, tra paesaggi antichi, acque tranquille e tramonti indimenticabili, per un’esperienza di viaggio davvero senza tempo.",
  },
  "secret-spots-between-luxor-and-aswan": {
    title: "Luoghi segreti tra Luxor e Assuan",
    excerpt:
      "Scopra i luoghi segreti tra Luxor e Assuan durante una crociera sul Nilo in Egitto: il Tempio di Edfu, il Tempio di Kom Ombo, la chiusa di Esna e i tranquilli villaggi sulle rive del Nilo senza tempo.",
  },
  "hidden-islands-you-can-only-see-on-a-dahabiya": {
    title: "Isole nascoste che si vedono solo in dahabiya",
    excerpt:
      "Scopra le isole nascoste del Nilo raggiungibili solo con una crociera in dahabiya in Egitto: slow travel, paesaggi incontaminati e un viaggio di lusso a vela tra luoghi segreti lungo il fiume.",
  },
  "untouched-nature-along-the-nile-river": {
    title: "Natura incontaminata lungo il Nilo",
    excerpt:
      "Scopra la natura incontaminata lungo il Nilo, in Egitto, dove paesaggi sereni, isole verdi, uccelli e panorami suggestivi rendono la crociera sul Nilo un’esperienza rilassante e autentica.",
  },
  "why-travelers-love-slow-travel-on-the-nile": {
    title: "Perché i viaggiatori amano lo slow travel sul Nilo",
    excerpt:
      "Scopra la bellezza dello slow travel sul Nilo con una crociera rilassante in Egitto da Luxor ad Assuan, tra templi antichi, panorami sul fiume ed esperienze culturali indimenticabili.",
  },
  "the-most-relaxing-way-to-explore-egypt-sailing-the-nile": {
    title: "Il modo più rilassante di scoprire l’Egitto: navigare sul Nilo",
    excerpt:
      "Scopra l’Egitto nel modo più rilassante con una crociera sul Nilo da Luxor ad Assuan, tra templi antichi, splendidi panorami sul fiume ed esperienze di lusso indimenticabili.",
  },
  "tips-for-first-time-travelers-on-the-nile": {
    title: "Consigli per chi naviga sul Nilo per la prima volta",
    excerpt:
      "I consigli essenziali per chi affronta per la prima volta una crociera sul Nilo in Egitto: i suggerimenti degli esperti, una lista completa di cosa mettere in valigia e cosa aspettarsi da una crociera di lusso sul Nilo.",
  },
  "why-a-dahabiya-cruise-feels-like-time-travel": {
    title: "Perché una crociera in dahabiya sembra un viaggio nel tempo",
    excerpt:
      "Scopra il fascino di una crociera in dahabiya in Egitto e viva un’esperienza autentica sul Nilo, navigando tra Luxor e Assuan. La bellezza senza tempo dell’Egitto, in uno stile di lusso tradizionale e sereno.",
  },
  "best-clothes-for-nile-cruise-weather-in-egypt": {
    title: "Cosa indossare in crociera sul Nilo: clima e abbigliamento",
    excerpt:
      "Scopra cosa indossare in crociera sul Nilo, in Egitto, con semplici consigli per il giorno e la sera: i capi migliori e come vestirsi comodamente per il clima di Luxor e Assuan.",
  },
  "dahabiya-cruise-cost-explained-whats-included": {
    title: "Quanto costa una crociera in dahabiya in Egitto: cosa è incluso",
    excerpt:
      "Il costo reale di una crociera in dahabiya in Egitto: il prezzo nel dettaglio, cosa è incluso e cosa no, i fattori che lo influenzano e perché questa navigazione di lusso tra Luxor e Assuan è uno dei modi più sereni ed esclusivi di scoprire il Nilo.",
  },
  "what-to-pack-for-a-dahabiya-nile-cruise": {
    title: "Cosa mettere in valigia per una crociera in dahabiya sul Nilo",
    excerpt:
      "Una guida semplice a cosa mettere in valigia per una crociera in dahabiya sul Nilo, in Egitto: l’abbigliamento essenziale, le regole di abbigliamento locali e i consigli per chi parte per la prima volta, per un viaggio comodo e indimenticabile.",
  },
  "how-to-choose-the-right-cabin-on-a-dahabiya": {
    title: "Come scegliere la cabina giusta su una dahabiya",
    excerpt:
      "Come scegliere la cabina giusta su una dahabiya e quale sia la più romantica per una crociera sul Nilo in Egitto: cabine private, piccole sistemazioni di lusso e le diverse tipologie spiegate, per una navigazione comoda e memorabile.",
  },
  "history-of-dahabiya-boats-in-egypt": {
    title: "La storia delle dahabiya in Egitto",
    excerpt:
      "La storia delle dahabiya in Egitto: come queste eleganti barche a vela siano passate dagli antichi viaggi sul Nilo all’odierna crociera in dahabiya. Le radici culturali, il design unico e il lusso.",
  },
  "why-the-nile-was-the-most-important-trade-route-in-ancient-egypt": {
    title: "Perché il Nilo fu la via commerciale più importante dell’antico Egitto",
    excerpt:
      "Il commercio sul Nilo nell’antico Egitto fu essenziale per i trasporti, l’economia e gli scambi: collegò le diverse regioni e sostenne una delle più grandi civiltà della storia.",
  },
  "what-is-a-dahabiya-nile-cruise-complete-beginner-guide": {
    title: "Che cos’è una crociera in dahabiya sul Nilo? La guida completa",
    excerpt:
      "Una crociera in dahabiya sul Nilo, in Egitto, si svolge su una piccola barca a vela tradizionale: un viaggio di lusso sereno lungo il fiume, con un’esperienza culturale e autentica.",
  },
  "is-the-nile-safe-for-sailing-today": {
    title: "Navigare sul Nilo oggi è sicuro?",
    excerpt:
      "Navigare sul Nilo è sicuro? Questa guida esamina le attuali condizioni di sicurezza delle crociere sul Nilo in Egitto, spiega quanto sia sicuro oggi per i turisti e offre consigli e aggiornamenti utili per un viaggio sereno e piacevole.",
  },
  "colossi-of-memnon": {
    title: "I Colossi di Memnone",
    excerpt:
      "I Colossi di Memnone a Luxor sono le celebri statue antiche del faraone Amenhotep III, famose per le dimensioni imponenti, la storia ricchissima e la misteriosa leggenda del suono che «cantava» all’alba.",
  },
  "aswan-nubian-villages": {
    title: "I villaggi nubiani di Assuan",
    excerpt:
      "Scopra i villaggi nubiani di Assuan e la vivace cultura nubiana in Egitto: uno sguardo ai villaggi colorati, alle tradizioni e all’autentico stile di vita sulle rive del Nilo.",
  },
  "luxor-temple-facts": {
    title: "Il Tempio di Luxor: storia e curiosità",
    excerpt:
      "Il Tempio di Luxor è un antico tempio egizio sulla riva orientale del Nilo. Celebre per le grandi statue, le colonne imponenti e la sua importanza storica, testimonia la ricca cultura e l’architettura dell’Egitto e attira visitatori da tutto il mondo.",
  },
  "how-is-a-dahabiya-different-from-a-nile-cruise": {
    title: "In cosa una dahabiya è diversa da una crociera sul Nilo?",
    excerpt:
      "La vera differenza tra una dahabiya e una crociera tradizionale sul Nilo: dimensioni, privacy, lusso e stile di viaggio a confronto, per scegliere l’esperienza sul Nilo più adatta al Suo viaggio in Egitto.",
  },
  "what-is-the-best-dahabiya-nile-cruise": {
    title: "Qual è la migliore crociera in dahabiya sul Nilo?",
    excerpt:
      "Scopra la migliore crociera in dahabiya sul Nilo: una navigazione privata e rilassata con Hathor Cruise, dove il servizio personalizzato e il ritmo lento creano un modo unico e autentico di scoprire l’Egitto.",
  },
  "why-choose-a-dahabiya-cruise-in-egypt": {
    title: "Perché scegliere una crociera in dahabiya in Egitto?",
    excerpt:
      "Scopra i vantaggi di una crociera privata in dahabiya e il Nilo vissuto come un’esperienza boutique esclusiva con Hathor Cruise, dove comfort e servizio personalizzato rendono il viaggio memorabile.",
  },
  "discover-the-timeless-luxor-west-bank": {
    title: "Alla scoperta della riva occidentale di Luxor",
    excerpt:
      "Navighi verso la riva occidentale di Luxor a bordo di una crociera di lusso in dahabiya e scopra l’Egitto nella sua bellezza elegante e senza tempo. Una crociera privata in dahabiya Le permette di visitare in modo autentico luoghi come la Valle dei Re, con un servizio personalizzato e ogni comfort.",
  },
  "luxury-travel-in-egypt-what-to-expect-on-a-dahabiya-cruise": {
    title: "Viaggi di lusso in Egitto: cosa aspettarsi da una crociera in dahabiya",
    excerpt:
      "Per un viaggio di lusso in Egitto, poche esperienze sono paragonabili a una crociera in dahabiya sul Nilo. Unendo eleganza, privacy e una navigazione autentica, la dahabiya offre un modo unico di scoprire i tesori del Nilo nel comfort e nell’esclusività.",
  },
  "sailing-from-aswan-to-luxor-on-a-dahabiya-nile-cruise": {
    title: "Da Assuan a Luxor in dahabiya sul Nilo",
    excerpt:
      "Navigare sul Nilo è uno dei modi più magici di vivere l’Egitto, e il viaggio da Assuan a Luxor in dahabiya è davvero indimenticabile. A differenza delle grandi navi affollate, la dahabiya è una barca a vela tradizionale che offre intimità, comfort e la possibilità di scoprire con calma i tesori nascosti lungo il Nilo.",
  },
  "spiritual-journey-to-egypt": {
    title: "Un viaggio spirituale in Egitto",
    excerpt:
      "Se cerca in Egitto qualcosa di più delle semplici visite, viva un viaggio sereno e spirituale a bordo di una dahabiya sul Nilo, navigando lentamente da Assuan a Luxor alla scoperta della bellezza, della cultura e della quiete del fiume.",
  },
  "discover-edfu-temple": {
    title: "Alla scoperta del Tempio di Edfu",
    excerpt:
      "Scopra il Tempio di Edfu, il tempio di Horus, uno dei siti antichi più impressionanti d’Egitto: piloni imponenti, rilievi minuziosi e sale sacre. Una tappa imperdibile di ogni viaggio in dahabiya, che fa rivivere la storia.",
  },
  "discovering-the-secrets-of-philae-temple": {
    title: "I segreti del Tempio di Philae",
    excerpt:
      "Scopra il maestoso Tempio di Philae ad Assuan, dedicato alla dea Iside. Tra le attrazioni più incantevoli di Assuan, unisce storia antica, un’architettura mozzafiato e la bellezza del Nilo: una visita da non perdere.",
  },
  "golden-gems-of-aswan": {
    title: "I tesori dorati di Assuan",
    excerpt:
      "Scopra Assuan dorata e la magia del Nilo: dalla maestosa Abu Simbel al sacro Tempio di Philae fino ai villaggi nubiani dai colori vivaci, le meraviglie di Assuan rendono il viaggio in dahabiya un’esperienza indimenticabile.",
  },
  "aswan-high-dam": {
    title: "La Grande Diga di Assuan",
    excerpt:
      "Scopra la Grande Diga di Assuan, simbolo del genio ingegneristico egiziano e della civiltà moderna: la sua storia affascinante, come è stata costruita e come governa il Nilo, sostiene l’agricoltura e plasma l’Egitto stesso.",
  },
  "exploring-esna-temples-history-nile-charm": {
    title: "Alla scoperta di Esna: templi, storia e fascino del Nilo",
    excerpt:
      "Navighi fino a Esna con una crociera di lusso sul Nilo e scopra il meglio di questa città storica: il Tempio di Khnum, i vivaci mercati locali e i tesori nascosti lungo il fiume. La ricca storia, l’architettura straordinaria e il fascino senza tempo di Esna, in un viaggio indimenticabile.",
  },
  "luxors-sacred-east-bank": {
    title: "La sacra riva orientale di Luxor",
    excerpt:
      "Percorra i viali sacri dove un tempo regnavano i faraoni e ascolti l’eco delle antiche cerimonie. Ammiri colonne imponenti e geroglifici minuziosi che raccontano storie senza tempo di dèi e di re.",
  },
  "kom-ombo-temple": {
    title: "Il Tempio di Kom Ombo",
    excerpt:
      "Durante una crociera in dahabiya sul Nilo, scopra il singolare Tempio di Kom Ombo, splendido tempio sul fiume dedicato al dio coccodrillo Sobek e a Horus il Vecchio. Lo visiti al tramonto per un’esperienza serena e indimenticabile, e veda veri coccodrilli mummificati nel vicino museo.",
  },
  "5-quiet-nile-spots-for-stunning-honeymoon-captures": {
    title: "5 luoghi tranquilli sul Nilo per una luna di miele in suite",
    excerpt:
      "Scopra 5 luoghi tranquilli e romantici lungo il Nilo, perfetti per le foto della luna di miele, e viva la bellezza e il lusso di una crociera in dahabiya catturando ricordi indimenticabili in Egitto.",
  },
  "discover-the-valley-of-the-kings": {
    title: "Alla scoperta della Valle dei Re",
    excerpt:
      "Faccia un passo nell’antico Egitto con una crociera di lusso sul Nilo fino alla Valle dei Re: esplori le tombe reali e goda della bellezza serena del Nilo a bordo di un’elegante dahabiya.",
  },
  "sailing-to-karnak-temple": {
    title: "In navigazione verso il Tempio di Karnak",
    excerpt:
      "Il complesso templare di Karnak, il tempio di Amon, Mut e Khonsu a Luxor, è un immenso tempio antico. Con le sue colonne imponenti e le statue colossali, è il cuore spirituale dell’antico Egitto in tutto il suo splendore.",
  },
  "exploring-luxor-and-aswan-on-a-luxury-dahabiya": {
    title: "Luxor e Assuan a bordo di una dahabiya di lusso",
    excerpt:
      "Scopra le meraviglie di Luxor e Assuan con una crociera di lusso sul Nilo, dove storia, cultura e panorami mozzafiato si uniscono in un viaggio indimenticabile in Egitto.",
  },
  "where-history-lives-the-temple-of-hatshepsut": {
    title: "Dove vive la storia: il Tempio di Hatshepsut",
    excerpt:
      "Torni indietro nel tempo alla storia dell’antico tempio funerario di Hatshepsut, una meraviglia scenografica ai piedi delle falesie di Luxor, e ne goda il racconto navigando su una serena e lussuosa dahabiya sul Nilo.",
  },
  "niles-hidden-gems-by-dahabiya": {
    title: "I tesori nascosti del Nilo in dahabiya",
    excerpt:
      "Vada oltre il solito itinerario delle crociere sul Nilo e scopra templi isolati, rive tranquille e siti storici raggiungibili solo in dahabiya. Questo articolo racconta le esperienze esclusive che rendono indimenticabile navigare sul Nilo in dahabiya.",
  },
  "best-places-to-visit-along-the-nile-with-a-dahabiya-cruise": {
    title: "I luoghi più belli da visitare sul Nilo in crociera in dahabiya",
    excerpt:
      "Navighi con stile a bordo di una crociera di lusso in dahabiya e scopra i luoghi più iconici del Nilo, dai templi antichi ai tesori storici. La attende un viaggio esclusivo tra eleganza e storia, con esperienze culturali indimenticabili e panorami mozzafiato.",
  },
  "explore-luxor-in-luxury": {
    title: "Luxor nel lusso",
    excerpt:
      "Scopra Luxor, terra di meraviglie, a bordo di una crociera di lusso in dahabiya: templi nascosti, la Valle dei Re e panorami tranquilli sul Nilo, in un viaggio autentico ed esclusivo lontano dalla folla.",
  },
  "best-time-for-dahabiya-nile-cruise": {
    title: "Il periodo migliore per una crociera in dahabiya sul Nilo",
    excerpt:
      "Navigare sul Nilo in dahabiya è uno dei modi più unici e lussuosi di vivere l’Egitto. Con le sue vele maestose e la sua atmosfera intensa, la crociera in dahabiya sembra quasi senza tempo, ben diversa dalle grandi navi fluviali di nuova generazione.",
  },
  "nile-cruise-or-luxury-dahabiya-which-one-to-choose": {
    title: "Crociera sul Nilo o dahabiya: quale scegliere in Egitto?",
    excerpt:
      "Scopra le meraviglie del Nilo, dai prodigi delle civiltà antiche alla bellezza della natura, e la differenza tra una crociera tradizionale e una dahabiya. Per un viaggio autentico e meno affollato, la dahabiya di lusso Hathor è la scelta perfetta: stile, tradizione e relax lungo il Nilo.",
  },
};

/** Posts whose article reads in Italian at /it/blogs/<slug>. */
export const TRANSLATED_BLOG_SLUGS_IT: ReadonlySet<string> = new Set<string>();

/** A post's title and excerpt in a language; English, and untranslated posts, pass through. */
export function blogPostIn<T extends { slug: string; title: string; excerpt: string }>(
  post: T,
  locale: PublicLocale,
): T {
  if (locale !== "it") return post;
  const words = BLOG_POSTS_IT[post.slug];
  return words ? { ...post, title: words.title, excerpt: words.excerpt } : post;
}

/** Where a post opens: its Italian article once translated, otherwise the English one. */
export function blogPostHref(slug: string, locale: PublicLocale): string {
  return locale === "it" && TRANSLATED_BLOG_SLUGS_IT.has(slug) ? `/it/blogs/${slug}` : `/blogs/${slug}`;
}
