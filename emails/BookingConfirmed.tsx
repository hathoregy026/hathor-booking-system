import type { EmailTemplateOverrides } from "@/lib/email-templates";
import { interpolateEmailText } from "@/lib/email-templates";
import type { BookingEmailDetails } from "@/lib/email-types";
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
  details: sampleBookingDetails,
};

const DEFAULT_HERO = "Reservation Confirmed";
const DEFAULT_BODY =
  "Your cabin is reserved. No payment has been collected yet; our team will contact you separately when secure online payment becomes available.";

const HIGHLIGHTS = [
  "Luxury cabin with panoramic Nile views",
  "Gourmet meals prepared by our private chef",
  "Guided excursions to ancient temples",
  "Personalized service throughout your voyage",
] as const;

export default function BookingConfirmedEmail({
  guestName = sampleGuestName,
  details = sampleBookingDetails,
  logoUrl,
  heroImageUrl,
  primaryColor,
  backgroundColor,
  heroHeading,
  bodyText,
}: BookingConfirmedEmailProps) {
  const rawHeading = interpolateEmailText(heroHeading ?? DEFAULT_HERO, {
    guestName,
  });
  /* Short display title; guest name is shown on the line below. */
  const heading = (rawHeading.split(",")[0] || DEFAULT_HERO).trim();
  const body = bodyText?.trim() || DEFAULT_BODY;

  return (
    <EmailLayout
      preview="Your Hathor reservation is confirmed — payment is pending"
      footerVariant="guest-reply"
      logoUrl={logoUrl}
      heroImageUrl={heroImageUrl}
      primaryColor={primaryColor}
      backgroundColor={backgroundColor}
    >
      <EmailEyebrow>Reservation</EmailEyebrow>
      <EmailHeading>{heading}</EmailHeading>
      <EmailBodyText>
        For {guestName} · Payment pending
      </EmailBodyText>
      <GoldDivider />
      <EmailBodyText>{body}</EmailBodyText>
      <EmailBodyText muted>
        Security note: Hathor will never ask you to send card details, passwords,
        or verification codes by email or messaging apps.
      </EmailBodyText>
      <BookingSummary details={details} showBookingReference />

      <table
        role="presentation"
        cellPadding={0}
        cellSpacing={0}
        width="100%"
        style={{ borderCollapse: "collapse", margin: "36px 0 0" }}
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
                      Your journey awaits
                    </td>
                  </tr>
                </tbody>
              </table>
              <EmailBulletList items={HIGHLIGHTS} />
            </td>
          </tr>
        </tbody>
      </table>

      {details.bookingUrl ? (
        <EmailCtaButton href={details.bookingUrl} label="View Your Reservation" />
      ) : null}
    </EmailLayout>
  );
}
