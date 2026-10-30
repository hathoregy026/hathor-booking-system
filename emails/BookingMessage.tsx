import type { EmailTemplateOverrides } from "@/lib/email-templates";
import { resolveEmailBody, resolveEmailHeading } from "@/lib/email-templates";
import type { BookingEmailDetails } from "@/lib/email-types";
import { EMAIL_COPY } from "@/lib/i18n/email-copy";
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

export default function BookingMessageEmail({
  guestName = sampleGuestName,
  details = sampleBookingDetails,
  message = sampleTeamMessage,
  logoUrl,
  heroImageUrl,
  primaryColor,
  backgroundColor,
  footer,
  heroHeading,
  bodyText,
}: BookingMessageEmailProps) {
  const locale = details.locale ?? "en";
  const shared = EMAIL_COPY[locale];
  const copy = shared.message;
  const vars = { guestName, bookingCode: details.bookingCode ?? details.bookingId };
  const { heading } = resolveEmailHeading(heroHeading, copy.hero, vars);
  const body = resolveEmailBody(bodyText, copy.body, vars);
  const code = details.bookingCode ?? details.bookingId;

  return (
    <EmailLayout
      preview={copy.preview(code)}
      locale={locale}
      footerVariant="guest-reply"
      logoUrl={logoUrl}
      heroImageUrl={heroImageUrl}
      primaryColor={primaryColor}
      backgroundColor={backgroundColor}
      footer={footer}
    >
      <EmailEyebrow>{copy.eyebrow}</EmailEyebrow>
      <EmailHeading size="medium">{heading}</EmailHeading>
      <EmailBodyText>{copy.dear}{guestName}{copy.booking}{code}</EmailBodyText>
      <GoldDivider />
      <TeamMessage text={message} spaceAfter />
      <EmailBodyText muted>{body}</EmailBodyText>
      {details.bookingUrl ? <EmailCtaButton href={details.bookingUrl} label={shared.trackLabel} /> : null}
    </EmailLayout>
  );
}
