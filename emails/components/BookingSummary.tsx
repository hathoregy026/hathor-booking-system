import { Text } from "@react-email/components";
import { differenceInCalendarDays } from "date-fns";
import type { BookingEmailDetails } from "@/lib/email-types";
import { EMAIL_COPY, type EmailCopy } from "@/lib/i18n/email-copy";
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
  const childrenMatch = guests.match(/(\d+)\s+(?:child|bambin)/i);
  return {
    adults: adultsMatch?.[1] ?? guests,
    children: childrenMatch?.[1] ?? "0",
  };
}

function computeDuration(checkIn: string, checkOut: string, copy: EmailCopy): string {
  try {
    const start = copy.parseDate(checkIn);
    const end = copy.parseDate(checkOut);
    const nights = differenceInCalendarDays(end, start);
    if (nights <= 0) return "—";
    return copy.nights(nights);
  } catch {
    return "—";
  }
}

function buildSummaryRows(
  details: BookingEmailDetails,
  showBookingReference: boolean,
): SummaryRow[] {
  const copy = EMAIL_COPY[details.locale ?? "en"];
  const labels = copy.summary;
  const { adults, children } = parseGuestCounts(details.guests);
  const rows: SummaryRow[] = [];

  if (showBookingReference && details.bookingId) {
    rows.push({
      label: labels.code,
      value: details.bookingCode ?? details.bookingId,
      bold: true,
    });
  }

  rows.push(
    { label: labels.cruise, value: details.cruiseName },
    { label: labels.departure, value: details.checkInDate },
    { label: labels.returnDate, value: details.checkOutDate },
    {
      label: labels.duration,
      value: computeDuration(details.checkInDate, details.checkOutDate, copy),
    },
    { label: labels.room, value: details.roomType },
    { label: labels.adults, value: adults },
    { label: labels.children, value: children },
    ...(details.paymentMethod ? [{ label: labels.method, value: details.paymentMethod }] : []),
    ...(details.ratePlan
      ? [{ label: labels.rate, value: details.ratePlan }]
      : []),
    ...(details.cardSurcharge ? [{ label: labels.surcharge, value: details.cardSurcharge }] : []),
    { label: labels.total, value: details.totalPrice, bold: true, gold: true },
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
  sectionTitle,
  spaceAfter = false,
}: BookingSummaryProps & { spaceAfter?: boolean }) {
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
      style={{ borderCollapse: "collapse", margin: spaceAfter ? "32px 0 28px" : "32px 0 0" }}
    >
      <tbody>
        <tr>
          <td style={{ padding: 0 }}>
            <GoldSectionTitle>{sectionTitle ?? EMAIL_COPY[details.locale ?? "en"].summary.title}</GoldSectionTitle>
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
    ...(details.guestLanguage ? [{ label: "Guest language", value: details.guestLanguage }] : []),
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
