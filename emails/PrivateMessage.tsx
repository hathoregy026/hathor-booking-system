import type { EmailTemplateOverrides } from "@/lib/email-templates";
import { TeamMessage } from "./components/BookingBlocks";
import { EmailLayout } from "./components/EmailLayout";
import { EmailBodyText, EmailEyebrow, EmailHeading, GoldDivider } from "./components/EmailUi";

type PrivateMessageProps = { recipientName?: string; subject: string; message: string; contactEmail?: string; signatureName?: string } & EmailTemplateOverrides;

export default function PrivateMessageEmail({ recipientName, subject, message, contactEmail, signatureName = "the Hathor team", logoUrl, heroImageUrl, primaryColor, backgroundColor, footer }: PrivateMessageProps) {
  return (
    <EmailLayout preview={subject} footerVariant="guest-reply" contactEmail={contactEmail} logoUrl={logoUrl} heroImageUrl={heroImageUrl} primaryColor={primaryColor} backgroundColor={backgroundColor} footer={footer}>
      <EmailEyebrow>A personal note</EmailEyebrow>
      <EmailHeading size="medium">{subject}</EmailHeading>
      <EmailBodyText>{recipientName ? `Dear ${recipientName},` : "Hello,"}</EmailBodyText>
      <GoldDivider />
      <TeamMessage text={message} spaceAfter />
      <EmailBodyText muted>Warm regards, {signatureName}. Reply directly to this email whenever you need us.</EmailBodyText>
    </EmailLayout>
  );
}
