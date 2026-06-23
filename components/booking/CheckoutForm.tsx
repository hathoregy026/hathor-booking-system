"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  User,
  Users,
} from "lucide-react";
import type { CheckoutSummary } from "@/lib/booking-checkout-summary";
import { formatPrice, formatUtcDate } from "@/lib/client-dates";

const COUNTRY_CODES = [
  { code: "+20", label: "Egypt (+20)" },
  { code: "+1", label: "US/Canada (+1)" },
  { code: "+44", label: "UK (+44)" },
  { code: "+971", label: "UAE (+971)" },
  { code: "+966", label: "Saudi Arabia (+966)" },
  { code: "+49", label: "Germany (+49)" },
  { code: "+33", label: "France (+33)" },
];

type CheckoutFormProps = {
  summary: CheckoutSummary;
};

type FormState = {
  fullName: string;
  email: string;
  countryCode: string;
  phone: string;
  adults: number;
  children: number;
  specialRequests: string;
};

const inputClassName =
  "w-full rounded-xl border px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--booking-navy)]/20";

const inputStyle = {
  borderColor: "var(--booking-border)",
  background: "var(--booking-surface)",
};

export function CheckoutForm({ summary }: CheckoutFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    fullName: "",
    email: "",
    countryCode: "+20",
    phone: "",
    adults: summary.adults,
    children: summary.children,
    specialRequests: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const guestTotal = form.adults + form.children;

  const validate = (): boolean => {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};

    if (!form.fullName.trim()) {
      nextErrors.fullName = "Full name is required";
    }

    if (!form.email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = "Enter a valid email address";
    }

    if (!form.phone.trim()) {
      nextErrors.phone = "Phone number is required";
    } else if (form.phone.replace(/\D/g, "").length < 6) {
      nextErrors.phone = "Enter a valid phone number";
    }

    if (form.adults < 1) {
      nextErrors.adults = "At least one adult is required";
    }

    if (form.children < 0) {
      nextErrors.children = "Invalid number of children";
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const phone = `${form.countryCode} ${form.phone.trim()}`.trim();

      const response = await fetch("/api/bookings/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cruiseId: summary.cruiseId,
          cruiseScheduleId: summary.scheduleId,
          roomId: summary.roomId,
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phone,
          adults: form.adults,
          children: form.children,
          specialRequests: form.specialRequests.trim(),
          priceCents: summary.priceCents,
        }),
      });

      const data = await response.json();

      if (response.status === 409) {
        setError(
          "Sorry, this room was just booked by someone else. Please choose another room.",
        );
        return;
      }

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to complete booking");
      }

      router.push(`/booking/success?bookingId=${encodeURIComponent(data.bookingId)}`);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-6 sm:pb-20 sm:pt-8 lg:px-8">
      <nav className="mb-6 text-sm" style={{ color: "var(--booking-muted)" }}>
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href={summary.backHref} className="hover:underline">
          Cruise details
        </Link>
        <span className="mx-2">/</span>
        <span style={{ color: "var(--booking-navy)" }}>Checkout</span>
      </nav>

      <div className="mb-6 sm:mb-8">
        <h1 className="booking-serif text-xl font-semibold sm:text-3xl lg:text-4xl">
          Complete your booking
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--booking-muted)" }}>
          Enter your guest details to request this cruise. Our team will confirm
          your reservation shortly.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-8">
        <form
          id="checkout-form"
          onSubmit={handleSubmit}
          className="booking-card booking-form-with-sticky space-y-5 p-4 sm:space-y-6 sm:p-6 md:p-8"
        >
          <h2 className="booking-serif text-lg font-semibold sm:text-xl">Guest information</h2>

          <div className="space-y-2">
            <label htmlFor="fullName" className="flex items-center gap-2 text-sm font-medium">
              <User className="h-4 w-4" style={{ color: "var(--booking-muted)" }} aria-hidden />
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              autoComplete="name"
              value={form.fullName}
              onChange={(event) =>
                setForm((current) => ({ ...current, fullName: event.target.value }))
              }
              className={inputClassName}
              style={inputStyle}
              placeholder="Jane Hathor"
            />
            {fieldErrors.fullName && (
              <p className="text-xs text-red-600">{fieldErrors.fullName}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
              <Mail className="h-4 w-4" style={{ color: "var(--booking-muted)" }} aria-hidden />
              Email Address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
              className={inputClassName}
              style={inputStyle}
              placeholder="jane@example.com"
            />
            {fieldErrors.email && (
              <p className="text-xs text-red-600">{fieldErrors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium">
              <Phone className="h-4 w-4" style={{ color: "var(--booking-muted)" }} aria-hidden />
              Phone Number
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <select
                aria-label="Country code"
                value={form.countryCode}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    countryCode: event.target.value,
                  }))
                }
                className={`${inputClassName} sm:max-w-[11rem]`}
                style={inputStyle}
              >
                {COUNTRY_CODES.map((entry) => (
                  <option key={entry.code} value={entry.code}>
                    {entry.label}
                  </option>
                ))}
              </select>
              <input
                id="phone"
                type="tel"
                autoComplete="tel-national"
                value={form.phone}
                onChange={(event) =>
                  setForm((current) => ({ ...current, phone: event.target.value }))
                }
                className={inputClassName}
                style={inputStyle}
                placeholder="127 049 6896"
              />
            </div>
            {fieldErrors.phone && (
              <p className="text-xs text-red-600">{fieldErrors.phone}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="adults" className="flex items-center gap-2 text-sm font-medium">
                <Users className="h-4 w-4" style={{ color: "var(--booking-muted)" }} aria-hidden />
                Adults
              </label>
              <input
                id="adults"
                type="number"
                min={1}
                max={10}
                value={form.adults}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    adults: Number.parseInt(event.target.value, 10) || 1,
                  }))
                }
                className={inputClassName}
                style={inputStyle}
              />
              {fieldErrors.adults && (
                <p className="text-xs text-red-600">{fieldErrors.adults}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="children" className="text-sm font-medium">
                Children
              </label>
              <input
                id="children"
                type="number"
                min={0}
                max={10}
                value={form.children}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    children: Number.parseInt(event.target.value, 10) || 0,
                  }))
                }
                className={inputClassName}
                style={inputStyle}
              />
              {fieldErrors.children && (
                <p className="text-xs text-red-600">{fieldErrors.children}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="specialRequests"
              className="flex items-center gap-2 text-sm font-medium"
            >
              <MessageSquare
                className="h-4 w-4"
                style={{ color: "var(--booking-muted)" }}
                aria-hidden
              />
              Special Requests
              <span className="font-normal" style={{ color: "var(--booking-muted)" }}>
                (optional)
              </span>
            </label>
            <textarea
              id="specialRequests"
              rows={4}
              value={form.specialRequests}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  specialRequests: event.target.value,
                }))
              }
              className={`${inputClassName} resize-y`}
              style={inputStyle}
              placeholder="Dietary restrictions, celebrations, accessibility needs..."
            />
          </div>

          {error && (
            <p
              className="rounded-2xl border px-4 py-3 text-sm"
              style={{
                borderColor: "#fecaca",
                background: "#fef2f2",
                color: "#b91c1c",
              }}
            >
              {error}
            </p>
          )}

          <div className="hidden flex-col-reverse gap-3 border-t pt-6 md:flex md:flex-row md:justify-between"
            style={{ borderColor: "var(--booking-border)" }}
          >
            <Link
              href={summary.backHref}
              className="booking-btn-outline inline-flex items-center justify-center gap-2 px-6 py-3 text-sm"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="booking-btn-primary inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                  Processing...
                </>
              ) : (
                "Confirm Booking"
              )}
            </button>
          </div>
        </form>

        <div className="booking-mobile-sticky-bar md:hidden">
          <button
            type="submit"
            form="checkout-form"
            disabled={isSubmitting}
            className="booking-btn-primary flex w-full items-center justify-center gap-2 py-3.5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                Processing...
              </>
            ) : (
              "Confirm Booking"
            )}
          </button>
        </div>

        <aside className="booking-card order-first h-fit p-4 sm:p-6 lg:order-none lg:sticky lg:top-24">
          <p
            className="text-xs font-semibold uppercase tracking-[0.14em]"
            style={{ color: "var(--booking-muted)" }}
          >
            Booking summary
          </p>

          <h2 className="booking-serif mt-3 text-base font-semibold leading-snug sm:text-lg">
            {summary.title}
          </h2>

          {summary.meta && (
            <p className="mt-2 text-sm font-medium" style={{ color: "var(--booking-navy)" }}>
              {summary.meta}
            </p>
          )}

          <dl className="mt-6 space-y-4 text-sm">
            {summary.checkInDate && (
              <div className="flex items-start gap-3">
                <CalendarDays
                  className="mt-0.5 h-4 w-4 shrink-0"
                  style={{ color: "var(--booking-muted)" }}
                  aria-hidden
                />
                <div>
                  <dt style={{ color: "var(--booking-muted)" }}>Check-in</dt>
                  <dd className="font-medium">
                    {formatUtcDate(summary.checkInDate)}
                  </dd>
                </div>
              </div>
            )}

            {summary.roomType && (
              <div>
                <dt style={{ color: "var(--booking-muted)" }}>Room type</dt>
                <dd className="font-medium">{summary.roomType}</dd>
              </div>
            )}

            <div>
              <dt style={{ color: "var(--booking-muted)" }}>Guests</dt>
              <dd className="font-medium">
                {guestTotal} guest{guestTotal === 1 ? "" : "s"} ({form.adults} adult
                {form.adults === 1 ? "" : "s"}
                {form.children > 0
                  ? `, ${form.children} child${form.children === 1 ? "" : "ren"}`
                  : ""}
                )
              </dd>
            </div>
          </dl>

          <div
            className="mt-6 flex items-center justify-between rounded-xl px-4 py-4"
            style={{ background: "var(--booking-cream)" }}
          >
            <span className="text-sm font-medium">Total</span>
            <span className="booking-serif text-2xl font-semibold">
              {formatPrice(summary.priceCents)}
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}
