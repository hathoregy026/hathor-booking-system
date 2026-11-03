/**
 * Terms & Conditions in Russian: an exact translation of the live English terms,
 * section by section, with the same ids. By the owner's decision of 31 October
 * 2026 there is no lawyer review: the text must say what the English says, with
 * nothing softened, added, omitted, explained or improved, and no Russian-law
 * wording. Change it only when the English changes.
 *
 * One Russian word per English term, for example: itinerary = Reiseverlauf,
 * route = Route, reservation = Reservierung, booking = Buchung, cancellation =
 * Stornierung, applicable = anwendbar, liable = haftet, responsible =
 * verantwortlich, departure = Abreise, voyage = Kreuzfahrt, journey = Reise.
 */

import type { TermsCopy } from "@/lib/i18n/terms-copy";
import { TERMS_TOC, type TermsSection } from "@/lib/terms-and-conditions-content";

/* Section titles and text, in the order and with the ids of TERMS_SECTIONS. */
const SECTIONS_RU: readonly TermsSection[] = [
  {
    id: "booking-payment",
    number: 1,
    title: "Buchung und Zahlung",
    paragraphs: [
      "Buchungen müssen im Voraus vorgenommen werden und werden gemäß dem folgenden Zahlungsplan bestätigt:",
    ],
    list: [
      { emphasis: "30 % des Gesamtbuchungswerts sind bei Bestätigung fällig.", text: "" },
      {
        emphasis:
          "Bis 60 Tage vor der Einschiffung müssen die Gesamtzahlungen 50 % des Gesamtbuchungswerts entsprechen.",
        text: "",
      },
      {
        emphasis: "Der verbleibende Restbetrag von 50 % ist 45 Tage vor der Einschiffung fällig.",
        text: "",
      },
    ],
    paragraphsAfterList: [
      "Eine Buchung gilt nur dann als bestätigt, wenn die erforderliche Anfangszahlung eingegangen ist und die Reservierung von Hathor Dahabiya angenommen wurde.",
      "Werden die erforderlichen Zahlungen nicht bis zu den anwendbaren Fristen vollständig geleistet, kann dies zur Stornierung der Reservierung führen, vorbehaltlich der nachstehenden Stornobedingungen.",
    ],
  },
  {
    id: "cancellation-refunds",
    number: 2,
    title: "Stornierung, Nichterscheinen und Erstattungen",
    paragraphs: [
      "Alle Stornierungen müssen schriftlich eingereicht werden.",
      "Es gelten die folgenden Stornogebühren:",
    ],
    list: [
      { emphasis: "90 Tage oder mehr vor der Einschiffung:", text: " keine Stornogebühr." },
      {
        emphasis: "61 bis 89 Tage vor der Einschiffung:",
        text: " 25 % des Gesamtbuchungswerts.",
      },
      {
        emphasis: "46 bis 60 Tage vor der Einschiffung:",
        text: " 50 % des Gesamtbuchungswerts.",
      },
      {
        emphasis: "45 Tage oder weniger vor der Einschiffung:",
        text: " 100 % des Gesamtbuchungswerts.",
      },
      {
        emphasis: "Nichterscheinen oder vorzeitige Abreise:",
        text: " 100 % des Gesamtbuchungswerts.",
      },
    ],
    paragraphsAfterList: [
      "Für nicht genutzte Mahlzeiten, nicht genutzte Nächte oder andere nicht genutzte Teile der gebuchten Kreuzfahrt wird nach Beginn der Reise keine Erstattung geleistet.",
      "Ist nach dem obigen Stornoplan eine Erstattung fällig, wird der erstattungsfähige Betrag nach Anwendung der jeweiligen Stornogebühr auf den Gesamtbuchungswert berechnet.",
    ],
  },
  {
    id: "children-policy",
    number: 3,
    title: "Richtlinie für Kinder",
    paragraphs: ["Für Kinder wird der Erwachsenentarif berechnet."],
  },
  {
    id: "pets-policy",
    number: 4,
    title: "Richtlinie für Haustiere",
    paragraphs: ["Haustiere sind an Bord der Hathor Dahabiya nicht erlaubt."],
  },
  {
    id: "inclusions",
    number: 5,
    title: "Enthaltene Leistungen",
    paragraphs: [
      "Sofern im bestätigten Reiseverlauf oder in der bestätigten Buchung nicht anders angegeben, enthält das Hathor-Kreuzfahrtpaket:",
    ],
    list: [
      { text: "Soft-All-Inclusive-Service." },
      {
        text: "Drei Mahlzeiten täglich, beginnend mit dem Mittagessen am Tag der Einschiffung und endend mit dem Frühstück am Tag der Ausschiffung.",
      },
      { text: "Tee, Kaffee, Softdrinks und frische Säfte." },
      { text: "Im ausgewählten Reiseverlauf enthaltene Besichtigungstouren." },
      { text: "Im ausgewählten Paket enthaltene Beförderung und Transfers." },
      { text: "Anwendbare Steuern und Servicegebühren." },
      { text: "Professionelles Kreuzfahrtpersonal." },
      {
        text: "Ein kostenloses Champagner-Begrüßungsgetränk für jede Kabine und Suite, einmal pro Aufenthalt serviert.",
      },
    ],
  },
  {
    id: "exclusions",
    number: 6,
    title: "Ausgeschlossene Leistungen",
    paragraphs: [
      "Sofern nicht ausdrücklich im bestätigten Reiseverlauf oder in der bestätigten Buchung enthalten, ist Folgendes ausgeschlossen:",
    ],
    list: [
      { text: "Optionale Ausflüge, die nicht im Reiseverlauf enthalten sind." },
      { text: "Persönliche Ausgaben." },
      { text: "Trinkgelder." },
      {
        text: "Alkoholische Getränke, ob einheimisch oder international, mit Ausnahme des kostenlosen Champagner-Begrüßungsgetränks, das einmal pro Aufenthalt für jede Kabine und Suite serviert wird.",
      },
    ],
  },
  {
    id: "taxes-service",
    number: 7,
    title: "Steuern und Servicegebühren",
    paragraphs: [
      "Der veröffentlichte Dahabiya-Preis enthält die anwendbaren Steuern und Servicegebühren.",
    ],
    variant: "vat-note",
  },
  {
    id: "company-responsibility",
    number: 8,
    title: "Verantwortung des Unternehmens",
    paragraphs: ["Hathor Dahabiya übernimmt die Verantwortung für:"],
    list: [
      {
        text: "Die Bereitstellung von Speisen und Getränken, die gemäß den anwendbaren Gesundheits-, Hygiene- und Sicherheitsstandards zubereitet sind.",
      },
      {
        text: "Die Aufrechterhaltung von Sauberkeit und Hygiene der Kabinen, Gemeinschaftsbereiche und Einrichtungen an Bord.",
      },
      {
        text: "Den Betrieb der Dahabiya in Übereinstimmung mit den anwendbaren ägyptischen maritimen, touristischen und gesundheitsbezogenen Vorschriften.",
      },
    ],
    paragraphsAfterList: [
      "Diese Verantwortung ist auf die an Bord der Hathor Dahabiya erbrachten Leistungen beschränkt und erstreckt sich nicht auf externe Faktoren außerhalb der angemessenen Kontrolle des Unternehmens.",
    ],
  },
  {
    id: "health-medical-dietary",
    number: 9,
    title: "Offenlegung gesundheitlicher, medizinischer und ernährungsbezogener Angaben",
    paragraphs: [
      "Gäste sind dafür verantwortlich, vor der Abreise etwaige medizinische Zustände, Allergien, Ernährungseinschränkungen oder besondere gesundheitliche Anforderungen offenzulegen.",
      "Hathor Dahabiya haftet nicht für Krankheit, Verletzung oder medizinische Komplikationen, die sich ergeben aus:",
    ],
    list: [
      { text: "Nicht offengelegten medizinischen Zuständen." },
      { text: "Der Nichtbeachtung von Sicherheitsanweisungen oder Anleitungen der Crew." },
    ],
    paragraphsAfterList: [
      "Hathor Dahabiya behält sich das Recht vor, die Teilnahme an Aktivitäten oder Leistungen zu verweigern, wenn der Zustand eines Gastes ein Risiko für ihn selbst, andere Gäste oder Crewmitglieder darstellen kann, ohne Anspruch auf Erstattung oder Entschädigung.",
    ],
  },
  {
    id: "weather-natural-events",
    number: 10,
    title: "Wetterbedingungen und Naturereignisse",
    paragraphs: [
      "Hathor Dahabiya trägt keine Haftung für Verzögerungen, Änderungen des Reiseverlaufs, Routenänderungen oder Stornierungen, die durch ungünstige Wetterbedingungen verursacht werden, einschließlich, aber nicht beschränkt auf Wind, Nebel, Stürme oder Schwankungen des Nilwasserstands.",
      "Jede Störung infolge natürlicher oder umweltbedingter Umstände, die als höhere Gewalt eingestuft werden, stellt keinen Grund für Erstattungen, Entschädigungen oder Ansprüche jeglicher Art dar, außer wenn dies nach anwendbarem Recht erforderlich ist.",
    ],
  },
  {
    id: "government-regulations",
    number: 11,
    title: "Staatliche Vorschriften, Inspektionen und Behörden",
    paragraphs: [
      "Hathor Dahabiya ist nicht verantwortlich für Verzögerungen, Unterbrechungen, Routenänderungen oder Stornierungen infolge von:",
    ],
    list: [
      { text: "Staatlich angeordneten Inspektionen." },
      { text: "Sicherheitskontrollen." },
      {
        text: "Entscheidungen, Beschränkungen oder Anordnungen, die von ägyptischen staatlichen Behörden oder Aufsichtsbehörden auferlegt werden.",
      },
    ],
    paragraphsAfterList: [
      "Solche Umstände berechtigen Gäste nicht zu Erstattung, Entschädigung oder Anspruch, außer wenn dies nach anwendbarem Recht erforderlich ist.",
    ],
  },
  {
    id: "itinerary-changes",
    number: 12,
    title: "Änderungen des Reiseverlaufs und betriebliche Anpassungen",
    paragraphs: [
      "Hathor Dahabiya behält sich das Recht vor, Reiseverläufe, Zeitpläne, Anlegestellen oder Leistungen zu ändern, wenn dies aus betrieblichen, nautischen oder Sicherheitsgründen als notwendig erachtet wird.",
      "Ersatzleistungen oder Ersatzaktivitäten von vergleichbarem Wert können nach Ermessen des Unternehmens erbracht werden.",
      "Solche Änderungen gelten nicht als Vertragsbruch und rechtfertigen keine Erstattungen oder Entschädigungen, außer wenn dies nach anwendbarem Recht erforderlich ist.",
    ],
  },
  {
    id: "company-cancellations",
    number: 13,
    title: "Vom Unternehmen veranlasste Stornierungen",
    paragraphs: [
      "In Ausnahmefällen höherer Gewalt oder betrieblicher Notwendigkeit behält sich Hathor Dahabiya das Recht vor, die Reise zu stornieren.",
      "Das Unternehmen kann nach seinem alleinigen Ermessen anbieten:",
    ],
    list: [
      { text: "Einen neu angesetzten Abreisetermin; oder" },
      { text: "Einen nicht erstattungsfähigen Guthabengutschein zur künftigen Verwendung." },
    ],
    paragraphsAfterList: [
      "Barerstattungen sind nicht garantiert, außer wenn dies nach anwendbarem Recht erforderlich ist.",
    ],
  },
  {
    id: "force-majeure",
    number: 14,
    title: "Höhere Gewalt",
    paragraphs: [
      "Hathor Dahabiya haftet nicht für die Nichterfüllung oder verzögerte Erfüllung ihrer Pflichten aufgrund von Ereignissen außerhalb ihrer angemessenen Kontrolle, einschließlich, aber nicht beschränkt auf:",
    ],
    list: [
      { text: "Elementarereignisse." },
      { text: "Staatliche Maßnahmen oder Beschränkungen." },
      { text: "Epidemien oder Pandemien." },
      { text: "Sperrungen der Flussschifffahrt." },
      { text: "Sicherheitslagen." },
      {
        text: "Andere natürliche, umweltbedingte oder betriebliche Umstände außerhalb der angemessenen Kontrolle des Unternehmens.",
      },
    ],
  },
  {
    id: "guest-conduct",
    number: 15,
    title: "Verhalten und Haftung der Gäste",
    paragraphs: [
      "Gäste sind verpflichtet, alle Bordregeln einzuhalten und Crewmitglieder, andere Gäste und Eigentum zu respektieren.",
      "Von einem Gast verursachte Schäden, Verluste oder Fehlverhalten können der verantwortlichen Partei in Rechnung gestellt werden.",
      "Hathor Dahabiya behält sich das Recht vor, die Reise jedes Gastes zu beenden, dessen Verhalten als unsicher, störend oder unangemessen erachtet wird, ohne Erstattung oder Entschädigung.",
    ],
  },
  {
    id: "personal-property",
    number: 16,
    title: "Persönliches Eigentum",
    paragraphs: [
      "Hathor Dahabiya übernimmt keine Verantwortung für Verlust, Diebstahl oder Beschädigung persönlicher Gegenstände an Bord oder während Ausflügen, außer wenn die Haftung rechtlich nicht ausgeschlossen werden kann.",
      "Gästen wird geraten, Wertsachen jederzeit zu sichern.",
    ],
  },
  {
    id: "limitation-liability",
    number: 17,
    title: "Haftungsbeschränkung",
    paragraphs: [
      "Die Haftung von Hathor Dahabiya ist auf den für die gebuchten Leistungen gezahlten Betrag beschränkt, außer wenn eine solche Beschränkung nach anwendbarem Recht verboten ist.",
      "Im größtmöglichen gesetzlich zulässigen Umfang haftet Hathor Dahabiya nicht für indirekte, beiläufige oder Folgeschäden.",
    ],
  },
  {
    id: "governing-law",
    number: 18,
    title: "Anwendbares Recht und gerichtliche Zuständigkeit",
    paragraphs: [
      "Diese Allgemeinen Geschäftsbedingungen unterliegen den Gesetzen der Arabischen Republik Ägypten und werden in Übereinstimmung mit diesen ausgelegt.",
      "Alle Streitigkeiten unterliegen der ausschließlichen Zuständigkeit der ägyptischen Gerichte, sofern das anwendbare Recht nichts anderes verlangt.",
    ],
  },
  {
    id: "acceptance",
    number: 19,
    title: "Annahme der Bedingungen",
    paragraphs: [
      "Mit der Bestätigung einer Buchung erkennt der Gast diese Allgemeinen Geschäftsbedingungen an, nimmt sie an und erklärt sich damit einverstanden, an sie gebunden zu sein.",
      "Wird eine Reservierung im Namen von mehr als einem Gast vorgenommen, ist die Person, die die Reservierung vornimmt, dafür verantwortlich, sicherzustellen, dass alle Mitglieder der Reisegruppe von den anwendbaren Allgemeinen Geschäftsbedingungen in Kenntnis gesetzt werden.",
    ],
  },
  {
    id: "contact",
    number: 20,
    title: "Kontakt",
    paragraphs: [
      "Bei Fragen zu einer Reservierung oder zu diesen Allgemeinen Geschäftsbedingungen wenden Sie sich bitte an Hathor Dahabiya.",
    ],
    variant: "contact",
  },
];

const TOC_RU: Record<string, string> = {
  "booking-payment": "Buchung und Zahlung",
  "cancellation-refunds": "Stornierung, Nichterscheinen und Erstattungen",
  "children-policy": "Kinder",
  "pets-policy": "Haustiere",
  inclusions: "Enthaltene Leistungen",
  exclusions: "Ausgeschlossene Leistungen",
  "taxes-service": "Steuern und Servicegebühren",
  "company-responsibility": "Verantwortung des Unternehmens",
  "health-medical-dietary": "Offenlegung gesundheitlicher, medizinischer und ernährungsbezogener Angaben",
  "weather-natural-events": "Wetterbedingungen und Naturereignisse",
  "government-regulations": "Staatliche Vorschriften, Inspektionen und Behörden",
  "itinerary-changes": "Änderungen des Reiseverlaufs und betriebliche Anpassungen",
  "company-cancellations": "Vom Unternehmen veranlasste Stornierungen",
  "force-majeure": "Höhere Gewalt",
  "guest-conduct": "Verhalten und Haftung der Gäste",
  "personal-property": "Persönliches Eigentum",
  "limitation-liability": "Haftungsbeschränkung",
  "governing-law": "Anwendbares Recht und gerichtliche Zuständigkeit",
  acceptance: "Annahme der Bedingungen",
  contact: "Kontakt",
};

export const TERMS_COPY_RU: TermsCopy = {
  eyebrow: "Gästeinformationen",
  title: "Allgemeine Geschäftsbedingungen",
  intro: [
    "Diese Allgemeinen Geschäftsbedingungen legen die Buchungs-, Zahlungs-, Reise-, Bord- und Gästerichtlinien fest, die für Reisen an Bord der Hathor Dahabiya gelten.",
    "Hathor betreibt Luxuskreuzfahrten auf dem Nil zwischen Luxor und Assuan, einschließlich Privatcharter-Erlebnissen und Erlebnissen mit gemeinsamer Abreise. Mit der Bestätigung einer Buchung erkennt jeder Gast an und erklärt sich damit einverstanden, an die nachstehend aufgeführten anwendbaren Allgemeinen Geschäftsbedingungen gebunden zu sein.",
  ],
  toc: TERMS_TOC.map((item) => ({ id: item.id, label: TOC_RU[item.id] ?? item.label })),
  sections: SECTIONS_RU,
  vatNote: [
    "Dies enthält ",
    "14 % Mehrwertsteuer und Servicegebühr",
    ".",
  ],
  headOffice: "Hauptsitz",
  address: ["One Kattamiya, Tower 211, 11. Etage, Flat 111", "Ring Road", "Kairo, Ägypten"],
  telephone: "Telefon:",
  email: "E-Mail:",
  website: "Website:",
  tocLabel: "Auf dieser Seite",
  tocTitle: "Auf dieser Seite",
};
