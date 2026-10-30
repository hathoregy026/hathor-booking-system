import type { EmailTemplateOverrides } from "@/lib/email-templates";
import { resolveEmailBody, resolveEmailHeading } from "@/lib/email-templates";
import type { BookingEmailDetails } from "@/lib/email-types";
import { EMAIL_COPY } from "@/lib/i18n/email-copy";
import { localizedHref } from "@/lib/i18n/locale";
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

export default function BookingDeclinedEmail({
  guestName = sampleGuestName,
  details = sampleBookingDetails,
  message,
  logoUrl,
  heroImageUrl,
  primaryColor,
  backgroundColor,
  footer,
  heroHeading,
  bodyText,
}: BookingDeclinedEmailProps) {
  const locale = details.locale ?? "en";
  const shared = EMAIL_COPY[locale];
  const copy = shared.declined;
  const vars = { guestName, bookingCode: details.bookingCode ?? details.bookingId };
  const { heading, namesGuest } = resolveEmailHeading(heroHeading, copy.hero, vars);
  const body = resolveEmailBody(bodyText, copy.body, vars);

  return (
    <EmailLayout
      preview={copy.preview}
      locale={locale}
      footerVariant="guest-reply"
      logoUrl={logoUrl}
      heroImageUrl={heroImageUrl}
      primaryColor={primaryColor}
      backgroundColor={backgroundColor}
      footer={footer}
    >
      <EmailEyebrow>{copy.eyebrow}</EmailEyebrow>
      <EmailHeading>{heading}</EmailHeading>
      {namesGuest ? null : <EmailBodyText>{shared.forGuestPrefix}{guestName}</EmailBodyText>}
      <GoldDivider />
      <EmailBodyText>{body}</EmailBodyText>
      {message?.trim() ? <TeamMessage title={copy.note} text={message} /> : null}
      <BookingSummary details={details} showBookingReference sectionTitle={copy.section} spaceAfter />
      <EmailCtaButton href={`${SITE_URL}${localizedHref("/booking", locale)}`} label={copy.cta} />
    </EmailLayout>
  );
}
