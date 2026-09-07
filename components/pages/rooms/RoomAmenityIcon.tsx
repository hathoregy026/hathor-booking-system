import type { ReactElement } from "react";

type AmenityIconKind =
  | "screen"
  | "bath"
  | "safe"
  | "coffee"
  | "wifi"
  | "phone"
  | "minibar"
  | "laundry"
  | "smart"
  | "doctor"
  | "service"
  | "ac"
  | "hair"
  | "view"
  | "jacuzzi"
  | "smoke"
  | "space"
  | "default";

function resolveAmenityIcon(label: string): AmenityIconKind {
  const value = label.toLowerCase();
  if (value.includes("satellite") || value.includes("screen")) return "screen";
  if (value.includes("jacuzzi")) return "jacuzzi";
  if (value.includes("bathtub") || value.includes("shower")) return "bath";
  if (value.includes("safe")) return "safe";
  if (value.includes("tea") || value.includes("coffee")) return "coffee";
  if (value.includes("internet") || value.includes("wi-fi") || value.includes("wifi"))
    return "wifi";
  if (value.includes("telephone")) return "phone";
  if (value.includes("minibar") || value.includes("mini bar")) return "minibar";
  if (value.includes("laundry")) return "laundry";
  if (value.includes("smart")) return "smart";
  if (value.includes("doctor")) return "doctor";
  if (value.includes("room service")) return "service";
  if (value.includes("air condition")) return "ac";
  if (value.includes("hair")) return "hair";
  if (value.includes("nile view") || value.includes("panoramic")) return "view";
  if (value.includes("non-smoking") || value.includes("smoking")) return "smoke";
  if (value.includes("square") || value.includes("metre")) return "space";
  return "default";
}

/*
 * Cabin-edit marks. Every glyph is drawn on the same 24 grid at one hairline
 * weight so the outlined squares read as a single engraved set rather than as
 * borrowed pictograms.
 */
const GLYPHS: Record<AmenityIconKind, ReactElement> = {
  screen: (
    <>
      <rect x="2.9" y="4.8" width="18.2" height="12.4" rx="1.1" />
      <path d="M12 17.2v2.6" />
      <path d="M8.4 19.8h7.2" />
    </>
  ),
  bath: (
    <>
      <path d="M3.2 13h17.6v1.6a4 4 0 0 1-4 4H7.2a4 4 0 0 1-4-4z" />
      <path d="m6.6 18.6-.9 1.8" />
      <path d="m17.4 18.6.9 1.8" />
      <path d="M11 8.6V6.2a2 2 0 0 1 2-2h2.6" />
      <path d="M8.6 8.6h4.8l-1 1.9H9.6z" />
      <path d="M10 11.6v.9" />
      <path d="M12 11.9v.9" />
    </>
  ),
  safe: (
    <>
      <rect x="3.4" y="4.4" width="17.2" height="15.2" rx="1.1" />
      <rect x="6.6" y="7.4" width="10.8" height="9.2" rx="0.6" />
      <circle cx="12" cy="12" r="1.9" />
      <path d="M12 8.4v1.5" />
      <path d="M12 14.1v1.5" />
      <path d="M8.7 12h1.5" />
      <path d="M13.8 12h1.5" />
    </>
  ),
  coffee: (
    <>
      <path d="M5.2 9.4h9.1v4.4a4.5 4.5 0 0 1-4.5 4.5h-.1a4.5 4.5 0 0 1-4.5-4.5z" />
      <path d="M14.3 10.8h1.9a2.3 2.3 0 0 1 0 4.6h-1.9" />
      <path d="M4 20.4h12.4" />
      <path d="M8.2 6.9c0-1 1-1.3 1-2.3" />
      <path d="M11.4 6.9c0-1 1-1.3 1-2.3" />
    </>
  ),
  wifi: (
    <>
      <path d="M3.6 9.4a13 13 0 0 1 16.8 0" />
      <path d="M6.8 12.9a8.4 8.4 0 0 1 10.4 0" />
      <path d="M9.9 16.3a3.7 3.7 0 0 1 4.2 0" />
      <circle cx="12" cy="19.3" r="0.85" />
    </>
  ),
  phone: (
    <>
      <path d="M6.5 3.6 9 4.5l.9 3.3-2 1.4a10.6 10.6 0 0 0 4.9 4.9l1.4-2 3.3.9.9 2.5a1.7 1.7 0 0 1-1.8 2.2A14.6 14.6 0 0 1 4.3 5.4a1.7 1.7 0 0 1 2.2-1.8z" />
    </>
  ),
  minibar: (
    <>
      <rect x="6.4" y="3.2" width="11.2" height="17.6" rx="1.2" />
      <path d="M6.4 10.2h11.2" />
      <path d="M14.9 6.1v2.2" />
      <path d="M14.9 12.2v2.4" />
    </>
  ),
  laundry: (
    <>
      <path d="M12 8.6V7.9a1.85 1.85 0 1 0-1.85 1.85" />
      <path d="m12 8.6-8.5 7.1a1 1 0 0 0 .65 1.77h15.7a1 1 0 0 0 .65-1.77z" />
    </>
  ),
  smart: (
    <>
      <rect x="6.7" y="3" width="10.6" height="18" rx="1.6" />
      <path d="M10.2 5.4h3.6" />
      <path d="M9.5 13.4a4 4 0 0 1 5 0" />
      <path d="M10.7 15.6a2.1 2.1 0 0 1 2.6 0" />
      <circle cx="12" cy="17.7" r="0.75" />
    </>
  ),
  doctor: (
    <>
      <path d="M9.5 3.6h5v4.9h4.9v5h-4.9v4.9h-5v-4.9H4.6v-5h4.9z" />
    </>
  ),
  service: (
    <>
      <path d="M3.4 16.4a8.6 8.6 0 0 1 17.2 0z" />
      <path d="M2.4 16.4h19.2" />
      <path d="M12 7.8V6.4" />
      <circle cx="12" cy="5.4" r="0.95" />
    </>
  ),
  ac: (
    <>
      <path d="M12 2.8v18.4" />
      <path d="m4.03 7.4 15.94 9.2" />
      <path d="M4.03 16.6 19.97 7.4" />
      <path d="m9.9 4.9 2.1-2.1 2.1 2.1" />
      <path d="m9.9 19.1 2.1 2.1 2.1-2.1" />
      <path d="M5.23 9.48 4.03 7.4h2.4" />
      <path d="M18.77 9.48 19.97 7.4h-2.4" />
      <path d="M5.23 14.52 4.03 16.6h2.4" />
      <path d="M18.77 14.52 19.97 16.6h-2.4" />
    </>
  ),
  hair: (
    <>
      <path d="M3.8 8.6a4.8 4.8 0 0 1 4.8-4.8h5v9.6h-5a4.8 4.8 0 0 1-4.8-4.8z" />
      <path d="M13.6 5.6h2.8v6h-2.8" />
      <path d="M7.6 13.2v5a1.8 1.8 0 0 0 1.8 1.8h1.2a1.8 1.8 0 0 0 1.8-1.8v-5" />
      <path d="M18.5 6.6h2.1" />
      <path d="M18.5 8.6h2.1" />
      <path d="M18.5 10.6h2.1" />
    </>
  ),
  view: (
    <>
      <circle cx="12" cy="8.8" r="2.9" />
      <path d="M3.4 14.6c1.75-1.6 3.5-1.6 5.25 0s3.5 1.6 5.25 0 3.5-1.6 5.25 0" />
      <path d="M3.4 18.2c1.75-1.6 3.5-1.6 5.25 0s3.5 1.6 5.25 0 3.5-1.6 5.25 0" />
    </>
  ),
  jacuzzi: (
    <>
      <path d="M3.2 13h17.6v1.6a4 4 0 0 1-4 4H7.2a4 4 0 0 1-4-4z" />
      <path d="m6.6 18.6-.9 1.8" />
      <path d="m17.4 18.6.9 1.8" />
      <circle cx="8.5" cy="9.5" r="1.15" />
      <circle cx="12" cy="7.4" r="1.5" />
      <circle cx="15.5" cy="9.7" r="1" />
    </>
  ),
  smoke: (
    <>
      <path d="M4 15.6h11.6v2.7H4z" />
      <path d="M13.1 15.6v2.7" />
      <path d="M17.4 13c1.5-1.1 1.5-2.8 0-3.9" />
      <path d="M20.2 13c1.5-1.1 1.5-2.8 0-3.9" />
      <path d="M3.4 20.6 20.6 3.4" />
    </>
  ),
  space: (
    <>
      <rect x="4.4" y="5.2" width="15.2" height="13.6" rx="0.8" />
      <path d="M7.6 12h8.8" />
      <path d="m9 10.6-1.4 1.4 1.4 1.4" />
      <path d="m15 10.6 1.4 1.4-1.4 1.4" />
    </>
  ),
  default: (
    <>
      <path d="M12 4.4 19.6 12 12 19.6 4.4 12z" />
    </>
  ),
};

export type AmenityCaption = { wide: string; tight: string };

/*
 * Two captions per provision: the wide one rides the desktop ledger in small
 * caps, the tight one carries the phone grid. The untouched amenity sentence
 * still ships with every cell for assistive tech and the hover title.
 */
const KIND_CAPTIONS: Record<AmenityIconKind, AmenityCaption> = {
  screen: { wide: "TV", tight: "TV" },
  bath: { wide: "Bath / Shower", tight: "Bath" },
  safe: { wide: "Safe", tight: "Safe" },
  coffee: { wide: "Tea & Coffee", tight: "Coffee" },
  wifi: { wide: "Wi-Fi", tight: "Wi-Fi" },
  phone: { wide: "Telephone", tight: "Phone" },
  minibar: { wide: "Minibar", tight: "Minibar" },
  laundry: { wide: "Laundry", tight: "Laundry" },
  smart: { wide: "Smart Controls", tight: "Smart" },
  doctor: { wide: "Doctor", tight: "Doctor" },
  service: { wide: "Room Service", tight: "Service" },
  ac: { wide: "A/C", tight: "A/C" },
  hair: { wide: "Hair Dryer", tight: "Hair Dryer" },
  view: { wide: "Nile View", tight: "Nile View" },
  jacuzzi: { wide: "Jacuzzi", tight: "Jacuzzi" },
  smoke: { wide: "Non-Smoking", tight: "Smoke-Free" },
  space: { wide: "Room Size", tight: "Room Size" },
  default: { wide: "", tight: "" },
};

/*
 * The suite and royal lists bundle two or three provisions into one line, so
 * those keep a caption naming every part instead of the single-kind shorthand.
 */
const CAPTION_OVERRIDES: Record<string, AmenityCaption> = {
  "jacuzzi & dual toilets": { wide: "Jacuzzi & Dual WC", tight: "Jacuzzi & WC" },
  "jacuzzi & two luxurious bathrooms": {
    wide: "Jacuzzi & Baths",
    tight: "Jacuzzi & Baths",
  },
  "hair dryer & mini bar": { wide: "Dryer & Minibar", tight: "Dryer & Bar" },
  "smart entertainment system": { wide: "Smart System", tight: "Smart" },
  "room & laundry service": { wide: "Room & Laundry", tight: "Laundry" },
  "air conditioning & high-speed wi-fi": {
    wide: "A/C & Wi-Fi",
    tight: "A/C & Wi-Fi",
  },
  "coffee machine, mini bar, air conditioning": {
    wide: "Coffee · Bar · A/C",
    tight: "Coffee & Bar",
  },
};

export function resolveAmenityCaption(label: string): AmenityCaption {
  const override = CAPTION_OVERRIDES[label.trim().toLowerCase()];
  if (override) return override;
  const caption = KIND_CAPTIONS[resolveAmenityIcon(label)];
  return caption.wide ? caption : { wide: label, tight: label };
}

export function RoomAmenityIcon({ label }: { label: string }) {
  return (
    <span className="ac-charter__icon" aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {GLYPHS[resolveAmenityIcon(label)]}
      </svg>
    </span>
  );
}
