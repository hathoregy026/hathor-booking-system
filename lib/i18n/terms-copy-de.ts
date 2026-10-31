/**
 * Terms & Conditions in German: a faithful translation of the English terms,
 * section by section, with the same ids. MACHINE DRAFT, NO LEGAL REVIEW. The
 * page shows `draftNotice` until a German lawyer has approved the text; see
 * docs/german-review.md section 4. No wording, company detail or registration
 * number has been added that the English terms do not contain.
 */

import type { TermsCopy } from "@/lib/i18n/terms-copy";
import { TERMS_TOC, type TermsSection } from "@/lib/terms-and-conditions-content";

/* Section titles and text, in the order and with the ids of TERMS_SECTIONS. */
const SECTIONS_DE: readonly TermsSection[] = [
  {
    id: "booking-payment",
    number: 1,
    title: "Buchung und Zahlung",
    paragraphs: [
      "Buchungen müssen im Voraus vorgenommen werden und werden nach folgendem Zahlungsplan bestätigt:",
    ],
    list: [
      { emphasis: "30 % des Gesamtbuchungswerts sind bei der Bestätigung fällig.", text: "" },
      {
        emphasis:
          "Bis 60 Tage vor der Einschiffung müssen die Zahlungen insgesamt 50 % des Gesamtbuchungswerts betragen.",
        text: "",
      },
      {
        emphasis: "Die restlichen 50 % sind 45 Tage vor der Einschiffung fällig.",
        text: "",
      },
    ],
    paragraphsAfterList: [
      "Eine Buchung gilt erst dann als bestätigt, wenn die erforderliche Anfangszahlung eingegangen ist und Hathor Dahabiya die Buchung angenommen hat.",
      "Werden die erforderlichen Zahlungen nicht fristgerecht geleistet, kann dies zur Stornierung der Buchung gemäß den nachstehenden Stornobedingungen führen.",
    ],
  },
  {
    id: "cancellation-refunds",
    number: 2,
    title: "Stornierung, Nichterscheinen und Erstattungen",
    paragraphs: [
      "Alle Stornierungen müssen schriftlich mitgeteilt werden.",
      "Es gelten die folgenden Stornogebühren:",
    ],
    list: [
      { emphasis: "90 Tage oder mehr vor der Einschiffung:", text: " keine Gebühr." },
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
      "Nach Beginn der Reise erfolgt keine Erstattung für nicht in Anspruch genommene Mahlzeiten, Nächte oder andere nicht genutzte Teile der gebuchten Reise.",
      "Ist nach dem obigen Stornoplan eine Erstattung fällig, wird der erstattungsfähige Betrag nach Anwendung der jeweiligen Gebühr auf den Gesamtbuchungswert berechnet.",
    ],
  },
  {
    id: "children-policy",
    number: 3,
    title: "Regelung für Kinder",
    paragraphs: ["Für Kinder gilt der Erwachsenenpreis."],
  },
  {
    id: "pets-policy",
    number: 4,
    title: "Regelung für Haustiere",
    paragraphs: ["Haustiere sind an Bord der Hathor Dahabiya nicht erlaubt."],
  },
  {
    id: "inclusions",
    number: 5,
    title: "Inklusivleistungen",
    paragraphs: [
      "Sofern in der bestätigten Route oder Buchung nicht anders angegeben, umfasst das Hathor-Reisepaket:",
    ],
    list: [
      { text: "Soft-All-Inclusive-Service." },
      {
        text: "Drei Mahlzeiten täglich, vom Mittagessen am Tag der Einschiffung bis zum Frühstück am Tag der Ausschiffung.",
      },
      { text: "Tee, Kaffee, Softdrinks und frische Säfte." },
      { text: "Die in der gewählten Route enthaltenen Besichtigungen." },
      { text: "Die im gewählten Paket enthaltenen Beförderungen und Transfers." },
      { text: "Anfallende Steuern und Servicegebühren." },
      { text: "Professionelles Kreuzfahrtpersonal." },
      {
        text: "Ein Glas Begrüßungs-Champagner pro Kabine und Suite, einmal pro Aufenthalt serviert.",
      },
    ],
  },
  {
    id: "exclusions",
    number: 6,
    title: "Nicht enthaltene Leistungen",
    paragraphs: [
      "Sofern in der bestätigten Route oder Buchung nicht ausdrücklich enthalten, sind ausgeschlossen:",
    ],
    list: [
      { text: "Optionale Ausflüge, die nicht zur Route gehören." },
      { text: "Persönliche Ausgaben." },
      { text: "Trinkgelder." },
      {
        text: "Alkoholische Getränke, einheimische wie internationale, mit Ausnahme des einmal pro Aufenthalt je Kabine und Suite servierten Glases Begrüßungs-Champagner.",
      },
    ],
  },
  {
    id: "taxes-service",
    number: 7,
    title: "Steuern und Servicegebühren",
    paragraphs: [
      "Der veröffentlichte Preis der Dahabiya enthält die anfallenden Steuern und Servicegebühren.",
    ],
    variant: "vat-note",
  },
  {
    id: "company-responsibility",
    number: 8,
    title: "Verantwortung des Unternehmens",
    paragraphs: ["Hathor Dahabiya übernimmt die Verantwortung dafür:"],
    list: [
      {
        text: "Speisen und Getränke bereitzustellen, die nach den geltenden Gesundheits-, Hygiene- und Sicherheitsvorschriften zubereitet sind.",
      },
      {
        text: "Sauberkeit und Hygiene der Kabinen, Gemeinschaftsbereiche und Einrichtungen an Bord aufrechtzuerhalten.",
      },
      {
        text: "Die Dahabiya im Einklang mit den geltenden ägyptischen Schifffahrts-, Tourismus- und Gesundheitsvorschriften zu betreiben.",
      },
    ],
    paragraphsAfterList: [
      "Diese Verantwortung ist auf die an Bord der Hathor Dahabiya erbrachten Leistungen beschränkt und erstreckt sich nicht auf äußere Umstände außerhalb der angemessenen Kontrolle des Unternehmens.",
    ],
  },
  {
    id: "health-medical-dietary",
    number: 9,
    title: "Gesundheit, medizinische Umstände und Ernährung",
    paragraphs: [
      "Gäste sind verpflichtet, vor der Abreise etwaige medizinische Umstände, Allergien, Ernährungseinschränkungen oder besondere gesundheitliche Bedürfnisse mitzuteilen.",
      "Hathor Dahabiya haftet nicht für Krankheiten, Verletzungen oder medizinische Komplikationen, die zurückzuführen sind auf:",
    ],
    list: [
      { text: "Nicht mitgeteilte medizinische Umstände." },
      { text: "Die Nichtbeachtung von Sicherheitsanweisungen oder Anweisungen der Crew." },
    ],
    paragraphsAfterList: [
      "Hathor Dahabiya behält sich das Recht vor, die Teilnahme an Aktivitäten oder Leistungen zu verweigern, wenn der Zustand eines Gastes ein Risiko für ihn selbst, für andere Gäste oder für die Crew darstellen könnte, ohne Anspruch auf Erstattung oder Entschädigung.",
    ],
  },
  {
    id: "weather-natural-events",
    number: 10,
    title: "Wetter und Naturereignisse",
    paragraphs: [
      "Hathor Dahabiya haftet nicht für Verzögerungen, Routenänderungen, Umleitungen oder Absagen infolge ungünstiger Wetterbedingungen, unter anderem Wind, Nebel, Stürme oder Schwankungen des Nilwasserstands.",
      "Beeinträchtigungen durch natürliche oder umweltbedingte Umstände, die als höhere Gewalt gelten, begründen keinerlei Ansprüche auf Erstattung, Entschädigung oder sonstige Forderungen, sofern das anwendbare Recht nichts anderes vorschreibt.",
    ],
  },
  {
    id: "government-regulations",
    number: 11,
    title: "Vorschriften, Inspektionen und Behörden",
    paragraphs: [
      "Hathor Dahabiya ist nicht verantwortlich für Verzögerungen, Unterbrechungen, Umleitungen oder Absagen infolge von:",
    ],
    list: [
      { text: "Behördlich angeordnete Inspektionen." },
      { text: "Sicherheitskontrollen." },
      {
        text: "Entscheidungen, Beschränkungen oder Anordnungen ägyptischer Regierungs- oder Aufsichtsbehörden.",
      },
    ],
    paragraphsAfterList: [
      "Solche Umstände begründen keinen Anspruch der Gäste auf Erstattung, Entschädigung oder sonstige Forderungen, sofern das anwendbare Recht nichts anderes vorschreibt.",
    ],
  },
  {
    id: "itinerary-changes",
    number: 12,
    title: "Routenänderungen und betriebliche Anpassungen",
    paragraphs: [
      "Hathor Dahabiya behält sich das Recht vor, Routen, Zeiten, Anlegestellen oder Leistungen zu ändern, wenn dies aus betrieblichen, nautischen oder Sicherheitsgründen für erforderlich gehalten wird.",
      "Nach Ermessen des Unternehmens können gleichwertige Ersatzleistungen oder Ersatzaktivitäten angeboten werden.",
      "Solche Änderungen gelten nicht als Vertragsverletzung und begründen keinen Anspruch auf Erstattung oder Entschädigung, sofern das anwendbare Recht nichts anderes vorschreibt.",
    ],
  },
  {
    id: "company-cancellations",
    number: 13,
    title: "Absagen durch das Unternehmen",
    paragraphs: [
      "In Ausnahmefällen höherer Gewalt oder betrieblicher Notwendigkeit behält sich Hathor Dahabiya das Recht vor, die Reise abzusagen.",
      "Das Unternehmen kann nach eigenem alleinigem Ermessen anbieten:",
    ],
    list: [
      { text: "Einen neuen Abreisetermin; oder" },
      { text: "Einen nicht erstattungsfähigen Gutschein zur späteren Verwendung." },
    ],
    paragraphsAfterList: [
      "Barerstattungen sind nicht garantiert, sofern das anwendbare Recht nichts anderes vorschreibt.",
    ],
  },
  {
    id: "force-majeure",
    number: 14,
    title: "Höhere Gewalt",
    paragraphs: [
      "Hathor Dahabiya haftet nicht für die Nichterfüllung oder verspätete Erfüllung ihrer Pflichten aufgrund von Ereignissen außerhalb ihrer angemessenen Kontrolle, unter anderem:",
    ],
    list: [
      { text: "Naturkatastrophen." },
      { text: "Behördliche Anordnungen oder Beschränkungen." },
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
    title: "Verhalten und Verantwortung der Gäste",
    paragraphs: [
      "Gäste sind verpflichtet, alle Bordregeln, die Crew, andere Gäste und das Eigentum an Bord zu respektieren.",
      "Von einem Gast verursachte Schäden, Verluste oder Fehlverhalten können dem Verantwortlichen in Rechnung gestellt werden.",
      "Hathor Dahabiya behält sich das Recht vor, die Reise jedes Gastes zu beenden, dessen Verhalten als gefährlich, störend oder unangemessen eingestuft wird, ohne Erstattung oder Entschädigung.",
    ],
  },
  {
    id: "personal-property",
    number: 16,
    title: "Persönliche Gegenstände",
    paragraphs: [
      "Hathor Dahabiya übernimmt keine Haftung für Verlust, Diebstahl oder Beschädigung persönlicher Gegenstände an Bord oder während der Ausflüge, außer in Fällen, in denen die Haftung gesetzlich nicht ausgeschlossen werden kann.",
      "Gästen wird empfohlen, ihre Wertsachen stets sorgfältig aufzubewahren.",
    ],
  },
  {
    id: "limitation-liability",
    number: 17,
    title: "Haftungsbeschränkung",
    paragraphs: [
      "Die Haftung von Hathor Dahabiya ist auf den für die gebuchten Leistungen gezahlten Betrag begrenzt, soweit eine solche Beschränkung nach anwendbarem Recht nicht unzulässig ist.",
      "Soweit gesetzlich zulässig, haftet Hathor Dahabiya nicht für indirekte, beiläufige oder Folgeschäden.",
    ],
  },
  {
    id: "governing-law",
    number: 18,
    title: "Anwendbares Recht und Gerichtsstand",
    paragraphs: [
      "Diese Allgemeinen Geschäftsbedingungen unterliegen den Gesetzen der Arabischen Republik Ägypten und werden nach diesen ausgelegt.",
      "Alle Streitigkeiten unterliegen der ausschließlichen Zuständigkeit der ägyptischen Gerichte, sofern das anwendbare Recht nichts anderes vorschreibt.",
    ],
  },
  {
    id: "acceptance",
    number: 19,
    title: "Annahme der Bedingungen",
    paragraphs: [
      "Mit der Bestätigung einer Buchung erkennt der Gast diese Allgemeinen Geschäftsbedingungen an, nimmt sie an und verpflichtet sich, sie einzuhalten.",
      "Wird eine Buchung für mehrere Gäste vorgenommen, ist die buchende Person dafür verantwortlich, alle Mitglieder der Reisegruppe über die geltenden Allgemeinen Geschäftsbedingungen zu informieren.",
    ],
  },
  {
    id: "contact",
    number: 20,
    title: "Kontakt",
    paragraphs: [
      "Bei Fragen zu einer Buchung oder zu diesen Allgemeinen Geschäftsbedingungen wenden Sie sich bitte an Hathor Dahabiya.",
    ],
    variant: "contact",
  },
];

const TOC_DE: Record<string, string> = {
  "booking-payment": "Buchung und Zahlung",
  "cancellation-refunds": "Stornierung, Nichterscheinen und Erstattungen",
  "children-policy": "Kinder",
  "pets-policy": "Haustiere",
  inclusions: "Inklusivleistungen",
  exclusions: "Nicht enthaltene Leistungen",
  "taxes-service": "Steuern und Servicegebühren",
  "company-responsibility": "Verantwortung des Unternehmens",
  "health-medical-dietary": "Gesundheit, medizinische Umstände und Ernährung",
  "weather-natural-events": "Wetter und Naturereignisse",
  "government-regulations": "Vorschriften, Inspektionen und Behörden",
  "itinerary-changes": "Routenänderungen und betriebliche Anpassungen",
  "company-cancellations": "Absagen durch das Unternehmen",
  "force-majeure": "Höhere Gewalt",
  "guest-conduct": "Verhalten und Verantwortung der Gäste",
  "personal-property": "Persönliche Gegenstände",
  "limitation-liability": "Haftungsbeschränkung",
  "governing-law": "Anwendbares Recht und Gerichtsstand",
  acceptance: "Annahme der Bedingungen",
  contact: "Kontakt",
};

export const TERMS_COPY_DE: TermsCopy = {
  eyebrow: "Informationen für Gäste",
  title: "Allgemeine Geschäftsbedingungen",
  draftNotice:
    "Entwurf: Diese deutsche Fassung ist eine noch nicht rechtlich geprüfte Übersetzung der englischen Bedingungen. Sie ist kein geprüfter Rechtstext.",
  intro: [
    "Diese Allgemeinen Geschäftsbedingungen legen die Regeln für Buchung, Zahlung, Reise und Aufenthalt an Bord sowie die Richtlinien für Gäste fest, die für Reisen an Bord der Hathor Dahabiya gelten.",
    "Hathor veranstaltet Luxuskreuzfahrten auf dem Nil zwischen Luxor und Assuan, einschließlich Privatcharter und Reisen mit gemeinsamen Abfahrten. Mit der Bestätigung einer Buchung erkennt jeder Gast an und erklärt sich damit einverstanden, an die nachstehenden geltenden Allgemeinen Geschäftsbedingungen gebunden zu sein.",
  ],
  toc: TERMS_TOC.map((item) => ({ id: item.id, label: TOC_DE[item.id] ?? item.label })),
  sections: SECTIONS_DE,
  vatNote: [
    "Die vom Kunden bereitgestellten Allgemeinen Geschäftsbedingungen besagen, dass darin ",
    "14 % Mehrwertsteuer und die Servicegebühr",
    " enthalten sind.",
  ],
  headOffice: "Hauptsitz",
  address: ["One Kattameya, Tower Nr. 211, Etage Nr. 11", "Ring Road, Nasr City", "Kairo, Ägypten"],
  telephone: "Telefon:",
  email: "E-Mail:",
  website: "Website:",
  tocLabel: "Auf dieser Seite",
  tocTitle: "Auf dieser Seite",
};
