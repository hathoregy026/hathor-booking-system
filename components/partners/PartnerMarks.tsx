/*
 * Partner marks for the "In Distinguished Company" band, drawn as vectors so
 * they stay sharp at every width (the band used to be a 1024px PNG).
 * Colours come from the --pc-* tokens on .partners-company, which is where
 * night mode remaps them.
 */

type MarkProps = { className?: string };

/**
 * Easy Trav's own logo, no ground: the sun open at its foot, two brush strokes
 * of river, Roman capitals and the tagline. Drawn on the logo's 1700-unit
 * board so every capital sits on the original letter's centre.
 */
export function EasyTravMark({ className = "" }: MarkProps) {
  return (
    <svg
      className={`pc-mark pc-mark--easytrav ${className}`}
      viewBox="-14 0 1728 760"
      aria-hidden="true"
      focusable="false"
    >
      <path
        className="pc-mark__hair"
        d="M731 191.3A111 111 0 1 1 916.6 166.9"
        fill="none"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <path
        className="pc-mark__x"
        d="M735 228C770 205 810 186 860 183C905 180 945 190 985 205C1040 226 1100 250 1176 243C1135 262 1080 258 1030 240C985 224 945 212 900 209C840 205 785 216 735 228Z"
      />
      <path
        className="pc-mark__x"
        d="M495 250C560 292 630 322 700 321C790 320 880 278 972 219C910 252 830 290 750 296C660 302 575 285 495 250Z"
      />
      <text className="pc-mark__roman" x="-11 176.4 409.8 575.2" y="585" fontSize="290">
        EASY
      </text>
      <text className="pc-mark__roman" x="901 1093.4 1308.9 1518.7" y="585" fontSize="290">
        TRAV
      </text>
      <text
        className="pc-mark__tagline"
        x="290"
        y="725"
        fontSize="100"
        textLength="1091"
        lengthAdjust="spacing"
      >
        Travel Made Easy
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
