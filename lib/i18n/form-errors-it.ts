import type { PublicLocale } from "@/lib/i18n/locale";

/**
 * /api/contact and the security check (lib/turnstile.ts, lib/public-api-security.ts)
 * answer in English. The server stays as it is: an Italian page translates the
 * refusals it knows, and anything else becomes the form's own failure sentence,
 * so English never reaches the guest even if a server message is reworded.
 */
const SERVER_ERRORS_IT: Readonly<Record<string, string>> = {
  "Please check your form and try again.": "Controlli i dati inseriti e riprovi.",
  "Too many messages. Please wait and try again.":
    "Troppi invii in poco tempo. Attenda qualche minuto e riprovi.",
  "Unable to send your message. Please try again later.":
    "Al momento non è stato possibile completare l’invio. Riprovi più tardi.",
  "Request body is too large": "Il testo inserito è troppo lungo. Lo accorci e riprovi.",
  "Security verification is unavailable. Please contact our reservations team directly.":
    "La verifica di sicurezza non è disponibile. Contatti direttamente il nostro ufficio prenotazioni.",
  "Please complete the security check and try again.":
    "Completi la verifica di sicurezza e riprovi.",
  "The security check is temporarily unavailable. Please try again.":
    "La verifica di sicurezza è momentaneamente non disponibile. Riprovi tra poco.",
  "The security check expired or could not be verified. Please try again.":
    "La verifica di sicurezza è scaduta o non è andata a buon fine. Riprovi.",
};

/** fetch itself failed: the guest's connection, not a refusal. */
const NETWORK_ERROR_IT =
  "Non è stato possibile raggiungere il nostro sistema. Controlli la connessione e riprovi.";

/** The sentence for a failed send. `error` carries the server's text, or is fetch's own TypeError. */
export function sendFailureIn(locale: PublicLocale, error: unknown, fallback: string): string {
  if (locale !== "it") return error instanceof Error ? error.message : fallback;
  if (error instanceof TypeError) return NETWORK_ERROR_IT;
  return (error instanceof Error && SERVER_ERRORS_IT[error.message]) || fallback;
}
