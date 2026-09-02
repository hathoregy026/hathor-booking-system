"use client";

import { usePublicTheme } from "./PublicThemeProvider";

/** Ref sun: solid core, eight even rays. */
function RefSunIcon() {
  return (
    <svg
      className="public-theme-toggle__icon"
      viewBox="0 0 24 24"
      aria-hidden
      focusable="false"
    >
      <circle cx="12" cy="12" r="3.9" fill="currentColor" />
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      >
        <path d="M12 1.9v2.4" />
        <path d="M12 19.7v2.4" />
        <path d="M1.9 12h2.4" />
        <path d="M19.7 12h2.4" />
        <path d="M4.86 4.86 6.56 6.56" />
        <path d="M17.44 17.44l1.7 1.7" />
        <path d="M4.86 19.14l1.7-1.7" />
        <path d="M17.44 6.56l1.7-1.7" />
      </g>
    </svg>
  );
}

/** Ref moon: solid crescent opening up-right, with a small sparkle. */
function RefMoonIcon() {
  return (
    <svg
      className="public-theme-toggle__icon"
      viewBox="0 0 24 24"
      aria-hidden
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M13.9 3.4a8.7 8.7 0 1 0 7.35 12.28A7.05 7.05 0 0 1 13.9 3.4Z"
      />
      <path
        fill="currentColor"
        d="M18.55 2.5c.24 1.42.78 1.96 2.2 2.2-1.42.24-1.96.78-2.2 2.2-.24-1.42-.78-1.96-2.2-2.2 1.42-.24 1.96-.78 2.2-2.2Z"
      />
    </svg>
  );
}

export function PublicThemeToggle() {
  const { theme, toggleTheme } = usePublicTheme();
  const isDay = theme === "day";

  return (
    <button
      type="button"
      className={`public-theme-toggle public-theme-toggle--switch cursor-hover${
        isDay ? " is-day" : " is-night"
      }`}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleTheme();
      }}
      aria-label={isDay ? "Switch to night mode" : "Switch to day mode"}
      aria-pressed={!isDay}
      title={isDay ? "Day mode" : "Night mode"}
    >
      <span className="public-theme-toggle__track">
        <span className="public-theme-toggle__thumb">
          {isDay ? <RefSunIcon /> : <RefMoonIcon />}
        </span>
        <span className="public-theme-toggle__label" aria-hidden="true">
          {isDay ? "daymode" : "nightmode"}
        </span>
      </span>
      <span className="sr-only">
        {isDay ? "Day mode, switch to night mode" : "Night mode, switch to day mode"}
      </span>
    </button>
  );
}
