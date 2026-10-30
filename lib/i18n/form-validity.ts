import type { FormEvent } from "react";
import type { PublicLocale, TranslatedLocale } from "@/lib/i18n/locale";

type Field = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

function isField(target: EventTarget): target is Field {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  );
}

type ValidityWords = {
  missing: string;
  email: string;
  tooShort: (length: number) => string;
  other: string;
};

const VALIDITY_WORDS: Record<TranslatedLocale, ValidityWords> = {
  it: {
    missing: "Compili questo campo.",
    email: "Inserisca un indirizzo email valido.",
    tooShort: (length) => `Inserisca almeno ${length} caratteri.`,
    other: "Controlli il valore inserito.",
  },
  de: {
    missing: "Bitte füllen Sie dieses Feld aus.",
    email: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
    tooShort: (length) => `Bitte geben Sie mindestens ${length} Zeichen ein.`,
    other: "Bitte prüfen Sie Ihre Eingabe.",
  },
};

/** The browser's own message for a field, in the page's language. */
function validityMessage(field: Field, words: ValidityWords): string {
  const { validity } = field;
  if (validity.valueMissing) return words.missing;
  if (validity.typeMismatch && field.type === "email") return words.email;
  if (validity.tooShort && "minLength" in field) return words.tooShort(field.minLength);
  return words.other;
}

/**
 * Native form validation speaks the browser's language, so a translated page in
 * an English browser showed "Please fill in this field." Spread on a <form>:
 * on translated pages the same checks run, with that language's messages;
 * English forms are left exactly as they were.
 */
export function formValidityIn(locale: PublicLocale) {
  if (locale === "en") return {};
  const words = VALIDITY_WORDS[locale];
  return {
    onInvalidCapture(event: FormEvent<HTMLFormElement>) {
      if (!isField(event.target)) return;
      event.target.setCustomValidity("");
      event.target.setCustomValidity(validityMessage(event.target, words));
    },
    onInputCapture(event: FormEvent<HTMLFormElement>) {
      if (isField(event.target)) event.target.setCustomValidity("");
    },
  };
}
