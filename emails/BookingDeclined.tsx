import type { EmailTemplateOverrides } from "@/lib/email-templates";
import { interpolateEmailText } from "@/lib/email-templates";
import type { BookingEmailDetails } from "@/lib/email-types";
import { TeamMessage } from "./components/BookingBlocks";
import { BookingSummary } from "./components/BookingSummary";
import { EmailLayout } from "./components/EmailLayout";
import { EmailBodyText, EmailCtaButton, EmailEyebrow, EmailHeading, GoldDivider } from "./components/EmailUi";
import { sampleBookingDetails, sampleGuestName } from "./sample-data";
import { SITE_URL } from "./styles";

type BookingDeclinedEmailProps = {
  guestName: string;
  details: BookingEmailDetails;
  message?: string;
} & EmailTemplateOverrides;

export const PreviewProps: BookingDeclinedEmailProps = {
  guestName: sampleGuestName,
  details: sampleBookingDetails,
  message: "The dates you chose are fully reserved for a private charter. We would be delighted to welcome you on the following Saturday sailing instead.",
};

const DEFAULT_HERO = "We're Sorry";
const DEFAULT_BODY =
  "Thank you for your interest in sailing with Hathor. Unfortunately we are unable to accept this booking request, and the cabins held for it have been released. No payment has been taken.";

export default function BookingDeclinedEmail({
  guestName = sampleGuestName,
  details = sampleBookingDetails,
  message,
  logoUrl,
  heroImageUrl,
  primaryColor,
  backgroundColor,
  heroHeading,
  bodyText,
}: BookingDeclinedEmailProps) {
  const heading = (interpolateEmailText(heroHeading ?? DEFAULT_HERO, { guestName }).split(",")[0] || DEFAULT_HERO).trim();
  const body = bodyText?.trim() || DEFAULT_BODY;

  return (
    <EmailLayout
      preview="An update on your Hathor booking request"
      footerVariant="guest-reply"
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
      {message?.trim() ? <TeamMessage title="A note from our reservations team" text={message} /> : null}
      <BookingSummary details={details} showBookingReference sectionTitle="The Request" spaceAfter />
      <EmailCtaButton href={`${SITE_URL}/booking`} label="Explore Other Dates" />
    </EmailLayout>
  );
}
