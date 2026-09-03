"use client";

import { useEffect, useRef, useState } from "react";

const LANGUAGES = ["Arabic", "English", "German", "Russian"] as const;
type Language = (typeof LANGUAGES)[number];

const ACTIVE: Language = "English";

/** Fine-line meridian globe — same stroke language as the wishlist and cart marks. */
function GlobeIcon() {
  return (
    <svg
      className="public-theme-toggle__icon"
      viewBox="0 0 24 24"
      aria-hidden
      focusable="false"
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="8.4" />
        <path d="M3.6 12h16.8" />
        <path d="M5.1 7.2h13.8" />
        <path d="M5.1 16.8h13.8" />
        <path d="M12 3.6c2.25 2.45 3.38 5.25 3.38 8.4S14.25 17.95 12 20.4C9.75 17.95 8.62 15.15 8.62 12S9.75 6.05 12 3.6Z" />
      </g>
    </svg>
  );
}

/**
 * English is the active language; the others are announced as forthcoming.
 *
 * The menu stays mounted and is driven by an `is-open` class so it can animate
 * both in and out — unmounting it would make the close instant.
 */
export function PublicLanguageToggle() {
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const closeOnOutsidePointer = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && !rootRef.current?.contains(target)) {
        setOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 2600);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const chooseLanguage = (language: Language) => {
    setOpen(false);
    setNotice(language === ACTIVE ? null : `${language} — coming soon`);
  };

  return (
    <div
      ref={rootRef}
      className={`public-lang-selector${open ? " is-open" : ""}`}
    >
      <button
        type="button"
        className="public-lang-toggle cursor-hover"
        aria-label={`Language: ${ACTIVE}. Choose a language`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="public-language-menu"
        title={`Language: ${ACTIVE}`}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen((current) => !current);
        }}
      >
        <span className="public-lang-toggle__globe" aria-hidden="true">
          <GlobeIcon />
        </span>
        <span className="public-lang-toggle__code" aria-hidden="true">
          En
        </span>
      </button>

      <div
        className={`public-lang-menu${open ? " is-open" : ""}`}
        aria-hidden={!open}
      >
        <p className="public-lang-menu__eyebrow" aria-hidden="true">
          Language
        </p>
        <ul id="public-language-menu" className="public-lang-menu__list" role="menu">
          {LANGUAGES.map((language) => {
            const isActive = language === ACTIVE;
            return (
              <li key={language} role="none" className="public-lang-menu__row">
                <button
                  type="button"
                  role="menuitem"
                  className={`public-lang-menu__option${
                    isActive ? " is-active" : ""
                  }`}
                  aria-current={isActive ? "true" : undefined}
                  tabIndex={open ? 0 : -1}
                  onClick={() => chooseLanguage(language)}
                >
                  <span className="public-lang-menu__name">{language}</span>
                  <span className="public-lang-menu__mark" aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {notice ? (
        <div className="public-lang-notice" role="status" aria-live="polite">
          {notice}
        </div>
      ) : null}
    </div>
  );
}
