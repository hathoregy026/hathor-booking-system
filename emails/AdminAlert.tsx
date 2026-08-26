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

const DEFAULT_HERO = "New Confirmed Reservation";
const DEFAULT_BODY =
  "This reservation was confirmed automatically without collecting payment. Follow up through your approved payment process.";

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
      preview="New confirmed Hathor reservation — payment pending"
      footerVariant="admin"
      logoWidth={72}
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
