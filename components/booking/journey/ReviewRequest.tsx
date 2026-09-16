"use client";

import Image from "next/image";
import Link from "next/link";
import { itineraryFor } from "@/lib/booking-itineraries";
import { HATHOR_BOOKING_INCLUSIONS } from "@/lib/booking-room-media";
import type { StayDurationValue } from "@/lib/booking-search-config";
import type { PhysicalRoomType } from "@/lib/physical-inventory";
import { PaymentJourney } from "./PaymentJourney";
import { IconLock } from "./icons";
import {
  longDate,
  money,
  partySummary,
  plural,
  rangeLabel,
  stageLabel,
  type GuestForm,
  type Hold,
  type Party,
} from "./model";

/** Screen 04 — the request as it will be sent, and how you prefer to pay. */
export function ReviewScreen({
  duration,
  roomType,
  party,
  hold,
  departureIso,
  arrivalIso,
  form,
  onForm,
  errors,
  busy,
  onEdit,
  onConfirm,
}: {
  duration: StayDurationValue;
  roomType: PhysicalRoomType;
  party: Party;
  hold: Hold;
  departureIso: string;
  arrivalIso: string;
  form: GuestForm;
  onForm: (patch: Partial<GuestForm>) => void;
  errors: Record<string, string>;
  busy: boolean;
  onEdit: () => void;
  onConfirm: () => void;
}) {
  const voyage = itineraryFor(duration);
  const required = hold.requiredCents ?? hold.paymentSchedule[0]?.cumulativeCents ?? null;
  const balance = required === null ? null : Math.max(0, hold.totalPriceCents - required);

  return (
    <div className="hj-duo">
      <section className="hj-card">
        <span className="hj-card__eyebrow">04 / Review &amp; send</span>
        <h2 className="hj-card__title">Send your request to Hathor</h2>
        <p className="hj-ledger__note" style={{ marginTop: 0 }}>
          Check the details below, tell us how you would prefer to pay, then send your booking for review.
        </p>

        <div className="hj-deposit" style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
          <span className="hj-rail__icon" aria-hidden><IconLock /></span>
          <span>
            <span className="hj-deposit__label">Nothing is paid today</span>
            <p className="hj-deposit__fine" style={{ marginTop: "0.2rem" }}>
              {required === null
                ? "Hathor Reservations will send your invoice after reviewing this request."
                : `After our team reviews your request we will invoice ${money(required)} to confirm the booking. No card details are collected on this website.`}
            </p>
          </span>
        </div>

        <span className="hj-step-label">Your payment journey</span>
        <PaymentJourney current={2} />

        <span className="hj-step-label">Preferred payment method</span>
        <div className="hj-grid2">
          {([["VISA", "Visa"], ["BANK_TRANSFER", "Bank Transfer"]] as const).map(([value, label]) => (
            <label key={value} className={`hj-choice${form.paymentMethod === value ? " hj-choice--on" : ""}`}>
              <input
                type="radio"
                name="hj-payment-method"
                checked={form.paymentMethod === value}
                onChange={() => onForm({ paymentMethod: value })}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
        <p className="hj-ledger__note">
          This is your preference only. No card number, expiry or security code is collected here — Hathor Reservations
          sends the invoice with payment instructions for the method you choose.
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

        <div className="hj-actions">
          <button type="button" className="hj-btn hj-btn--quiet" onClick={onEdit}>Edit guest details</button>
          <button type="button" className="hj-btn hj-btn--solid" disabled={busy} onClick={onConfirm}>
            {busy ? "Sending your request…" : "Send booking for review"} <span aria-hidden>→</span>
          </button>
        </div>
        <p className="hj-note">No payment is collected at this step.</p>
      </section>

      <section className="hj-card">
        <span className="hj-card__eyebrow">Your quote</span>
        <h2 className="hj-card__title">{voyage.title}</h2>
        <Image
          src={voyage.image}
          alt=""
          width={640}
          height={360}
          sizes="(max-width: 1080px) 100vw, 330px"
          style={{ width: "100%", height: "auto", borderRadius: "4px", display: "block", marginBottom: "0.8rem" }}
        />
        <div className="hj-ledger">
          <div className="hj-ledger__row"><span>Route</span><span>{voyage.route}</span></div>
          <div className="hj-ledger__row"><span>Dates</span><span>{rangeLabel(departureIso, arrivalIso)}</span></div>
          <div className="hj-ledger__row"><span>Check-in</span><span>{longDate(departureIso)}</span></div>
          <div className="hj-ledger__row"><span>Guests</span><span>{partySummary(party)}</span></div>
          <div className="hj-ledger__row"><span>Accommodation</span><span>{plural(party.cabins, "×")} {roomType}</span></div>
          <div className="hj-ledger__row"><span>Lead guest</span><span>{form.firstName} {form.lastName}</span></div>
        </div>

        <div className="hj-total-block">
          <span className="hj-total-block__label">Voyage total</span>
          <div className="hj-total-block__amount">{money(hold.totalPriceCents)}</div>
          <p className="hj-deposit__fine">Taxes and service charges included.</p>
        </div>

        {required === null ? null : (
          <div className="hj-deposit">
            <span className="hj-deposit__label">Due when invoiced</span>
            <span className="hj-deposit__amount">{money(required)}</span>
            {balance !== null && balance > 0 ? (
              <p className="hj-deposit__fine">Remaining {money(balance)} follows the payment plan below.</p>
            ) : null}
          </div>
        )}

        <span className="hj-step-label">Payment plan</span>
        <div className="hj-ledger">
          {hold.paymentSchedule.map(stage => (
            <div className="hj-ledger__row" key={stage.milestone}>
              <span>{stageLabel(stage)}</span>
              <span>{money(stage.cumulativeCents)}</span>
            </div>
          ))}
        </div>

        <div className="hj-deposit" style={{ background: "none", border: 0, padding: "0.6rem 0 0" }}>
          <span className="hj-deposit__label">Booking status</span>
          <span className="hj-rail__value">Not sent yet</span>
        </div>
      </section>
    </div>
  );
}
