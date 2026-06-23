import { Text } from "@react-email/components";
import type { BookingEmailDetails } from "@/lib/email-types";
import { BookingSummary } from "./components/BookingSummary";
import { EmailLayout } from "./components/EmailLayout";
import { emailColors } from "./styles";

type BookingConfirmedEmailProps = {
  guestName: string;
  details: BookingEmailDetails;
};

export default function BookingConfirmedEmail({
  guestName,
  details,
}: BookingConfirmedEmailProps) {
  return (
    <EmailLayout
      preview="Your Hathor Dahabiya cruise is officially confirmed"
      title="Your Hathor Dahabiya Cruise is Confirmed!"
    >
      <Text style={lead}>Dear {guestName},</Text>
      <Text style={highlight}>
        Great news! Your reservation is officially confirmed. We look forward to
        welcoming you aboard.
      </Text>
      <BookingSummary details={details} />
      <Text style={body}>
        Please keep this email for your records. Should your plans change,
        contact us as soon as possible.
      </Text>
      <Text style={signOff}>
        Fair winds and calm waters,
        <br />
        The Hathor Team
      </Text>
    </EmailLayout>
  );
}

const lead = {
  color: emailColors.cream,
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0 0 16px",
};

const highlight = {
  color: emailColors.goldLight,
  fontSize: "15px",
  fontWeight: 600,
  lineHeight: "1.6",
  margin: "0 0 16px",
};

const body = {
  color: emailColors.muted,
  fontSize: "14px",
  lineHeight: "1.7",
  margin: "0 0 16px",
};

const signOff = {
  color: emailColors.goldLight,
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "8px 0 0",
};
