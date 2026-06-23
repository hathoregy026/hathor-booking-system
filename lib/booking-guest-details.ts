type GuestDetailsInput = {
  fullName: string;
  phone: string;
  adults: number;
  children: number;
  specialRequests?: string;
};

/** Persist guest extras in customerName for admin visibility (no extra DB columns). */
export function buildBookingCustomerName(input: GuestDetailsInput): string {
  const lines = [input.fullName.trim()];

  if (input.phone.trim()) {
    lines.push(`Phone: ${input.phone.trim()}`);
  }

  lines.push(
    `Guests: ${input.adults} adult${input.adults === 1 ? "" : "s"}, ${input.children} child${input.children === 1 ? "" : "ren"}`,
  );

  if (input.specialRequests?.trim()) {
    lines.push(`Requests: ${input.specialRequests.trim()}`);
  }

  return lines.join("\n");
}
