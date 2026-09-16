"use client";

import Link from "next/link";
import { HATHOR_BOOKING_INCLUSIONS } from "@/lib/booking-room-media";
import type { PhysicalRoomType } from "@/lib/physical-inventory";
import {
  distributeParty,
  money,
  stageLabel,
  type GuestForm,
  type Hold,
  type Party,
} from "./model";
import { IconBank, IconCard } from "./icons";

/** Screen 04 — lead guest, passengers, payment preference, then send the request. */
export function DetailsPaymentScreen({
  roomType,
  party,
  hold,
  form,
  onForm,
  names,
  onNames,
  errors,
  busy,
  onBack,
  onConfirm,
}: {
  roomType: PhysicalRoomType;
  party: Party;
  hold: Hold;
  form: GuestForm;
  onForm: (patch: Partial<GuestForm>) => void;
  names: string[];
  onNames: (index: number, value: string) => void;
  errors: Record<string, string>;
  busy: boolean;
  onBack: () => void;
  onConfirm: () => void;
}) {
  const cabins = distributeParty(party);
  let cursor = 0;

  return (
    <div className="hj-details">
      <section>
        <span className="hj-step-label">Lead guest details</span>
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
          <label className={`hj-field${errors.phone ? " hj-field--invalid" : ""}`}>
            <span>Phone *</span>
            <input type="tel" inputMode="tel" value={form.phone} autoComplete="tel" placeholder="+20 10 1234 5678" onChange={event => onForm({ phone: event.target.value })} />
            {errors.phone ? <p className="hj-error">{errors.phone}</p> : null}
          </label>
          <label className={`hj-field${errors.country ? " hj-field--invalid" : ""}`}>
            <span>Country *</span>
            <input value={form.country} autoComplete="country-name" maxLength={80} placeholder="e.g. Egypt" onChange={event => onForm({ country: event.target.value })} />
            {errors.country ? <p className="hj-error">{errors.country}</p> : null}
          </label>
        </div>

        <span className="hj-step-label">Passenger names (as per passports)</span>
        {errors.names ? <p className="hj-error" style={{ marginBottom: "0.5rem" }}>{errors.names}</p> : null}
        {cabins.map((cabin, cabinIndex) => (
          <div className="hj-cabinguests" key={cabinIndex}>
            <p className="hj-cabinguests__title">Cabin {String(cabinIndex + 1).padStart(2, "0")} · {roomType}</p>
            <div className="hj-grid2">
              {[
                ...Array.from({ length: cabin.adults }, (_, i) => ({ label: `Adult ${i + 1}` })),
                ...Array.from({ length: cabin.children }, (_, i) => ({ label: `Child ${i + 1}` })),
              ].map(guest => {
                const index = cursor;
                cursor += 1;
                return (
                  <label className="hj-field" key={`${cabinIndex}-${guest.label}`}>
                    <span>{guest.label} full name *</span>
                    <input value={names[index] ?? ""} maxLength={120} autoComplete="name" onChange={event => onNames(index, event.target.value)} />
                  </label>
                );
              })}
            </div>
          </div>
        ))}

        <label className="hj-field" style={{ marginTop: "1rem" }}>
          <span>Airport transfer (optional)</span>
          <textarea
            value={form.transfers}
            maxLength={600}
            placeholder="Would you like Hathor to arrange airport transfers?"
            onChange={event => onForm({ transfers: event.target.value })}
          />
        </label>

        <label className="hj-field" style={{ marginTop: "0.7rem" }}>
          <span>Dietary requirements (optional)</span>
          <textarea value={form.dietary} maxLength={600} onChange={event => onForm({ dietary: event.target.value })} />
        </label>

        <label className="hj-field" style={{ marginTop: "0.7rem" }}>
          <span>Special requests (optional)</span>
          <textarea
            value={form.requests}
            maxLength={600}
            placeholder="Celebrations, connecting cabins, or anything we should know."
            onChange={event => onForm({ requests: event.target.value })}
          />
        </label>
      </section>

      <section className="hj-pay">
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

        <p className="hj-pay__title" style={{ marginTop: "1.3rem" }}>Payment schedule</p>
        <ol className="hj-schedule">
          {hold.paymentSchedule.map(stage => (
            <li key={stage.milestone}>
              <strong>{money(stage.cumulativeCents)}</strong>
              <span>{stageLabel(stage)}</span>
            </li>
          ))}
        </ol>
        <p className="hj-ledger__note">
          After sending your reservation request, Hathor Reservations will review the details and send the invoice with payment instructions.
        </p>

        <span className="hj-step-label">Included in your voyage</span>
        <ul className="hj-inclusions">
          {HATHOR_BOOKING_INCLUSIONS.map(item => <li key={item}>{item}</li>)}
        </ul>

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
        <button type="button" className="hj-btn hj-btn--ghost" onClick={onBack}>← Back to suites</button>
        <button type="button" className="hj-btn" disabled={busy} onClick={onConfirm}>
          {busy ? "Sending your request…" : "Confirm request"} <span aria-hidden>→</span>
        </button>
      </div>
      <p className="hj-note" style={{ gridColumn: "1 / -1" }}>No payment is collected at this step.</p>
    </div>
  );
}
