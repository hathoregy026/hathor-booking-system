import { Button, Heading, Section, Text } from "@react-email/components";
import { format } from "date-fns";
import type { EmailTemplateOverrides } from "@/lib/email-templates";
import { interpolateEmailText } from "@/lib/email-templates";
import type { BookingEmailDetails } from "@/lib/email-types";
import { BookingSummary, GuestInfoTable } from "./components/BookingSummary";
import { EmailLayout } from "./components/EmailLayout";
import { sampleBookingDetails } from "./sample-data";
import { resolveEmailTheme } from "./theme";
import { emailColors, emailFonts, SITE_URL } from "./styles";

type AdminAlertEmailProps = {
  details: BookingEmailDetails;
} & EmailTemplateOverrides;

export const PreviewProps: AdminAlertEmailProps = {
  details: sampleBookingDetails,
};

const DEFAULT_HERO = "New Booking Request";
const DEFAULT_BODY =
  "Please log in to the admin dashboard to review and confirm this booking.";

export default function AdminAlertEmail({
  details = sampleBookingDetails,
  logoUrl,
  heroImageUrl,
  primaryColor,
  backgroundColor,
  heroHeading,
  bodyText,
}: AdminAlertEmailProps) {
  const theme = resolveEmailTheme({ logoUrl, primaryColor, backgroundColor });
  const heading = interpolateEmailText(heroHeading ?? DEFAULT_HERO, {
    guestName: details.guestName,
  });
  const body = bodyText?.trim() || DEFAULT_BODY;
  const receivedAt = new Date();
  const receivedDate = format(receivedAt, "MMMM d, yyyy");
  const receivedTime = format(receivedAt, "h:mm a");

  return (
    <EmailLayout
      preview="New Hathor booking request"
      footerVariant="admin"
      logoWidth={120}
      logoUrl={logoUrl}
      heroImageUrl={heroImageUrl}
      primaryColor={primaryColor}
      backgroundColor={backgroundColor}
    >
      <Section
        style={{
          backgroundColor: theme.infoBg,
          borderLeft: `4px solid ${theme.goldDark}`,
          borderRadius: "4px",
          margin: "0 0 32px",
          padding: "20px 24px",
        }}
      >
        <Heading
          as="h2"
          style={{
            color: emailColors.textPrimary,
            fontFamily: emailFonts.serif,
            fontSize: "22px",
            fontWeight: 400,
            lineHeight: "1.35",
            margin: "0 0 8px",
          }}
        >
          {heading}
        </Heading>
        <Text
          style={{
            color: emailColors.textSecondary,
            fontFamily: emailFonts.sans,
            fontSize: "13px",
            lineHeight: "1.5",
            margin: 0,
          }}
        >
          Received: {receivedDate} at {receivedTime}
        </Text>
      </Section>

      <GuestInfoTable details={details} />

      <BookingSummary
        details={details}
        showBookingReference
        sectionTitle="BOOKING DETAILS"
      />

      <Section
        style={{
          backgroundColor: theme.cardBackground,
          border: `1px solid ${theme.borderColor}`,
          borderRadius: "8px",
          margin: "32px 0 8px",
          padding: "24px 28px",
          textAlign: "center",
        }}
      >
        <Text
          style={{
            color: emailColors.textSecondary,
            fontFamily: emailFonts.sans,
            fontSize: "16px",
            lineHeight: "1.6",
            margin: "0 0 20px",
          }}
        >
          {body}
        </Text>
        <Button
          href={`${SITE_URL}/admin`}
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
          Open Dashboard
        </Button>
      </Section>
    </EmailLayout>
  );
}
