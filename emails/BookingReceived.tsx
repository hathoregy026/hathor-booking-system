import type { EmailTemplateOverrides } from "@/lib/email-templates";
import { resolveEmailBody, resolveEmailHeading } from "@/lib/email-templates";
import type { BookingEmailDetails } from "@/lib/email-types";
import { EMAIL_COPY } from "@/lib/i18n/email-copy";
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

export default function BookingReceivedEmail({
  guestName = sampleGuestName,
  details = sampleBookingDetails,
  logoUrl,
  heroImageUrl,
  primaryColor,
  backgroundColor,
  footer,
  heroHeading,
  bodyText,
}: BookingReceivedEmailProps) {
  const locale = details.locale ?? "en";
  const shared = EMAIL_COPY[locale];
  const copy = shared.received;
  const vars = { guestName, bookingCode: details.bookingCode ?? details.bookingId };
  const { heading, namesGuest } = resolveEmailHeading(heroHeading, copy.hero, vars);
  const body = resolveEmailBody(bodyText, copy.body, vars);

  return (
    <EmailLayout
      preview={copy.preview}
      locale={locale}
      footerVariant="guest"
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
      {details.bookingCode ? <BookingCodeCard code={details.bookingCode} trackUrl={details.bookingUrl} locale={locale} /> : null}
      <BookingSummary details={details} />
      <EmailInfoCard title={copy.nextTitle}>{copy.next}</EmailInfoCard>
      {details.bookingUrl ? <EmailCtaButton href={details.bookingUrl} label={shared.trackLabel} /> : null}
    </EmailLayout>
  );
}
