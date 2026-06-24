import { Section, Text } from "@react-email/components";
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
    { label: "Total Price", value: details.totalPrice, bold: true, gold: true },
  );

  return rows;
}

function cellStyle(isAlt: boolean) {
  return {
    backgroundColor: isAlt ? emailColors.rowAlt : emailColors.card,
    borderBottom: `1px solid ${emailColors.border}`,
    padding: "12px 16px",
    verticalAlign: "top" as const,
    width: "50%",
  };
}

export function BookingSummary({
  details,
  showBookingReference = false,
  sectionTitle = "YOUR RESERVATION DETAILS",
}: BookingSummaryProps) {
  if (!details) {
    return null;
  }

  const rows = buildSummaryRows(details, showBookingReference);

  return (
    <Section style={{ margin: "32px 0" }}>
      <GoldSectionTitle>{sectionTitle}</GoldSectionTitle>
      <table
        role="presentation"
        cellPadding={0}
        cellSpacing={0}
        width="100%"
        style={{
          border: `1px solid ${emailColors.border}`,
          borderCollapse: "collapse",
          width: "100%",
        }}
      >
        <tbody>
          {rows.map((row, index) => {
            const isAlt = index % 2 === 1;
            return (
              <tr key={row.label}>
                <td style={cellStyle(isAlt)}>
                  <Text
                    style={{
                      color: emailColors.textSecondary,
                      fontFamily: emailFonts.sans,
                      fontSize: "13px",
                      fontWeight: 700,
                      letterSpacing: "1px",
                      lineHeight: "1.4",
                      margin: 0,
                      textTransform: "uppercase",
                    }}
                  >
                    {row.label}
                  </Text>
                </td>
                <td style={cellStyle(isAlt)}>
                  <Text
                    style={{
                      color: row.gold ? emailColors.goldDark : emailColors.textPrimary,
                      fontFamily: emailFonts.sans,
                      fontSize: "16px",
                      fontWeight: row.bold ? 700 : 400,
                      lineHeight: "1.6",
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
    </Section>
  );
}

export function GuestInfoTable({
  details,
  sectionTitle = "GUEST INFORMATION",
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
    { label: "Special Requests", value: "—" },
  ];

  return (
    <Section style={{ margin: "0 0 32px" }}>
      <GoldSectionTitle>{sectionTitle}</GoldSectionTitle>
      <table
        role="presentation"
        cellPadding={0}
        cellSpacing={0}
        width="100%"
        style={{
          border: `1px solid ${emailColors.border}`,
          borderCollapse: "collapse",
          width: "100%",
        }}
      >
        <tbody>
          {rows.map((row, index) => {
            const isAlt = index % 2 === 1;
            return (
              <tr key={row.label}>
                <td style={cellStyle(isAlt)}>
                  <Text
                    style={{
                      color: emailColors.textSecondary,
                      fontFamily: emailFonts.sans,
                      fontSize: "13px",
                      fontWeight: 700,
                      letterSpacing: "1px",
                      lineHeight: "1.4",
                      margin: 0,
                      textTransform: "uppercase",
                    }}
                  >
                    {row.label}
                  </Text>
                </td>
                <td style={cellStyle(isAlt)}>
                  <Text
                    style={{
                      color: emailColors.textPrimary,
                      fontFamily: emailFonts.sans,
                      fontSize: "16px",
                      lineHeight: "1.6",
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
    </Section>
  );
}
