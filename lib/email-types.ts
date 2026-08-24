export type BookingEmailDetails = {
  bookingId: string;
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
};
