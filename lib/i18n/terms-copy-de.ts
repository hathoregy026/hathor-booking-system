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
          "Bis 60 Tage vor der Einschiffung müssen die Zahlungen insgesamt mindestens 50 % des Gesamtbuchungswerts erreichen.",
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
      "Nach Beginn der Reise erfolgt keine Erstattung für Mahlzeiten, Nächte oder andere Teile der gebuchten Reise, die der Gast nicht in Anspruch nehmen möchte.",
      "Ist nach dem obigen Stornoplan eine Erstattung fällig, wird der erstattungsfähige Betrag nach Anwendung der jeweiligen Gebühr auf den Gesamtbuchungswert berechnet.",
      "Es fällt keine Gebühr an, wenn unvermeidbare, außergewöhnliche Umstände am Bestimmungsort oder in dessen unmittelbarer Nähe, etwa die Sperrung des Nils für die Schifffahrt oder eine ernste Sicherheitslage, die Reise erheblich beeinträchtigen. In diesem Fall erstattet Hathor Dahabiya alle geleisteten Zahlungen innerhalb von 14 Tagen vollständig, ohne weitere Entschädigung.",
      "Der Gast kann die Buchung auf eine andere Person übertragen, die alle Bedingungen der Reise erfüllt, wenn er Hathor Dahabiya mindestens 7 Tage vor der Einschiffung schriftlich informiert. Der ursprüngliche und der neue Gast haften gesamtschuldnerisch für den noch offenen Betrag und für angemessene Mehrkosten der Übertragung, die Hathor Dahabiya angibt und belegt.",
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
      {
        text: "Soft All-Inclusive, also alle Mahlzeiten und alkoholfreien Getränke (Tee, Kaffee, Softdrinks und frische Säfte); alkoholische Getränke sind nicht enthalten (siehe Nicht enthaltene Leistungen).",
      },
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
    paragraphs: [
      "Hathor Dahabiya ist für die Erbringung aller in der bestätigten Buchung enthaltenen Reiseleistungen verantwortlich, einschließlich Transfers und Besichtigungen, unabhängig davon, ob sie von Hathor Dahabiya oder von ihren Partnern erbracht werden.",
      "Hathor Dahabiya übernimmt insbesondere die Verantwortung dafür:",
    ],
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
      "Diese Verantwortung erstreckt sich nicht auf Leistungen, die der Gast selbst organisiert und die nicht Teil der bestätigten Buchung sind.",
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
      "Ungünstige Wetterbedingungen, unter anderem Wind, Nebel, Stürme oder Schwankungen des Nilwasserstands, können zu Verzögerungen, Routenänderungen, Umleitungen oder Absagen führen.",
      "Hathor Dahabiya leistet keine Entschädigung für Beeinträchtigungen durch solche unvermeidbaren, außergewöhnlichen Umstände. Die in den Abschnitten 2, 12 und 13 genannten Rechte des Gastes auf Preisminderung oder auf Rücktritt mit vollständiger Erstattung bleiben unberührt.",
    ],
  },
  {
    id: "government-regulations",
    number: 11,
    title: "Vorschriften, Inspektionen und Behörden",
    paragraphs: [
      "Verzögerungen, Unterbrechungen, Umleitungen oder Absagen können zurückzuführen sein auf:",
    ],
    list: [
      { text: "Behördlich angeordnete Inspektionen." },
      { text: "Sicherheitskontrollen." },
      {
        text: "Entscheidungen, Beschränkungen oder Anordnungen ägyptischer Regierungs- oder Aufsichtsbehörden.",
      },
    ],
    paragraphsAfterList: [
      "Hathor Dahabiya leistet für solche Umstände keine Entschädigung. Die in den Abschnitten 2, 12 und 13 genannten Rechte des Gastes bleiben unberührt.",
    ],
  },
  {
    id: "itinerary-changes",
    number: 12,
    title: "Routenänderungen und betriebliche Anpassungen",
    paragraphs: [
      "Hathor Dahabiya kann geringfügige Änderungen an Routen, Zeiten, Anlegestellen oder Leistungen vornehmen, wenn dies aus betrieblichen, nautischen oder Sicherheitsgründen erforderlich ist. Solche Änderungen stellen keine Vertragsverletzung dar, und Hathor Dahabiya wird den Gast klar und rechtzeitig darüber informieren.",
      "Muss Hathor Dahabiya vor der Abreise ein Hauptmerkmal der Reise erheblich ändern, informiert sie den Gast unverzüglich. Der Gast kann die Änderung annehmen oder ohne Stornogebühr von der Buchung zurücktreten und erhält alle geleisteten Zahlungen innerhalb von 14 Tagen vollständig erstattet.",
      "Kann eine in der Buchung enthaltene Leistung während der Reise nicht wie vereinbart erbracht werden, bietet Hathor Dahabiya, soweit möglich, ohne Mehrkosten eine Ersatzleistung gleicher oder höherer Qualität an. Wird eine Leistung nicht erbracht oder ist die Ersatzleistung von geringerer Qualität, hat der Gast Anspruch auf eine angemessene Preisminderung.",
      "Über die Preisminderung hinaus ist keine Entschädigung geschuldet, wenn die Änderung oder Beeinträchtigung dem Gast, einem an den gebuchten Leistungen unbeteiligten Dritten oder unvermeidbaren, außergewöhnlichen Umständen zuzurechnen ist.",
    ],
  },
  {
    id: "company-cancellations",
    number: 13,
    title: "Absagen durch das Unternehmen",
    paragraphs: [
      "Hathor Dahabiya kann eine Reise vor der Abreise in Ausnahmefällen wegen höherer Gewalt oder aus betrieblicher Notwendigkeit absagen.",
      "Sagt Hathor Dahabiya die Reise ab, erhält der Gast alle geleisteten Zahlungen innerhalb von 14 Tagen nach der Absage vollständig erstattet. Wenn der Gast es wünscht, kann Hathor Dahabiya stattdessen anbieten:",
    ],
    list: [
      { text: "Einen neuen Abreisetermin; oder" },
      { text: "Einen Gutschein für eine künftige Reise." },
    ],
    paragraphsAfterList: [
      "Sagt Hathor Dahabiya die Reise aus betrieblichen Gründen und nicht wegen unvermeidbarer, außergewöhnlicher Umstände ab, kann der Gast zusätzlich Anspruch auf eine angemessene Entschädigung haben.",
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
    paragraphsAfterList: [
      "Die in den Abschnitten 2, 12 und 13 vorgesehenen Rechte des Gastes auf Erstattung oder Preisminderung bleiben unberührt.",
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
      "Außer bei Personenschäden und bei vorsätzlich oder fahrlässig verursachten Schäden ist die Haftung von Hathor Dahabiya auf das Dreifache des Gesamtbuchungspreises begrenzt.",
      "Soweit gesetzlich zulässig, haftet Hathor Dahabiya nicht für indirekte, beiläufige oder Folgeschäden.",
    ],
  },
  {
    id: "governing-law",
    number: 18,
    title: "Anwendbares Recht und Gerichtsstand",
    paragraphs: [
      "Diese Allgemeinen Geschäftsbedingungen unterliegen den Gesetzen der Arabischen Republik Ägypten und werden nach diesen ausgelegt.",
      "Alle Streitigkeiten unterliegen der Zuständigkeit der ägyptischen Gerichte.",
      "Ist der Gast ein Verbraucher mit Wohnsitz in einem anderen Land, entzieht ihm dies nicht den Schutz der zwingenden Bestimmungen des Rechts seines Wohnsitzlandes, und er kann auch vor den Gerichten dieses Landes klagen.",
    ],
  },
  {
    id: "acceptance",
    number: 19,
    title: "Annahme der Bedingungen",
    paragraphs: [
      "Mit der Bestätigung einer Buchung erkennt der Gast diese Allgemeinen Geschäftsbedingungen an, nimmt sie an und verpflichtet sich, sie einzuhalten.",
      "Wird eine Buchung für mehrere Gäste vorgenommen, ist die buchende Person dafür verantwortlich, alle Mitglieder der Reisegruppe über die geltenden Allgemeinen Geschäftsbedingungen zu informieren.",
      "Diese Allgemeinen Geschäftsbedingungen werden auf Englisch und in Übersetzungen veröffentlicht. Die deutsche Fassung dient der besseren Orientierung. Bei Abweichungen zwischen den Fassungen hat die englische Fassung Vorrang, sofern das auf die Buchung anwendbare Recht nichts anderes vorschreibt.",
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
    "Darin enthalten sind ",
    "14 % Mehrwertsteuer und die Servicegebühr",
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
