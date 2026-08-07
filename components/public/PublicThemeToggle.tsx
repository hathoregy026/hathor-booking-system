"use client";

import { usePublicTheme } from "./PublicThemeProvider";

/** Hathor horned-disk mark — branded core of sun/moon icons. */
function HathorMark() {
  return (
    <g>
      <path
        fill="currentColor"
        d="M187.27,108.72c-11.57-19.94-29.83-32.78-51.04-38.6-.52-2.21,1.51-3.61,3.62-3.48,15.92.95,30.3,7.08,42.95,16.42,26.04,19.26,39.24,49.58,36.15,81.78-3.35,34.98-25.97,63.78-59.32,75.56-37.03,13.08-79.34,3.08-106.27-25.72-11.6-12.41-18.19-27.24-21.19-43.61-8.77-47.89,20.2-93.48,67.49-105.25,1.66-.41,2.94.58,3.05,1.75.08.84-.13,2.82-1.53,3.39-26.88,10.86-46.45,33.79-52.11,62.66-5.36,27.33,1.86,55.75,20.28,76.6,13.45,15.22,31.74,22.81,51.77,23.73,26.75,1.23,50.97-11.27,65.12-34.08,17.08-27.55,17.61-62.59,1.04-91.15Z"
      />
      <path
        fill="currentColor"
        d="M149.11,38.49c-9.1,4.38-18.24,3.66-26.23-1.54l-11.98-7.8-10.76-1.82c-.8-.14-1.79-.83-2.11-1.37-1.42-2.4,8.89-8.67,18.74-1.61,12.61,9.04,28.02,8.69,39.93-1.33,1.43-1.2,4.14-1.18,5.69-.73,1.44.41,3.7,2.76,2.27,4.98-3.45,5.32-9.62,8.37-15.56,11.23Z"
      />
      <circle fill="currentColor" cx="132.07" cy="13.08" r="9.15" />
    </g>
  );
}

/** Branded sun: Hathor mark as the solar disk + rays. */
function BrandedSunIcon() {
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
        strokeWidth="1.25"
        strokeLinecap="round"
      >
        <path d="M12 1.9v2" />
        <path d="M12 20.1v2" />
        <path d="M1.9 12h2" />
        <path d="M20.1 12h2" />
        <path d="M4.7 4.7l1.4 1.4" />
        <path d="M17.9 17.9l1.4 1.4" />
        <path d="M4.7 19.3l1.4-1.4" />
        <path d="M17.9 6.1l1.4-1.4" />
      </g>
      <g transform="translate(5.35 5.2) scale(0.054)">
        <HathorMark />
      </g>
    </svg>
  );
}

/** Branded moon: centered Hathor mark + crescent + balanced stars. */
function BrandedMoonIcon() {
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
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.8 5.2a7.1 7.1 0 1 0 4.1 10.2 5.6 5.6 0 1 1-4.1-10.2Z"
      />
      <path
        fill="currentColor"
        d="M17.55 6.85l.28.84h.88l-.71.52.27.84-.72-.52-.71.52.27-.84-.71-.52h.88z"
      />
      <path
        fill="currentColor"
        d="M18.85 10.7l.18.54h.56l-.45.33.17.54-.46-.33-.45.33.18-.54-.46-.33h.56z"
      />
      <g transform="translate(5.1 5.35) scale(0.05)">
        <HathorMark />
      </g>
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
      aria-label={`Switch to ${isDay ? "night" : "day"} view`}
      aria-pressed={!isDay}
      title={`${isDay ? "Night" : "Day"} view`}
    >
      <span className="public-theme-toggle__track">
        <span className="public-theme-toggle__glyph public-theme-toggle__glyph--sun">
          <BrandedSunIcon />
        </span>
        <span className="public-theme-toggle__glyph public-theme-toggle__glyph--moon">
          <BrandedMoonIcon />
        </span>
        <span className="public-theme-toggle__thumb" aria-hidden>
          {isDay ? <BrandedSunIcon /> : <BrandedMoonIcon />}
        </span>
      </span>
      <span className="sr-only">{isDay ? "Day" : "Night"} view</span>
    </button>
  );
}
