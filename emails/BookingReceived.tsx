import { Heading, Section, Text } from "@react-email/components";
import type { EmailTemplateOverrides } from "@/lib/email-templates";
import { interpolateEmailText } from "@/lib/email-templates";
import type { BookingEmailDetails } from "@/lib/email-types";
import { BookingSummary } from "./components/BookingSummary";
import { EmailLayout } from "./components/EmailLayout";
import { sampleBookingDetails, sampleGuestName } from "./sample-data";
import { resolveEmailTheme } from "./theme";
import { emailColors, emailFonts } from "./styles";

type BookingReceivedEmailProps = {
  guestName: string;
  details: BookingEmailDetails;
} & EmailTemplateOverrides;

export const PreviewProps: BookingReceivedEmailProps = {
  guestName: sampleGuestName,
  details: sampleBookingDetails,
};

const DEFAULT_HERO = "Thank You, {guestName}";
const DEFAULT_BODY =
  "Your booking request has been received. Our team is reviewing your reservation and will contact you within 24 hours to confirm your luxury Nile cruise experience.";

export default function BookingReceivedEmail({
  guestName = sampleGuestName,
  details = sampleBookingDetails,
  logoUrl,
  heroImageUrl,
  primaryColor,
  backgroundColor,
  heroHeading,
  bodyText,
}: BookingReceivedEmailProps) {
  const theme = resolveEmailTheme({ logoUrl, primaryColor, backgroundColor });
  const heading = interpolateEmailText(heroHeading ?? DEFAULT_HERO, { guestName });
  const body = bodyText?.trim() || DEFAULT_BODY;

  return (
    <EmailLayout
      preview="Your Hathor cruise booking request has been received"
      footerVariant="guest"
      logoUrl={logoUrl}
      heroImageUrl={heroImageUrl}
      primaryColor={primaryColor}
      backgroundColor={backgroundColor}
    >
      <Text
        style={{
          color: theme.goldDark,
          fontFamily: emailFonts.sans,
          fontSize: "13px",
          fontWeight: 700,
          letterSpacing: "2px",
          margin: "0 0 12px",
          textAlign: "center",
          textTransform: "uppercase",
        }}
      >
        Booking Request
      </Text>

      <Heading
        as="h1"
        style={{
          color: emailColors.textPrimary,
          fontFamily: emailFonts.serif,
          fontSize: "28px",
          fontWeight: 400,
          lineHeight: "1.35",
          margin: "0 0 16px",
          textAlign: "center",
        }}
      >
        {heading}
      </Heading>

      <Text
        style={{
          color: emailColors.textSecondary,
          fontFamily: emailFonts.sans,
          fontSize: "16px",
          lineHeight: "1.6",
          margin: "0 0 8px",
          textAlign: "center",
        }}
      >
        {body}
      </Text>

      <BookingSummary details={details} />

      <Section
        style={{
          backgroundColor: theme.infoBg,
          borderLeft: `4px solid ${theme.primaryColor}`,
          borderRadius: "4px",
          margin: "32px 0 0",
          padding: "20px 24px",
        }}
      >
        <Text
          style={{
            color: emailColors.textPrimary,
            fontFamily: emailFonts.sans,
            fontSize: "16px",
            fontWeight: 700,
            lineHeight: "1.5",
            margin: "0 0 8px",
          }}
        >
          What happens next?
        </Text>
        <Text
          style={{
            color: emailColors.textSecondary,
            fontFamily: emailFonts.sans,
            fontSize: "16px",
            lineHeight: "1.6",
            margin: 0,
          }}
        >
          Our reservations team will verify availability and send you a
          confirmation email. No payment is required until your booking is
          confirmed.
        </Text>
      </Section>
    </EmailLayout>
  );
}
