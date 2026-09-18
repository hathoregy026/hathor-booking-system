import type { BookingEmailDetails } from "@/lib/email-types";

/** Shared sample data for React Email preview and safe fallbacks. */
export const sampleBookingDetails: BookingEmailDetails = {
  bookingId: "3f2a91c0-5b7e-4c1a-9d2e-8f6b1a0c4e21",
  bookingCode: "HB-3F2A91C0",
  guestName: "Amelia Carter",
  guestEmail: "amelia@example.com",
  guestPhone: "+20 127 049 6896",
  cruiseName: "7 Nights / 8 Days — Luxor to Aswan to Luxor",
  checkInDate: "July 4, 2026",
  checkOutDate: "July 11, 2026",
  roomType: "Luxury King Cabin",
  guests: "2 adults, 0 children",
  totalPrice: "USD 7,000",
  paymentMethod: "Bank Transfer",
  amountPaid: "USD 2,100",
  balanceDue: "USD 4,900",
  paymentPlan: [
    { title: "Deposit to confirm", when: "On receipt of this invoice", amount: "USD 2,100", state: "due" },
    { title: "Second payment · 60 days before", when: "By May 5, 2026", amount: "USD 1,400", state: "upcoming" },
    { title: "Final balance · 45 days before", when: "By May 20, 2026", amount: "USD 3,500", state: "upcoming" },
  ],
};

export const sampleGuestName = "Amelia Carter";

export const sampleInvoiceInstructions =
  "Please transfer the deposit to:\nHathor Cruise — Bank account details\nIBAN: EG00 0000 0000 0000 0000 0000 000\nSWIFT: XXXXEGCX\n\nUse your booking code as the transfer reference.";

export const sampleTeamMessage =
  "Thank you for your note. Your cabin is on the upper deck with a Nile view, and we have added the vegetarian menu for both guests.\n\nPlease let us know if anything else would make the voyage perfect.";
