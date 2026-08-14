type GuestDetailsInput = {
  fullName: string;
  phone: string;
  adults: number;
  children: number;
  specialRequests?: string;
};

export type ParsedBookingGuest = {
  guestName: string;
  guestPhone: string | null;
  partyLabel: string;
  partySize: number | null;
  specialRequests: string | null;
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

function parsePartySize(guestsLine: string): number | null {
  const adults = guestsLine.match(/(\d+)\s+adult/i);
  const children = guestsLine.match(/(\d+)\s+child/i);
  if (!adults && !children) return null;
  return Number(adults?.[1] ?? 0) + Number(children?.[1] ?? 0);
}

/**
 * Split the stuffed `customerName` blob into display columns.
 * Prisma Booking has no phone / party / requests fields.
 */
export function parseBookingCustomerName(
  customerName: string | null | undefined,
): ParsedBookingGuest {
  const raw = customerName?.trim() ?? "";
  if (!raw || raw === "—") {
    return {
      guestName: "Guest",
      guestPhone: null,
      partyLabel: "—",
      partySize: null,
      specialRequests: null,
    };
  }

  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const phoneLine = lines.find((line) => /^phone:/i.test(line));
  const guestsLine = lines.find((line) => /^guests:/i.test(line));
  const requestsLine = lines.find((line) => /^requests:/i.test(line));
  const guestName =
    lines.find(
      (line) =>
        !/^phone:/i.test(line) &&
        !/^guests:/i.test(line) &&
        !/^requests:/i.test(line),
    ) ?? "Guest";

  const partyLabel = guestsLine
    ? guestsLine.replace(/^guests:\s*/i, "").trim()
    : "—";

  return {
    guestName,
    guestPhone: phoneLine
      ? phoneLine.replace(/^phone:\s*/i, "").trim() || null
      : null,
    partyLabel: partyLabel || "—",
    partySize: guestsLine ? parsePartySize(guestsLine) : null,
    specialRequests: requestsLine
      ? requestsLine.replace(/^requests:\s*/i, "").trim() || null
      : null,
  };
}
