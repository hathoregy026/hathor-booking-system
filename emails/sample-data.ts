import type { BookingEmailDetails } from "@/lib/email-types";

/** Shared sample data for React Email preview and safe fallbacks. */
export const sampleBookingDetails: BookingEmailDetails = {
  bookingId: "HTH-2026-0042",
  guestName: "Amelia Carter",
  guestEmail: "amelia@example.com",
  guestPhone: "+20 127 049 6896",
  cruiseName: "7 Nights / 8 Days — Luxor to Aswan to Luxor",
  checkInDate: "July 4, 2026",
  checkOutDate: "July 11, 2026",
  roomType: "Luxury Rooms",
  guests: "2 adults, 0 children",
  totalPrice: "$4,200",
};

export const sampleGuestName = "Amelia Carter";
