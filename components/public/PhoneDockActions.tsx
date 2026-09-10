"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useBookNowModal } from "@/components/booking/BookingModalProvider";
import { SocialBrandIcon } from "@/components/public/SocialBrandIcon";
import { PUBLIC_CONTACT } from "@/lib/public-contact";
import { PUBLIC_SOCIAL_LINKS } from "@/lib/public-social";

/** Thin-stroke calendar — same line language as the dock heart, cart, and globe. */
function DockCalendarIcon() {
  return (
    <svg
      className="hsc__icon"
      viewBox="0 0 24 24"
      aria-hidden
      focusable="false"
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.45"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3.7" y="5.15" width="16.6" height="15.15" rx="2.1" />
        <path d="M3.7 9.55h16.6" />
        <path d="M8.05 3.55v3.2" />
        <path d="M15.95 3.55v3.2" />
      </g>
    </svg>
  );
}

/** Thin-stroke chat bubble — matches the dock mark stroke, not the floating gold pill. */
function DockChatIcon({ className = "hsc__icon" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden
      focusable="false"
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.45"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19.35 15.35A7.85 7.85 0 1 0 8.2 18.9L4.4 20.15l1.55-3.55A7.85 7.85 0 0 0 19.35 15.35Z" />
      </g>
    </svg>
  );
}

function DockCloseIcon() {
  return (
    <svg
      className="hsc__icon"
      viewBox="0 0 24 24"
      aria-hidden
      focusable="false"
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.45"
        strokeLinecap="round"
      >
        <path d="M7 7l10 10" />
        <path d="M17 7 7 17" />
      </g>
    </svg>
  );
}

export function PhoneDockBookNow() {
  const { openBooking } = useBookNowModal();

  return (
    <button
      type="button"
      className="hpd-book"
      aria-label="Book now"
      title="Book now"
      onClick={openBooking}
    >
      <span className="hsc__mark" aria-hidden="true">
        <DockCalendarIcon />
      </span>
    </button>
  );
}

export function PhoneDockContact() {
  const [open, setOpen] = useState(false);
  const [layerHost, setLayerHost] = useState<HTMLElement | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef(false);

  useEffect(() => {
    setLayerHost(document.body);
  }, []);

  const closeMenu = () => {
    closingRef.current = true;
    setOpen(false);
    window.setTimeout(() => {
      closingRef.current = false;
    }, 450);
  };

  useEffect(() => {
    if (!open) return;

    const closeOnOutsidePointer = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (rootRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      closeMenu();
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const menu = (
    <div
      className={`hpd-contact-layer${open ? " is-open" : ""}`}
    >
      <button
        type="button"
        className="hpd-contact__backdrop"
        aria-label="Close contact links"
        tabIndex={open ? 0 : -1}
        onPointerDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (open) closeMenu();
        }}
      />

      <div
        ref={menuRef}
        className="hpd-contact__menu"
        role="menu"
        aria-hidden={!open}
      >
        {PUBLIC_SOCIAL_LINKS.map((link, i) => (
          <a
            key={link.key}
            href={link.href}
            className="hpd-contact__link"
            role="menuitem"
            aria-label={link.label}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={open ? 0 : -1}
            style={{ transitionDelay: open ? `${40 + i * 35}ms` : "0ms" }}
          >
            <SocialBrandIcon
              platform={link.key}
              className="hpd-contact__brand"
            />
          </a>
        ))}

        <a
          href={PUBLIC_CONTACT.whatsappUrl}
          className="hpd-contact__link"
          role="menuitem"
          aria-label="WhatsApp"
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={open ? 0 : -1}
          style={{
            transitionDelay: open
              ? `${40 + PUBLIC_SOCIAL_LINKS.length * 35}ms`
              : "0ms",
          }}
        >
          <DockChatIcon className="hpd-contact__brand hpd-contact__brand--line" />
        </a>

        <a
          href={`tel:${PUBLIC_CONTACT.phone}`}
          className="hpd-contact__link"
          role="menuitem"
          aria-label={`Call ${PUBLIC_CONTACT.phoneDisplay}`}
          tabIndex={open ? 0 : -1}
          style={{
            transitionDelay: open
              ? `${40 + (PUBLIC_SOCIAL_LINKS.length + 1) * 35}ms`
              : "0ms",
          }}
        >
          <svg
            className="hpd-contact__brand hpd-contact__brand--line"
            viewBox="0 0 24 24"
            aria-hidden
            focusable="false"
          >
            <g
              fill="none"
              stroke="currentColor"
              strokeWidth="1.45"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8.2 4.8c.35 0 .66.22.78.55l1.1 3.05a.85.85 0 0 1-.22.9L8.7 10.5a11.2 11.2 0 0 0 4.8 4.8l1.2-1.16a.85.85 0 0 1 .9-.22l3.05 1.1c.33.12.55.43.55.78v2.35c0 .9-.8 1.6-1.68 1.45C10.3 18.7 5.3 13.7 4.4 6.48 4.25 5.6 4.95 4.8 5.85 4.8Z" />
            </g>
          </svg>
        </a>
      </div>
    </div>
  );

  return (
    <div
      ref={rootRef}
      className={`hpd-contact${open ? " is-open" : ""}`}
    >
      <button
        type="button"
        className="hpd-contact__toggle"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={open ? "Close contact links" : "Open contact links"}
        title="Contact"
        onClick={() => {
          if (closingRef.current) return;
          setOpen((current) => !current);
        }}
      >
        <span className="hsc__mark" aria-hidden="true">
          {open ? <DockCloseIcon /> : <DockChatIcon />}
        </span>
      </button>
      {layerHost ? createPortal(menu, layerHost) : null}
    </div>
  );
}
