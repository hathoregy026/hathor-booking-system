import { Text } from "@react-email/components";
import { format } from "date-fns";
import type { EmailTemplateOverrides } from "@/lib/email-templates";
import { resolveEmailBody, resolveEmailHeading } from "@/lib/email-templates";
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
  "Review this request in the dashboard. Confirm it to email the guest an invoice for their chosen payment method, or decline it to release the cabins.";

export default function AdminAlertEmail({
  details = sampleBookingDetails,
  logoUrl,
  heroImageUrl,
  primaryColor,
  backgroundColor,
  heroHeading,
  bodyText,
}: AdminAlertEmailProps) {
  const vars = { guestName: details.guestName, bookingCode: details.bookingCode ?? details.bookingId };
  const { heading } = resolveEmailHeading(heroHeading, DEFAULT_HERO, vars);
  const body = resolveEmailBody(bodyText, DEFAULT_BODY, vars);
  const receivedAt = new Date();
  const receivedDate = format(receivedAt, "MMMM d, yyyy");
  const receivedTime = format(receivedAt, "h:mm a");

  return (
    <EmailLayout
      preview={`New Hathor booking request${details.bookingCode ? ` ${details.bookingCode}` : ""} — ${details.guestName}`}
      footerVariant="admin"
      logoWidth={56}
      logoUrl={logoUrl}
      heroImageUrl={heroImageUrl}
      primaryColor={primaryColor}
      backgroundColor={backgroundColor}
    >
      <EmailEyebrow>Admin</EmailEyebrow>
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
                  fontSize: "12px",
                  fontWeight: 300,
                  letterSpacing: "0.06em",
                  lineHeight: "1.5",
                  margin: 0,
                  textTransform: "uppercase",
                }}
              >
                Received {receivedDate} at {receivedTime}
              </Text>
            </td>
          </tr>
        </tbody>
      </table>

      <GoldDivider width="40px" />

      <GuestInfoTable details={details} />
      <BookingSummary
        details={details}
        showBookingReference
        sectionTitle="Booking Details"
      />

      <EmailBodyText align="center" muted>
        {body}
      </EmailBodyText>

      <EmailCtaButton href={details.adminUrl ?? `${SITE_URL}/admin/bookings`} label="Review Booking" />
    </EmailLayout>
  );
}
