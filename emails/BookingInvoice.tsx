import type { EmailTemplateOverrides } from "@/lib/email-templates";
import { interpolateEmailText } from "@/lib/email-templates";
import type { BookingEmailDetails } from "@/lib/email-types";
import { AmountCallout, BookingCodeCard, PaymentPlanTable, TeamMessage } from "./components/BookingBlocks";
import { BookingSummary } from "./components/BookingSummary";
import { EmailLayout } from "./components/EmailLayout";
import { EmailBodyText, EmailCtaButton, EmailEyebrow, EmailHeading, GoldDivider } from "./components/EmailUi";
import { sampleBookingDetails, sampleGuestName, sampleInvoiceInstructions } from "./sample-data";

type BookingInvoiceEmailProps = {
  guestName: string;
  details: BookingEmailDetails;
  /** Written by the team when confirming: bank details or the secure card payment link. */
  instructions: string;
} & EmailTemplateOverrides;

export const PreviewProps: BookingInvoiceEmailProps = {
  guestName: sampleGuestName,
  details: sampleBookingDetails,
  instructions: sampleInvoiceInstructions,
};

const DEFAULT_HERO = "Your Invoice";
const DEFAULT_BODY =
  "Thank you for choosing Hathor. We have reviewed your request and your cabins are reserved for you. To confirm your booking, please pay the deposit below using your chosen payment method.";

export default function BookingInvoiceEmail({
  guestName = sampleGuestName,
  details = sampleBookingDetails,
  instructions = sampleInvoiceInstructions,
  logoUrl,
  heroImageUrl,
  primaryColor,
  backgroundColor,
  heroHeading,
  bodyText,
}: BookingInvoiceEmailProps) {
  const heading = (interpolateEmailText(heroHeading ?? DEFAULT_HERO, { guestName }).split(",")[0] || DEFAULT_HERO).trim();
  const body = bodyText?.trim() || DEFAULT_BODY;
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
      <EmailBodyText>For {guestName}</EmailBodyText>
      <GoldDivider />
      <EmailBodyText>{body}</EmailBodyText>

      {due ? (
        <AmountCallout
          label="Due now to confirm"
          amount={due.amount}
          note={`Total voyage ${details.totalPrice} · paid by ${method}`}
        />
      ) : null}

      <TeamMessage title={`How to pay by ${method}`} text={instructions} />

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
