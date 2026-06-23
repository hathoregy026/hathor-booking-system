import { Text } from "@react-email/components";
import type { BookingEmailDetails } from "@/lib/email-types";
import { BookingSummary } from "./components/BookingSummary";
import { EmailLayout } from "./components/EmailLayout";
import { emailColors } from "./styles";

type BookingReceivedEmailProps = {
  guestName: string;
  details: BookingEmailDetails;
};

export default function BookingReceivedEmail({
  guestName,
  details,
}: BookingReceivedEmailProps) {
  return (
    <EmailLayout
      preview="Your Hathor cruise booking request has been received"
      title="Booking Request Received"
    >
      <Text style={lead}>Dear {guestName},</Text>
      <Text style={body}>
        Thank you! Your booking request has been received. We are reviewing it
        and will contact you shortly to confirm.
      </Text>
      <BookingSummary details={details} />
      <Text style={body}>
        Our team will be in touch soon. If you have any questions in the
        meantime, please reply to the contact details on our website.
      </Text>
      <Text style={signOff}>
        Warm regards,
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
