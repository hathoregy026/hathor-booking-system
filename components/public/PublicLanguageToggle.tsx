"use client";

import { useEffect, useRef, useState } from "react";

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

/** English is active; German and Russian translations are coming soon. */
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
    const timer = window.setTimeout(() => setNotice(null), 2400);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const chooseLanguage = (language: "English" | "German" | "Russian") => {
    setOpen(false);
    setNotice(language === "English" ? null : `${language} is coming soon`);
  };

  return (
    <div ref={rootRef} className="public-lang-selector">
      <button
        type="button"
        className="public-lang-toggle cursor-hover"
        aria-label="Choose language. English selected"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="public-language-menu"
        title="Language: English"
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
          EN
        </span>
      </button>

      {open ? (
        <ul id="public-language-menu" className="public-lang-menu" role="menu">
          {(["English", "German", "Russian"] as const).map((language) => (
            <li key={language} role="none">
              <button
                type="button"
                role="menuitem"
                className="public-lang-menu__option"
                aria-current={language === "English" ? "true" : undefined}
                onClick={() => chooseLanguage(language)}
              >
                {language}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {notice ? (
        <div className="public-lang-notice" role="status" aria-live="polite">
          {notice}
        </div>
      ) : null}
    </div>
  );
}
