import type { EmailTemplateOverrides } from "@/lib/email-templates";
import { resolveEmailBody, resolveEmailHeading } from "@/lib/email-templates";
import type { BookingEmailDetails } from "@/lib/email-types";
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

const DEFAULT_HERO = "Your Invoice";
const DEFAULT_BODY =
  "Thank you for choosing Hathor. We have reviewed your request and your cabins are reserved for you. To confirm your booking, please pay the deposit below using your chosen payment method.";

export default function BookingInvoiceEmail({
  guestName = sampleGuestName,
  details = sampleBookingDetails,
  paymentLink,
  instructions,
  logoUrl,
  heroImageUrl,
  primaryColor,
  backgroundColor,
  heroHeading,
  bodyText,
}: BookingInvoiceEmailProps) {
  const vars = { guestName, bookingCode: details.bookingCode ?? details.bookingId };
  const { heading, namesGuest } = resolveEmailHeading(heroHeading, DEFAULT_HERO, vars);
  const body = resolveEmailBody(bodyText, DEFAULT_BODY, vars);
  const due = details.paymentPlan?.find(stage => stage.state === "due");
  const method = details.paymentMethod ?? "your chosen method";

  return (
    <EmailLayout
      preview={`Your Hathor invoice — ${due ? `${due.amount} due to confirm` : "payment instructions inside"}`}
      footerVariant="guest-reply"
      logoUrl={logoUrl}
      heroImageUrl={heroImageUrl}
      primaryColor={primaryColor}
      backgroundColor={backgroundColor}
    >
      <EmailEyebrow>Invoice</EmailEyebrow>
      <EmailHeading>{heading}</EmailHeading>
      {namesGuest ? null : <EmailBodyText>For {guestName}</EmailBodyText>}
      <GoldDivider />
      <EmailBodyText>{body}</EmailBodyText>

      {due ? (
        <AmountCallout
          label="Due now to confirm"
          amount={due.amount}
          note={`${due.percent ? `${due.percent}% of your ${details.totalPrice} voyage` : `Total voyage ${details.totalPrice}`} · paid by ${method}`}
        />
      ) : null}

      {paymentLink ? (
        <>
          <EmailCtaButton href={paymentLink} label={due ? `Pay ${due.amount} securely` : "Pay securely"} />
          <EmailBodyText muted>
            If the button does not open, copy this secure payment link into your browser: {paymentLink}
          </EmailBodyText>
        </>
      ) : null}

      {instructions?.trim() ? <TeamMessage title={`How to pay by ${method}`} text={instructions} /> : null}

      {details.bookingCode ? <BookingCodeCard code={details.bookingCode} trackUrl={details.bookingUrl} /> : null}
      {details.paymentPlan ? <PaymentPlanTable stages={details.paymentPlan} /> : null}
      <BookingSummary details={details} showBookingReference spaceAfter />

      <EmailBodyText muted>
        Your booking is confirmed once your payment is received and recorded — we will email you as soon as it is.
        Hathor will never ask for card numbers, passwords or verification codes by email or messaging apps.
      </EmailBodyText>

      {details.bookingUrl ? <EmailCtaButton href={details.bookingUrl} label="Track Your Booking" /> : null}
    </EmailLayout>
  );
}
