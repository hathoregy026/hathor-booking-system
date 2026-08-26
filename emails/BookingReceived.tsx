import type { EmailTemplateOverrides } from "@/lib/email-templates";
import { interpolateEmailText } from "@/lib/email-templates";
import type { BookingEmailDetails } from "@/lib/email-types";
import { BookingSummary } from "./components/BookingSummary";
import { EmailLayout } from "./components/EmailLayout";
import {
  EmailBodyText,
  EmailEyebrow,
  EmailHeading,
  EmailInfoCard,
  GoldDivider,
} from "./components/EmailUi";
import { sampleBookingDetails, sampleGuestName } from "./sample-data";

type BookingReceivedEmailProps = {
  guestName: string;
  details: BookingEmailDetails;
} & EmailTemplateOverrides;

export const PreviewProps: BookingReceivedEmailProps = {
  guestName: sampleGuestName,
  details: sampleBookingDetails,
};

const DEFAULT_HERO = "Thank You";
const DEFAULT_BODY =
  "Your booking request has been received. Our team is reviewing your reservation and will contact you within 24 hours to confirm your luxury Nile cruise experience.";

export default function BookingReceivedEmail({
  guestName = sampleGuestName,
  details = sampleBookingDetails,
  logoUrl,
  heroImageUrl,
  primaryColor,
  backgroundColor,
  heroHeading,
  bodyText,
}: BookingReceivedEmailProps) {
  const rawHeading = interpolateEmailText(heroHeading ?? DEFAULT_HERO, {
    guestName,
  });
  const heading = (rawHeading.split(",")[0] || DEFAULT_HERO).trim();
  const body = bodyText?.trim() || DEFAULT_BODY;

  return (
    <EmailLayout
      preview="Your Hathor cruise booking request has been received"
      footerVariant="guest"
      logoUrl={logoUrl}
      heroImageUrl={heroImageUrl}
      primaryColor={primaryColor}
      backgroundColor={backgroundColor}
    >
      <EmailEyebrow>Booking Request</EmailEyebrow>
      <EmailHeading>{heading}</EmailHeading>
      <EmailBodyText>For {guestName}</EmailBodyText>
      <GoldDivider />
      <EmailBodyText>{body}</EmailBodyText>
      <BookingSummary details={details} />
      <EmailInfoCard title="What happens next?">
        Our reservations team will verify availability and send you a
        confirmation email. No payment is required until your booking is
        confirmed.
      </EmailInfoCard>
    </EmailLayout>
  );
}
