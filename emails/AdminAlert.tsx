import { Section, Text } from "@react-email/components";
import type { BookingEmailDetails } from "@/lib/email-types";
import { BookingSummary } from "./components/BookingSummary";
import { EmailLayout } from "./components/EmailLayout";
import { emailColors } from "./styles";

type AdminAlertEmailProps = {
  details: BookingEmailDetails;
};

export default function AdminAlertEmail({ details }: AdminAlertEmailProps) {
  return (
    <EmailLayout preview="New Hathor booking request" title="New Booking Request!">
      <Text style={body}>
        A new booking has been submitted on the website.
      </Text>

      <Section style={guestBox}>
        <Text style={guestTitle}>Guest details</Text>
        <Text style={guestLine}>
          <strong>Name:</strong> {details.guestName}
        </Text>
        <Text style={guestLine}>
          <strong>Email:</strong> {details.guestEmail}
        </Text>
        {details.guestPhone ? (
          <Text style={guestLine}>
            <strong>Phone:</strong> {details.guestPhone}
          </Text>
        ) : null}
      </Section>

      <BookingSummary details={details} />
    </EmailLayout>
  );
}

const body = {
  color: emailColors.muted,
  fontSize: "14px",
  lineHeight: "1.7",
  margin: "0 0 16px",
};

const guestBox = {
  backgroundColor: emailColors.background,
  border: `1px solid ${emailColors.border}`,
  borderRadius: "8px",
  margin: "0 0 8px",
  padding: "16px 20px",
};

const guestTitle = {
  color: emailColors.goldLight,
  fontSize: "12px",
  fontWeight: 600,
  letterSpacing: "0.08em",
  margin: "0 0 12px",
  textTransform: "uppercase" as const,
};

const guestLine = {
  color: emailColors.cream,
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "0 0 6px",
};
