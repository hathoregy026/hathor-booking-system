"use client";

/**
 * Language switch — same pill geometry, knob and label treatment as
 * PublicThemeToggle, so the header reads as one control family.
 *
 * English only for now: the control announces the active language and is
 * marked as the current selection rather than pretending to toggle.
 */

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
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18" />
        <path d="M12 3c2.4 2.6 3.6 5.6 3.6 9s-1.2 6.4-3.6 9c-2.4-2.6-3.6-5.6-3.6-9S9.6 5.6 12 3Z" />
      </g>
    </svg>
  );
}

export function PublicLanguageToggle() {
  return (
    <button
      type="button"
      className="public-theme-toggle public-lang-toggle cursor-hover is-day"
      aria-label="Language: English"
      aria-disabled="true"
      title="English"
    >
      <span className="public-theme-toggle__track">
        <span className="public-theme-toggle__thumb">
          <GlobeIcon />
        </span>
        <span className="public-theme-toggle__label" aria-hidden="true">
          english
        </span>
        <span className="public-lang-toggle__phone-label" aria-hidden="true">
          EN
        </span>
      </span>
      <span className="sr-only">Site language: English</span>
    </button>
  );
}
