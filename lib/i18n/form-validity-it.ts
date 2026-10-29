import type { FormEvent } from "react";
import type { PublicLocale } from "@/lib/i18n/locale";

type Field = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

function isField(target: EventTarget): target is Field {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  );
}

/** The browser's own message for a field, in Italian. */
function italianMessage(field: Field): string {
  const { validity } = field;
  if (validity.valueMissing) return "Compili questo campo.";
  if (validity.typeMismatch && field.type === "email") {
    return "Inserisca un indirizzo email valido.";
  }
  if (validity.tooShort && "minLength" in field) {
    return `Inserisca almeno ${field.minLength} caratteri.`;
  }
  return "Controlli il valore inserito.";
}

/**
 * Native form validation speaks the browser's language, so an Italian page in
 * an English browser showed "Please fill in this field." Spread on a <form>:
 * on Italian pages the same checks run, with Italian messages; English forms
 * are left exactly as they were.
 */
export function formValidityIn(locale: PublicLocale) {
  if (locale !== "it") return {};
  return {
    onInvalidCapture(event: FormEvent<HTMLFormElement>) {
      if (!isField(event.target)) return;
      event.target.setCustomValidity("");
      event.target.setCustomValidity(italianMessage(event.target));
    },
    onInputCapture(event: FormEvent<HTMLFormElement>) {
      if (isField(event.target)) event.target.setCustomValidity("");
    },
  };
}
