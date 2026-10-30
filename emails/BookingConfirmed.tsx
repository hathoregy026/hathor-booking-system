import type { EmailTemplateOverrides } from "@/lib/email-templates";
import { resolveEmailBody, resolveEmailHeading } from "@/lib/email-templates";
import type { BookingEmailDetails } from "@/lib/email-types";
import { EMAIL_COPY } from "@/lib/i18n/email-copy";
import { AmountCallout, BookingCodeCard, PaymentPlanTable } from "./components/BookingBlocks";
import { BookingSummary } from "./components/BookingSummary";
import { EmailLayout } from "./components/EmailLayout";
import {
  EmailBodyText,
  EmailBulletList,
  EmailCtaButton,
  EmailEyebrow,
  EmailHeading,
  GoldDivider,
} from "./components/EmailUi";
import { sampleBookingDetails, sampleGuestName } from "./sample-data";
import { emailColors, emailFonts } from "./styles";

type BookingConfirmedEmailProps = {
  guestName: string;
  details: BookingEmailDetails;
} & EmailTemplateOverrides;

export const PreviewProps: BookingConfirmedEmailProps = {
  guestName: sampleGuestName,
  details: {
    ...sampleBookingDetails,
    paymentPlan: sampleBookingDetails.paymentPlan?.map((stage, index) => ({
      ...stage,
      state: index === 0 ? "paid" : index === 1 ? "due" : "upcoming",
    })),
  },
};

export default function BookingConfirmedEmail({
  guestName = sampleGuestName,
  details = sampleBookingDetails,
  logoUrl,
  heroImageUrl,
  primaryColor,
  backgroundColor,
  footer,
  heroHeading,
  bodyText,
}: BookingConfirmedEmailProps) {
  const locale = details.locale ?? "en";
  const shared = EMAIL_COPY[locale];
  const copy = shared.confirmed;
  const vars = { guestName, bookingCode: details.bookingCode ?? details.bookingId };
  const { heading, namesGuest } = resolveEmailHeading(heroHeading, copy.hero, vars);
  const body = resolveEmailBody(bodyText, copy.body, vars);
  const remaining = details.paymentPlan?.filter(stage => stage.state !== "paid") ?? [];

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

      {details.amountPaid ? (
        <AmountCallout
          label={copy.paidLabel}
          amount={details.amountPaid}
          note={
            remaining.length > 0 && details.balanceDue
              ? copy.paidBalance(details.balanceDue)
              : copy.paidFull
          }
        />
      ) : null}

      {details.bookingCode ? <BookingCodeCard code={details.bookingCode} trackUrl={details.bookingUrl} locale={locale} /> : null}
      {details.paymentPlan && remaining.length > 0 ? (
        <PaymentPlanTable stages={details.paymentPlan} title={copy.schedule} locale={locale} />
      ) : null}
      <BookingSummary details={details} showBookingReference spaceAfter />

      <table
        role="presentation"
        cellPadding={0}
        cellSpacing={0}
        width="100%"
        style={{ borderCollapse: "collapse", margin: "36px 0 28px" }}
      >
        <tbody>
          <tr>
            <td
              style={{
                backgroundColor: emailColors.paperWarm,
                borderTop: `1px solid ${emailColors.borderSolid}`,
                borderBottom: `1px solid ${emailColors.borderSolid}`,
                padding: "28px 8px",
              }}
            >
              <table
                role="presentation"
                cellPadding={0}
                cellSpacing={0}
                width="100%"
                style={{ borderCollapse: "collapse", margin: "0 0 18px" }}
              >
                <tbody>
                  <tr>
                    <td
                      style={{
                        color: emailColors.ink,
                        fontFamily: emailFonts.editorial,
                        fontSize: "22px",
                        fontWeight: 500,
                        lineHeight: "1.3",
                        padding: 0,
                        textAlign: "center",
                      }}
                    >
                      {copy.awaits}
                    </td>
                  </tr>
                </tbody>
              </table>
              <EmailBulletList items={copy.highlights} />
            </td>
          </tr>
        </tbody>
      </table>

      <EmailBodyText muted>{copy.security}</EmailBodyText>

      {details.bookingUrl ? (
        <EmailCtaButton href={details.bookingUrl} label={copy.cta} />
      ) : null}
    </EmailLayout>
  );
}
