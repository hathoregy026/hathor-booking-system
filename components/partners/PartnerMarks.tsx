/*
 * Partner marks for the "In Distinguished Company" band, drawn as vectors so
 * they stay sharp at every width (the band used to be a 1024px PNG).
 * Colours come from the --pc-* tokens on .partners-company, which is where
 * night mode remaps them.
 */

type MarkProps = { className?: string };

export function EasyTravMark({ className = "" }: MarkProps) {
  return (
    <svg
      className={`pc-mark pc-mark--easytrav ${className}`}
      viewBox="0 0 40 40"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id="pc-easytrav-sheen" cx="0.5" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#fff" stopOpacity="0.12" />
          <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.16" />
        </radialGradient>
      </defs>
      <rect className="pc-mark__tile" width="40" height="40" rx="0.7" />
      <rect width="40" height="40" rx="0.7" fill="url(#pc-easytrav-sheen)" />
      <g
        className="pc-mark__emblem"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(20 17.4) scale(1.16) translate(-20 -16)"
      >
        <path
          d="M18.2 16.9C15.9 15.8 15.6 12.4 17.6 10.8 19.6 9.2 22.6 10 22.9 12.4 23.2 14.6 21.2 16.4 18.8 17.4"
          strokeWidth="0.8"
        />
        <path
          d="M4.6 18.6C10.4 21.6 15.9 21.2 20.4 18.9 24.4 16.9 28 15.4 31.6 16.2"
          strokeWidth="1"
        />
        <path
          d="M9.2 20.6C14 22.6 19.4 22.4 24 20.6 27 19.4 29.4 19 32 19.6"
          strokeWidth="0.5"
        />
      </g>
      <text
        className="pc-mark__caps pc-mark__caps--tile"
        x="20"
        y="30.6"
        textAnchor="middle"
        textLength="35.2"
        lengthAdjust="spacing"
      >
        EASY TRAV
      </text>
      <text
        className="pc-mark__caps pc-mark__caps--tile pc-mark__caps--tag"
        x="20"
        y="34.2"
        textAnchor="middle"
        textLength="12.4"
        lengthAdjust="spacing"
      >
        TOURISM
      </text>
    </svg>
  );
}

export function BookingMark({ className = "" }: MarkProps) {
  return (
    <svg
      className={`pc-mark pc-mark--booking ${className}`}
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
    >
      <path
        className="pc-mark__ink"
        fillRule="evenodd"
        transform="scale(0.936 1)"
        d="M0 0H14.6C20.6 0 23.9 3 23.9 7.9 23.9 11.3 22.2 13.7 19.4 14.8 22.9 15.8 25 18.6 25 22.6 25 28.4 21.2 32 14.4 32H0ZM7.4 5.9V12.6H13.1C15.4 12.6 16.6 11.4 16.6 9.25 16.6 7.1 15.4 5.9 13.1 5.9ZM7.4 18.1V26H13.6C16.3 26 17.6 24.6 17.6 22.05 17.6 19.5 16.3 18.1 13.6 18.1Z"
      />
      <circle className="pc-mark__ink" cx="28.1" cy="28.1" r="3.75" />
    </svg>
  );
}

export function ExpediaMark({ className = "" }: MarkProps) {
  return (
    <svg
      className={`pc-mark pc-mark--expedia ${className}`}
      viewBox="0 0 62 39"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <clipPath id="pc-expedia-x-band">
          <rect x="9" y="27.2" width="9.4" height="8" />
        </clipPath>
      </defs>
      <rect
        className="pc-mark__tile"
        x="20.25"
        y="0"
        width="21"
        height="21"
        rx="4.4"
      />
      <path
        className="pc-mark__arrow"
        d="M25.9 15.6 34.4 7.1M27.6 6.2H35.1V13.7"
        fill="none"
        strokeWidth="2.3"
        strokeLinejoin="miter"
      />
      <g className="pc-mark__word" fill="none" strokeWidth="1.68">
        <path d="M1.64 24.2V35.2M0.8 25.04H8.4M1.64 29.7H7.8M0.8 34.36H8.6" />
        <path
          d="M10.1 26.2 17.1 36.2M17.1 26.2 10.1 36.2"
          clipPath="url(#pc-expedia-x-band)"
        />
        <path d="M19.04 27.2V38.8" />
        <circle cx="22.2" cy="31.2" r="3.16" />
        <path d="M28.14 31.2H34.46A3.16 3.16 0 1 0 33.79 33.15" />
        <circle cx="40.4" cy="31.2" r="3.16" />
        <path d="M43.56 24.2V35.2M46.45 27.2V35.2" />
        <circle cx="52.5" cy="31.2" r="3.16" />
        <path d="M55.66 27.2V35.2" />
      </g>
      <circle className="pc-mark__ink" cx="46.45" cy="25" r="1.1" />
      <g className="pc-mark__word" fill="none" strokeWidth="0.34">
        <circle cx="59.2" cy="25.3" r="1.2" />
        <path d="M58.75 26.05V24.55H59.35C59.8 24.55 59.8 25.3 59.35 25.3H58.75M59.25 25.3 59.7 26.05" />
      </g>
    </svg>
  );
}

export function XLuxuryMark({ className = "" }: MarkProps) {
  return (
    <svg
      className={`pc-mark pc-mark--xluxury ${className}`}
      viewBox="0 0 52 38"
      aria-hidden="true"
      focusable="false"
    >
      <path
        className="pc-mark__x"
        d="M12.4 0.9C15.8 0.3 18.6 1.4 21 4.6L36.9 22.6C38.6 24.8 40.6 25.7 44.2 25.6 41 27 37.4 26.9 35 24.3L18.6 5.9C16.8 3.4 15 1.7 12.4 0.9Z"
      />
      <path
        className="pc-mark__hair"
        d="M41.4 0.9 14.2 25.9"
        fill="none"
        strokeWidth="0.62"
      />
      <path
        className="pc-mark__hair"
        d="M9.4 0.75H18.4M36.2 0.75H45.2M10 26.05H18.8M35.6 26.05H45.4"
        fill="none"
        strokeWidth="0.5"
      />
      <text
        className="pc-mark__caps pc-mark__caps--x"
        x="26.2"
        y="37.4"
        textAnchor="middle"
        textLength="50.7"
        lengthAdjust="spacing"
      >
        X LUXURY
      </text>
    </svg>
  );
}
