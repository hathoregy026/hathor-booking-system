"use client";

import Link from "next/link";
import { HATHOR_BOOKING_INCLUSIONS } from "@/lib/booking-room-media";
import { findCountry } from "@/lib/countries";
import { CountryPicker } from "./CountryPicker";
import { guestLabel, type CabinView } from "./allocation";
import { type GuestForm, type PaymentStage } from "./model";
import { IconBank, IconCard } from "./icons";
import { PaymentPlan } from "./PaymentPlan";

/** Step 3 — lead guest, passengers by cabin, payment preference, then send the request. */
export function DetailsPaymentScreen({
  cabins,
  schedule,
  form,
  onForm,
  names,
  onName,
  errors,
  busy,
  onBack,
  onConfirm,
}: {
  cabins: CabinView[];
  schedule: PaymentStage[];
  form: GuestForm;
  onForm: (patch: Partial<GuestForm>) => void;
  names: Record<string, string>;
  onName: (guestId: string, value: string) => void;
  errors: Record<string, string>;
  busy: boolean;
  onBack: () => void;
  onConfirm: () => void;
}) {
  const country = findCountry(form.countryCode);

  return (
    <div className="hj-details">
      <section>
        <span className="hj-step-label" id="hj-m-lead">Lead guest details</span>
        <p className="hj-step-lede">This will be the primary contact for your voyage.</p>
        <div className="hj-lead">
          <div className="hj-grid2">
            <label className={`hj-field${errors.firstName ? " hj-field--invalid" : ""}`}>
              <span>First name *</span>
              <input value={form.firstName} autoComplete="given-name" maxLength={60} placeholder="e.g. Alex" onChange={event => onForm({ firstName: event.target.value })} />
              {errors.firstName ? <p className="hj-error">{errors.firstName}</p> : null}
            </label>
            <label className={`hj-field${errors.lastName ? " hj-field--invalid" : ""}`}>
              <span>Last name *</span>
              <input value={form.lastName} autoComplete="family-name" maxLength={60} placeholder="e.g. Morgan" onChange={event => onForm({ lastName: event.target.value })} />
              {errors.lastName ? <p className="hj-error">{errors.lastName}</p> : null}
            </label>
          </div>

          <label className={`hj-field${errors.email ? " hj-field--invalid" : ""}`} style={{ marginTop: "0.7rem" }}>
            <span>Email address *</span>
            <input type="email" value={form.email} autoComplete="email" maxLength={254} placeholder="e.g. alex@example.com" onChange={event => onForm({ email: event.target.value })} />
            {errors.email ? <p className="hj-error">{errors.email}</p> : null}
          </label>

          <div className="hj-grid2" style={{ marginTop: "0.7rem" }}>
            <div className={`hj-field${errors.country ? " hj-field--invalid" : ""}`}>
              <span id="hj-country-label">Country *</span>
              <CountryPicker
                value={form.countryCode}
                labelledBy="hj-country-label"
                invalid={Boolean(errors.country)}
                onChange={chosen => onForm({ countryCode: chosen?.code ?? "", country: chosen?.name ?? "" })}
              />
              {errors.country ? <p className="hj-error">{errors.country}</p> : null}
            </div>
            <label className={`hj-field${errors.phone ? " hj-field--invalid" : ""}`}>
              <span>Phone *</span>
              <span className="hj-phone">
                <span className="hj-phone__code" aria-label={country ? `Country code for ${country.name}` : "Choose your country for its code"}>
                  {country ? `+${country.dial}` : "+"}
                </span>
                <input
                  type="tel"
                  inputMode="tel"
                  value={form.phone}
                  autoComplete="tel-national"
                  placeholder={country ? "Phone number" : "Choose your country first"}
                  onChange={event => onForm({ phone: event.target.value })}
                />
              </span>
              {errors.phone ? <p className="hj-error">{errors.phone}</p> : null}
            </label>
          </div>
        </div>

        <span className="hj-step-label" id="hj-m-passengers">Passenger names (as per passports)</span>
        <p className="hj-step-lede">Include every guest as they appear on their passport, cabin by cabin.</p>
        {errors.names ? <p className="hj-error" style={{ marginBottom: "0.5rem" }}>{errors.names}</p> : null}
        <div className="hj-names">
          {cabins.map(cabin => (
            <div className="hj-cabinguests" key={cabin.id}>
              <p className="hj-cabinguests__title">{cabin.label}</p>
              <div className="hj-grid2">
                {cabin.guests.map(guest => (
                  <label className={`hj-field${errors.names && !(names[guest.id] ?? "").trim() ? " hj-field--invalid" : ""}`} key={guest.id}>
                    <span>{guestLabel(guest)} full name *</span>
                    <input value={names[guest.id] ?? ""} maxLength={120} autoComplete="off" onChange={event => onName(guest.id, event.target.value)} />
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="hj-extras">
          <label className="hj-field" style={{ marginTop: "1rem" }}>
            <span>Special requests (optional)</span>
            <textarea
              value={form.requests}
              maxLength={600}
              placeholder="Celebrations, connecting cabins, or anything we should know."
              onChange={event => onForm({ requests: event.target.value })}
            />
          </label>
        </div>
      </section>

      <section className="hj-pay" id="hj-m-payment">
        <p className="hj-pay__title">Payment preference</p>
        <p className="hj-pay__lede">Choose how you would prefer to pay. Invoice and payment instructions will follow from Hathor Reservations. No card details are collected on this website.</p>

        <div style={{ display: "grid", gap: "0.55rem" }}>
          <label className={`hj-choice${form.paymentMethod === "VISA" ? " hj-choice--on" : ""}`}>
            <input
              type="radio"
              name="hj-payment-method"
              checked={form.paymentMethod === "VISA"}
              onChange={() => onForm({ paymentMethod: "VISA" })}
            />
            <span>
              <strong><IconCard /> Visa / card payment</strong>
              <span>Preferred method only. Hathor sends the invoice later — no card number is stored here.</span>
            </span>
          </label>
          <label className={`hj-choice${form.paymentMethod === "BANK_TRANSFER" ? " hj-choice--on" : ""}`}>
            <input
              type="radio"
              name="hj-payment-method"
              checked={form.paymentMethod === "BANK_TRANSFER"}
              onChange={() => onForm({ paymentMethod: "BANK_TRANSFER" })}
            />
            <span>
              <strong><IconBank /> Bank transfer</strong>
              <span>Pay via international bank transfer using the instructions on your invoice.</span>
            </span>
          </label>
        </div>

        <div className="hj-pay__pair">
          <div className="hj-pay__col">
            <p className="hj-pay__title" style={{ marginTop: "1.3rem" }}>Payment schedule</p>
            <PaymentPlan stages={schedule} />
            <p className="hj-ledger__note">
              After sending your reservation request, Hathor Reservations will review the details and send the invoice with payment instructions.
              Your cabins are reserved for you the moment you send this request.
            </p>
          </div>

          <div className="hj-pay__col">
            <span className="hj-step-label">Included in your voyage</span>
            <ul className="hj-inclusions">
              {HATHOR_BOOKING_INCLUSIONS.map(item => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </div>

        <span className="hj-step-label">Terms</span>
        <label className={`hj-terms${errors.terms ? " hj-field--invalid" : ""}`}>
          <input type="checkbox" checked={form.termsAccepted} onChange={event => onForm({ termsAccepted: event.target.checked })} />
          <span>
            I have read the <Link href="/terms-and-conditions" target="_blank">booking and cancellation terms</Link> and understand
            this sends a booking request, not a confirmed reservation.
          </span>
        </label>
        {errors.terms ? <p className="hj-error">{errors.terms}</p> : null}

        <label className="hj-terms" style={{ marginTop: "0.55rem" }}>
          <input type="checkbox" checked={form.marketingOptIn} onChange={event => onForm({ marketingOptIn: event.target.checked })} />
          <span>Keep me informed about Hathor voyages and offers. (optional)</span>
        </label>
      </section>

      <div className="hj-actions" style={{ gridColumn: "1 / -1" }}>
        <button type="button" className="hj-btn hj-btn--ghost" onClick={onBack}>← Back to guests &amp; suites</button>
        <button type="button" className="hj-btn" disabled={busy} onClick={onConfirm}>
          {busy ? "Sending your request…" : "Confirm request"} <span aria-hidden>→</span>
        </button>
      </div>
      <p className="hj-note" style={{ gridColumn: "1 / -1" }}>No payment is collected at this step.</p>
    </div>
  );
}
