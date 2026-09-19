import { Text } from "@react-email/components";
import type { EmailTemplateOverrides } from "@/lib/email-templates";
import { resolveEmailBody, resolveEmailHeading } from "@/lib/email-templates";
import { TeamMessage } from "./components/BookingBlocks";
import { EmailLayout } from "./components/EmailLayout";
import { EmailBodyText, EmailCtaButton, EmailEyebrow, EmailHeading, GoldDivider } from "./components/EmailUi";
import { emailColors, emailFonts } from "./styles";

export type ContactAlertLine = { label: string; value: string };

type ContactAlertEmailProps = {
  guestName: string;
  guestEmail: string;
  /** "Contact inquiry" or "Charter request". */
  inquiryType: string;
  /** Phone, dates, party, voyage selection — whatever the guest sent. */
  lines: ContactAlertLine[];
  message: string;
} & EmailTemplateOverrides;

export const PreviewProps: ContactAlertEmailProps = {
  guestName: "Amelia Carter",
  guestEmail: "amelia@example.com",
  inquiryType: "Charter request",
  lines: [
    { label: "Phone", value: "+44 20 7946 0000" },
    { label: "Check-in", value: "2026-11-14" },
    { label: "Adults", value: "8" },
    { label: "Preferred route", value: "Luxor → Aswan" },
  ],
  message: "We would like to charter the whole boat for a family celebration in November. Could you share availability and a quote?",
};

const DEFAULT_HERO = "New Message From {guestName}";
const DEFAULT_BODY = "Reply straight from your inbox: the guest's email is the reply-to address of this message.";

/** The team's copy of a contact or charter message, framed like the booking alerts. */
export default function ContactAlertEmail({
  guestName = PreviewProps.guestName,
  guestEmail = PreviewProps.guestEmail,
  inquiryType = PreviewProps.inquiryType,
  lines = PreviewProps.lines,
  message = PreviewProps.message,
  logoUrl,
  heroImageUrl,
  primaryColor,
  backgroundColor,
  heroHeading,
  bodyText,
}: ContactAlertEmailProps) {
  const vars = { guestName, inquiryType };
  const { heading } = resolveEmailHeading(heroHeading, DEFAULT_HERO, vars);
  const body = resolveEmailBody(bodyText, DEFAULT_BODY, vars);
  const rows = [{ label: "Name", value: guestName }, { label: "Email", value: guestEmail }, ...lines];

  return (
    <EmailLayout
      preview={`${inquiryType} — ${guestName}`}
      footerVariant="admin"
      logoWidth={56}
      logoUrl={logoUrl}
      heroImageUrl={heroImageUrl}
      primaryColor={primaryColor}
      backgroundColor={backgroundColor}
    >
      <EmailEyebrow>{inquiryType}</EmailEyebrow>
      <EmailHeading align="left" size="medium">
        {heading}
      </EmailHeading>
      <GoldDivider width="40px" />

      <table role="presentation" cellPadding={0} cellSpacing={0} width="100%" style={{ borderCollapse: "collapse", border: `1px solid ${emailColors.borderSolid}` }}>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${row.label}-${index}`}>
              <td style={{ backgroundColor: index % 2 ? emailColors.rowAlt : emailColors.paperWarm, borderBottom: `1px solid ${emailColors.borderSolid}`, padding: "12px 16px", width: "38%", verticalAlign: "top" }}>
                <Text style={{ color: emailColors.textMuted, fontFamily: emailFonts.body, fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em", lineHeight: "1.5", margin: 0, textTransform: "uppercase" }}>
                  {row.label}
                </Text>
              </td>
              <td style={{ backgroundColor: index % 2 ? emailColors.rowAlt : emailColors.paperWarm, borderBottom: `1px solid ${emailColors.borderSolid}`, padding: "12px 16px", verticalAlign: "top" }}>
                <Text style={{ color: emailColors.ink, fontFamily: emailFonts.body, fontSize: "14px", fontWeight: 400, lineHeight: "1.5", margin: 0 }}>{row.value}</Text>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <TeamMessage title="Their message" text={message} spaceAfter />

      <EmailBodyText align="center" muted>
        {body}
      </EmailBodyText>

      <EmailCtaButton href={`mailto:${guestEmail}`} label={`Reply to ${guestName}`} />
    </EmailLayout>
  );
}
