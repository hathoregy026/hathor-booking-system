"use client";

import { usePublicTheme } from "./PublicThemeProvider";

/** Ref sun: disk with eight rays, inner half filled. */
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
        <path d="M12 2.2v1.7" />
        <path d="M12 20.1v1.7" />
        <path d="M2.2 12h1.7" />
        <path d="M20.1 12h1.7" />
        <path d="M5.05 5.05l1.2 1.2" />
        <path d="M17.75 17.75l1.2 1.2" />
        <path d="M5.05 18.95l1.2-1.2" />
        <path d="M17.75 6.25l1.2-1.2" />
      </g>
      <circle
        cx="12"
        cy="12"
        r="4.15"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.35"
      />
      <path fill="currentColor" d="M12 7.85a4.15 4.15 0 0 1 0 8.3Z" />
    </svg>
  );
}

/** Ref moon: gold crescent outline. */
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
        d="M14.6 5.15a7.05 7.05 0 1 0 4.05 10.15 5.55 5.55 0 1 1-4.05-10.15Z"
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
      title={isDay ? "Night mode" : "Day mode"}
    >
      <span className="public-theme-toggle__track">
        <span className="public-theme-toggle__label" aria-hidden="true">
          {isDay ? "night mode" : "day mode"}
        </span>
        <span className="public-theme-toggle__thumb">
          {isDay ? <RefSunIcon /> : <RefMoonIcon />}
        </span>
      </span>
      <span className="sr-only">
        {isDay ? "Day view, switch to night mode" : "Night view, switch to day mode"}
      </span>
    </button>
  );
}
