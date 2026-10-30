import type { EmailTemplateOverrides } from "@/lib/email-templates";
import { resolveEmailBody, resolveEmailHeading } from "@/lib/email-templates";
import type { BookingEmailDetails } from "@/lib/email-types";
import { EMAIL_COPY } from "@/lib/i18n/email-copy";
import { AmountCallout, BookingCodeCard, PaymentPlanTable, TeamMessage } from "./components/BookingBlocks";
import { BookingSummary } from "./components/BookingSummary";
import { EmailLayout } from "./components/EmailLayout";
import { EmailBodyText, EmailCtaButton, EmailEyebrow, EmailHeading, GoldDivider } from "./components/EmailUi";
import { sampleBookingDetails, sampleGuestName, sampleInvoicePaymentLink } from "./sample-data";

type BookingInvoiceEmailProps = {
  guestName: string;
  details: BookingEmailDetails;
  /** The secure payment link the team pastes when confirming: the email's "Pay now" button. */
  paymentLink?: string;
  /** Anything else the team writes when confirming (bank details, a note). Optional. */
  instructions?: string;
} & EmailTemplateOverrides;

export const PreviewProps: BookingInvoiceEmailProps = {
  guestName: sampleGuestName,
  details: sampleBookingDetails,
  paymentLink: sampleInvoicePaymentLink,
};

export default function BookingInvoiceEmail({
  guestName = sampleGuestName,
  details = sampleBookingDetails,
  paymentLink,
  instructions,
  logoUrl,
  heroImageUrl,
  primaryColor,
  backgroundColor,
  footer,
  heroHeading,
  bodyText,
}: BookingInvoiceEmailProps) {
  const locale = details.locale ?? "en";
  const shared = EMAIL_COPY[locale];
  const copy = shared.invoice;
  const vars = { guestName, bookingCode: details.bookingCode ?? details.bookingId };
  const { heading, namesGuest } = resolveEmailHeading(heroHeading, copy.hero, vars);
  const body = resolveEmailBody(bodyText, copy.body, vars);
  const due = details.paymentPlan?.find(stage => stage.state === "due");
  const method = copy.method(details.paymentMethod);

  return (
    <EmailLayout
      preview={copy.preview(due?.amount)}
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

      {due ? (
        <AmountCallout
          label={copy.dueLabel}
          amount={due.amount}
          note={copy.dueNote({ percent: due.percent, total: details.totalPrice, method, surcharge: Boolean(details.cardSurcharge) })}
        />
      ) : null}
      {due && details.remainingAfterDue ? (
        <EmailBodyText muted>
          {copy.afterParts[0]}{details.remainingAfterDue.amount}{copy.afterParts[1]}{details.remainingAfterDue.when.charAt(0).toLowerCase()}{details.remainingAfterDue.when.slice(1)}{copy.afterParts[2]}
        </EmailBodyText>
      ) : null}

      {paymentLink ? (
        <>
          <EmailCtaButton href={paymentLink} label={copy.pay(due?.amount)} />
          <EmailBodyText muted>
            {copy.linkFallback}{paymentLink}
          </EmailBodyText>
        </>
      ) : null}

      {instructions?.trim() ? <TeamMessage title={copy.howToPay(method)} text={instructions} /> : null}

      {details.bookingCode ? <BookingCodeCard code={details.bookingCode} trackUrl={details.bookingUrl} locale={locale} /> : null}
      {details.paymentPlan ? <PaymentPlanTable stages={details.paymentPlan} locale={locale} /> : null}
      <BookingSummary details={details} showBookingReference spaceAfter />

      <EmailBodyText muted>{copy.closing}</EmailBodyText>

      {details.bookingUrl ? <EmailCtaButton href={details.bookingUrl} label={shared.trackLabel} /> : null}
    </EmailLayout>
  );
}
