import { Button, Heading, Section, Text } from "@react-email/components";
import type { EmailTemplateOverrides } from "@/lib/email-templates";
import { interpolateEmailText } from "@/lib/email-templates";
import type { BookingEmailDetails } from "@/lib/email-types";
import { BookingSummary } from "./components/BookingSummary";
import { EmailLayout } from "./components/EmailLayout";
import { sampleBookingDetails, sampleGuestName } from "./sample-data";
import { resolveEmailTheme } from "./theme";
import { emailColors, emailFonts, SITE_URL } from "./styles";

type BookingConfirmedEmailProps = {
  guestName: string;
  details: BookingEmailDetails;
} & EmailTemplateOverrides;

export const PreviewProps: BookingConfirmedEmailProps = {
  guestName: sampleGuestName,
  details: sampleBookingDetails,
};

const DEFAULT_HERO = "Welcome Aboard, {guestName}";
const DEFAULT_BODY =
  "Your Hathor Dahabiya cruise is officially confirmed. We are preparing an unforgettable journey along the Nile, just for you.";

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
  const theme = resolveEmailTheme({ logoUrl, primaryColor, backgroundColor });
  const heading = interpolateEmailText(heroHeading ?? DEFAULT_HERO, { guestName });
  const body = bodyText?.trim() || DEFAULT_BODY;

  return (
    <EmailLayout
      preview="Your Hathor Dahabiya cruise is officially confirmed"
      footerVariant="guest-reply"
      logoUrl={logoUrl}
      heroImageUrl={heroImageUrl}
      primaryColor={primaryColor}
      backgroundColor={backgroundColor}
    >
      <Text
        style={{
          color: emailColors.success,
          fontFamily: emailFonts.sans,
          fontSize: "13px",
          fontWeight: 700,
          letterSpacing: "2px",
          margin: "0 0 12px",
          textAlign: "center",
          textTransform: "uppercase",
        }}
      >
        Confirmed
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

      <BookingSummary details={details} showBookingReference />

      <Section
        style={{
          backgroundColor: theme.cardBackground,
          border: `1px solid ${theme.primaryColor}`,
          borderRadius: "8px",
          margin: "32px 0",
          padding: "24px 28px",
        }}
      >
        <Heading
          as="h3"
          style={{
            color: emailColors.textPrimary,
            fontFamily: emailFonts.serif,
            fontSize: "18px",
            fontWeight: 400,
            lineHeight: "1.4",
            margin: "0 0 16px",
            textAlign: "left",
          }}
        >
          Your Journey Awaits
        </Heading>
        {HIGHLIGHTS.map((item) => (
          <Text
            key={item}
            style={{
              color: emailColors.textSecondary,
              fontFamily: emailFonts.sans,
              fontSize: "16px",
              lineHeight: "1.6",
              margin: "0 0 10px",
              paddingLeft: "4px",
            }}
          >
            <span style={{ color: theme.goldDark, marginRight: "10px" }}>
              •
            </span>
            {item}
          </Text>
        ))}
      </Section>

      <Section style={{ margin: "32px 0 8px", textAlign: "center" }}>
        <Button
          href={SITE_URL}
          style={{
            backgroundColor: theme.goldDark,
            borderRadius: "4px",
            color: theme.cardBackground,
            display: "inline-block",
            fontFamily: emailFonts.sans,
            fontSize: "14px",
            fontWeight: 700,
            letterSpacing: "2px",
            lineHeight: "1",
            padding: "16px 32px",
            textDecoration: "none",
            textTransform: "uppercase",
          }}
        >
          View Your Booking
        </Button>
      </Section>
    </EmailLayout>
  );
}
