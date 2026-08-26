"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import {
  getSelectedRoomIdsForCheckout,
  validateRoomSelection,
} from "@/components/booking/BookingSearchResults";
import { formatPrice, formatUtcDate } from "@/lib/client-dates";
import {
  findStayDurationOption,
  formatGuestsSummary,
  type StayDurationValue,
} from "@/lib/booking-search-config";
import {
  nonRefundableRateLabel,
  standardRateLabel,
} from "@/lib/rate-plans";
import { useBookingStore, getSelectedRooms } from "@/store/bookingStore";

const SALUTATIONS = ["Mr", "Mrs", "Miss"] as const;

const COUNTRY_CODES = [
  { code: "+20", label: "Egypt (+20)" },
  { code: "+1", label: "US/Canada (+1)" },
  { code: "+44", label: "UK (+44)" },
  { code: "+971", label: "UAE (+971)" },
  { code: "+966", label: "Saudi Arabia (+966)" },
  { code: "+49", label: "Germany (+49)" },
  { code: "+33", label: "France (+33)" },
];

type GuestFormState = {
  salutation: string;
  firstName: string;
  lastName: string;
  email: string;
  countryCode: string;
  phone: string;
  marketingOptIn: boolean;
  termsAccepted: boolean;
};

const fieldClass =
  "hathor-checkout-field w-full border px-3 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--booking-gold)]/20 focus:border-[var(--booking-gold)]";

type BookingConfirmationColumnsProps = {
  onBack: () => void;
};

export function BookingConfirmationColumns({ onBack }: BookingConfirmationColumnsProps) {
  const router = useRouter();
  const idempotencyKey = useRef(crypto.randomUUID());
  const {
    duration,
    checkInDate,
    startDate,
    endDate,
    roomConfigs,
    availableRooms,
    selectedRoomIds,
    selectedCruiseId,
    selectedScheduleId,
    selectedRatePlan,
    totalPrice,
    isLoading,
    error,
    setPassengerDetails,
    setIsLoading,
    setError,
    setHoldExpiresAt,
    setBookingId,
    setTotalPrice,
  } = useBookingStore();

  const [form, setForm] = useState<GuestFormState>({
    salutation: "Mr",
    firstName: "",
    lastName: "",
    email: "",
    countryCode: "+20",
    phone: "",
    marketingOptIn: false,
    termsAccepted: false,
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string>>>({});
  const [specialRequests, setSpecialRequests] = useState<string[]>([""]);

  const selectedRooms = getSelectedRooms(availableRooms, selectedRoomIds);
  const checkoutRoomIds = getSelectedRoomIdsForCheckout(
    availableRooms,
    selectedRoomIds,
  );
  const durationOption = duration
    ? findStayDurationOption(duration as StayDurationValue)
    : undefined;
  const nights = durationOption?.nights ?? 1;
  const perNightCents = nights > 0 ? Math.round(totalPrice / nights) : totalPrice;
  const rateLabel =
    selectedRatePlan === "non-refundable"
      ? nonRefundableRateLabel(
          durationOption?.label.replace(/^⛵\s*/, "") ?? "Hathor Cruise",
        )
      : standardRateLabel(
          durationOption?.label.replace(/^⛵\s*/, "") ?? "Hathor Cruise",
        );
  const combinedSpecialRequests = specialRequests
    .map((entry) => entry.trim())
    .filter(Boolean)
    .join("\n");

  const validate = (): boolean => {
    const next: Partial<Record<string, string>> = {};

    if (!form.firstName.trim()) next.firstName = "First name is required";
    if (!form.lastName.trim()) next.lastName = "Last name is required";
    if (!form.email.trim()) {
      next.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = "Enter a valid email";
    }
    if (!form.phone.trim() || form.phone.replace(/\D/g, "").length < 6) {
      next.phone = "Valid phone number required";
    }
    if (!form.termsAccepted) {
      next.termsAccepted = "Please acknowledge the reservation and payment status";
    }

    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleBookNow = async () => {
    const roomError = validateRoomSelection(
      availableRooms,
      selectedRoomIds,
      roomConfigs,
    );
    if (roomError) {
      setError(roomError);
      return;
    }

    if (!validate()) return;

    if (
      !selectedCruiseId ||
      !startDate ||
      !endDate ||
      !selectedScheduleId ||
      checkoutRoomIds.length === 0
    ) {
      setError("Booking details are incomplete. Please start over.");
      return;
    }

    const fullName = `${form.salutation} ${form.firstName.trim()} ${form.lastName.trim()}`.trim();
    const customerPhone = `${form.countryCode} ${form.phone.trim()}`.trim();
    const adults = roomConfigs.reduce((sum, cfg) => sum + cfg.adults, 0);
    const children = roomConfigs.reduce((sum, cfg) => sum + cfg.children, 0);

    setIsLoading(true);
    setError(null);
    setPassengerDetails({ name: fullName, email: form.email.trim() });

    try {
      const holdResponse = await fetch("/api/bookings/hold", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey.current,
        },
        body: JSON.stringify({
          cruiseId: selectedCruiseId,
          cruiseScheduleId: selectedScheduleId,
          roomIds: checkoutRoomIds,
          startDate,
          endDate,
          ratePlan: selectedRatePlan,
        }),
      });

      const holdData = await holdResponse.json();

      if (holdResponse.status === 409) {
        setError(
          "Sorry, one of your selected rooms was just booked. Please choose another room.",
        );
        return;
      }

      if (!holdResponse.ok) {
        throw new Error(holdData.error ?? "Failed to hold rooms");
      }

      setBookingId(holdData.bookingId);
      setHoldExpiresAt(holdData.holdExpiresAt);
      setTotalPrice(holdData.totalPriceCents);

      const tickets = selectedRooms
        .map((room) => ({
          ticketTypeId: room.prices[0]?.ticketTypeId,
          quantity: 1,
        }))
        .filter((ticket) => ticket.ticketTypeId);

      const confirmResponse = await fetch("/api/bookings/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey.current,
        },
        body: JSON.stringify({
          bookingId: holdData.bookingId,
          holdSecret: holdData.holdSecret,
          customerName: fullName,
          customerEmail: form.email.trim(),
          customerPhone,
          adults,
          children,
          specialRequests: combinedSpecialRequests,
          marketingOptIn: form.marketingOptIn,
          termsAccepted: form.termsAccepted,
          roomIds: checkoutRoomIds,
          tickets,
        }),
      });

      const confirmData = await confirmResponse.json();

      if (confirmResponse.status === 409) {
        setError(
          "Sorry, one of your selected rooms was just booked. Please choose another room.",
        );
        return;
      }

      if (!confirmResponse.ok) {
        const safeMessage =
          confirmData.error === "Internal server error"
            ? "We could not confirm your reservation. Your cabin selection is still safe to retry."
            : confirmData.error;
        throw new Error(
          safeMessage ??
            (confirmResponse.status === 503
              ? "Database is busy. Please wait and try again."
              : "Failed to confirm booking"),
        );
      }

      router.push(
        `/booking/success?bookingId=${encodeURIComponent(confirmData.bookingId)}&token=${encodeURIComponent(confirmData.accessToken)}`,
      );
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="hathor-checkout">
      <div className="hathor-checkout-grid">
        {/* Left — reservation summary */}
        <aside className="hathor-checkout-column hathor-checkout-column--summary">
          <h2 className="hathor-checkout-column__title booking-serif">
            Your Reservation
          </h2>

          <div className="hathor-checkout-summary">
            <p className="hathor-checkout-summary__itinerary">
              {durationOption?.label.replace(/^⛵\s*/, "") ?? "Hathor Dahabiya"}
            </p>

            {selectedRooms.map((room) => (
              <p key={room.id} className="hathor-checkout-summary__room">
                {room.name}
                {room.roomType ? ` · ${room.roomType}` : ""}
              </p>
            ))}

            <dl className="hathor-checkout-summary__meta">
              <div>
                <dt>Nights</dt>
                <dd>{nights}</dd>
              </div>
              <div>
                <dt>Guests</dt>
                <dd>{formatGuestsSummary(roomConfigs)}</dd>
              </div>
              {checkInDate && (
                <div>
                  <dt>Check-in</dt>
                  <dd>{formatUtcDate(checkInDate)}</dd>
                </div>
              )}
              {startDate && endDate && (
                <div>
                  <dt>Stay</dt>
                  <dd>
                    {formatUtcDate(startDate)} – {formatUtcDate(endDate)}
                  </dd>
                </div>
              )}
            </dl>

            <div className="hathor-checkout-summary__breakdown">
              <div className="hathor-checkout-summary__line">
                <span>
                  {formatPrice(perNightCents)} × {nights} night
                  {nights === 1 ? "" : "s"}
                </span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <p className="hathor-checkout-summary__rate-plan">{rateLabel}</p>
              <div className="hathor-checkout-summary__total">
                <span>Total</span>
                <span className="booking-serif">{formatPrice(totalPrice)}</span>
              </div>
            </div>

            <div className="hathor-checkout-special-requests">
              <p className="hathor-checkout-special-requests__label">Special Requests</p>
              {specialRequests.map((request, index) => (
                <div key={`request-${index}`} className="hathor-checkout-special-requests__item">
                  <textarea
                    className={`${fieldClass} hathor-checkout-special-requests__input`}
                    rows={3}
                    value={request}
                    placeholder="Dietary needs, celebrations, accessibility…"
                    onChange={(event) =>
                      setSpecialRequests((current) => {
                        const next = [...current];
                        next[index] = event.target.value;
                        return next;
                      })
                    }
                  />
                </div>
              ))}
              <button
                type="button"
                className="hathor-checkout-special-requests__add"
                onClick={() => setSpecialRequests((current) => [...current, ""])}
              >
                + Another Request
              </button>
            </div>
          </div>
        </aside>

        {/* Middle — guest information */}
        <section className="hathor-checkout-column hathor-checkout-column--guest">
          <h2 className="hathor-checkout-column__title booking-serif">
            Guest Information
          </h2>

          <div className="hathor-checkout-form">
            <div className="hathor-checkout-form__row">
              <div className="hathor-checkout-form__field">
                <label htmlFor="salutation">Title</label>
                <select
                  id="salutation"
                  className={fieldClass}
                  value={form.salutation}
                  onChange={(e) =>
                    setForm((c) => ({ ...c, salutation: e.target.value }))
                  }
                >
                  {SALUTATIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="hathor-checkout-form__row hathor-checkout-form__row--2">
              <div className="hathor-checkout-form__field">
                <label htmlFor="firstName">First Name</label>
                <input
                  id="firstName"
                  type="text"
                  autoComplete="given-name"
                  className={fieldClass}
                  value={form.firstName}
                  onChange={(e) =>
                    setForm((c) => ({ ...c, firstName: e.target.value }))
                  }
                />
                {fieldErrors.firstName && (
                  <p className="hathor-checkout-form__error">{fieldErrors.firstName}</p>
                )}
              </div>
              <div className="hathor-checkout-form__field">
                <label htmlFor="lastName">Last Name</label>
                <input
                  id="lastName"
                  type="text"
                  autoComplete="family-name"
                  className={fieldClass}
                  value={form.lastName}
                  onChange={(e) =>
                    setForm((c) => ({ ...c, lastName: e.target.value }))
                  }
                />
                {fieldErrors.lastName && (
                  <p className="hathor-checkout-form__error">{fieldErrors.lastName}</p>
                )}
              </div>
            </div>

            <div className="hathor-checkout-form__field">
              <label htmlFor="guestEmail">Email</label>
              <input
                id="guestEmail"
                type="email"
                autoComplete="email"
                className={fieldClass}
                value={form.email}
                onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))}
              />
              {fieldErrors.email && (
                <p className="hathor-checkout-form__error">{fieldErrors.email}</p>
              )}
            </div>

            <div className="hathor-checkout-form__field">
              <label htmlFor="guestPhone">Phone</label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <select
                  aria-label="Country code"
                  className={`${fieldClass} sm:max-w-[10rem]`}
                  value={form.countryCode}
                  onChange={(e) =>
                    setForm((c) => ({ ...c, countryCode: e.target.value }))
                  }
                >
                  {COUNTRY_CODES.map((entry) => (
                    <option key={entry.code} value={entry.code}>
                      {entry.label}
                    </option>
                  ))}
                </select>
                <input
                  id="guestPhone"
                  type="tel"
                  autoComplete="tel-national"
                  className={fieldClass}
                  value={form.phone}
                  onChange={(e) => setForm((c) => ({ ...c, phone: e.target.value }))}
                />
              </div>
              {fieldErrors.phone && (
                <p className="hathor-checkout-form__error">{fieldErrors.phone}</p>
              )}
            </div>

          </div>
        </section>

        {/* Right — reservation acknowledgement */}
        <section className="hathor-checkout-column hathor-checkout-column--payment">
          <h2 className="hathor-checkout-column__title booking-serif">
            Confirm Reservation
          </h2>

          <p className="hathor-checkout-payment-note">
            No payment is collected during this testing period. Confirming reserves
            the selected cabin at the price shown. Payment remains pending until a
            secure payment system is added.
          </p>

          <div className="hathor-checkout-checkboxes">
            <label className="hathor-checkout-checkbox">
              <input
                type="checkbox"
                checked={form.marketingOptIn}
                onChange={(e) =>
                  setForm((c) => ({ ...c, marketingOptIn: e.target.checked }))
                }
              />
              <span>Notify me about special offers</span>
            </label>
            <label className="hathor-checkout-checkbox">
              <input
                type="checkbox"
                checked={form.termsAccepted}
                onChange={(e) =>
                  setForm((c) => ({ ...c, termsAccepted: e.target.checked }))
                }
              />
              <span>
                I understand this confirms my reservation, but no payment has
                been collected and the balance remains due.
              </span>
            </label>
            {fieldErrors.termsAccepted && (
              <p className="hathor-checkout-form__error">{fieldErrors.termsAccepted}</p>
            )}
          </div>

          {error && (
            <p className="hathor-checkout-alert" role="alert">
              {error}
            </p>
          )}

          <div className="hathor-checkout-actions">
            <button
              type="button"
              className="hathor-modal-btn hathor-modal-btn--ghost"
              onClick={onBack}
              disabled={isLoading}
            >
              Back
            </button>
            <button
              type="button"
              className="hathor-checkout-book-btn"
              onClick={() => void handleBookNow()}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Processing…
                </>
              ) : (
                "Confirm Reservation"
              )}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
