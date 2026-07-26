"use client";

import { FormEvent, useId, useState } from "react";
import { Send } from "lucide-react";
import { PUBLIC_CONTACT } from "@/lib/public-contact";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function FooterSubscribe() {
  const inputId = useId();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = email.trim();

    if (!EMAIL_PATTERN.test(value) || value.length > 254) {
      setError("Please enter a valid email address.");
      setSent(false);
      return;
    }

    setError(null);
    setSent(true);

    const subject = encodeURIComponent("Hathor newsletter subscription");
    const body = encodeURIComponent(
      `Please subscribe this address to Hathor updates:\n\n${value}`,
    );
    window.location.href = `mailto:${PUBLIC_CONTACT.email}?subject=${subject}&body=${body}`;
  }

  return (
    <form className="owo-footer__subscribe-form" onSubmit={onSubmit} noValidate>
      <label className="sr-only" htmlFor={inputId}>
        Email Address
      </label>
      <div className="owo-footer__subscribe-row">
        <input
          id={inputId}
          type="email"
          name="email"
          autoComplete="email"
          maxLength={254}
          placeholder="Email Address"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (error) setError(null);
            if (sent) setSent(false);
          }}
          className="owo-footer__subscribe-input"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
        />
        <button
          type="submit"
          className="owo-footer__subscribe-btn cursor-hover"
          aria-label="Subscribe"
        >
          <Send aria-hidden className="owo-footer__subscribe-icon" />
        </button>
      </div>
      {error ? (
        <p id={`${inputId}-error`} className="owo-footer__subscribe-status" role="alert">
          {error}
        </p>
      ) : null}
      {sent && !error ? (
        <p className="owo-footer__subscribe-status" role="status">
          Opening your email client…
        </p>
      ) : null}
    </form>
  );
}
