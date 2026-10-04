export type EmailPaymentStage = {
  title: string;
  when: string;
  amount: string;
  /** This stage's share of the voyage total (30, 20, 50…). */
  percent?: number;
  state: "paid" | "due" | "upcoming";
};

export type BookingEmailDetails = {
  bookingId: string;
  recordedBySession?: string;
  /** Short code guests use to track the booking; shown instead of the raw id. */
  bookingCode?: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  cruiseName: string;
  checkInDate: string;
  checkOutDate: string;
  roomType: string;
  guests: string;
  totalPrice: string;
  ratePlan?: string;
  specialRequests?: string;
  bookingUrl?: string;
  /** Link to /admin/bookings/[id] for the team's copy. */
  adminUrl?: string;
  paymentMethod?: string;
  /** The 2.5% online card surcharge, already included in totalPrice. Absent for bank transfer. */
  cardSurcharge?: string;
  amountPaid?: string;
  balanceDue?: string;
  /** What is still owed once the amount due now is paid, and when the next payment falls. */
  remainingAfterDue?: { amount: string; when: string };
  paymentPlan?: EmailPaymentStage[];
};
