"use client";

import { ArrowLeft, ArrowRight, Mail, User } from "lucide-react";
import { useBookingStore } from "@/store/bookingStore";

export function PassengerDetailsStep() {
  const { passengerDetails, setPassengerDetails, setStep, error, setError } =
    useBookingStore();

  const handleContinue = () => {
    const name = passengerDetails.name.trim();
    const email = passengerDetails.email.trim();

    if (!name) {
      setError("Please enter your full name.");
      return;
    }

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setPassengerDetails({ name, email });
    setError(null);
    setStep(3);
  };

  return (
    <div className="mx-auto max-w-lg space-y-6 sm:space-y-8">
      <div className="space-y-2 text-center">
        <h2 className="booking-serif text-xl font-semibold sm:text-3xl">
          Guest details
        </h2>
        <p className="text-sm" style={{ color: "var(--booking-muted)" }}>
          Tell us who will be joining this unforgettable journey.
        </p>
      </div>

      <div className="booking-card space-y-5 p-4 sm:p-8">
        <div className="space-y-2">
          <label
            htmlFor="passenger-name"
            className="flex items-center gap-2 text-sm font-medium"
          >
            <User
              className="h-4 w-4"
              style={{ color: "var(--booking-muted)" }}
              aria-hidden
            />
            Full Name
          </label>
          <input
            id="passenger-name"
            type="text"
            value={passengerDetails.name}
            onChange={(event) =>
              setPassengerDetails({ name: event.target.value })
            }
            placeholder="Jane Hathor"
            className="w-full rounded-xl border px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--booking-navy)]/20"
            style={{
              borderColor: "var(--booking-border)",
              background: "var(--booking-surface)",
            }}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="passenger-email"
            className="flex items-center gap-2 text-sm font-medium"
          >
            <Mail
              className="h-4 w-4"
              style={{ color: "var(--booking-muted)" }}
              aria-hidden
            />
            Email Address
          </label>
          <input
            id="passenger-email"
            type="email"
            value={passengerDetails.email}
            onChange={(event) =>
              setPassengerDetails({ email: event.target.value })
            }
            placeholder="jane@example.com"
            className="w-full rounded-xl border px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--booking-navy)]/20"
            style={{
              borderColor: "var(--booking-border)",
              background: "var(--booking-surface)",
            }}
          />
        </div>
      </div>

      {error && (
        <p
          className="rounded-2xl border px-4 py-3 text-center text-sm"
          style={{
            borderColor: "#fecaca",
            background: "#fef2f2",
            color: "#b91c1c",
          }}
        >
          {error}
        </p>
      )}

      <div className="hidden flex-col-reverse gap-3 md:flex md:flex-row md:justify-between">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="booking-btn-outline inline-flex items-center justify-center gap-2 px-6 py-3 text-sm"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="booking-btn-primary inline-flex items-center justify-center gap-2 px-8 py-3 text-sm"
        >
          Continue to Review
          <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <div className="booking-mobile-sticky-bar md:hidden">
        <button
          type="button"
          onClick={handleContinue}
          className="booking-btn-primary flex w-full items-center justify-center gap-2 py-3.5 text-sm"
        >
          Continue to Review
          <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
