"use client";

import { useEffect, useId, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Check } from "lucide-react";
import "./InquiryForm.css";
import { trackGaEvent } from "@/lib/ga-browser";
import type { InquiryPayload } from "@/lib/inquiry-email";
import {
  buildSelectionEnquiry,
  resolveSelectionSummary,
} from "@/lib/selection-enquiry";
import {
  useFavorites,
  useSelectionHydrated,
  useVoyageSelection,
} from "@/components/selection/SelectionProvider";
import { usePublicLocale } from "@/hooks/usePublicLocale";
import { INQUIRY_FORM_COPY } from "@/lib/i18n/contact-copy";

type InquiryFormProps = {
  type: InquiryPayload["type"];
  title: string;
  intro?: string;
  submitLabel?: string;
  showCharterFields?: boolean;
  className?: string;
  submitClassName?: string;
};

type FormState = "idle" | "submitting" | "success" | "error";

function subscribeNoop() {
  return () => {};
}

function useIsClient() {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}

export function InquiryForm({
  type,
  title,
  intro,
  submitLabel,
  showCharterFields = false,
  className,
  submitClassName = "btn btn-primary",
}: InquiryFormProps) {
  const t = INQUIRY_FORM_COPY[usePublicLocale()];
  /*
   * My Voyage carries into the enquiry automatically — the guest never re-enters
   * what they already chose. Read-only here; opening the form does not clear the
   * selection, and the contact fields stay fully editable.
   */
  const voyageSelection = useVoyageSelection();
  const favorites = useFavorites();
  const selectionHydrated = useSelectionHydrated();
  const selection = selectionHydrated
    ? buildSelectionEnquiry(voyageSelection, favorites)
    : undefined;
  /* "Reference" is an internal ids line for the reservations desk only. */
  const selectionLines = resolveSelectionSummary(selection).filter(
    (line) => line.label !== "Reference",
  );

  const [state, setState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const portalReady = useIsClient();
  const titleId = useId();

  useEffect(() => {
    if (state !== "success" || type !== "contact") return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setState("idle");
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [state, type]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");
    setErrorMessage("");

    const form = event.currentTarget;
    const data = new FormData(form);
    const typed = String(data.get("message") ?? "");
    /* On a translated page the desk learns the guest's language, when it fits. */
    const message =
      t.languageNote && typed.trim().length + t.languageNote.length + 2 <= 4000
        ? `${typed.trim()}\n\n${t.languageNote}`
        : typed;

    const payload: InquiryPayload = {
      type,
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? "") || undefined,
      message,
      website: String(data.get("website") ?? ""),
      address: showCharterFields
        ? String(data.get("address") ?? "") || undefined
        : undefined,
      checkIn: showCharterFields
        ? String(data.get("checkIn") ?? "") || undefined
        : undefined,
      adults: showCharterFields
        ? Number(data.get("adults") ?? 0) || undefined
        : undefined,
      children: showCharterFields
        ? Number(data.get("children") ?? 0) || undefined
        : undefined,
      /* Slugs and integers only — the server resolves every readable string. */
      selection,
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error((t.serverErrors ? result?.error : undefined) ?? t.unableToSend);
      }

      setState("success");
      trackGaEvent("generate_lead", { lead_type: type });
      form.reset();
    } catch (error) {
      setState("error");
      setErrorMessage(
        error instanceof Error && t.serverErrors ? error.message : t.unableToSend,
      );
    }
  }

  const contactSuccessPopup =
    type === "contact" && state === "success" && portalReady
      ? createPortal(
          <div
            className="contact-success-popup"
            role="presentation"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                setState("idle");
              }
            }}
          >
            <div
              className="contact-success-popup__panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
            >
              <button
                type="button"
                className="contact-success-popup__close"
                aria-label={t.close}
                onClick={() => setState("idle")}
              >
                ×
              </button>
              <div className="contact-success-popup__seal" aria-hidden="true">
                <Check strokeWidth={1.7} />
              </div>
              <p className="contact-success-popup__eyebrow">{t.sentEyebrow}</p>
              <h2 id={titleId} className="contact-success-popup__title">
                {t.thanks}
              </h2>
              <p className="contact-success-popup__copy">{t.sentBody}</p>
              <div className="contact-success-popup__status">
                <span aria-hidden="true" />
                <p>{t.respond}</p>
              </div>
              <button
                type="button"
                className="ce-btn contact-success-popup__again"
                onClick={() => setState("idle")}
              >
                {t.again}
              </button>
            </div>
          </div>,
          document.body,
        )
      : null;

  if (state === "success" && type !== "contact") {
    return (
      <div
        className={["hathor-form-card hathor-form-card--success", className]
          .filter(Boolean)
          .join(" ")}
      >
        <h2 className="section-title typo-page-title text-2xl">{t.thanksCard}</h2>
        <p className="section-body typo-body-text mt-4">{t.receivedBody}</p>
      </div>
    );
  }

  return (
    <>
      <form
        className={["hathor-form-card", className].filter(Boolean).join(" ")}
        onSubmit={handleSubmit}
      >
        <h2 className="section-title typo-page-title text-2xl">{title}</h2>
        {intro ? (
          <p className="section-body typo-body-text mt-3">{intro}</p>
        ) : null}

        {selectionLines.length > 0 ? (
          <section className="hathor-form-selection" aria-label={t.selectionLabel}>
            <p className="hathor-form-selection__title">{t.selectionTitle}</p>
            <dl className="hathor-form-selection__list">
              {selectionLines.map((line) => (
                <div key={`${line.label}-${line.value}`}>
                  <dt>{line.label}</dt>
                  <dd>{line.value}</dd>
                </div>
              ))}
            </dl>
            <p className="hathor-form-selection__note">{t.selectionNote}</p>
          </section>
        ) : null}

        <div className="mt-8 space-y-4">
          <div hidden aria-hidden="true" style={{ display: "none" }}>
            <label htmlFor={`${type}-website`}>Website</label>
            <input
              id={`${type}-website`}
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <div>
            <label className="lux-label" htmlFor={`${type}-name`}>
              {t.name}
            </label>
            <input
              id={`${type}-name`}
              name="name"
              type="text"
              className="lux-input"
              required
              minLength={2}
              maxLength={120}
              autoComplete="name"
            />
          </div>

          <div>
            <label className="lux-label" htmlFor={`${type}-email`}>
              {t.email}
            </label>
            <input
              id={`${type}-email`}
              name="email"
              type="email"
              className="lux-input"
              required
              maxLength={254}
              autoComplete="email"
            />
          </div>

          <div>
            <label className="lux-label" htmlFor={`${type}-phone`}>
              {t.phone}
            </label>
            <input
              id={`${type}-phone`}
              name="phone"
              type="tel"
              className="lux-input"
              maxLength={30}
              autoComplete="tel"
            />
          </div>

          {showCharterFields ? (
            <>
              <div>
                <label className="lux-label" htmlFor={`${type}-address`}>
                  {t.address}
                </label>
                <input
                  id={`${type}-address`}
                  name="address"
                  type="text"
                  className="lux-input"
                  maxLength={300}
                  autoComplete="street-address"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="lux-label" htmlFor={`${type}-checkIn`}>
                    {t.checkIn}
                  </label>
                  <input
                    id={`${type}-checkIn`}
                    name="checkIn"
                    type="date"
                    className="lux-input"
                  />
                </div>
                <div>
                  <label className="lux-label" htmlFor={`${type}-adults`}>
                    {t.adults}
                  </label>
                  <input
                    id={`${type}-adults`}
                    name="adults"
                    type="number"
                    min={0}
                    max={50}
                    defaultValue={2}
                    className="lux-input"
                  />
                </div>
                <div>
                  <label className="lux-label" htmlFor={`${type}-children`}>
                    {t.children}
                  </label>
                  <input
                    id={`${type}-children`}
                    name="children"
                    type="number"
                    min={0}
                    max={50}
                    defaultValue={0}
                    className="lux-input"
                  />
                </div>
              </div>
            </>
          ) : null}

          <div>
            <label className="lux-label" htmlFor={`${type}-message`}>
              {t.message}
            </label>
            <textarea
              id={`${type}-message`}
              name="message"
              rows={5}
              className="lux-input resize-none"
              required
              minLength={3}
              maxLength={4000}
            />
          </div>

          {state === "error" && errorMessage ? (
            <p className="text-sm text-red-700" role="alert">
              {errorMessage}
            </p>
          ) : null}

          <button
            type="submit"
            className={submitClassName}
            disabled={state === "submitting"}
          >
            {state === "submitting" ? t.sending : submitLabel ?? t.sendMessage}
          </button>
        </div>
      </form>
      {contactSuccessPopup}
    </>
  );
}
