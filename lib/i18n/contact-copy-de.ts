/** The Contact page and its enquiry form in German; see contact-copy.ts. */
import type { ContactCopy, InquiryFormCopy } from "@/lib/i18n/contact-copy";

export const CONTACT_COPY_DE: ContactCopy = {
  runLabel: "Kontakt zur Reservierung der Hathor",
  navLabel: "Bereiche der Seite",
  nav: { write: "Schreiben", reach: "Kontakt", hours: "Zeiten", cruises: "Kreuzfahrten" },
  eyebrow: "Kontakt",
  scroll: "Scrollen",
  alts: {
    hero: "Reservierung der Hathor und Reise auf dem Nil",
    boat: "Die Hathor Dahabiya auf dem Nil",
    royal: "Royal Suite an Bord der Hathor Dahabiya",
    sailing: "Auf dem Nil an Bord der Hathor",
    life: "Das Leben an Bord der Hathor Dahabiya",
    card: "Die Hathor Dahabiya auf dem Nil",
  },
  aboard: "An Bord",
  route: "Luxor — Assuan",
  manifestoEyebrow: "Eine offene Leitung",
  manifesto: ["Eine private Leitung,", "die Sie einlädt,", "den Nil zu entdecken"],
  reachEyebrow: "So erreichen Sie uns",
  reachIntro: "Vier Wege zu einem Gespräch mit unserer Reservierung in Kairo.",
  channels: [
    { word: "Besuch", label: "Adresse", meta: "Büro in Kairo" },
    { word: "Anruf", label: "Telefon", meta: "Direkte Leitung", cta: "Jetzt anrufen" },
    { word: "E-Mail", label: "E-Mail", meta: "Reservierung", cta: "E-Mail senden" },
    {
      word: "Nachricht",
      label: "WhatsApp",
      meta: "Sofort",
      value: "Schreiben Sie uns auf WhatsApp",
      cta: "WhatsApp",
    },
  ],
  address: "One Kattamiya, Tower 211, 11. Etage, Flat 111, Ring Road, Kairo, Ägypten",
  hoursLabel: "Erreichbarkeit",
  hoursZone: "Kairo · OEZ",
  workingHours: "Täglich erreichbar: 09:00 – 17:00 Uhr",
  dayOff: "Ruhetag: Freitag",
  nextEyebrow: "Als Nächstes",
  nextTitle: "Schreiben Sie uns",
  writeEyebrow: "Schreiben",
  composeTitle: "Ihre Nachricht",
  submit: "Nachricht senden",
  cardTag: "Reservierung",
  cardTitle: "Korrespondenz",
  cardOffice: "Büro in Kairo · täglich 09:00–17:00 Uhr",
  call: "Anrufen",
  bookNow: "Jetzt buchen",
};

export const INQUIRY_FORM_COPY_DE: InquiryFormCopy = {
  close: "Dankesnachricht schließen",
  sentEyebrow: "Nachricht gesendet",
  thanks: "Vielen Dank",
  sentBody:
    "Ihre Nachricht ist bei unserer Reservierung angekommen. Eine Bestätigungs-E-Mail ist an die angegebene Adresse unterwegs.",
  respond: "Unser Team antwortet Ihnen innerhalb von 24 Stunden.",
  again: "Weitere Nachricht senden",
  thanksCard: "Vielen Dank",
  receivedBody:
    "Wir haben Ihre Nachricht erhalten. Unsere Reservierung antwortet Ihnen innerhalb von 24 Stunden.",
  selectionLabel: "Ihre Auswahl",
  selectionTitle: "Ihre Reise mit der Hathor",
  selectionNote: "Wird mit Ihrer Nachricht gesendet. Sie können sie jederzeit in Meine Reise ändern.",
  name: "Name",
  email: "E-Mail",
  phone: "Telefon",
  address: "Adresse",
  checkIn: "Anreise",
  adults: "Erwachsene",
  children: "Kinder",
  message: "Nachricht",
  sending: "Wird gesendet…",
  sendMessage: "Nachricht senden",
  unableToSend: "Die Nachricht konnte nicht gesendet werden.",
  securityCheck: "Bitte schließen Sie vor dem Senden die Sicherheitsprüfung ab.",
  verificationUnavailable:
    "Die Sicherheitsprüfung ist nicht verfügbar. Laden Sie diese Seite neu oder kontaktieren Sie direkt unsere Reservierung.",
  serverErrors: false,
  languageNote: "Guest language: German",
};

/** What /api/contact can say to a guest, by its English wording. */
export const INQUIRY_REFUSALS_DE: Record<string, string> = {
  "Please check your form and try again.": "Bitte prüfen Sie das Formular und versuchen Sie es erneut.",
  "Too many messages. Please wait and try again.":
    "Zu viele Nachrichten. Bitte warten Sie und versuchen Sie es erneut.",
  "Unable to send your message. Please try again later.":
    "Ihre Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es später erneut.",
  "Security verification is unavailable. Please contact our reservations team directly.":
    "Die Sicherheitsprüfung ist nicht verfügbar. Bitte kontaktieren Sie direkt unsere Reservierung.",
  "Please complete the security check and try again.":
    "Bitte schließen Sie die Sicherheitsprüfung ab und versuchen Sie es erneut.",
  "The security check is temporarily unavailable. Please try again.":
    "Die Sicherheitsprüfung ist vorübergehend nicht verfügbar. Bitte versuchen Sie es erneut.",
  "The security check expired or could not be verified. Please try again.":
    "Die Sicherheitsprüfung ist abgelaufen oder konnte nicht bestätigt werden. Bitte versuchen Sie es erneut.",
};
