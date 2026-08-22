"use client";

import { usePublicTheme } from "./PublicThemeProvider";

/** Ref sun: eight rays, left half of the disk filled. */
function RefSunIcon() {
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
        strokeWidth="1.35"
        strokeLinecap="round"
      >
        <path d="M12 2.15v1.65" />
        <path d="M12 20.2v1.65" />
        <path d="M2.15 12h1.65" />
        <path d="M20.2 12h1.65" />
        <path d="M5.02 5.02l1.18 1.18" />
        <path d="M17.8 17.8l1.18 1.18" />
        <path d="M5.02 18.98l1.18-1.18" />
        <path d="M17.8 6.2l1.18-1.18" />
      </g>
      <circle
        cx="12"
        cy="12"
        r="4.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.35"
      />
      <path fill="currentColor" d="M12 7.8A4.2 4.2 0 0 0 12 16.2V7.8Z" />
    </svg>
  );
}

/** Ref moon: left-facing gold crescent. */
function RefMoonIcon() {
  return (
    <svg
      className="public-theme-toggle__icon"
      viewBox="0 0 24 24"
      aria-hidden
      focusable="false"
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.1 5.1A7.05 7.05 0 1 1 8.4 18.7 5.55 5.55 0 1 0 15.1 5.1Z"
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
          {isDay ? "day mode" : "night mode"}
        </span>
      </span>
      <span className="sr-only">
        {isDay ? "Day mode, switch to night mode" : "Night mode, switch to day mode"}
      </span>
    </button>
  );
}
