export type AdminBookingCabin = {
  /** The physical cabin (K01…R02), for "see it on the ship". */
  roomId?: string;
  type: string;
  adults: number;
  children: number;
  unitPriceCents: number;
};

/** Where a booking stands in Hathor's flow: request → invoice → paid deposit → confirmed. */
export type AdminBookingStage =
  | "hold"
  | "new"
  | "invoiced"
  | "confirmed"
  | "paid"
  | "declined"
  | "cancelled"
  | "expired";

export type AdminPaymentStage = { milestone: string; cumulativeCents: number; dueAt: string | null };

export type AdminBookingDto = {
  id: string;
  code: string;
  stage: AdminBookingStage;
  customerName: string;
  guestName: string;
  guestPhone: string | null;
  partyLabel: string;
  partySize: number | null;
  specialRequests: string | null;
  customerEmail: string;
  country: string | null;
  /** Set when the guest booked in a language other than English. */
  guestLocale?: "it";
  status: string;
  cruiseName: string;
  /** The voyage's slug (e.g. "4-nights-luxor-aswan"); the ship map opens on it. */
  cruiseSlug?: string;
  checkInDate: string;
  checkOutDate: string;
  departureTime: string;
  arrivalTime: string;
  rooms: string[];
  roomTypes: string[];
  cabins: AdminBookingCabin[];
  /** What the guest owes: the cabin quote plus any card surcharge. */
  totalPriceCents: number;
  /** The 2.5% online card surcharge included in totalPriceCents (0 for bank transfer). */
  cardSurchargeCents: number;
  paidCents: number;
  /** The first stage of the payment schedule: what confirms the booking. */
  depositCents: number | null;
  /** Every stage of the payment schedule, cumulative, in order. */
  paymentSchedule: AdminPaymentStage[];
  paymentMethod: string | null;
  requestedAt: string | null;
  acceptedAt: string | null;
  confirmedAt: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  guestEmailStatus: string;
  adminEmailStatus: string;
  createdAt: string;
  deletedAt: string | null;
};

/** Reasons staff may give when cancelling; hathor_administer_booking refuses any other. */
export const CANCEL_REASONS = [
  "CANCELLATION",
  "NO_SHOW",
  "EARLY_DEPARTURE",
  "HATHOR_CANCELLED",
  "UNAVOIDABLE_CIRCUMSTANCES",
  "SIGNIFICANT_CHANGE",
] as const;
export type CancelReason = (typeof CANCEL_REASONS)[number];

/** No cancellation fee: the Terms owe a full refund (sections 13, 2 and 12). */
export const ZERO_FEE_CANCEL_REASONS: readonly CancelReason[] = ["HATHOR_CANCELLED", "UNAVOIDABLE_CIRCUMSTANCES", "SIGNIFICANT_CHANGE"];

/** Every stored cancellationReason in words, the decline included. */
export const CANCELLATION_REASON_LABELS: Record<CancelReason | "HATHOR_DECLINED", string> = {
  CANCELLATION: "Guest cancelled",
  NO_SHOW: "No-show",
  EARLY_DEPARTURE: "Early departure",
  HATHOR_CANCELLED: "Hathor cancelled the voyage",
  UNAVOIDABLE_CIRCUMSTANCES: "Guest cancelled: unavoidable circumstances",
  SIGNIFICANT_CHANGE: "Guest cancelled after a significant change",
  HATHOR_DECLINED: "Request declined by Hathor",
};

export function cancellationReasonLabel(reason: string | null): string {
  if (!reason) return "—";
  return CANCELLATION_REASON_LABELS[reason as keyof typeof CANCELLATION_REASON_LABELS] ?? reason;
}

export function bookingStage(input: {
  status: string;
  acceptedAt: string | Date | null;
  cancellationReason: string | null;
  paidCents: number;
  totalPriceCents: number;
}): AdminBookingStage {
  switch (input.status) {
    case "PENDING_HOLD":
      return "hold";
    case "REQUESTED":
      return input.acceptedAt ? "invoiced" : "new";
    case "CONFIRMED":
      return input.totalPriceCents > 0 && input.paidCents >= input.totalPriceCents ? "paid" : "confirmed";
    case "CANCELLED":
      return input.cancellationReason === "HATHOR_DECLINED" ? "declined" : "cancelled";
    default:
      return "expired";
  }
}

export const STAGE_LABELS: Record<AdminBookingStage, string> = {
  hold: "Checkout hold",
  new: "New request",
  invoiced: "Invoice sent",
  confirmed: "Confirmed",
  paid: "Paid in full",
  declined: "Declined",
  cancelled: "Cancelled",
  expired: "Expired",
};

export const STAGE_HINTS: Record<AdminBookingStage, string> = {
  hold: "Guest is still at checkout — nothing sent yet",
  new: "Review it, then confirm to send the invoice",
  invoiced: "Waiting for the deposit — record it when received",
  confirmed: "Deposit received — balance follows the schedule",
  paid: "Everything is paid",
  declined: "Turned down — cabins released",
  cancelled: "Cancelled — cabins released",
  expired: "Checkout hold ran out",
};

/** True for a request or checkout hold that still needs the team. */
export function isPendingBookingStatus(status: string): boolean {
  const upper = status.toUpperCase();
  return upper === "REQUESTED" || upper === "PENDING" || upper === "PENDING_HOLD";
}

export function displayBookingStatus(status: string): string {
  if (status === "REQUESTED") return "Request received";
  if (isPendingBookingStatus(status)) return "Temporary hold";
  return status.replace(/_/g, " ");
}

export function paymentMethodLabel(method: string | null): string {
  if (method === "BANK_TRANSFER") return "Bank Transfer";
  if (method === "VISA") return "Visa";
  return "Not chosen";
}
