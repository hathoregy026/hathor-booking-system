"use client";

import { useEffect, useId, useRef, useState } from "react";
import { trackGaEvent } from "@/lib/ga-browser";
import type { InquiryPayload } from "@/lib/inquiry-email";
import { CHARTER_PRIVATE } from "@/lib/charter-private-content";
import { PUBLIC_CONTACT } from "@/lib/public-contact";
import { usePublicLocale } from "@/hooks/usePublicLocale";
import { CHARTER_COPY } from "@/lib/i18n/charter-copy";

type FormState = "idle" | "submitting" | "success" | "error";
type TripType = (typeof CHARTER_PRIVATE.inquiry.tripTypes)[number];

type CharterRequestFormProps = {
  preferredRoute: string;
  routes: readonly string[];
  onPreferredRouteChange: (route: string) => void;
  compact?: boolean;
  /** Bring a field or the thank-you into view. The charter story passes its own mapping: inside the sideways track a plain scrollIntoView would move the page, not the story. */
  onReveal?: (element: HTMLElement) => void;
};

const revealByDefault = (element: HTMLElement) => element.scrollIntoView({ block: "center", behavior: "smooth" });

/* The same rules /api/contact applies, so a guest sees which field to fix instead of a generic refusal. */
const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M}\p{N} .,'’\-]{1,119}$/u;
const PHONE_PATTERN = /^[0-9+() .\-]*$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FIELD_ORDER = ["name", "email", "phone", "checkIn", "adults", "children", "message"] as const;

/** A route like "Luxor ↔ Aswan ↔ Luxor" also answers departure, destination and trip type. */
function routeDetails(route: string): { departure: string; destination: string; tripType: TripType } {
  const stops = route.split(/\s*↔\s*/).map(stop => stop.trim()).filter(Boolean);
  const first = stops[0] ?? "";
  const last = stops[stops.length - 1] ?? "";
  const roundTrip = stops.length > 2 && first === last;
  return {
    departure: first,
    destination: roundTrip ? stops[1] ?? "" : last,
    tripType: roundTrip ? "Round-Trip" : stops.length > 2 ? "Multi-Stop" : "One-Way",
  };
}

const todayIso = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
};

export function CharterRequestForm({
  preferredRoute,
  routes,
  onPreferredRouteChange,
  compact = false,
  onReveal = revealByDefault,
}: CharterRequestFormProps) {
  const copy = CHARTER_COPY[usePublicLocale()];
  const t = copy.form;
  const formId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const [state, setState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  /* A send that failed (not a field to fix): offer the reservations desk directly. */
  const [fallbackHref, setFallbackHref] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [sentTo, setSentTo] = useState("");
  /* Whether the guest's own confirmation actually left (the team's copy always has, on success). */
  const [receiptSent, setReceiptSent] = useState(true);
  const [minDate] = useState(todayIso);

  /* Route-derived fields follow the chosen route and stay editable until it changes again. */
  const tripFor = (chosen: string) => {
    const details = routeDetails(chosen);
    return { ...details, departure: copy.place(details.departure), destination: copy.place(details.destination) };
  };
  const [route, setRoute] = useState(preferredRoute);
  const [trip, setTrip] = useState(() => tripFor(preferredRoute));
  if (preferredRoute !== route) {
    setRoute(preferredRoute);
    setTrip(tripFor(preferredRoute));
  }

  useEffect(() => {
    if (state !== "success" || !successRef.current) return;
    successRef.current.focus({ preventScroll: true });
    onReveal(successRef.current);
  }, [state, onReveal]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");
    setErrorMessage("");
    setFallbackHref(null);
    setFieldErrors({});

    const form = event.currentTarget;
    const data = new FormData(form);
    const text = (key: string) => String(data.get(key) ?? "").trim();

    const name = text("name");
    const email = text("email");
    const phone = text("phone");
    const checkIn = text("checkIn");
    const preferredTime = text("preferredTime");
    const tripType = text("tripType");
    const departure = text("departure");
    const destination = text("destination");
    const adultsRaw = text("adults");
    const childrenRaw = text("children");
    const special = text("specialRequirements");
    const notes = text("message");
    const chosenRoute = text("preferredRoute") || preferredRoute;
    const adults = adultsRaw === "" ? NaN : Number(adultsRaw);
    const children = childrenRaw === "" ? 0 : Number(childrenRaw);

    const nextErrors: Record<string, string> = {};
    if (name.length < 2) nextErrors.name = t.errors.name;
    else if (!NAME_PATTERN.test(name)) nextErrors.name = t.errors.nameChars;
    if (!email || !EMAIL_PATTERN.test(email)) nextErrors.email = t.errors.email;
    if (phone && !PHONE_PATTERN.test(phone)) nextErrors.phone = t.errors.phone;
    if (checkIn && checkIn < minDate) nextErrors.checkIn = t.errors.date;
    if (!Number.isInteger(adults) || adults < 1 || adults > 50) nextErrors.adults = t.errors.adults;
    if (!Number.isInteger(children) || children < 0 || children > 50) nextErrors.children = t.errors.children;

    const composedMessage = [
      notes || "Private charter inquiry.",
      "",
      tripType ? `Trip type: ${tripType}` : "",
      departure ? `Departure: ${departure}` : "",
      destination ? `Destination: ${destination}` : "",
      preferredTime ? `Preferred time: ${preferredTime}` : "",
      special ? `Special requirements: ${special}` : "",
      t.languageNote ?? "",
    ]
      .filter(Boolean)
      .join("\n");

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setState("error");
      setErrorMessage(t.errors.check);
      const firstKey = FIELD_ORDER.find(key => nextErrors[key]) ?? Object.keys(nextErrors)[0];
      const el = form.querySelector<HTMLElement>(`[name="${firstKey}"]`);
      if (el) {
        el.focus({ preventScroll: true });
        onReveal(el);
      }
      return;
    }

    const payload: InquiryPayload = {
      type: "charter",
      name,
      email,
      phone: phone || undefined,
      message: composedMessage,
      checkIn: checkIn || undefined,
      adults,
      children,
      website: text("website"),
      ...(chosenRoute ? { preferredRoute: chosenRoute } : {}),
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = (await response.json().catch(() => null)) as {
        error?: string;
        receiptSent?: boolean;
      } | null;
      if (!response.ok) {
        throw new Error((t.serverErrors ? result?.error : undefined) ?? t.errors.send);
      }

      setSentTo(email);
      setReceiptSent(result?.receiptSent !== false);
      setState("success");
      trackGaEvent("generate_lead", { lead_type: "charter" });
      form.reset();
    } catch (error) {
      setState("error");
      setErrorMessage(error instanceof Error && t.serverErrors ? error.message : t.errors.send);
      /* The request must never be lost: the same details, ready to send from the guest's own mail. */
      const subject = `Private charter request — ${name}`;
      const details = [
        `Name: ${name}`,
        `Email: ${email}`,
        phone ? `Phone: ${phone}` : "",
        chosenRoute ? `Preferred route: ${chosenRoute}` : "",
        checkIn ? `Preferred start date: ${checkIn}` : "",
        `Adults: ${adults}`,
        `Children: ${children}`,
      ].filter(Boolean).join("\n");
      const body = `${details}\n\n${composedMessage}`;
      setFallbackHref(`mailto:${PUBLIC_CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    }
  }

  if (state === "success") {
    return (
      <section
        id="charter-request"
        className="ch-request"
        aria-labelledby="charter-request-heading"
      >
        <div className="ch-form__success" role="status" aria-live="polite">
          <h2 id="charter-request-heading" className="chr-display" ref={successRef} tabIndex={-1}>
            {t.success.title}
          </h2>
          <p>{t.success.body}</p>
          {sentTo && receiptSent ? (
            <p className="ch-form__note">
              {t.success.receipt.before} <strong>{sentTo}</strong>
              {t.success.receipt.after}{" "}
              <a href={`mailto:${PUBLIC_CONTACT.email}`}>{PUBLIC_CONTACT.email}</a>.
            </p>
          ) : null}
          {sentTo && !receiptSent ? (
            <p className="ch-form__note">
              {t.success.noReceipt.before}{" "}
              <strong>{sentTo}</strong>
              {t.success.noReceipt.after}{" "}
              <a href={`mailto:${PUBLIC_CONTACT.email}`}>{PUBLIC_CONTACT.email}</a>{" "}
              {t.success.noReceipt.end}
            </p>
          ) : null}
          <button
            type="button"
            className="ch-form__again"
            onClick={() => {
              setState("idle");
              setSentTo("");
              setReceiptSent(true);
            }}
          >
            {t.success.again}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      id="charter-request"
      className="ch-request"
      aria-labelledby="charter-request-heading"
    >
      {!compact ? (
        <div className="ch-request__intro">
          <p className="chr-eyebrow">{t.eyebrow}</p>
          <h2 id="charter-request-heading" className="chr-display">
            {t.title}
          </h2>
          <p>{t.lead}</p>
          <p className="ch-request__route">{copy.preferred(copy.place(preferredRoute))}</p>
          <p className="ch-request__email">
            <a href={`mailto:${PUBLIC_CONTACT.email}`}>{PUBLIC_CONTACT.email}</a>
          </p>
        </div>
      ) : (
        <h2 id="charter-request-heading" className="lx-sr">
          {t.title}
        </h2>
      )}

      <form
        ref={formRef}
        className="ch-form"
        onSubmit={handleSubmit}
        noValidate
      >
        {/* Spam trap, as on the contact form: people never see or fill it. */}
        <div hidden aria-hidden="true" style={{ display: "none" }}>
          <label htmlFor={`${formId}-website`}>Website</label>
          <input id={`${formId}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <div className="ch-form__row">
          <div className="ch-form__field">
            <label className="ch-form__label" htmlFor={`${formId}-name`}>
              {t.name}
            </label>
            <input
              id={`${formId}-name`}
              name="name"
              type="text"
              className="ch-form__input"
              required
              minLength={2}
              maxLength={120}
              autoComplete="name"
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={fieldErrors.name ? `${formId}-name-error` : undefined}
            />
            {fieldErrors.name ? (
              <p className="ch-form__error" id={`${formId}-name-error`}>{fieldErrors.name}</p>
            ) : null}
          </div>
          <div className="ch-form__field">
            <label className="ch-form__label" htmlFor={`${formId}-email`}>
              {t.email}
            </label>
            <input
              id={`${formId}-email`}
              name="email"
              type="email"
              className="ch-form__input"
              required
              maxLength={254}
              autoComplete="email"
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? `${formId}-email-error` : undefined}
            />
            {fieldErrors.email ? (
              <p className="ch-form__error" id={`${formId}-email-error`}>{fieldErrors.email}</p>
            ) : null}
          </div>
        </div>

        <div className="ch-form__row">
          <div className="ch-form__field">
            <label className="ch-form__label" htmlFor={`${formId}-phone`}>
              {t.phone}
            </label>
            <input
              id={`${formId}-phone`}
              name="phone"
              type="tel"
              className="ch-form__input"
              maxLength={30}
              autoComplete="tel"
              aria-invalid={Boolean(fieldErrors.phone)}
              aria-describedby={fieldErrors.phone ? `${formId}-phone-error` : undefined}
            />
            {fieldErrors.phone ? (
              <p className="ch-form__error" id={`${formId}-phone-error`}>{fieldErrors.phone}</p>
            ) : null}
          </div>
          <div className="ch-form__field">
            <label className="ch-form__label" htmlFor={`${formId}-tripType`}>
              {t.tripType}
            </label>
            <select
              id={`${formId}-tripType`}
              name="tripType"
              className="ch-form__input"
              value={trip.tripType}
              onChange={event => setTrip(current => ({ ...current, tripType: event.target.value as TripType }))}
            >
              {CHARTER_PRIVATE.inquiry.tripTypes.map((type) => (
                <option key={type} value={type}>
                  {t.tripTypes[type]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="ch-form__row">
          <div className="ch-form__field">
            <label className="ch-form__label" htmlFor={`${formId}-departure`}>
              {t.departure}
            </label>
            <input
              id={`${formId}-departure`}
              name="departure"
              type="text"
              className="ch-form__input"
              placeholder={t.departurePlaceholder}
              maxLength={80}
              value={trip.departure}
              onChange={event => setTrip(current => ({ ...current, departure: event.target.value }))}
            />
          </div>
          <div className="ch-form__field">
            <label className="ch-form__label" htmlFor={`${formId}-destination`}>
              {t.destination}
            </label>
            <input
              id={`${formId}-destination`}
              name="destination"
              type="text"
              className="ch-form__input"
              placeholder={t.destinationPlaceholder}
              maxLength={80}
              value={trip.destination}
              onChange={event => setTrip(current => ({ ...current, destination: event.target.value }))}
            />
          </div>
        </div>

        <div className="ch-form__row">
          <div className="ch-form__field">
            <label className="ch-form__label" htmlFor={`${formId}-checkIn`}>
              {t.startDate}
            </label>
            <input
              id={`${formId}-checkIn`}
              name="checkIn"
              type="date"
              min={minDate}
              /* "Today" is the guest's own date; the server may render a different one around midnight. */
              suppressHydrationWarning
              className="ch-form__input"
              aria-invalid={Boolean(fieldErrors.checkIn)}
              aria-describedby={fieldErrors.checkIn ? `${formId}-checkIn-error` : undefined}
            />
            {fieldErrors.checkIn ? (
              <p className="ch-form__error" id={`${formId}-checkIn-error`}>{fieldErrors.checkIn}</p>
            ) : null}
          </div>
          <div className="ch-form__field">
            <label className="ch-form__label" htmlFor={`${formId}-time`}>
              {t.time}
            </label>
            <input
              id={`${formId}-time`}
              name="preferredTime"
              type="time"
              className="ch-form__input"
            />
          </div>
        </div>

        <div className="ch-form__row">
          <div className="ch-form__field">
            <label className="ch-form__label" htmlFor={`${formId}-route`}>
              {t.route}
            </label>
            <select
              id={`${formId}-route`}
              name="preferredRoute"
              className="ch-form__input"
              value={preferredRoute}
              onChange={(e) => onPreferredRouteChange(e.target.value)}
            >
              {routes.map((option) => (
                <option key={option} value={option}>
                  {copy.place(option)}
                </option>
              ))}
            </select>
          </div>
          <div className="ch-form__field">
            <label className="ch-form__label" htmlFor={`${formId}-adults`}>
              {t.adults}
            </label>
            <input
              id={`${formId}-adults`}
              name="adults"
              type="number"
              inputMode="numeric"
              min={1}
              max={50}
              defaultValue={2}
              className="ch-form__input"
              aria-invalid={Boolean(fieldErrors.adults)}
              aria-describedby={fieldErrors.adults ? `${formId}-adults-error` : undefined}
            />
            {fieldErrors.adults ? (
              <p className="ch-form__error" id={`${formId}-adults-error`}>{fieldErrors.adults}</p>
            ) : null}
          </div>
        </div>

        <div className="ch-form__row">
          <div className="ch-form__field">
            <label className="ch-form__label" htmlFor={`${formId}-children`}>
              {t.children}
            </label>
            <input
              id={`${formId}-children`}
              name="children"
              type="number"
              inputMode="numeric"
              min={0}
              max={50}
              defaultValue={0}
              className="ch-form__input"
              aria-invalid={Boolean(fieldErrors.children)}
              aria-describedby={fieldErrors.children ? `${formId}-children-error` : undefined}
            />
            {fieldErrors.children ? (
              <p className="ch-form__error" id={`${formId}-children-error`}>{fieldErrors.children}</p>
            ) : null}
          </div>
          <div className="ch-form__field">
            <label className="ch-form__label" htmlFor={`${formId}-special`}>
              {t.special}
            </label>
            <input
              id={`${formId}-special`}
              name="specialRequirements"
              type="text"
              className="ch-form__input"
              maxLength={300}
              placeholder={t.specialPlaceholder}
            />
          </div>
        </div>

        <div className="ch-form__field ch-form__field--full">
          <label className="ch-form__label" htmlFor={`${formId}-message`}>
            {t.message}
          </label>
          <textarea
            id={`${formId}-message`}
            name="message"
            rows={3}
            className="ch-form__input"
            maxLength={3000}
            placeholder={t.messagePlaceholder}
          />
        </div>

        <div
          className={
            state === "error" ? "ch-form__status is-error" : "ch-form__status"
          }
          role="status"
          aria-live="polite"
        >
          {state === "error" ? <p>{errorMessage}</p> : null}
          {state === "error" && fallbackHref ? (
            <p className="ch-form__fallback">
              {t.fallback.lead}{" "}
              <a href={fallbackHref}>{t.fallback.link}</a>
              {" · "}
              <a href={PUBLIC_CONTACT.whatsappUrl} target="_blank" rel="noopener noreferrer">WhatsApp</a>
              {" · "}
              <a href={`tel:${PUBLIC_CONTACT.phone}`}>{PUBLIC_CONTACT.phoneDisplay}</a>
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          className="chr-btn chr-btn--solid"
          disabled={state === "submitting"}
          aria-busy={state === "submitting"}
        >
          <span>
            {state === "submitting" ? t.sending : t.send}
          </span>
        </button>
      </form>
    </section>
  );
}
