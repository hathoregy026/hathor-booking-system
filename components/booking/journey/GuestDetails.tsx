"use client";

import { useState } from "react";
import Link from "next/link";
import { itineraryFor } from "@/lib/booking-itineraries";
import type { StayDurationValue } from "@/lib/booking-search-config";
import type { PhysicalRoomType } from "@/lib/physical-inventory";
import {
  distributeParty,
  longDate,
  money,
  partySummary,
  plural,
  rangeLabel,
  type GuestForm,
  type Hold,
  type Party,
} from "./model";
import { IconMail } from "./icons";

/** The reservation as label and value rows, shared by screens 03 and 04. */
export function ReservationLedger({
  duration,
  roomType,
  party,
  hold,
  departureIso,
  arrivalIso,
}: {
  duration: StayDurationValue;
  roomType: PhysicalRoomType;
  party: Party;
  hold: Hold;
  departureIso: string;
  arrivalIso: string;
}) {
  const voyage = itineraryFor(duration);
  return (
    <div className="hj-ledger">
      <div className="hj-ledger__row"><span>Journey</span><span>{voyage.route}</span></div>
      <div className="hj-ledger__row"><span>Voyage</span><span>{voyage.title}</span></div>
      <div className="hj-ledger__row"><span>Dates</span><span>{rangeLabel(departureIso, arrivalIso)}</span></div>
      <div className="hj-ledger__row"><span>Check-in</span><span>{longDate(departureIso)}</span></div>
      <div className="hj-ledger__row"><span>Guests</span><span>{partySummary(party)}</span></div>
      <div className="hj-ledger__row"><span>Cabin type</span><span>{plural(party.cabins, "×")} {roomType}</span></div>
      <div className="hj-ledger__row"><span>Rate</span><span>Standard Hathor rate</span></div>
      <div className="hj-ledger__row hj-ledger__row--total"><span>Voyage total</span><span>{money(hold.totalPriceCents)}</span></div>
    </div>
  );
}

/** Screen 03 — the reservation, the lead guest, and what happens next. */
export function GuestDetailsScreen({
  duration,
  roomType,
  party,
  hold,
  departureIso,
  arrivalIso,
  form,
  onForm,
  names,
  onNames,
  errors,
  busy,
  onEdit,
  onContinue,
}: {
  duration: StayDurationValue;
  roomType: PhysicalRoomType;
  party: Party;
  hold: Hold;
  departureIso: string;
  arrivalIso: string;
  form: GuestForm;
  onForm: (patch: Partial<GuestForm>) => void;
  names: string[];
  onNames: (index: number, value: string) => void;
  errors: Record<string, string>;
  busy: boolean;
  onEdit: () => void;
  onContinue: () => void;
}) {
  const [extrasOpen, setExtrasOpen] = useState(false);
  const cabins = distributeParty(party);
  const firstStage = hold.paymentSchedule[0] ?? null;
  let cursor = 0;

  return (
    <div className="hj-trio">
      <section className="hj-card">
        <span className="hj-card__eyebrow">01 / Your selection</span>
        <h2 className="hj-card__title">Your Reservation</h2>
        <ReservationLedger
          duration={duration}
          roomType={roomType}
          party={party}
          hold={hold}
          departureIso={departureIso}
          arrivalIso={arrivalIso}
        />
        {firstStage ? (
          <div className="hj-deposit">
            <span className="hj-deposit__label">
              {hold.totalPriceCents > 0
                ? `${Math.round((firstStage.cumulativeCents / hold.totalPriceCents) * 100)}% deposit after team review`
                : "Deposit after team review"}
            </span>
            <span className="hj-deposit__amount">{money(firstStage.cumulativeCents)}</span>
            <p className="hj-deposit__fine">Invoiced by Hathor Reservations. Nothing is charged on this website.</p>
          </div>
        ) : null}
        <button type="button" className="hj-btn hj-btn--quiet hj-btn--wide" style={{ marginTop: "0.8rem" }} onClick={onEdit}>
          Edit selections
        </button>
      </section>

      <section className="hj-card">
        <span className="hj-card__eyebrow">02 / Lead guest</span>
        <h2 className="hj-card__title">Guest Information</h2>

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

        <span className="hj-step-label">Passenger names</span>
        {errors.names ? <p className="hj-error" style={{ marginBottom: "0.5rem" }}>{errors.names}</p> : null}
        {cabins.map((cabin, cabinIndex) => (
          <div className="hj-cabinguests" key={cabinIndex}>
            <p className="hj-cabinguests__title">Cabin {cabinIndex + 1} · {roomType}</p>
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

        <button
          type="button"
          className="hj-disclosure"
          style={{ marginTop: "0.8rem" }}
          aria-expanded={extrasOpen}
          onClick={() => setExtrasOpen(open => !open)}
        >
          <span>Add a special request (optional)</span>
          <span aria-hidden>{extrasOpen ? "–" : "+"}</span>
        </button>

        {extrasOpen ? (
          <div style={{ marginTop: "0.7rem", display: "grid", gap: "0.7rem" }}>
            <label className="hj-field">
              <span>Dietary requirements</span>
              <textarea value={form.dietary} maxLength={600} onChange={event => onForm({ dietary: event.target.value })} />
            </label>
            <label className="hj-field">
              <span>Arrival and transfer details</span>
              <textarea value={form.transfers} maxLength={600} onChange={event => onForm({ transfers: event.target.value })} />
            </label>
            <label className="hj-field">
              <span>Anything else</span>
              <textarea value={form.requests} maxLength={600} onChange={event => onForm({ requests: event.target.value })} />
            </label>
          </div>
        ) : null}

        <p className="hj-ledger__note">No account is required.</p>

        <div className="hj-actions" style={{ marginTop: "1rem" }}>
          <button type="button" className="hj-btn hj-btn--wide" disabled={busy} onClick={onContinue}>
            {busy ? "Checking your hold…" : "Continue to review & payment"} <span aria-hidden>→</span>
          </button>
        </div>
        <p className="hj-note">No payment is collected at this step.</p>
      </section>

      <section className="hj-card">
        <span className="hj-card__eyebrow">03 / Next steps</span>
        <h2 className="hj-card__title">What Happens Next?</h2>
        <ol className="hj-timeline">
          <li data-state="now">
            <span className="hj-timeline__dot">1</span>
            <span><strong>Team reviews availability</strong><span>We verify the cabin and the final voyage total.</span></span>
          </li>
          <li>
            <span className="hj-timeline__dot">2</span>
            <span><strong>Receive your quote</strong><span>We email the approved quote and payment instructions.</span></span>
          </li>
          <li>
            <span className="hj-timeline__dot">3</span>
            <span><strong>Pay the first instalment</strong><span>{firstStage ? `${money(firstStage.cumulativeCents)} for this booking.` : "The amount shown on your invoice."}</span></span>
          </li>
          <li>
            <span className="hj-timeline__dot">4</span>
            <span><strong>Booking confirmed</strong><span>Issued once Hathor accepts and the payment is recorded.</span></span>
          </li>
          <li>
            <span className="hj-timeline__dot">5</span>
            <span><strong>Pay the balance</strong><span>Following the payment plan before embarkation.</span></span>
          </li>
        </ol>
        <p className="hj-assist">
          <span className="hj-assist__icon" aria-hidden><IconMail /></span>
          <span>Need assistance? <Link href="/contact">Contact our reservations team</Link>.</span>
        </p>
      </section>
    </div>
  );
}
