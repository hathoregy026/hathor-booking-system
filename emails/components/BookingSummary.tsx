import { Text } from "@react-email/components";
import { differenceInCalendarDays, parse } from "date-fns";
import type { BookingEmailDetails } from "@/lib/email-types";
import { emailColors, emailFonts } from "../styles";
import { GoldSectionTitle } from "./EmailLayout";

type BookingSummaryProps = {
  details: BookingEmailDetails;
  showBookingReference?: boolean;
  sectionTitle?: string;
};

type SummaryRow = {
  label: string;
  value: string;
  bold?: boolean;
  gold?: boolean;
};

function parseGuestCounts(guests: string): { adults: string; children: string } {
  const adultsMatch = guests.match(/(\d+)\s+adult/i);
  const childrenMatch = guests.match(/(\d+)\s+child/i);
  return {
    adults: adultsMatch?.[1] ?? guests,
    children: childrenMatch?.[1] ?? "0",
  };
}

function computeDuration(checkIn: string, checkOut: string): string {
  try {
    const start = parse(checkIn, "MMMM d, yyyy", new Date());
    const end = parse(checkOut, "MMMM d, yyyy", new Date());
    const nights = differenceInCalendarDays(end, start);
    if (nights <= 0) return "—";
    return `${nights} night${nights === 1 ? "" : "s"}`;
  } catch {
    return "—";
  }
}

function buildSummaryRows(
  details: BookingEmailDetails,
  showBookingReference: boolean,
): SummaryRow[] {
  const { adults, children } = parseGuestCounts(details.guests);
  const rows: SummaryRow[] = [];

  if (showBookingReference && details.bookingId) {
    rows.push({
      label: "Booking Reference",
      value: details.bookingId,
      bold: true,
    });
  }

  rows.push(
    { label: "Cruise Name", value: details.cruiseName },
    { label: "Departure Date", value: details.checkInDate },
    { label: "Return Date", value: details.checkOutDate },
    {
      label: "Duration",
      value: computeDuration(details.checkInDate, details.checkOutDate),
    },
    { label: "Room Type", value: details.roomType },
    { label: "Adults", value: adults },
    { label: "Children", value: children },
    ...(details.ratePlan
      ? [{ label: "Rate", value: details.ratePlan }]
      : []),
    { label: "Total Price", value: details.totalPrice, bold: true, gold: true },
  );

  return rows;
}

function labelCell(isAlt: boolean) {
  return {
    backgroundColor: isAlt ? emailColors.rowAlt : emailColors.paperWarm,
    borderBottom: `1px solid ${emailColors.borderSolid}`,
    padding: "14px 16px",
    verticalAlign: "top" as const,
    width: "42%",
  };
}

function valueCell(isAlt: boolean) {
  return {
    backgroundColor: isAlt ? emailColors.rowAlt : emailColors.paperWarm,
    borderBottom: `1px solid ${emailColors.borderSolid}`,
    padding: "14px 16px",
    verticalAlign: "top" as const,
    width: "58%",
  };
}

export function BookingSummary({
  details,
  showBookingReference = false,
  sectionTitle = "Your Reservation Details",
}: BookingSummaryProps) {
  if (!details) {
    return null;
  }

  const rows = buildSummaryRows(details, showBookingReference);

  return (
    <table
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      width="100%"
      style={{ borderCollapse: "collapse", margin: "32px 0 0" }}
    >
      <tbody>
        <tr>
          <td style={{ padding: 0 }}>
            <GoldSectionTitle>{sectionTitle}</GoldSectionTitle>
            <table
              role="presentation"
              cellPadding={0}
              cellSpacing={0}
              width="100%"
              style={{
                border: `1px solid ${emailColors.borderSolid}`,
                borderCollapse: "collapse",
                width: "100%",
              }}
            >
              <tbody>
                {rows.map((row, index) => {
                  const isAlt = index % 2 === 1;
                  const isLast = index === rows.length - 1;
                  const bottomBorder = isLast
                    ? `1px solid ${emailColors.borderSolid}`
                    : `1px solid ${emailColors.borderSolid}`;

                  return (
                    <tr key={row.label}>
                      <td
                        style={{
                          ...labelCell(isAlt),
                          borderBottom: bottomBorder,
                        }}
                      >
                        <Text
                          style={{
                            color: emailColors.goldDark,
                            fontFamily: emailFonts.body,
                            fontSize: "10px",
                            fontWeight: 600,
                            letterSpacing: "0.16em",
                            lineHeight: "1.4",
                            margin: 0,
                            textTransform: "uppercase",
                          }}
                        >
                          {row.label}
                        </Text>
                      </td>
                      <td
                        style={{
                          ...valueCell(isAlt),
                          borderBottom: bottomBorder,
                        }}
                      >
                        <Text
                          style={{
                            color: row.gold
                              ? emailColors.goldDark
                              : emailColors.ink,
                            fontFamily: row.gold
                              ? emailFonts.editorial
                              : emailFonts.body,
                            fontSize: row.gold ? "18px" : "14px",
                            fontWeight: row.bold ? 500 : 300,
                            lineHeight: "1.5",
                            margin: 0,
                            textAlign: "right",
                          }}
                        >
                          {row.value}
                        </Text>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export function GuestInfoTable({
  details,
  sectionTitle = "Guest Information",
}: {
  details: BookingEmailDetails;
  sectionTitle?: string;
}) {
  if (!details) {
    return null;
  }

  const rows: SummaryRow[] = [
    { label: "Full Name", value: details.guestName },
    { label: "Email", value: details.guestEmail },
    { label: "Phone Number", value: details.guestPhone ?? "—" },
    { label: "Special Requests", value: details.specialRequests || "None" },
  ];

  return (
    <table
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      width="100%"
      style={{ borderCollapse: "collapse", margin: "0 0 8px" }}
    >
      <tbody>
        <tr>
          <td style={{ padding: 0 }}>
            <GoldSectionTitle>{sectionTitle}</GoldSectionTitle>
            <table
              role="presentation"
              cellPadding={0}
              cellSpacing={0}
              width="100%"
              style={{
                border: `1px solid ${emailColors.borderSolid}`,
                borderCollapse: "collapse",
                width: "100%",
              }}
            >
              <tbody>
                {rows.map((row, index) => {
                  const isAlt = index % 2 === 1;
                  return (
                    <tr key={row.label}>
                      <td style={labelCell(isAlt)}>
                        <Text
                          style={{
                            color: emailColors.goldDark,
                            fontFamily: emailFonts.body,
                            fontSize: "10px",
                            fontWeight: 600,
                            letterSpacing: "0.16em",
                            lineHeight: "1.4",
                            margin: 0,
                            textTransform: "uppercase",
                          }}
                        >
                          {row.label}
                        </Text>
                      </td>
                      <td style={valueCell(isAlt)}>
                        <Text
                          style={{
                            color: emailColors.ink,
                            fontFamily: emailFonts.body,
                            fontSize: "14px",
                            fontWeight: 300,
                            lineHeight: "1.5",
                            margin: 0,
                            textAlign: "right",
                          }}
                        >
                          {row.value}
                        </Text>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
