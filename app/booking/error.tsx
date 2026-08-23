"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Error boundary for the whole booking flow.
 *
 * Without this file, any thrown error in /booking, /booking/checkout or
 * /booking/success renders Next.js's built-in grey "This page couldn't load"
 * screen with a raw digest — mid-checkout, on a multi-thousand-dollar booking.
 *
 * Important reassurance: several failure points sit AFTER the reservation is
 * written (the success page read, for instance). A guest who sees an error may
 * already have a confirmed booking, so this page must never imply the booking
 * failed, and must not push them to book again and double-pay.
 */
export default function BookingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface it in the server/browser logs — the previous behaviour swallowed
    // some of these silently, which made them very hard to trace.
    console.error("[booking] route error:", error);
  }, [error]);

  return (
    <main className="hathor-booking-error">
      <div className="hathor-booking-error__card">
        <p className="hathor-booking-error__eyebrow">Hathor Dahabiya</p>

        <h1 className="hathor-booking-error__title">
          Something interrupted your booking
        </h1>

        <p className="hathor-booking-error__body">
          We hit a problem loading this page. <strong>If you had already
          reached the confirmation step, your reservation may well have gone
          through</strong> — please check your email before booking again.
        </p>

        <div className="hathor-booking-error__actions">
          <button
            type="button"
            onClick={reset}
            className="hathor-booking-error__btn hathor-booking-error__btn--primary"
          >
            Try again
          </button>
          <Link
            href="/"
            className="hathor-booking-error__btn hathor-booking-error__btn--ghost"
          >
            Return home
          </Link>
        </div>

        <p className="hathor-booking-error__help">
          Still stuck? Email{" "}
          <a href="mailto:hathoregy026@gmail.com">hathoregy026@gmail.com</a> and
          we will complete your reservation by hand.
          {error.digest && (
            <>
              {" "}
              <span className="hathor-booking-error__ref">
                Reference: {error.digest}
              </span>
            </>
          )}
        </p>
      </div>

      <style>{`
        .hathor-booking-error {
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1.25rem;
          background: #ece8df;
          color: #2c2824;
        }
        .hathor-booking-error__card {
          width: 100%;
          max-width: 34rem;
          background: #ffffff;
          border: 1px solid rgba(182, 159, 100, 0.35);
          border-radius: 1.25rem;
          padding: 2.5rem 2rem;
          box-shadow: 0 24px 60px -30px rgba(44, 40, 36, 0.35);
          text-align: center;
        }
        .hathor-booking-error__eyebrow {
          font-size: 0.6875rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #b69f64;
          margin-bottom: 1.25rem;
        }
        .hathor-booking-error__title {
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(1.5rem, 4vw, 2rem);
          line-height: 1.2;
          margin-bottom: 1rem;
        }
        .hathor-booking-error__body {
          font-size: 0.9375rem;
          line-height: 1.65;
          color: #5a5249;
          margin-bottom: 1.75rem;
        }
        .hathor-booking-error__actions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        @media (min-width: 480px) {
          .hathor-booking-error__actions {
            flex-direction: row;
            justify-content: center;
          }
        }
        .hathor-booking-error__btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 2.875rem;
          padding: 0 1.5rem;
          border-radius: 999px;
          font-size: 0.8125rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background-color 200ms ease, color 200ms ease;
        }
        .hathor-booking-error__btn--primary {
          background: #b69f64;
          color: #ffffff;
          border: 1px solid #b69f64;
        }
        .hathor-booking-error__btn--primary:hover {
          background: #a68f57;
        }
        .hathor-booking-error__btn--ghost {
          background: transparent;
          color: #2c2824;
          border: 1px solid rgba(44, 40, 36, 0.25);
        }
        .hathor-booking-error__btn--ghost:hover {
          background: rgba(44, 40, 36, 0.05);
        }
        .hathor-booking-error__help {
          margin-top: 1.75rem;
          font-size: 0.8125rem;
          line-height: 1.6;
          color: #7a7268;
        }
        .hathor-booking-error__help a {
          color: #b69f64;
          text-decoration: underline;
        }
        .hathor-booking-error__ref {
          display: inline-block;
          margin-top: 0.5rem;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 0.6875rem;
          color: #9a9289;
        }
      `}</style>
    </main>
  );
}
