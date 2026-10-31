/**
 * The guest's automatic emails in German: a machine draft, listed in
 * docs/german-review.md. Formal "Sie"; amounts come in already formatted.
 */

import { format, parse } from "date-fns";
import { de as deDates } from "date-fns/locale/de";
import type { EmailCopy } from "@/lib/i18n/email-copy";

/* The catalog's voyages, as the German voyage pages word them. */
const CRUISE_ROUTES_DE: Record<string, string> = {
  "Luxor to Aswan": "Von Luxor nach Assuan",
  "Aswan to Luxor": "Von Assuan nach Luxor",
  "Luxor to Aswan to Luxor": "Von Luxor nach Assuan und zurück",
};
const CRUISE_NAME = /^(\d+) Nights? \/ (\d+) Days? — (.+)$/;

const deCruiseName = (name: string) => {
  const match = CRUISE_NAME.exec(name.trim());
  const route = match && CRUISE_ROUTES_DE[match[3]!];
  return route ? `${match[1]} Nächte / ${match[2]} Tage — ${route}` : name;
};

export const EMAIL_COPY_DE: EmailCopy = {
  htmlLang: "de",
  heroAlt: "Luxuskreuzfahrt auf dem Nil an Bord der Hathor Dahabiya",
  date: date => format(date, "d. MMMM yyyy", { locale: deDates }),
  parseDate: text => parse(text, "d. MMMM yyyy", new Date(), { locale: deDates }),
  forGuestPrefix: "Für ",
  guestFallback: "Gast",
  notSpecified: "Nicht angegeben",
  ratePlan: "Hathor Standardtarif",
  paymentMethod: bank => (bank ? "Banküberweisung" : "Visa"),
  party: (adults, children) =>
    `${adults} ${adults === 1 ? "Erwachsener" : "Erwachsene"}, ${children} ${children === 1 ? "Kind" : "Kinder"}`,
  roomGuests: count => `${count} ${count === 1 ? "Gast" : "Gäste"}`,
  cardSurcharge: (amount, percent) =>
    `${amount} (Online-Kartenzahlung, ${String(percent).replace(".", ",")} %)`,
  cruiseName: deCruiseName,
  nights: count => `${count} ${count === 1 ? "Nacht" : "Nächte"}`,
  trackLabel: "Buchung verfolgen",
  stageTitle: (milestone, stageCount) => {
    if (milestone === "INITIAL") return stageCount === 1 ? "Vollständige Zahlung" : "Erste Rechnung";
    if (milestone === "DAY_60") return "Zweite Rechnung · 60 Tage vorher";
    if (milestone === "DAY_45") return "Schlussrechnung · 45 Tage vorher";
    if (milestone === "BALANCE") return "Restbetrag";
    return milestone;
  },
  stageState: { paid: "Erhalten", due: "Jetzt fällig", upcoming: "Anstehend" },
  stageWhen: {
    paid: "Dankend erhalten",
    initial: "Bei Erhalt Ihrer Rechnung",
    by: date => `Bis zum ${date}`,
    beforeDeparture: "Vor der Abreise",
  },
  schedule: "Zahlungsplan",
  summary: {
    title: "Die Details Ihrer Buchung",
    code: "Buchungscode",
    cruise: "Reise",
    departure: "Abreisedatum",
    returnDate: "Rückreisedatum",
    duration: "Dauer",
    room: "Kabinentyp",
    adults: "Erwachsene",
    children: "Kinder",
    method: "Bevorzugte Zahlungsart",
    rate: "Tarif",
    surcharge: "Kartenzuschlag (enthalten)",
    total: "Gesamtpreis",
  },
  codeCard: {
    label: "Ihr Buchungscode",
    trackBefore: "Verfolgen Sie Ihre Buchung jederzeit unter",
    trackAfter: "mit diesem Code und Ihrer E-Mail-Adresse.",
  },
  received: {
    preview: "Ihre Buchungsanfrage für die Hathor ist bei uns eingegangen",
    eyebrow: "Buchungsanfrage",
    hero: "Vielen Dank",
    body: "Ihre Buchungsanfrage wurde gesendet. Das Reservierungsteam der Hathor meldet sich bei Ihnen mit der Rechnung und den Zahlungshinweisen. Es wurde keine Zahlung eingezogen.",
    nextTitle: "Wie geht es weiter?",
    next: "Unser Reservierungsteam prüft Ihre Anfrage und sendet Ihnen per E-Mail eine Rechnung für die gewählte Zahlungsart. Sobald Ihre Anzahlung eingegangen ist, erhalten Sie die Bestätigung mit dem restlichen Zahlungsplan.",
  },
  confirmed: {
    preview: "Ihre Reservierung auf der Hathor ist bestätigt: Zahlung erhalten",
    eyebrow: "Reservierung",
    hero: "Reservierung bestätigt",
    body: "Die Hathor hat Ihre Reservierung angenommen, und die erforderliche erste Zahlung wurde verbucht. Bitte richten Sie sich für einen etwaigen Restbetrag nach dem Zahlungsplan.",
    paidLabel: "Zahlung erhalten",
    paidBalance: balance => `Restbetrag ${balance} · siehe Zahlungsplan unten`,
    paidFull: "Ihre Reise ist vollständig bezahlt",
    schedule: "Ihr Zahlungsplan",
    awaits: "Ihre Reise erwartet Sie",
    highlights: [
      "Luxuskabine mit Panoramablick auf den Nil",
      "Gourmetgerichte von unserem privaten Küchenchef",
      "Geführte Ausflüge zu antiken Tempeln",
      "Persönlicher Service während der gesamten Reise",
    ],
    security:
      "Sicherheitshinweis: Die Hathor wird Sie niemals bitten, Kartendaten, Passwörter oder Bestätigungscodes per E-Mail oder Messenger zu senden.",
    cta: "Reservierung ansehen",
  },
  invoice: {
    preview: dueAmount => `Ihre Rechnung der Hathor: ${dueAmount ? `${dueAmount} zur Bestätigung fällig` : "die Zahlungshinweise finden Sie darin"}`,
    eyebrow: "Rechnung",
    hero: "Ihre Rechnung",
    body: "Vielen Dank, dass Sie sich für die Hathor entschieden haben. Wir haben Ihre Anfrage geprüft, und Ihre Kabinen sind für Sie reserviert. Um Ihre Buchung zu bestätigen, zahlen Sie bitte die unten genannte Anzahlung mit der gewählten Zahlungsart.",
    method: method => method ?? "die von Ihnen gewählte Zahlungsart",
    dueLabel: "Jetzt zur Bestätigung fällig",
    dueNote: ({ percent, total, method, surcharge }) =>
      `${percent ? `${percent} % Ihrer Reise zu ${total}` : `Reise gesamt ${total}`} · Zahlung per ${method}${surcharge ? " · einschließlich Kartenzuschlag" : ""}`,
    afterParts: ["Nach dieser Zahlung verbleiben ", ", fällig: ", "."],
    pay: amount => (amount ? `${amount} sicher bezahlen` : "Sicher bezahlen"),
    linkFallback: "Falls sich die Schaltfläche nicht öffnet, kopieren Sie diesen sicheren Zahlungslink in Ihren Browser: ",
    howToPay: method => `So zahlen Sie per ${method}`,
    closing:
      "Ihre Buchung ist bestätigt, sobald Ihre Zahlung eingegangen und verbucht ist. Wir schreiben Ihnen, sobald es so weit ist. Die Hathor fragt niemals per E-Mail oder Messenger nach Kartennummern, Passwörtern oder Bestätigungscodes.",
  },
  declined: {
    preview: "Neuigkeiten zu Ihrer Buchungsanfrage bei der Hathor",
    eyebrow: "Buchungsanfrage",
    hero: "Es tut uns leid",
    body: "Vielen Dank für Ihr Interesse an einer Reise mit der Hathor. Leider können wir diese Buchungsanfrage nicht annehmen, und die dafür reservierten Kabinen wurden freigegeben. Es wurde keine Zahlung eingezogen.",
    note: "Eine Nachricht unseres Reservierungsteams",
    section: "Die Anfrage",
    cta: "Andere Termine ansehen",
  },
  message: {
    preview: code => `Eine Nachricht zu Ihrer Hathor Buchung ${code}`,
    eyebrow: "Reservierungen",
    hero: "Eine Nachricht der Hathor",
    body: "Antworten Sie bei Fragen einfach auf diese E-Mail. Unser Reservierungsteam liest jede Nachricht.",
    dear: "Guten Tag ",
    booking: " · Buchung ",
  },
  receipt: {
    subject: (refund, code) => `Ihr Beleg der Hathor für ${refund ? "die Erstattung" : "die Zahlung"} — ${code}`,
    message: ({ refund, amount, date, reference }) =>
      refund
        ? `Wir haben Ihre Erstattung von ${amount} am ${date} verbucht.\n\nReferenz der Bank oder des Zahlungsdienstleisters: ${reference}\n\nEtwaige angehängte Dokumente gehören zu dieser Erstattung. Wenn Sie Fragen haben, antworten Sie bitte auf diese E-Mail.`
        : `Vielen Dank. Wir haben Ihre Zahlung von ${amount} am ${date} verbucht.\n\nReferenz der Bank oder des Zahlungsdienstleisters: ${reference}\n\nDieser Beleg bestätigt nur die verbuchte Zahlung. Unter „Buchung verfolgen“ sehen Sie den Status Ihrer Buchung und den restlichen Zahlungsplan. Wenn Sie Fragen haben, antworten Sie bitte auf diese E-Mail.`,
  },
  contact: {
    title: "Wir haben Ihre Nachricht erhalten",
    preview: "Wir haben Ihre Nachricht erhalten — Hathor Dahabiya",
    eyebrow: "Nachricht erhalten",
    hero: "Vielen Dank, {guestName}",
    body: "Ihre Nachricht ist beim Reservierungsteam der Hathor eingegangen. Wir antworten Ihnen innerhalb von 24 Stunden.",
    replyHint: "Wenn Sie Ihrer Anfrage etwas hinzufügen möchten, können Sie direkt auf diese E-Mail antworten.",
    replyFallback: "Wenn Sie etwas hinzufügen möchten, können Sie direkt auf diese E-Mail antworten.",
    security:
      "Senden Sie zu Ihrer Sicherheit niemals Passwörter oder Kartendaten per E-Mail. Die Hathor fordert als Antwort auf eine Kontaktnachricht keine Zahlung über einen ungeprüften Link an.",
    cta: "Die Dahabiya entdecken",
  },
  footer: {
    tagline: "Luxuskreuzfahrten auf dem Nil",
    replyNote: "Fragen? Antworten Sie direkt auf diese E-Mail. Wir helfen Ihnen gern.",
  },
  templates: {
    BookingReceived: {
      subject: "Ihre Buchungsanfrage bei der Hathor ist eingegangen",
      heading: "Anfrage erhalten, {guestName}",
      body: "Ihre Buchungsanfrage wurde gesendet. Das Reservierungsteam der Hathor meldet sich bei Ihnen mit der Rechnung und den Zahlungshinweisen. Es wurde keine Zahlung eingezogen.",
    },
    BookingInvoice: {
      subject: "Ihre Rechnung der Hathor — Buchung {bookingCode}",
      heading: "Ihre Rechnung, {guestName}",
      body: "Vielen Dank, dass Sie sich für die Hathor entschieden haben. Wir haben Ihre Anfrage geprüft, und Ihre Kabinen sind für Sie reserviert. Um Ihre Buchung zu bestätigen, zahlen Sie bitte die unten genannte Anzahlung mit der gewählten Zahlungsart.",
    },
    BookingConfirmed: {
      subject: "Ihre Reservierung auf der Hathor ist bestätigt — {bookingCode}",
      heading: "Reservierung bestätigt, {guestName}",
      body: "Die Hathor hat Ihre Reservierung angenommen, und die erforderliche erste Zahlung wurde verbucht. Bitte richten Sie sich für einen etwaigen Restbetrag nach dem Zahlungsplan.",
    },
    BookingDeclined: {
      subject: "Neuigkeiten zu Ihrer Buchungsanfrage {bookingCode} bei der Hathor",
      heading: "Es tut uns leid, {guestName}",
      body: "Vielen Dank für Ihr Interesse an einer Reise mit der Hathor. Leider können wir diese Buchungsanfrage nicht annehmen, und die dafür reservierten Kabinen wurden freigegeben. Es wurde keine Zahlung eingezogen.",
    },
    BookingMessage: {
      subject: "Eine Nachricht zu Ihrer Hathor Buchung {bookingCode}",
      heading: "Eine Nachricht der Hathor",
      body: "Antworten Sie bei Fragen einfach auf diese E-Mail. Unser Reservierungsteam liest jede Nachricht.",
    },
    ContactReceived: {
      subject: "Wir haben Ihre Nachricht erhalten | Hathor Dahabiya",
      heading: "Vielen Dank, {guestName}",
      body: "Ihre Nachricht ist beim Reservierungsteam der Hathor eingegangen. Wir antworten Ihnen innerhalb von 24 Stunden.",
    },
  },
};
