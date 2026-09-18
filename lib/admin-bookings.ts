export type AdminBookingCabin = {
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
  status: string;
  cruiseName: string;
  checkInDate: string;
  checkOutDate: string;
  departureTime: string;
  arrivalTime: string;
  rooms: string[];
  roomTypes: string[];
  cabins: AdminBookingCabin[];
  totalPriceCents: number;
  paidCents: number;
  /** The first stage of the payment schedule: what confirms the booking. */
  depositCents: number | null;
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
