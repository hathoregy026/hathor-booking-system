/**
 * The Contact page and its enquiry form, in every public language. English
 * is the live copy, character for character. What the form sends is
 * unchanged, except that a translated page notes the guest's language for
 * the reservations desk (the guest's receipt does not include the message).
 */

import type { PublicLocale } from "@/lib/i18n/locale";
import { PUBLIC_CONTACT } from "@/lib/public-contact";

type Channel = { word: string; label: string; meta: string; value?: string; cta?: string };

export type ContactCopy = {
  runLabel: string;
  navLabel: string;
  nav: { write: string; reach: string; hours: string; cruises: string };
  eyebrow: string;
  scroll: string;
  alts: {
    hero: string;
    boat: string;
    royal: string;
    sailing: string;
    life: string;
    card: string;
  };
  aboard: string;
  route: string;
  manifestoEyebrow: string;
  manifesto: readonly [string, string, string];
  reachEyebrow: string;
  reachIntro: string;
  channels: readonly [Channel, Channel, Channel, Channel];
  address: string;
  hoursLabel: string;
  hoursZone: string;
  workingHours: string;
  dayOff: string;
  nextEyebrow: string;
  nextTitle: string;
  writeEyebrow: string;
  /** The form's own heading (the dashboard's form title sits above it). */
  composeTitle: string;
  submit: string;
  cardTag: string;
  cardTitle: string;
  cardOffice: string;
  call: string;
  bookNow: string;
};

export type InquiryFormCopy = {
  close: string;
  sentEyebrow: string;
  thanks: string;
  sentBody: string;
  respond: string;
  again: string;
  thanksCard: string;
  receivedBody: string;
  selectionLabel: string;
  selectionTitle: string;
  selectionNote: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  checkIn: string;
  adults: string;
  children: string;
  message: string;
  sending: string;
  sendMessage: string;
  unableToSend: string;
  /** Use the server's own refusal text (English) or always this language's. */
  serverErrors: boolean;
  /** Added to the team's copy of the message on translated pages. */
  languageNote: string | null;
};

export const CONTACT_COPY: Record<PublicLocale, ContactCopy> = {
  en: {
    runLabel: "Contact Hathor reservations",
    navLabel: "Contact page sections",
    nav: { write: "Write", reach: "Reach", hours: "Hours", cruises: "Cruises" },
    eyebrow: "Contact",
    scroll: "Scroll",
    alts: {
      hero: "Hathor reservations and Nile voyage",
      boat: "Hathor Dahabiya on the Nile",
      royal: "Royal suite aboard Hathor Dahabiya",
      sailing: "Sailing the Nile aboard Hathor",
      life: "Life aboard Hathor Dahabiya",
      card: "Hathor Dahabiya on the Nile",
    },
    aboard: "Aboard",
    route: "Luxor — Aswan",
    manifestoEyebrow: "A line open",
    manifesto: ["A private line", "that invites you", "to begin the Nile"],
    reachEyebrow: "Reach us",
    reachIntro: "Four ways to begin a conversation with our reservations desk in Cairo.",
    channels: [
      { word: "Visit", label: "Company Address", meta: "Cairo office" },
      { word: "Call", label: "Call Us Hotline", meta: "Direct line", cta: "Call Now" },
      { word: "Write", label: "Email", meta: "Reservations", cta: "Email Us" },
      {
        word: "Message",
        label: "WhatsApp",
        meta: "Instant",
        value: "Message us on WhatsApp",
        cta: "WhatsApp",
      },
    ],
    address: PUBLIC_CONTACT.address,
    hoursLabel: "Working hours",
    hoursZone: "Cairo · EET",
    workingHours: PUBLIC_CONTACT.workingHours,
    dayOff: PUBLIC_CONTACT.dayOff,
    nextEyebrow: "Next",
    nextTitle: "Write to us",
    writeEyebrow: "Write",
    composeTitle: "Your message",
    submit: "Send Message",
    cardTag: "Reservations",
    cardTitle: "Correspondence",
    cardOffice: "Cairo office · daily 09:00–17:00",
    call: "Call",
    bookNow: "Book Now",
  },
  it: {
    runLabel: "Contatti dell’ufficio prenotazioni Hathor",
    navLabel: "Sezioni della pagina",
    nav: { write: "Ci scriva", reach: "Recapiti", hours: "Orari", cruises: "Crociere" },
    eyebrow: "Contatti",
    scroll: "Scorri",
    alts: {
      hero: "Prenotazioni Hathor e viaggio sul Nilo",
      boat: "Hathor Dahabiya sul Nilo",
      royal: "Royal Suite a bordo di Hathor Dahabiya",
      sailing: "In navigazione sul Nilo a bordo di Hathor",
      life: "La vita a bordo di Hathor Dahabiya",
      card: "Hathor Dahabiya sul Nilo",
    },
    aboard: "A bordo",
    route: "Luxor — Assuan",
    manifestoEyebrow: "Una linea aperta",
    manifesto: ["Una linea privata", "che La invita", "a scoprire il Nilo"],
    reachEyebrow: "Come contattarci",
    reachIntro:
      "Quattro modi per iniziare una conversazione con il nostro ufficio prenotazioni al Cairo.",
    channels: [
      { word: "Visita", label: "Indirizzo", meta: "Ufficio del Cairo" },
      { word: "Chiamata", label: "Telefono", meta: "Linea diretta", cta: "Chiami ora" },
      { word: "E-mail", label: "E-mail", meta: "Prenotazioni", cta: "Ci scriva" },
      {
        word: "Messaggio",
        label: "WhatsApp",
        meta: "Risposta immediata",
        value: "Ci scriva su WhatsApp",
        cta: "WhatsApp",
      },
    ],
    address: "One Kattamiya, Torre 211, 11º piano, int. 111, Ring Road, Il Cairo, Egitto",
    hoursLabel: "Orari di apertura",
    hoursZone: "Il Cairo · EET",
    workingHours: "Orari: tutti i giorni 09:00 – 17:00",
    dayOff: "Giorno di chiusura: venerdì",
    nextEyebrow: "Il passo successivo",
    nextTitle: "Ci scriva",
    writeEyebrow: "Ci scriva",
    composeTitle: "Il Suo messaggio",
    submit: "Invia il messaggio",
    cardTag: "Prenotazioni",
    cardTitle: "Corrispondenza",
    cardOffice: "Ufficio del Cairo · tutti i giorni 09:00–17:00",
    call: "Chiami",
    bookNow: "Prenota ora",
  },
};

export const INQUIRY_FORM_COPY: Record<PublicLocale, InquiryFormCopy> = {
  en: {
    close: "Close thank you message",
    sentEyebrow: "Message sent",
    thanks: "Thank you",
    sentBody:
      "Your note has reached our reservations desk. A confirmation email is on its way to the address you provided.",
    respond: "Our team will respond within 24 hours.",
    again: "Send another message",
    thanksCard: "Thank You",
    receivedBody:
      "Your message has been received. Our reservations team will respond within 24 hours.",
    selectionLabel: "Your selection",
    selectionTitle: "Your Hathor voyage",
    selectionNote: "Sent with your message. Adjust it any time in My Voyage.",
    name: "Name",
    email: "Email",
    phone: "Phone",
    address: "Address",
    checkIn: "Check In",
    adults: "Adults",
    children: "Children",
    message: "Message",
    sending: "Sending…",
    sendMessage: "Send Message",
    unableToSend: "Unable to send message",
    serverErrors: true,
    languageNote: null,
  },
  it: {
    close: "Chiudi il messaggio di ringraziamento",
    sentEyebrow: "Messaggio inviato",
    thanks: "Grazie",
    sentBody:
      "Il Suo messaggio è arrivato al nostro ufficio prenotazioni. Una e-mail di conferma è in arrivo all’indirizzo indicato.",
    respond: "Il nostro team Le risponderà entro 24 ore.",
    again: "Invii un altro messaggio",
    thanksCard: "Grazie",
    receivedBody:
      "Abbiamo ricevuto il Suo messaggio. Il nostro ufficio prenotazioni Le risponderà entro 24 ore.",
    selectionLabel: "La Sua selezione",
    selectionTitle: "Il Suo viaggio con Hathor",
    selectionNote:
      "Inviata con il Suo messaggio. Può modificarla in qualsiasi momento in Il mio viaggio.",
    name: "Nome",
    email: "E-mail",
    phone: "Telefono",
    address: "Indirizzo",
    checkIn: "Arrivo",
    adults: "Adulti",
    children: "Bambini",
    message: "Messaggio",
    sending: "Invio in corso…",
    sendMessage: "Invia il messaggio",
    unableToSend: "Non è stato possibile inviare il messaggio.",
    serverErrors: false,
    languageNote: "Guest language: Italian",
  },
};
