"use client";

import { useState } from "react";
import type { InquiryPayload } from "@/lib/inquiry-email";

type InquiryFormProps = {
  type: InquiryPayload["type"];
  title: string;
  intro?: string;
  submitLabel?: string;
  showCharterFields?: boolean;
};

type FormState = "idle" | "submitting" | "success" | "error";

export function InquiryForm({
  type,
  title,
  intro,
  submitLabel = "Send Request",
  showCharterFields = false,
}: InquiryFormProps) {
  const [state, setState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");
    setErrorMessage("");

    const form = event.currentTarget;
    const data = new FormData(form);

    const payload: InquiryPayload = {
      type,
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? "") || undefined,
      message: String(data.get("message") ?? ""),
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
      <div className="hathor-form-card hathor-form-card--success">
        <h2 className="hathor-section-title text-2xl">Thank You</h2>
        <p className="hathor-body-text mt-4">
          Your message has been received. Our reservations team will respond
          within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form className="hathor-form-card" onSubmit={handleSubmit} noValidate>
      <h2 className="hathor-section-title text-2xl">{title}</h2>
      {intro ? <p className="hathor-body-text mt-3">{intro}</p> : null}

      <div className="mt-8 space-y-4">
        <div>
          <label className="lux-label" htmlFor={`${type}-name`}>
            Name
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
            Email
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
            Phone
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
                Address
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
                  Check In
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
                  Adults
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
                  Children
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
            Message
          </label>
          <textarea
            id={`${type}-message`}
            name="message"
            rows={5}
            className="lux-input resize-none"
            required
            minLength={10}
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
          className="public-btn-gold w-full py-3.5"
          disabled={state === "submitting"}
        >
          {state === "submitting" ? "Sending…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
