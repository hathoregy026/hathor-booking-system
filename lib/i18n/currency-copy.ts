/**
 * Words around the display-currency selector and converted prices. English is
 * the live copy, word for word; Italian follows the site's style (short
 * imperative on buttons, "Lei" in sentences).
 */
import type { Currency } from "@/lib/currency";
import type { PublicLocale } from "@/lib/i18n/locale";

export type CurrencyCopy = {
  trigger: (currency: Currency) => string;
  eyebrow: string;
  menuLabel: string;
  names: Record<Currency, string>;
  loading: string;
  unavailable: (preferred: Currency | null) => string;
  retry: string;
  estimates: string;
  dailyRates: string;
  /** A rate's date, which arrives as YYYY-MM-DD. */
  rateDate: (iso: string) => string;
  /** Under a converted total: the amount actually booked and invoiced, in USD. */
  settlement: (currency: Currency, usdTotal: string | null) => string;
};

export const CURRENCY_COPY: Record<PublicLocale, CurrencyCopy> = {
  en: {
    trigger: (currency) => `Currency: ${currency}. Choose currency`,
    eyebrow: "Your preferred currency",
    menuLabel: "Choose display currency",
    names: { EUR: "Euro", USD: "US dollar", GBP: "British pound", EGP: "Egyptian pound", RUB: "Russian ruble" },
    loading: "Loading exchange rates…",
    unavailable: (preferred) => `Rates are unavailable. Showing USD${preferred ? ` until ${preferred} is available` : ""}.`,
    retry: "Try again",
    estimates: "Converted prices are estimates. Bookings and invoices are in USD.",
    dailyRates: "Daily rates",
    rateDate: (iso) => iso,
    settlement: (currency, usdTotal) =>
      `${currency} amounts are estimates. ${usdTotal === null ? "Bookings and invoices are in USD." : `Booking and invoice total: ${usdTotal}.`}`,
  },
  it: {
    trigger: (currency) => `Valuta: ${currency}. Scegli la valuta`,
    eyebrow: "La Sua valuta preferita",
    menuLabel: "Scegli la valuta dei prezzi",
    names: { EUR: "Euro", USD: "Dollaro statunitense", GBP: "Sterlina britannica", EGP: "Lira egiziana", RUB: "Rublo russo" },
    loading: "Caricamento dei tassi di cambio…",
    unavailable: (preferred) => `I tassi non sono disponibili. I prezzi sono in USD${preferred ? ` finché ${preferred} non sarà disponibile` : ""}.`,
    retry: "Riprova",
    estimates: "I prezzi convertiti sono indicativi. Prenotazioni e fatture sono in USD.",
    dailyRates: "Tassi giornalieri",
    rateDate: (iso) => iso.split("-").reverse().join("/"),
    settlement: (currency, usdTotal) =>
      `Gli importi in ${currency} sono indicativi. ${usdTotal === null ? "Prenotazioni e fatture sono in USD." : `Totale di prenotazione e fattura: ${usdTotal}.`}`,
  },
  de: {
    trigger: (currency) => `Währung: ${currency}. Währung wählen`,
    eyebrow: "Ihre bevorzugte Währung",
    menuLabel: "Anzeigewährung wählen",
    names: { EUR: "Euro", USD: "US-Dollar", GBP: "Britisches Pfund", EGP: "Ägyptisches Pfund", RUB: "Russischer Rubel" },
    loading: "Wechselkurse werden geladen…",
    unavailable: (preferred) => `Die Kurse sind nicht verfügbar. Preise werden in USD angezeigt${preferred ? `, bis ${preferred} verfügbar ist` : ""}.`,
    retry: "Erneut versuchen",
    estimates: "Umgerechnete Preise sind Richtwerte. Buchungen und Rechnungen lauten auf USD.",
    dailyRates: "Tageskurse",
    rateDate: (iso) => iso.split("-").reverse().join("."),
    settlement: (currency, usdTotal) =>
      `Beträge in ${currency} sind Richtwerte. ${usdTotal === null ? "Buchungen und Rechnungen lauten auf USD." : `Gesamtbetrag von Buchung und Rechnung: ${usdTotal}.`}`,
  },
};
