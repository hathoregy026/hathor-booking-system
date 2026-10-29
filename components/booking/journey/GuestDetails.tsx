"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { cardSurchargeCents } from "@/lib/card-surcharge";
import { findCountry } from "@/lib/countries";
import { localizedHref } from "@/lib/i18n/locale";
import { CountryPicker } from "./CountryPicker";
import { guestLabel, type CabinView } from "./allocation";
import { type GuestForm, type PaymentStage } from "./model";
import { useCurrency } from "@/components/public/CurrencyProvider";
import { IconBank, IconCard } from "./icons";
import { PaymentPlan } from "./PaymentPlan";
import { useBookingCopy } from "./useBookingCopy";

/** Step 3 — lead guest, passengers by cabin, payment preference, then send the request. */
export function DetailsPaymentScreen({
  cabins,
  schedule,
  totalCents,
  form,
  onForm,
  names,
  onName,
  errors,
  busy,
  onBack,
  onConfirm,
  verification,
}: {
  cabins: CabinView[];
  schedule: PaymentStage[];
  totalCents: number | null;
  form: GuestForm;
  onForm: (patch: Partial<GuestForm>) => void;
  names: Record<string, string>;
  onName: (guestId: string, value: string) => void;
  errors: Record<string, string>;
  busy: boolean;
  onBack: () => void;
  onConfirm: () => void;
  verification?: ReactNode;
}) {
  const t = useBookingCopy();
  const d = t.details;
  const country = findCountry(form.countryCode);
  const countryName = country ? t.countryName(country.code, country.name) : null;

  const { money } = useCurrency();
  return (
    <div className="hj-details">
      <section>
        <span className="hj-step-label" id="hj-m-lead">{d.lead}</span>
        <p className="hj-step-lede">{d.leadLede}</p>
        <div className="hj-lead">
          <div className="hj-grid2">
            <label className={`hj-field${errors.firstName ? " hj-field--invalid" : ""}`}>
              <span>{d.firstName}</span>
              <input value={form.firstName} autoComplete="given-name" maxLength={60} placeholder={d.firstNamePlaceholder} onChange={event => onForm({ firstName: event.target.value })} />
              {errors.firstName ? <p className="hj-error">{errors.firstName}</p> : null}
            </label>
            <label className={`hj-field${errors.lastName ? " hj-field--invalid" : ""}`}>
              <span>{d.lastName}</span>
              <input value={form.lastName} autoComplete="family-name" maxLength={60} placeholder={d.lastNamePlaceholder} onChange={event => onForm({ lastName: event.target.value })} />
              {errors.lastName ? <p className="hj-error">{errors.lastName}</p> : null}
            </label>
          </div>

          <label className={`hj-field${errors.email ? " hj-field--invalid" : ""}`} style={{ marginTop: "0.7rem" }}>
            <span>{d.email}</span>
            <input type="email" value={form.email} autoComplete="email" maxLength={254} placeholder={d.emailPlaceholder} onChange={event => onForm({ email: event.target.value })} />
            {errors.email ? <p className="hj-error">{errors.email}</p> : null}
          </label>

          <div className="hj-grid2" style={{ marginTop: "0.7rem" }}>
            <div className={`hj-field${errors.country ? " hj-field--invalid" : ""}`}>
              <span id="hj-country-label">{d.country}</span>
              <CountryPicker
                value={form.countryCode}
                labelledBy="hj-country-label"
                invalid={Boolean(errors.country)}
                onChange={chosen => onForm({ countryCode: chosen?.code ?? "", country: chosen?.name ?? "" })}
              />
              {errors.country ? <p className="hj-error">{errors.country}</p> : null}
            </div>
            <label className={`hj-field${errors.phone ? " hj-field--invalid" : ""}`}>
              <span>{d.phone}</span>
              <span className="hj-phone">
                <span className="hj-phone__code" aria-label={countryName ? d.countryCode(countryName) : d.countryCodeMissing}>
                  {country ? `+${country.dial}` : "+"}
                </span>
                <input
                  type="tel"
                  inputMode="tel"
                  value={form.phone}
                  autoComplete="tel-national"
                  placeholder={country ? d.phonePlaceholder : d.phoneNoCountry}
                  onChange={event => onForm({ phone: event.target.value })}
                />
              </span>
              {errors.phone ? <p className="hj-error">{errors.phone}</p> : null}
            </label>
          </div>
        </div>

        <span className="hj-step-label" id="hj-m-passengers">{d.passengers}</span>
        <p className="hj-step-lede">{d.passengersLede}</p>
        {errors.names ? <p className="hj-error" style={{ marginBottom: "0.5rem" }}>{errors.names}</p> : null}
        <div className="hj-names">
          {cabins.map(cabin => (
            <div className="hj-cabinguests" key={cabin.id}>
              <p className="hj-cabinguests__title">{cabin.label}</p>
              <div className="hj-grid2">
                {cabin.guests.map(guest => (
                  <label className={`hj-field${errors.names && !(names[guest.id] ?? "").trim() ? " hj-field--invalid" : ""}`} key={guest.id}>
                    <span>{d.fullName(guestLabel(guest, t))}</span>
                    <input value={names[guest.id] ?? ""} maxLength={120} autoComplete="off" onChange={event => onName(guest.id, event.target.value)} />
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="hj-extras">
          <label className="hj-field" style={{ marginTop: "1rem" }}>
            <span>{d.requests}</span>
            <textarea
              value={form.requests}
              maxLength={600}
              placeholder={d.requestsPlaceholder}
              onChange={event => onForm({ requests: event.target.value })}
            />
          </label>
        </div>
      </section>

      <section className="hj-pay" id="hj-m-payment">
        <p className="hj-pay__title">{d.paymentTitle}</p>
        <p className="hj-pay__lede">{d.paymentLede}</p>

        <div style={{ display: "grid", gap: "0.55rem" }}>
          <label className={`hj-choice${form.paymentMethod === "VISA" ? " hj-choice--on" : ""}`}>
            <input
              type="radio"
              name="hj-payment-method"
              checked={form.paymentMethod === "VISA"}
              onChange={() => onForm({ paymentMethod: "VISA" })}
            />
            <span>
              <strong><IconCard /> {d.card}</strong>
              <span>{d.cardNote}</span>
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
              <strong><IconBank /> {d.bank}</strong>
              <span>{d.bankNote}</span>
            </span>
          </label>
        </div>
        <div aria-live="polite">
          {form.paymentMethod === "VISA" ? (
            <p className="hj-note-box">
              {d.surchargeNote(
                totalCents
                  ? `${money(totalCents)} + ${money(cardSurchargeCents(totalCents))} = ${money(totalCents + cardSurchargeCents(totalCents))}`
                  : null,
              )}
            </p>
          ) : null}
        </div>

        <div className="hj-pay__pair">
          <div className="hj-pay__col">
            <p className="hj-pay__title" style={{ marginTop: "1.3rem" }}>{d.schedule}</p>
            <PaymentPlan stages={schedule} locale={t.locale} />
            <p className="hj-ledger__note">
              {d.scheduleNote}
            </p>
          </div>

          <div className="hj-pay__col">
            <span className="hj-step-label">{d.includedTitle}</span>
            <ul className="hj-inclusions">
              {d.inclusions.map(item => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </div>

        <span className="hj-step-label">{d.terms}</span>
        <label className={`hj-terms${errors.terms ? " hj-field--invalid" : ""}`}>
          <input type="checkbox" checked={form.termsAccepted} onChange={event => onForm({ termsAccepted: event.target.checked })} />
          <span>
            {d.termsBefore} <Link href={localizedHref("/terms-and-conditions", t.locale)} target="_blank">{d.termsLink}</Link> {d.termsAfter}
          </span>
        </label>
        {errors.terms ? <p className="hj-error">{errors.terms}</p> : null}

        <label className="hj-terms" style={{ marginTop: "0.55rem" }}>
          <input type="checkbox" checked={form.marketingOptIn} onChange={event => onForm({ marketingOptIn: event.target.checked })} />
          <span>{d.marketing}</span>
        </label>
      </section>

      {verification ? <div className="hj-booking-verification" style={{ gridColumn: "1 / -1", minWidth: 0 }}>{verification}</div> : null}
      <div className="hj-actions" style={{ gridColumn: "1 / -1" }}>
        <button type="button" className="hj-btn hj-btn--ghost" onClick={onBack}>{d.backToSuites}</button>
        <button type="button" className="hj-btn" disabled={busy} onClick={onConfirm}>
          {busy ? d.sending : d.confirm} <span aria-hidden>→</span>
        </button>
      </div>
      <p className="hj-note" style={{ gridColumn: "1 / -1" }}>{d.noPayment}</p>
    </div>
  );
}
