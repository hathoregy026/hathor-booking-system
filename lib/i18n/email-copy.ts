/**
 * The guest's automatic emails, in every public language. English is the live
 * copy, word for word; Italian follows the site's style (short imperative on
 * buttons, "Lei" in sentences, gender-neutral toward the reader).
 *
 * `templates` holds the three fields the dashboard can edit in English
 * (subject, heading, body). The dashboard's rows are English wording, so a
 * translated email takes these three from here and keeps only the rows'
 * colours, plus the footer's contact details and copyright line.
 */

import { format, parse } from "date-fns";
import { it as itDates } from "date-fns/locale/it";
import { stageTitle } from "@/lib/booking-code";
import type { EmailFooterSettings } from "@/lib/email-footer";
import type { EmailTemplateName } from "@/lib/email-templates";
import type { PublicLocale } from "@/lib/i18n/locale";

type TemplateText = { subject: string; heading: string; body: string };

export type EmailCopy = {
  htmlLang: string;
  heroAlt: string;
  /** The date as a guest reads it ("July 4, 2026", "4 luglio 2026"). */
  date: (date: Date) => string;
  /** Reads `date`'s own format back, for the summary's night count. */
  parseDate: (text: string) => Date;
  forGuestPrefix: string;
  guestFallback: string;
  notSpecified: string;
  ratePlan: string;
  paymentMethod: (bank: boolean) => string;
  party: (adults: number, children: number) => string;
  roomGuests: (count: number) => string;
  cardSurcharge: (amount: string, percent: number) => string;
  cruiseName: (name: string) => string;
  nights: (count: number) => string;
  trackLabel: string;
  stageTitle: (milestone: string, stageCount: number) => string;
  stageState: { paid: string; due: string; upcoming: string };
  stageWhen: { paid: string; initial: string; by: (date: string) => string; beforeDeparture: string };
  schedule: string;
  summary: {
    title: string;
    code: string;
    cruise: string;
    departure: string;
    returnDate: string;
    duration: string;
    room: string;
    adults: string;
    children: string;
    method: string;
    rate: string;
    surcharge: string;
    total: string;
  };
  codeCard: { label: string; trackBefore: string; trackAfter: string };
  received: { preview: string; eyebrow: string; hero: string; body: string; nextTitle: string; next: string };
  confirmed: {
    preview: string;
    eyebrow: string;
    hero: string;
    body: string;
    paidLabel: string;
    paidBalance: (balance: string) => string;
    paidFull: string;
    schedule: string;
    awaits: string;
    highlights: readonly string[];
    security: string;
    cta: string;
  };
  invoice: {
    preview: (dueAmount?: string) => string;
    eyebrow: string;
    hero: string;
    body: string;
    method: (method?: string) => string;
    dueLabel: string;
    dueNote: (input: { percent?: number; total: string; method: string; surcharge: boolean }) => string;
    /** The sentence around the amount left and when it falls due. */
    afterParts: readonly [string, string, string];
    pay: (amount?: string) => string;
    linkFallback: string;
    howToPay: (method: string) => string;
    closing: string;
  };
  declined: { preview: string; eyebrow: string; hero: string; body: string; note: string; section: string; cta: string };
  message: {
    preview: (code: string) => string;
    eyebrow: string;
    hero: string;
    body: string;
    dear: string;
    booking: string;
  };
  receipt: {
    subject: (refund: boolean, code: string) => string;
    message: (input: { refund: boolean; amount: string; date: string; reference: string }) => string;
  };
  contact: {
    title: string;
    preview: string;
    eyebrow: string;
    hero: string;
    body: string;
    replyHint: string;
    replyFallback: string;
    security: string;
    cta: string;
  };
  footer: Pick<EmailFooterSettings, "tagline" | "replyNote">;
  /** Translated stand-ins for the dashboard's English wording. */
  templates: Partial<Record<EmailTemplateName, TemplateText>>;
};

const EN: EmailCopy = {
  htmlLang: "en",
  heroAlt: "Luxury Hathor Dahabiya cruise on the Nile",
  date: date => format(date, "MMMM d, yyyy"),
  parseDate: text => parse(text, "MMMM d, yyyy", new Date()),
  forGuestPrefix: "For ",
  guestFallback: "Guest",
  notSpecified: "Not specified",
  ratePlan: "Standard Hathor rate",
  paymentMethod: bank => (bank ? "Bank Transfer" : "Visa"),
  party: (adults, children) =>
    `${adults} adult${adults === 1 ? "" : "s"}, ${children} child${children === 1 ? "" : "ren"}`,
  roomGuests: count => `${count} guest${count === 1 ? "" : "s"}`,
  cardSurcharge: (amount, percent) => `${amount} (${percent}% online card payment)`,
  cruiseName: name => name,
  nights: count => `${count} night${count === 1 ? "" : "s"}`,
  trackLabel: "Track Your Booking",
  stageTitle,
  stageState: { paid: "Received", due: "Due now", upcoming: "Upcoming" },
  stageWhen: {
    paid: "Received with thanks",
    initial: "On receipt of your invoice",
    by: date => `By ${date}`,
    beforeDeparture: "Before departure",
  },
  schedule: "Payment Schedule",
  summary: {
    title: "Your Reservation Details",
    code: "Booking Code",
    cruise: "Cruise Name",
    departure: "Departure Date",
    returnDate: "Return Date",
    duration: "Duration",
    room: "Room Type",
    adults: "Adults",
    children: "Children",
    method: "Preferred payment method",
    rate: "Rate",
    surcharge: "Card surcharge (included)",
    total: "Total Price",
  },
  codeCard: {
    label: "Your booking code",
    trackBefore: "Track your booking any time at",
    trackAfter: "with this code and your email.",
  },
  received: {
    preview: "Your Hathor cruise booking request has been received",
    eyebrow: "Booking Request",
    hero: "Thank You",
    body: "Your booking request has been sent. Hathor reservations will contact you with the invoice and payment instructions. No payment has been collected.",
    nextTitle: "What happens next?",
    next: "Our reservations team will review your request and email you an invoice for your chosen payment method. Once your deposit is received, we send your confirmation with the rest of the payment schedule.",
  },
  confirmed: {
    preview: "Your Hathor reservation is confirmed — payment received",
    eyebrow: "Reservation",
    hero: "Reservation Confirmed",
    body: "Hathor has accepted your reservation and the required initial payment has been recorded. Please follow the payment schedule for any remaining balance.",
    paidLabel: "Payment received",
    paidBalance: balance => `Remaining balance ${balance} · see the schedule below`,
    paidFull: "Your voyage is paid in full",
    schedule: "Your Payment Schedule",
    awaits: "Your journey awaits",
    highlights: [
      "Luxury cabin with panoramic Nile views",
      "Gourmet meals prepared by our private chef",
      "Guided excursions to ancient temples",
      "Personalized service throughout your voyage",
    ],
    security:
      "Security note: Hathor will never ask you to send card details, passwords, or verification codes by email or messaging apps.",
    cta: "View Your Reservation",
  },
  invoice: {
    preview: dueAmount => `Your Hathor invoice — ${dueAmount ? `${dueAmount} due to confirm` : "payment instructions inside"}`,
    eyebrow: "Invoice",
    hero: "Your Invoice",
    body: "Thank you for choosing Hathor. We have reviewed your request and your cabins are reserved for you. To confirm your booking, please pay the deposit below using your chosen payment method.",
    method: method => method ?? "your chosen method",
    dueLabel: "Due now to confirm",
    dueNote: ({ percent, total, method, surcharge }) =>
      `${percent ? `${percent}% of your ${total} voyage` : `Total voyage ${total}`} · paid by ${method}${surcharge ? " · includes the card surcharge" : ""}`,
    afterParts: ["After this payment, ", " remains — ", "."],
    pay: amount => (amount ? `Pay ${amount} securely` : "Pay securely"),
    linkFallback: "If the button does not open, copy this secure payment link into your browser: ",
    howToPay: method => `How to pay by ${method}`,
    closing:
      "Your booking is confirmed once your payment is received and recorded — we will email you as soon as it is. Hathor will never ask for card numbers, passwords or verification codes by email or messaging apps.",
  },
  declined: {
    preview: "An update on your Hathor booking request",
    eyebrow: "Booking Request",
    hero: "We're Sorry",
    body: "Thank you for your interest in sailing with Hathor. Unfortunately we are unable to accept this booking request, and the cabins held for it have been released. No payment has been taken.",
    note: "A note from our reservations team",
    section: "The Request",
    cta: "Explore Other Dates",
  },
  message: {
    preview: code => `A message about your Hathor booking ${code}`,
    eyebrow: "Reservations",
    hero: "A Note From Hathor",
    body: "Simply reply to this email with any questions — our reservations team reads every message.",
    dear: "Dear ",
    booking: " · Booking ",
  },
  receipt: {
    subject: (refund, code) => `Your Hathor ${refund ? "refund" : "payment"} receipt — ${code}`,
    message: ({ refund, amount, date, reference }) =>
      refund
        ? `We have recorded your refund of ${amount} on ${date}.\n\nBank / processor reference: ${reference}\n\nAny attached documents accompany this refund record. If you have questions, please reply to this email.`
        : `Thank you. We have recorded your payment of ${amount} on ${date}.\n\nBank / processor reference: ${reference}\n\nThis receipt acknowledges the recorded payment only. Use Track Your Booking to check your booking status and remaining payment schedule. If you have questions, please reply to this email.`,
  },
  contact: {
    title: "We received your message",
    preview: "We received your message — Hathor Dahabiya",
    eyebrow: "Message received",
    hero: "Thank you, {guestName}",
    body: "Your note has reached the Hathor reservations desk. We will reply within 24 hours.",
    replyHint: "You may reply directly to this email if you wish to add anything to your request.",
    replyFallback: "You can reply directly to this email if you need to add anything.",
    security:
      "For your security, never send passwords or card details by email. Hathor will not request payment through an unverified link in response to a contact message.",
    cta: "Visit Dahabiya",
  },
  footer: {
    tagline: "Luxury cruises on the Nile",
    replyNote: "Questions? Reply directly to this email — we are here to help.",
  },
  templates: {},
};

/* The catalog's voyages, as the Italian voyage pages word them. */
const CRUISE_ROUTES_IT: Record<string, string> = {
  "Luxor to Aswan": "Da Luxor ad Assuan",
  "Aswan to Luxor": "Da Assuan a Luxor",
  "Luxor to Aswan to Luxor": "Da Luxor ad Assuan e ritorno",
};
const CRUISE_NAME = /^(\d+) Nights? \/ (\d+) Days? — (.+)$/;

const itCruiseName = (name: string) => {
  const match = CRUISE_NAME.exec(name.trim());
  const route = match && CRUISE_ROUTES_IT[match[3]!];
  return route ? `${match[1]} notti / ${match[2]} giorni — ${route}` : name;
};

const IT: EmailCopy = {
  htmlLang: "it",
  heroAlt: "Crociera di lusso sul Nilo a bordo di Hathor Dahabiya",
  date: date => format(date, "d MMMM yyyy", { locale: itDates }),
  parseDate: text => parse(text, "d MMMM yyyy", new Date(), { locale: itDates }),
  forGuestPrefix: "Per ",
  guestFallback: "Ospite",
  notSpecified: "Non specificato",
  ratePlan: "Tariffa standard Hathor",
  paymentMethod: bank => (bank ? "Bonifico bancario" : "Visa"),
  party: (adults, children) =>
    `${adults} ${adults === 1 ? "adulto" : "adulti"}, ${children} ${children === 1 ? "bambino" : "bambini"}`,
  roomGuests: count => `${count} ${count === 1 ? "ospite" : "ospiti"}`,
  cardSurcharge: (amount, percent) =>
    `${amount} (pagamento online con carta, ${String(percent).replace(".", ",")}%)`,
  cruiseName: itCruiseName,
  nights: count => `${count} ${count === 1 ? "notte" : "notti"}`,
  trackLabel: "Segui la prenotazione",
  stageTitle: (milestone, stageCount) => {
    if (milestone === "INITIAL") return stageCount === 1 ? "Pagamento completo" : "Prima fattura";
    if (milestone === "DAY_60") return "Seconda fattura · 60 giorni prima";
    if (milestone === "DAY_45") return "Fattura finale · 45 giorni prima";
    if (milestone === "BALANCE") return "Saldo";
    return milestone;
  },
  stageState: { paid: "Ricevuto", due: "Da pagare ora", upcoming: "In programma" },
  stageWhen: {
    paid: "Ricevuto, con i nostri ringraziamenti",
    initial: "Al ricevimento della fattura",
    by: date => `Entro il ${date}`,
    beforeDeparture: "Prima della partenza",
  },
  schedule: "Piano di pagamento",
  summary: {
    title: "I dettagli della Sua prenotazione",
    code: "Codice di prenotazione",
    cruise: "Viaggio",
    departure: "Data di partenza",
    returnDate: "Data di ritorno",
    duration: "Durata",
    room: "Tipologia di cabina",
    adults: "Adulti",
    children: "Bambini",
    method: "Metodo di pagamento preferito",
    rate: "Tariffa",
    surcharge: "Supplemento carta (incluso)",
    total: "Prezzo totale",
  },
  codeCard: {
    label: "Il Suo codice di prenotazione",
    trackBefore: "Può seguire la Sua prenotazione in qualsiasi momento su",
    trackAfter: "con questo codice e il Suo indirizzo email.",
  },
  received: {
    preview: "La Sua richiesta di prenotazione per la crociera Hathor è stata ricevuta",
    eyebrow: "Richiesta di prenotazione",
    hero: "Grazie",
    body: "La Sua richiesta di prenotazione è stata inviata. L’ufficio prenotazioni di Hathor La contatterà con la fattura e le istruzioni di pagamento. Non è stato effettuato alcun pagamento.",
    nextTitle: "Cosa succede ora?",
    next: "Il nostro ufficio prenotazioni esaminerà la Sua richiesta e Le invierà via email la fattura per il metodo di pagamento scelto. Ricevuto l’acconto, Le invieremo la conferma insieme al resto del piano di pagamento.",
  },
  confirmed: {
    preview: "La Sua prenotazione Hathor è confermata: pagamento ricevuto",
    eyebrow: "Prenotazione",
    hero: "Prenotazione confermata",
    body: "Hathor ha accettato la Sua prenotazione e ha registrato il pagamento iniziale richiesto. La preghiamo di attenersi al piano di pagamento per l’eventuale saldo residuo.",
    paidLabel: "Pagamento ricevuto",
    paidBalance: balance => `Saldo residuo ${balance} · il piano è qui sotto`,
    paidFull: "Il Suo viaggio è interamente saldato",
    schedule: "Il Suo piano di pagamento",
    awaits: "Il Suo viaggio La attende",
    highlights: [
      "Cabina di lusso con vista panoramica sul Nilo",
      "Pasti gourmet preparati dal nostro chef privato",
      "Escursioni guidate agli antichi templi",
      "Un servizio personalizzato per tutto il viaggio",
    ],
    security:
      "Nota di sicurezza: Hathor non Le chiederà mai di inviare dati della carta, password o codici di verifica via email o tramite app di messaggistica.",
    cta: "Vedi la prenotazione",
  },
  invoice: {
    preview: dueAmount => `La Sua fattura Hathor: ${dueAmount ? `${dueAmount} da versare per confermare` : "le istruzioni di pagamento all’interno"}`,
    eyebrow: "Fattura",
    hero: "La Sua fattura",
    body: "Grazie per aver scelto Hathor. Abbiamo esaminato la Sua richiesta e le cabine sono riservate per Lei. Per confermare la prenotazione, La preghiamo di versare l’acconto indicato di seguito con il metodo di pagamento scelto.",
    method: method => (method ? method.replace("Bonifico", "bonifico") : "il metodo da Lei scelto"),
    dueLabel: "Da versare ora per confermare",
    dueNote: ({ percent, total, method, surcharge }) =>
      `${percent ? `${percent}% del Suo viaggio di ${total}` : `Totale del viaggio ${total}`} · pagamento con ${method}${surcharge ? " · supplemento carta incluso" : ""}`,
    afterParts: ["Dopo questo pagamento resteranno ", " da versare: ", "."],
    pay: amount => (amount ? `Paga ${amount} in sicurezza` : "Paga in sicurezza"),
    linkFallback: "Se il pulsante non si apre, copi nel Suo browser questo link di pagamento sicuro: ",
    howToPay: method => `Come pagare con ${method}`,
    closing:
      "La Sua prenotazione sarà confermata una volta ricevuto e registrato il pagamento: Le scriveremo non appena sarà avvenuto. Hathor non Le chiederà mai numeri di carta, password o codici di verifica via email o tramite app di messaggistica.",
  },
  declined: {
    preview: "Un aggiornamento sulla Sua richiesta di prenotazione Hathor",
    eyebrow: "Richiesta di prenotazione",
    hero: "Siamo spiacenti",
    body: "Grazie per l’interesse a navigare con Hathor. Purtroppo non possiamo accettare questa richiesta di prenotazione e le cabine riservate sono state rilasciate. Non è stato effettuato alcun pagamento.",
    note: "Un messaggio dal nostro ufficio prenotazioni",
    section: "La richiesta",
    cta: "Scopri altre date",
  },
  message: {
    preview: code => `Un messaggio sulla Sua prenotazione Hathor ${code}`,
    eyebrow: "Prenotazioni",
    hero: "Un messaggio da Hathor",
    body: "Per qualsiasi domanda, risponda semplicemente a questa email: il nostro ufficio prenotazioni legge ogni messaggio.",
    dear: "Gentile ",
    booking: " · Prenotazione ",
  },
  receipt: {
    subject: (refund, code) => `La Sua ricevuta di ${refund ? "rimborso" : "pagamento"} Hathor — ${code}`,
    message: ({ refund, amount, date, reference }) =>
      refund
        ? `Abbiamo registrato il Suo rimborso di ${amount} in data ${date}.\n\nRiferimento della banca o del circuito di pagamento: ${reference}\n\nGli eventuali documenti allegati accompagnano questa registrazione del rimborso. Per qualsiasi domanda, risponda a questa email.`
        : `Grazie. Abbiamo registrato il Suo pagamento di ${amount} in data ${date}.\n\nRiferimento della banca o del circuito di pagamento: ${reference}\n\nQuesta ricevuta attesta soltanto il pagamento registrato. Con il pulsante «Segui la prenotazione» può verificare lo stato della prenotazione e i pagamenti ancora previsti. Per qualsiasi domanda, risponda a questa email.`,
  },
  contact: {
    title: "Abbiamo ricevuto il Suo messaggio",
    preview: "Abbiamo ricevuto il Suo messaggio — Hathor Dahabiya",
    eyebrow: "Messaggio ricevuto",
    hero: "Grazie, {guestName}",
    body: "Il Suo messaggio è arrivato all’ufficio prenotazioni di Hathor. Le risponderemo entro 24 ore.",
    replyHint: "Se desidera aggiungere qualcosa alla Sua richiesta, può rispondere direttamente a questa email.",
    replyFallback: "Se desidera aggiungere qualcosa, può rispondere direttamente a questa email.",
    security:
      "Per la Sua sicurezza, non invii mai password o dati della carta via email. Hathor non richiede pagamenti tramite link non verificati in risposta a un messaggio di contatto.",
    cta: "Scopri la dahabiya",
  },
  footer: {
    tagline: "Crociere di lusso sul Nilo",
    replyNote: "Domande? Risponda direttamente a questa email: siamo a Sua disposizione.",
  },
  templates: {
    BookingReceived: {
      subject: "La Sua richiesta di prenotazione Hathor è stata ricevuta",
      heading: "Richiesta ricevuta, {guestName}",
      body: "La Sua richiesta di prenotazione è stata inviata. L’ufficio prenotazioni di Hathor La contatterà con la fattura e le istruzioni di pagamento. Non è stato effettuato alcun pagamento.",
    },
    BookingInvoice: {
      subject: "La Sua fattura Hathor — prenotazione {bookingCode}",
      heading: "La Sua fattura, {guestName}",
      body: "Grazie per aver scelto Hathor. Abbiamo esaminato la Sua richiesta e le cabine sono riservate per Lei. Per confermare la prenotazione, La preghiamo di versare l’acconto indicato di seguito con il metodo di pagamento scelto.",
    },
    BookingConfirmed: {
      subject: "La Sua prenotazione Hathor è confermata — {bookingCode}",
      heading: "Prenotazione confermata, {guestName}",
      body: "Hathor ha accettato la Sua prenotazione e ha registrato il pagamento iniziale richiesto. La preghiamo di attenersi al piano di pagamento per l’eventuale saldo residuo.",
    },
    BookingDeclined: {
      subject: "Un aggiornamento sulla Sua richiesta di prenotazione Hathor {bookingCode}",
      heading: "Siamo spiacenti, {guestName}",
      body: "Grazie per l’interesse a navigare con Hathor. Purtroppo non possiamo accettare questa richiesta di prenotazione e le cabine riservate sono state rilasciate. Non è stato effettuato alcun pagamento.",
    },
    BookingMessage: {
      subject: "Un messaggio sulla Sua prenotazione Hathor {bookingCode}",
      heading: "Un messaggio da Hathor",
      body: "Per qualsiasi domanda, risponda semplicemente a questa email: il nostro ufficio prenotazioni legge ogni messaggio.",
    },
    ContactReceived: {
      subject: "Abbiamo ricevuto il Suo messaggio | Hathor Dahabiya",
      heading: "Grazie, {guestName}",
      body: "Il Suo messaggio è arrivato all’ufficio prenotazioni di Hathor. Le risponderemo entro 24 ore.",
    },
  },
};

export const EMAIL_COPY: Record<PublicLocale, EmailCopy> = { en: EN, it: IT };
