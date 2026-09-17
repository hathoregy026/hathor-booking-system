import type { getSailingAvailability } from "@/lib/availability-service";
import type { PhysicalRoomType } from "@/lib/physical-inventory";
import type { StayDurationValue } from "@/lib/booking-search-config";
import type { Arrangement } from "./allocation";

/** Shapes the booking journey reads from the existing engine endpoints. */

export type Sailing = Awaited<ReturnType<typeof getSailingAvailability>>[number];
export type RoomTypeAvailability = Sailing["types"][number];

export type HoldRoom = {
  roomType: PhysicalRoomType;
  adults: number;
  children: number;
  unitPriceCents: number;
};

export type PaymentStage = {
  milestone: string;
  dueAt: string | null;
  cumulativeCents: number;
};

export type Hold = {
  bookingId: string;
  accessToken: string;
  status: string;
  holdExpiresAt: string | null;
  totalPriceCents: number;
  currency?: string;
  requiredCents?: number;
  rooms: HoldRoom[];
  paymentSchedule: PaymentStage[];
};

export type Party = { adults: number; children: number; cabins: number };

export type GuestForm = {
  firstName: string;
  lastName: string;
  email: string;
  /** The number as typed, without the country code. */
  phone: string;
  /** ISO country code from the country menu; its dialling code prefixes the phone. */
  countryCode: string;
  country: string;
  dietary: string;
  transfers: string;
  requests: string;
  paymentMethod: "VISA" | "BANK_TRANSFER";
  termsAccepted: boolean;
  marketingOptIn: boolean;
};

/**
 * What the flow remembers between reloads. A hold exists only once the guest
 * presses Confirm request, so `hold` is set just for that short window.
 */
export type Attempt = {
  key: string;
  /** scheduleId + rooms payload; a different selection needs a new key. */
  signature: string;
  duration: StayDurationValue;
  scheduleId: string;
  adults: number;
  children: number;
  arrangement: Arrangement;
  hold?: Hold;
};

export const STORAGE_KEY = "hathor-journey-attempt-v2";

export const emptyGuestForm = (): GuestForm => ({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  countryCode: "",
  country: "",
  dietary: "",
  transfers: "",
  requests: "",
  paymentMethod: "VISA",
  termsAccepted: false,
  marketingOptIn: false,
});

/** Voyage money: "USD 7,000", with cents only when a total actually has them. */
export function money(cents: number): string {
  return `USD ${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(cents / 100)}`;
}

/** "1 Adult", "2 Adults" — the wording fix requested for the final UI. */
export function plural(count: number, one: string, many = `${one}s`): string {
  return `${count} ${count === 1 ? one : many}`;
}

export function partySummary(party: Party): string {
  const parts = [plural(party.adults, "Adult")];
  if (party.children > 0) parts.push(plural(party.children, "Child", "Children"));
  parts.push(plural(party.cabins, "Cabin"));
  return parts.join(" · ");
}

/** UTC-safe calendar helpers: sailing times are stored as UTC midnight. */
export function utcParts(iso: string) {
  const date = new Date(iso);
  return { year: date.getUTCFullYear(), month: date.getUTCMonth(), day: date.getUTCDate(), weekday: date.getUTCDay() };
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function monthLabel(year: number, month: number): string {
  return `${MONTHS[month]} ${year}`;
}

export function shortDate(iso: string): string {
  const { day, month, year } = utcParts(iso);
  return `${day} ${MONTHS[month].slice(0, 3)} ${year}`;
}

export function longDate(iso: string): string {
  const { weekday, day, month, year } = utcParts(iso);
  return `${WEEKDAYS[weekday]}, ${day} ${MONTHS[month]} ${year}`;
}

export function monthShort(iso: string): string {
  return MONTHS[utcParts(iso).month].slice(0, 3).toUpperCase();
}

export function weekdayShort(iso: string): string {
  return WEEKDAYS[utcParts(iso).weekday].slice(0, 3).toUpperCase();
}

/** Wording for a stored payment stage, shared by the review and result screens. */
export function stageLabel(stage: PaymentStage): string {
  if (stage.milestone === "INITIAL") return "When Hathor sends your invoice";
  if (!stage.dueAt) return stage.milestone;
  const days = stage.milestone === "DAY_60" ? 60 : 45;
  return `By ${longDate(stage.dueAt)} · ${days} days before departure`;
}

export function rangeLabel(fromIso: string, toIso: string): string {
  const from = utcParts(fromIso);
  const to = utcParts(toIso);
  const fromPart = from.month === to.month && from.year === to.year ? `${from.day}` : `${from.day} ${MONTHS[from.month].slice(0, 3)}`;
  return `${fromPart}–${to.day} ${MONTHS[to.month].slice(0, 3)} ${to.year}`;
}

/** Longer date span for the voyage folio. */
export function folioRange(fromIso: string, toIso: string): string {
  return `${shortDate(fromIso)} – ${shortDate(toIso)}`;
}

/**
 * The phone number to send: the chosen country's code plus the number typed,
 * without spaces or a leading trunk 0. A number typed with its own "+" wins.
 */
export function internationalPhone(phone: string, dial: string | null): string {
  const digits = phone.replace(/[\s().-]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.startsWith("00")) return `+${digits.slice(2)}`;
  return dial ? `+${dial}${digits.replace(/^0+/, "")}` : digits;
}
