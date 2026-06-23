import { Section, Text } from "@react-email/components";
import type { BookingEmailDetails } from "@/lib/email-types";
import { emailColors, emailFonts } from "../styles";

type BookingSummaryProps = {
  details: BookingEmailDetails;
};

export function BookingSummary({ details }: BookingSummaryProps) {
  const rows: { label: string; value: string }[] = [
    { label: "Cruise", value: details.cruiseName },
    { label: "Dates", value: `${details.checkInDate} – ${details.checkOutDate}` },
    { label: "Room", value: details.roomType },
    { label: "Guests", value: details.guests },
    { label: "Total", value: details.totalPrice },
  ];

  if (details.bookingId) {
    rows.unshift({ label: "Reference", value: details.bookingId });
  }

  return (
    <Section style={summaryBox}>
      <Text style={summaryTitle}>Booking summary</Text>
      {rows.map((row) => (
        <Section key={row.label} style={rowStyle}>
          <Text style={label}>{row.label}</Text>
          <Text style={value}>{row.value}</Text>
        </Section>
      ))}
    </Section>
  );
}

const summaryBox = {
  backgroundColor: "rgba(201, 162, 39, 0.08)",
  border: `1px solid ${emailColors.border}`,
  borderRadius: "8px",
  margin: "24px 0",
  padding: "20px",
};

const summaryTitle = {
  color: emailColors.goldLight,
  fontFamily: emailFonts.serif,
  fontSize: "14px",
  fontWeight: 600,
  letterSpacing: "0.08em",
  margin: "0 0 16px",
  textTransform: "uppercase" as const,
};

const rowStyle = {
  marginBottom: "10px",
};

const label = {
  color: emailColors.muted,
  fontSize: "11px",
  letterSpacing: "0.06em",
  margin: "0 0 2px",
  textTransform: "uppercase" as const,
};

const value = {
  color: emailColors.cream,
  fontSize: "14px",
  lineHeight: "1.5",
  margin: 0,
};
