import type { EmailTemplateOverrides } from "@/lib/email-templates";
import { resolveEmailBody, resolveEmailHeading } from "@/lib/email-templates";
import type { BookingEmailDetails } from "@/lib/email-types";
import { TeamMessage } from "./components/BookingBlocks";
import { EmailLayout } from "./components/EmailLayout";
import { EmailBodyText, EmailCtaButton, EmailEyebrow, EmailHeading, GoldDivider } from "./components/EmailUi";
import { sampleBookingDetails, sampleGuestName, sampleTeamMessage } from "./sample-data";

type BookingMessageEmailProps = {
  guestName: string;
  details: BookingEmailDetails;
  message: string;
} & EmailTemplateOverrides;

export const PreviewProps: BookingMessageEmailProps = {
  guestName: sampleGuestName,
  details: sampleBookingDetails,
  message: sampleTeamMessage,
};

const DEFAULT_HERO = "A Note From Hathor";
const DEFAULT_BODY = "Simply reply to this email with any questions — our reservations team reads every message.";

export default function BookingMessageEmail({
  guestName = sampleGuestName,
  details = sampleBookingDetails,
  message = sampleTeamMessage,
  logoUrl,
  heroImageUrl,
  primaryColor,
  backgroundColor,
  heroHeading,
  bodyText,
}: BookingMessageEmailProps) {
  const vars = { guestName, bookingCode: details.bookingCode ?? details.bookingId };
  const { heading } = resolveEmailHeading(heroHeading, DEFAULT_HERO, vars);
  const body = resolveEmailBody(bodyText, DEFAULT_BODY, vars);
  const code = details.bookingCode ?? details.bookingId;

  return (
    <EmailLayout
      preview={`A message about your Hathor booking ${code}`}
      footerVariant="guest-reply"
      logoUrl={logoUrl}
      heroImageUrl={heroImageUrl}
      primaryColor={primaryColor}
      backgroundColor={backgroundColor}
    >
      <EmailEyebrow>Reservations</EmailEyebrow>
      <EmailHeading size="medium">{heading}</EmailHeading>
      <EmailBodyText>Dear {guestName} · Booking {code}</EmailBodyText>
      <GoldDivider />
      <TeamMessage text={message} spaceAfter />
      <EmailBodyText muted>{body}</EmailBodyText>
      {details.bookingUrl ? <EmailCtaButton href={details.bookingUrl} label="Track Your Booking" /> : null}
    </EmailLayout>
  );
}
