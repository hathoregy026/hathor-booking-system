import type { EmailTemplateOverrides } from "@/lib/email-templates";
import { resolveEmailBody, resolveEmailHeading } from "@/lib/email-templates";
import type { BookingEmailDetails } from "@/lib/email-types";
import { BookingCodeCard } from "./components/BookingBlocks";
import { BookingSummary } from "./components/BookingSummary";
import { EmailLayout } from "./components/EmailLayout";
import {
  EmailBodyText,
  EmailCtaButton,
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
  "Your booking request has been sent. Hathor reservations will contact you with the invoice and payment instructions. No payment has been collected.";

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
  const vars = { guestName, bookingCode: details.bookingCode ?? details.bookingId };
  const { heading, namesGuest } = resolveEmailHeading(heroHeading, DEFAULT_HERO, vars);
  const body = resolveEmailBody(bodyText, DEFAULT_BODY, vars);

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
      {namesGuest ? null : <EmailBodyText>For {guestName}</EmailBodyText>}
      <GoldDivider />
      <EmailBodyText>{body}</EmailBodyText>
      {details.bookingCode ? <BookingCodeCard code={details.bookingCode} trackUrl={details.bookingUrl} /> : null}
      <BookingSummary details={details} />
      <EmailInfoCard title="What happens next?">
        Our reservations team will review your request and email you an invoice for your chosen payment method. Once your deposit is received, we send your confirmation with the rest of the payment schedule.
      </EmailInfoCard>
      {details.bookingUrl ? <EmailCtaButton href={details.bookingUrl} label="Track Your Booking" /> : null}
    </EmailLayout>
  );
}
