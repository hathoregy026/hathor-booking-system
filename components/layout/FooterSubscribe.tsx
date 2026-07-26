"use client";

import { FormEvent, useEffect, useId, useRef, useState } from "react";
import gsap from "gsap";
import { PUBLIC_CONTACT } from "@/lib/public-contact";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function FooterSubscribe() {
  const inputId = useId();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [focused, setFocused] = useState(false);

  const labelRef = useRef<HTMLSpanElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const arrowRef = useRef<HTMLSpanElement>(null);

  const labelUp = focused || email.length > 0;

  useEffect(() => {
    const label = labelRef.current;
    const line = lineRef.current;
    if (!label || !line) return;

    gsap.to(label, {
      yPercent: -50,
      y: labelUp ? -20 : 0,
      scale: labelUp ? 0.75 : 1,
      duration: 0.45,
      ease: "power3.out",
      overwrite: "auto",
    });

    gsap.to(line, {
      width: focused ? "100%" : "0%",
      duration: 0.55,
      ease: "power3.out",
      overwrite: "auto",
    });
  }, [focused, labelUp]);

  useEffect(() => {
    const btn = btnRef.current;
    const arrow = arrowRef.current;
    if (!btn || !arrow) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const onMove = (event: MouseEvent) => {
      const rect = btn.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      gsap.to(btn, {
        x: x * 0.35,
        y: y * 0.35,
        duration: 0.45,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    const onLeave = () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.9,
        ease: "elastic.out(1, 0.4)",
        overwrite: "auto",
      });
      gsap.to(arrow, { x: 0, duration: 0.35, ease: "power2.out", overwrite: "auto" });
    };

    const onEnter = () => {
      gsap.to(arrow, { x: 5, duration: 0.4, ease: "power3.out", overwrite: "auto" });
    };

    btn.addEventListener("mousemove", onMove);
    btn.addEventListener("mouseleave", onLeave);
    btn.addEventListener("mouseenter", onEnter);

    return () => {
      btn.removeEventListener("mousemove", onMove);
      btn.removeEventListener("mouseleave", onLeave);
      btn.removeEventListener("mouseenter", onEnter);
      gsap.killTweensOf([btn, arrow]);
    };
  }, []);

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
    <form className="lux-footer__subscribe-form" onSubmit={onSubmit} noValidate>
      <div className="lux-footer__field">
        <div className="lux-footer__input-wrap">
          <label className="sr-only" htmlFor={inputId}>
            Email address
          </label>
          <input
            id={inputId}
            type="email"
            name="email"
            autoComplete="email"
            maxLength={254}
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (error) setError(null);
              if (sent) setSent(false);
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="lux-footer__input"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${inputId}-error` : undefined}
          />
          <span ref={labelRef} className="lux-footer__float-label" aria-hidden>
            Enter your email address
          </span>
          <span ref={lineRef} className="lux-footer__focus-line" aria-hidden />
        </div>
        <button
          ref={btnRef}
          type="submit"
          className="lux-footer__submit cursor-hover"
          aria-label="Subscribe"
        >
          <span ref={arrowRef} className="lux-footer__submit-arrow" aria-hidden>
            →
          </span>
        </button>
      </div>
      {error ? (
        <p id={`${inputId}-error`} className="lux-footer__subscribe-status" role="alert">
          {error}
        </p>
      ) : null}
      {sent && !error ? (
        <p className="lux-footer__subscribe-status" role="status">
          Opening your email client…
        </p>
      ) : null}
    </form>
  );
}
