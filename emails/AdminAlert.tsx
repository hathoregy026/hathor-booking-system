import { Text } from "@react-email/components";
import { format } from "date-fns";
import type { EmailTemplateOverrides } from "@/lib/email-templates";
import { interpolateEmailText } from "@/lib/email-templates";
import type { BookingEmailDetails } from "@/lib/email-types";
import { BookingSummary, GuestInfoTable } from "./components/BookingSummary";
import { EmailLayout } from "./components/EmailLayout";
import {
  EmailBodyText,
  EmailCtaButton,
  EmailEyebrow,
  EmailHeading,
  GoldDivider,
} from "./components/EmailUi";
import { sampleBookingDetails } from "./sample-data";
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
      logoWidth={160}
      logoUrl={logoUrl}
      heroImageUrl={heroImageUrl}
      primaryColor={primaryColor}
      backgroundColor={backgroundColor}
    >
      <EmailEyebrow>Admin Notification</EmailEyebrow>
      <EmailHeading align="left" size="medium">
        {heading}
      </EmailHeading>

      <table
        role="presentation"
        cellPadding={0}
        cellSpacing={0}
        width="100%"
        style={{ borderCollapse: "collapse", margin: "0 0 24px" }}
      >
        <tbody>
          <tr>
            <td style={{ padding: 0 }}>
              <Text
                style={{
                  color: emailColors.textMuted,
                  fontFamily: emailFonts.body,
                  fontSize: "13px",
                  lineHeight: "1.5",
                  margin: 0,
                }}
              >
                Received {receivedDate} at {receivedTime}
              </Text>
            </td>
          </tr>
        </tbody>
      </table>

      <GoldDivider width="60px" />

      <GuestInfoTable details={details} />
      <BookingSummary
        details={details}
        showBookingReference
        sectionTitle="Booking Details"
      />

      <EmailBodyText align="center" muted>
        {body}
      </EmailBodyText>

      <EmailCtaButton href={`${SITE_URL}/admin`} label="Open Dashboard" />
    </EmailLayout>
  );
}
