"use client";

import { useId, useRef, useState } from "react";
import type { InquiryPayload } from "@/lib/inquiry-email";
import { PUBLIC_CONTACT } from "@/lib/public-contact";

type FormState = "idle" | "submitting" | "success" | "error";

type CharterRequestFormProps = {
  preferredRoute: string;
  routes: readonly string[];
  onPreferredRouteChange: (route: string) => void;
};

export function CharterRequestForm({
  preferredRoute,
  routes,
  onPreferredRouteChange,
}: CharterRequestFormProps) {
  const formId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, setState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");
    setErrorMessage("");
    setFieldErrors({});

    const form = event.currentTarget;
    const data = new FormData(form);

    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const address = String(data.get("address") ?? "").trim();
    const checkIn = String(data.get("checkIn") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    const adultsRaw = String(data.get("adults") ?? "");
    const childrenRaw = String(data.get("children") ?? "");
    const route = String(data.get("preferredRoute") ?? preferredRoute).trim();

    const nextErrors: Record<string, string> = {};
    if (name.length < 2) nextErrors.name = "Please enter your name.";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "Please enter a valid email.";
    }
    if (message.length < 10) {
      nextErrors.message = "Please share a little more about your voyage.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setState("error");
      setErrorMessage("Please check the highlighted fields.");
      const order = ["name", "email", "message"] as const;
      const firstKey = order.find((key) => nextErrors[key]) ?? Object.keys(nextErrors)[0];
      const el = form.querySelector<HTMLElement>(`[name="${firstKey}"]`);
      el?.focus();
      el?.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }

    const payload: InquiryPayload = {
      type: "charter",
      name,
      email,
      phone: phone || undefined,
      message,
      address: address || undefined,
      checkIn: checkIn || undefined,
      adults: adultsRaw === "" ? undefined : Number(adultsRaw) || undefined,
      children:
        childrenRaw === "" ? undefined : Number(childrenRaw) || undefined,
      ...(route ? { preferredRoute: route } : {}),
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
        throw new Error(result?.error ?? "Unable to send message");
      }

      setState("success");
      form.reset();
    } catch (error) {
      setState("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to send message",
      );
    }
  }

  if (state === "success") {
    return (
      <section
        id="charter-request"
        className="ch-request"
        aria-labelledby="charter-request-heading"
      >
        <div className="lux-ed-shell">
          <div className="ch-form__success" role="status" aria-live="polite">
            <p className="lux-ed-label lux-ed-label--gold">Request Received</p>
            <h2 id="charter-request-heading" className="lux-ed-title">
              Thank you.
            </h2>
            <p className="lux-ed-copy">
              Your private voyage inquiry has been received. Our charter team
              will prepare a tailored response.
            </p>
          </div>
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
      <div className="lux-ed-shell">
        <div className="lux-ed-grid ch-request__grid">
          <div className="ch-request__intro" data-charter-reveal="">
            <p className="lux-ed-label">Private Concierge Desk</p>
            <h2 id="charter-request-heading" className="lux-ed-title">
              Your voyage begins
              <br />
              with a conversation.
            </h2>
            <p className="lux-ed-copy">
              Tell us about your party, preferred dates and the experience you
              have in mind. Our charter team will prepare a personalized
              proposal.
            </p>
            <p className="ch-request__route-note">
              Preferred route · <strong>{preferredRoute}</strong>
            </p>
            <div className="ch-request__concierge">
              <p className="ch-request__concierge-title">
                Private Charter Concierge
              </p>
              <p className="ch-intro__micro">
                A tailored response will be prepared for your request.
              </p>
              <p className="ch-intro__micro">
                <a href={`mailto:${PUBLIC_CONTACT.email}`}>
                  {PUBLIC_CONTACT.email}
                </a>
              </p>
            </div>
          </div>

          <form
            ref={formRef}
            className="ch-form"
            onSubmit={handleSubmit}
            noValidate
            data-charter-reveal=""
          >
            <div className="ch-form__row">
              <div className="ch-form__field">
                <label className="ch-form__label" htmlFor={`${formId}-name`}>
                  Name
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
                  aria-describedby={
                    fieldErrors.name ? `${formId}-name-error` : undefined
                  }
                />
                {fieldErrors.name ? (
                  <p id={`${formId}-name-error`} className="ch-form__error">
                    {fieldErrors.name}
                  </p>
                ) : null}
              </div>

              <div className="ch-form__field">
                <label className="ch-form__label" htmlFor={`${formId}-email`}>
                  Email
                </label>
                <input
                  id={`${formId}-email`}
                  name="email"
                  type="email"
                  inputMode="email"
                  className="ch-form__input"
                  required
                  maxLength={254}
                  autoComplete="email"
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={
                    fieldErrors.email ? `${formId}-email-error` : undefined
                  }
                />
                {fieldErrors.email ? (
                  <p id={`${formId}-email-error`} className="ch-form__error">
                    {fieldErrors.email}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="ch-form__row">
              <div className="ch-form__field">
                <label className="ch-form__label" htmlFor={`${formId}-phone`}>
                  Phone
                </label>
                <input
                  id={`${formId}-phone`}
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  className="ch-form__input"
                  maxLength={30}
                  autoComplete="tel"
                />
              </div>

              <div className="ch-form__field">
                <label
                  className="ch-form__label"
                  htmlFor={`${formId}-address`}
                >
                  Address
                </label>
                <input
                  id={`${formId}-address`}
                  name="address"
                  type="text"
                  className="ch-form__input"
                  maxLength={300}
                  autoComplete="street-address"
                />
              </div>
            </div>

            <div className="ch-form__row">
              <div className="ch-form__field">
                <label
                  className="ch-form__label"
                  htmlFor={`${formId}-checkIn`}
                >
                  Check In
                </label>
                <input
                  id={`${formId}-checkIn`}
                  name="checkIn"
                  type="date"
                  className="ch-form__input"
                />
              </div>

              <div className="ch-form__field">
                <label
                  className="ch-form__label"
                  htmlFor={`${formId}-route`}
                >
                  Preferred Route
                </label>
                <select
                  id={`${formId}-route`}
                  name="preferredRoute"
                  className="ch-form__select"
                  value={preferredRoute}
                  onChange={(event) => onPreferredRouteChange(event.target.value)}
                >
                  {routes.map((route) => (
                    <option key={route} value={route}>
                      {route}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="ch-form__row">
              <div className="ch-form__field">
                <label
                  className="ch-form__label"
                  htmlFor={`${formId}-adults`}
                >
                  Adults
                </label>
                <input
                  id={`${formId}-adults`}
                  name="adults"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={50}
                  defaultValue={2}
                  className="ch-form__input"
                />
              </div>

              <div className="ch-form__field">
                <label
                  className="ch-form__label"
                  htmlFor={`${formId}-children`}
                >
                  Children
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
                />
              </div>
            </div>

            <div className="ch-form__field ch-form__field--full">
              <label
                className="ch-form__label"
                htmlFor={`${formId}-message`}
              >
                Message
              </label>
              <textarea
                id={`${formId}-message`}
                name="message"
                rows={5}
                className="ch-form__textarea"
                required
                minLength={10}
                maxLength={4000}
                aria-invalid={Boolean(fieldErrors.message)}
                aria-describedby={
                  fieldErrors.message ? `${formId}-message-error` : undefined
                }
              />
              {fieldErrors.message ? (
                <p
                  id={`${formId}-message-error`}
                  className="ch-form__error"
                >
                  {fieldErrors.message}
                </p>
              ) : null}
            </div>

            <p
              className={
                state === "error"
                  ? "ch-form__status ch-form__status--error"
                  : "ch-form__status"
              }
              role="status"
              aria-live="polite"
            >
              {state === "error" ? errorMessage : ""}
            </p>

            <button
              type="submit"
              className="lux-ed-btn lux-ed-btn--ink ch-form__submit"
              disabled={state === "submitting"}
              aria-busy={state === "submitting"}
            >
              {state === "submitting" ? "Sending…" : "Send Private Request"}
              {state !== "submitting" ? (
                <span className="lux-ed-btn__arrow" aria-hidden="true">
                  →
                </span>
              ) : null}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
