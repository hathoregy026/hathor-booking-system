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
  if (value.includes("jacuzzi")) return "jacuzzi";
  if (value.includes("non-smoking") || value.includes("smoking")) return "smoke";
  if (value.includes("square") || value.includes("metre")) return "space";
  return "default";
}

const PATHS: Record<AmenityIconKind, string> = {
  screen:
    "M4 6h16v10H4zm2 12h12M9 20h6",
  bath: "M5 14h14l-1 4H6zm2-8a3 3 0 0 1 6 0v2H7z",
  safe: "M6 5h12v14H6zm6 4v4m-2-2h4",
  coffee: "M6 8h8v8H6zm8 2h2a2 2 0 0 1 0 4h-2",
  wifi: "M5 13a11 11 0 0 1 14 0M8.5 16a6 6 0 0 1 7 0M12 19h.01",
  phone: "M8 4h8l1 3-3 2 2 7-3 2-4-9-3 2z",
  minibar: "M7 4h10v16H7zm3 4v4m4-4v4",
  laundry: "M6 6h12v12H6zm6 3a3 3 0 1 1 0 6",
  smart: "M8 5h8v14H8zm4 11h.01",
  doctor: "M12 5v14M5 12h14",
  service: "M6 10h12v9H6zm3-5h6v5H9z",
  ac: "M4 12h16M12 4v16M7 7l10 10M17 7L7 17",
  hair: "M8 6h8v4a4 4 0 0 1-8 0zM12 14v4",
  view: "M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6zM12 15a3 3 0 1 0 0-6",
  jacuzzi: "M5 14c2-4 12-4 14 0M7 18h10",
  smoke: "M6 18h12M9 8c0-2 2-3 3-3s3 1 3 3",
  space: "M5 7h14v10H5zM9 11h6",
  default: "M6 6h12v12H6zm6 3v6",
};

export function RoomAmenityIcon({ label }: { label: string }) {
  const kind = resolveAmenityIcon(label);
  return (
    <span className="ac-charter__icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1">
        <path d={PATHS[kind]} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
