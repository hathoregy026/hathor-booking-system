/**
 * The private charter page and its request form in German; see charter-copy.ts.
 * Route and trip-type values stay English for the reservations desk; only
 * their labels change.
 */
import { PLACES_DE } from "@/lib/i18n/catalog-copy-de";
import type { CharterCopy } from "@/lib/i18n/charter-copy";

export const CHARTER_COPY_DE: CharterCopy = {
  runLabel: "Privatcharter an Bord der Hathor",
  chaptersLabel: "Kapitel zum Charter",
  chapters: ["Anfrage", "Das Schiff", "Residenzen", "Routen"],
  deed: ["Private Dahabiya", "Decks", "Residenzen", "Gäste maximal", "Andere Gäste"],
  freedomWords: ["Privatsphäre.", "Flexibilität.", "Fürsorge."],
  residenceDecks: ["Unterdeck", "Unterdeck", "Hauptdeck"],
  kicker: "Privater Dahabiya-Charter · Ägypten",
  deedIntro:
    "Chartern Sie Ihre eigene Luxus-Dahabiya: die zwölf Kabinen und Suiten der Hathor, Crew und Küchenchef, für eine private Nilkreuzfahrt in Ägypten, von Luxor nach Assuan, Dendera oder Kairo.",
  lead: "Ihr privater Nil, ganz für Sie allein.",
  primaryCta: "Privatcharter anfragen",
  secondaryCta: "Verfügbarkeit prüfen",
  scrollCue: "Scrollen und an Bord kommen",
  shipLabel:
    "Die Hathor im Profil: Sonnendeck, Hauptdeck und Unterdeck, alle für eine einzige Gruppe reserviert",
  shipLegend: ["Jedes Deck", "für Ihre Gruppe reserviert"],
  preferToTalk: "Lieber im Gespräch",
  requestPhotoAlt: "Die Hathor unterwegs auf dem Nil",
  vow: {
    eyebrow: "Die Dahabiya zur alleinigen Nutzung",
    title: ["Das Schiff", "gehört Ihnen"],
    statement:
      "Beim Privatcharter gehört die Hathor allein Ihrer Gruppe, und Sie gestalten die Reise frei nach Ihrem Rhythmus, Ihrer Küche und Ihren Landausflügen.",
    places: "Luxor · Assuan · Dendera · Kairo",
    frontAlt: "Das private Sonnendeck, für Ihre Gruppe reserviert",
    backAlt: "Das Leben an Bord der Hathor",
    photoAlt: "Privatcharter der Hathor Dahabiya auf dem Nil",
  },
  fleet: {
    kicker: "Die Residenz",
    title: ["Jede", "Residenz"],
    intro:
      "Die Hathor erstreckt sich über drei Decks und nimmt eine begrenzte Zahl von Gästen in acht Kabinen, zwei Suiten und zwei Royal Suites auf.",
    stats: ["8 Kabinen", "2 Suiten", "2 Royal Suites"],
    outro:
      "Ausgewählte Kabinen lassen sich für mehr Privatsphäre verbinden. Jeder Raum verfügt über Smart-Systeme wie schlüssellosen Zugang, Smart-TV, automatisierte Beleuchtung und Vorhangsteuerung.",
    cards: [
      {
        title: "Luxury Rooms",
        body: "Die Kabinen der Hathor verbinden durchdachte Proportionen, Nilblick und praktischen Komfort in einer ruhigen, zeitgemäßen Umgebung.",
        capacity: "8 Kabinen",
        detail: "22 m² · eigenes Bad · Komfort mit Nilblick",
        amenities: ["Smart-Systeme", "Eigenes Bad", "Schnelles WLAN"],
        hrefLabel: "Kabinen ansehen",
      },
      {
        title: "Luxury Suites",
        body: "Die Suiten bieten mehr Raum für Gäste, die mehr Privatsphäre, großzügige Proportionen und einen freien Blick auf den Fluss suchen.",
        capacity: "2 Suiten",
        detail: "46 m² · Unterdeck · Jacuzzi",
        amenities: ["Panoramablick auf den Nil", "Jacuzzi", "Zwei Bäder"],
        hrefLabel: "Alle Merkmale",
      },
      {
        title: "Luxury Royal Suites",
        body: "Die Royal Suites sind die größten Unterkünfte der Hathor, mit zusätzlichem privatem Raum und noch mehr Abgeschiedenheit.",
        capacity: "2 Royal Suites",
        detail: "56 m² · Hauptdeck · privater Raum",
        amenities: ["Bester Blick auf den Nil", "Jacuzzi", "Zwei Badezimmer"],
        hrefLabel: "Suiten ansehen",
      },
    ],
  },
  value: {
    kicker: "Warum die Hathor chartern",
    title: "Privatsphäre. Flexibilität. Fürsorge.",
    intro:
      "Unser Team gestaltet mit Ihnen eine private Nilreise nach Maß für Ihre Termine, Ihre Gruppe und Ihre Prioritäten. Darauf können Sie zählen:",
    pillars: [
      {
        title: "Volle Privatsphäre und Diskretion",
        body: "Größtmögliche Privatsphäre an Bord, keine anderen Gäste. Eine private Dahabiya allein für Ihre Gruppe, mit zurückhaltendem, diskretem Service.",
      },
      {
        title: "Flexible Routen",
        body: "Eine Route nach Maß, in Ihrem Tempo. Fahren Sie von Luxor nach Assuan, nehmen Sie die Strecke in umgekehrter Richtung oder reisen Sie weiter bis Dendera und Kairo: alles ganz auf Sie abgestimmt.",
      },
      {
        title: "Persönliche Fürsorge",
        body: "Eigene Crew und eigener Küchenchef, edle Unterkünfte und aufmerksame Gastfreundschaft für Komfort und sorglose Tage auf dem Nil.",
      },
    ],
  },
  experiences: {
    kicker: "Private Erlebnisse an Bord",
    title: ["Gestaltet", "allein für", "Ihre Gruppe"],
    items: [
      {
        title: "Private Dinner",
        body: "Auf Wunsch private Dinner an ausgewählten Orten an Bord, für alle, die ein persönlicheres Erlebnis suchen.",
      },
      {
        title: "Concierge an Land und auf dem Fluss",
        body: "Eine eigene Crew koordiniert Anlegestellen, Reiseleiter und Transfers, damit jeder Moment an Land reibungslos verläuft.",
      },
      {
        title: "Ihr Rhythmus",
        body: "Wachen, fahren und speisen Sie, wann Sie möchten. Stille Decks oder Feste: Das Schiff wechselt die Stimmung mit Ihnen.",
      },
      {
        title: "Wellness auf dem Nil",
        body: "Zwischen den Tempeln Spa-Rituale und Stunden ohne Eile, gedacht für Privatsphäre und Ruhe.",
      },
    ],
  },
  passages: {
    kicker: "Private Routen auf dem Nil",
    title: ["Wählen", "Sie Ihre", "Route"],
    lead: "Wählen Sie Ihre bevorzugte Route. Jeder Halt, jede Zeit und jeder Landausflug wird rund um Ihre Gäste geplant.",
    label: "Charter-Routen",
    selected: "Ausgewählt · Angebot anfragen",
    choose: "Diese Route wählen",
    imageAlt: (route) => `Hathor Dahabiya, Privatcharter auf dem Nil: ${route}`,
  },
  preferred: (route) => `Wunschroute · ${route}`,
  process: {
    kicker: "So funktioniert der Charter",
    title: ["Drei", "bedachte", "Schritte"],
    begin: "Mit Schritt eins beginnen",
    steps: [
      {
        title: "Senden Sie Ihre Anfrage",
        body: "Nennen Sie uns Ihre Termine, die Gästezahl, Ihre Wunschroute und wie Sie reisen möchten.",
      },
      {
        title: "Erhalten Sie ein Angebot nach Maß",
        body: "Unser Team gestaltet mit Ihnen eine private Nilreise nach Maß für Ihre Termine, Ihre Gruppe und Ihre Prioritäten.",
      },
      {
        title: "Kommen Sie an Bord und entspannen Sie",
        body: "Sie kommen auf einer privaten Dahabiya an, die allein für Sie vorbereitet ist. Vom ersten Kaffee bis zur letzten Anlegestelle ist jedes Detail geregelt.",
      },
    ],
    frontAlt: "Der gemächliche Rhythmus der Fahrt auf dem Nil",
    backAlt: "Persönliche Gastfreundschaft an Bord der Hathor",
    celebrationAlt: "Eine private Feier an Bord der Hathor",
  },
  trust: {
    kicker: "Vertrauen und Diskretion",
    title: ["Stille", "Belege"],
    facts: [
      "Keine anderen Gäste an Bord, 100 % Privatsphäre",
      "Eigene Crew und privater Küchenchef",
      "Kabinen, Suiten und Royal Suites",
      "Nilrouten nach Maß",
    ],
    quotes: [
      {
        quote:
          "Wir haben um Privatsphäre gebeten und ein schwimmendes Zuhause gefunden, das unseren Rhythmus verstand. Nichts war gehetzt, alles war durchdacht.",
        attribution: "A.M. · Familiencharter, London",
      },
      {
        quote:
          "Die Route bewegte sich, wann wir es wollten. Tempel im ersten Licht, Abendessen, wenn der Fluss abkühlte: makellos von der Anfrage bis zur Einschiffung.",
        attribution: "R.K. · Firmenretreat",
      },
    ],
    photoAlt: "Das Leben an Bord eines Privatcharters der Hathor",
    askWhatsapp: "Auf WhatsApp fragen",
  },
  epilogue: {
    eyebrow: "Privater Concierge",
    lines: ["Ihre Reise,", "neu gedacht."],
    body:
      "Beim Privatcharter gehört die Hathor allein Ihrer Gruppe, und Sie gestalten die Reise frei nach Ihrem Rhythmus, Ihrer Küche und Ihren Landausflügen.",
    scheduled: {
      before: "Reisen Sie zu zweit oder in einer kleinen Gruppe? Buchen Sie stattdessen eine",
      link: "planmäßige Nilkreuzfahrt",
      after: "an Bord der Hathor.",
    },
    email: "E-Mail",
    photoAlts: ["Privates Dinner an Bord der Hathor", "Privatcharter der Hathor in der Abenddämmerung auf dem Nil"],
  },
  hours: "Täglich erreichbar: 09:00 – 17:00 Uhr",
  place: (name) => name.replace(/\b(Aswan|Cairo)\b/g, (stop) => PLACES_DE[stop] ?? stop),
  form: {
    eyebrow: "Privater Concierge",
    /* A heading in the display font, which has no hyphen. */
    title: "Dahabiya Kreuzfahrt im Charter",
    lead: "Fragen Sie einen Privatcharter an: Wir melden uns mit einem Angebot nach Maß.",
    tripTypes: { "One-Way": "Einfache Fahrt", "Round-Trip": "Hin und zurück", "Multi-Stop": "Mehrere Stopps" },
    name: "Name",
    email: "E-Mail",
    phone: "Telefon",
    tripType: "Art der Reise",
    departure: "Abfahrt",
    departurePlaceholder: "z. B. Luxor",
    destination: "Ziel",
    destinationPlaceholder: "z. B. Assuan",
    startDate: "Gewünschtes Startdatum",
    time: "Gewünschte Uhrzeit",
    route: "Gewünschte Route",
    adults: "Passagiere (Erwachsene)",
    children: "Kinder",
    special: "Gepäck / besondere Wünsche",
    specialPlaceholder: "Barrierefreiheit, Anlässe, Ernährung…",
    message: "Nachricht",
    messagePlaceholder: "Erzählen Sie uns, wie Sie reisen möchten…",
    errors: {
      name: "Bitte geben Sie Ihren Namen ein.",
      nameChars: "Bitte verwenden Sie nur Buchstaben, Leerzeichen, Bindestriche oder Apostrophe.",
      email: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
      phone: "Bitte verwenden Sie nur Ziffern, Leerzeichen und + ( ) -.",
      date: "Bitte wählen Sie ein Datum ab heute.",
      adults: "Bitte geben Sie 1 bis 50 Erwachsene an.",
      children: "Bitte geben Sie 0 bis 50 Kinder an.",
      check: "Bitte prüfen Sie die markierten Felder.",
      send: "Ihre Anfrage konnte nicht gesendet werden.",
      security: "Bitte schließen Sie vor dem Senden die Sicherheitsprüfung ab.",
    },
    fallback: {
      lead: "Ihre Angaben sind sicher. Senden Sie sie direkt an unser Charter-Team:",
      link: "Anfrage per E-Mail senden",
    },
    draft: {
      subject: (name) => `Anfrage für einen Privatcharter: ${name}`,
      inquiry: "Anfrage für einen Privatcharter.",
      tripType: "Art der Reise",
      departure: "Abfahrt",
      destination: "Ziel",
      time: "Bevorzugte Zeit",
      special: "Besondere Wünsche",
      name: "Name",
      email: "E-Mail",
      phone: "Telefon",
      route: "Bevorzugte Route",
      startDate: "Bevorzugtes Abreisedatum",
      adults: "Erwachsene",
      children: "Kinder",
    },
    website: "Website",
    sending: "Wird gesendet…",
    send: "Anfrage senden",
    success: {
      title: "Vielen Dank.",
      body: "Wir haben Ihre Anfrage für eine private Reise erhalten. Unser Charter-Team bereitet eine persönliche Antwort vor.",
      receipt: { before: "Eine Bestätigung ist unterwegs an", after: ". Falls sie nicht ankommt, schreiben Sie an" },
      noReceipt: {
        before: "Unser Team hat Ihre Anfrage erhalten, wir konnten aber keine Bestätigung senden an",
        after: ". Bitte prüfen Sie die Adresse oder schreiben Sie an",
        end: "damit wir Sie erreichen können.",
      },
      again: "Weitere Anfrage senden",
    },
    languageNote: "Guest language: German",
  },
};
