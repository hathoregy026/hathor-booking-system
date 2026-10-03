import type { EmailTemplateOverrides } from "@/lib/email-templates";
import { TeamMessage } from "./components/BookingBlocks";
import { EmailLayout } from "./components/EmailLayout";
import { EmailBodyText, EmailEyebrow, EmailHeading, GoldDivider } from "./components/EmailUi";

type PrivateMessageProps = { recipientName?: string; subject: string; message: string } & EmailTemplateOverrides;

export default function PrivateMessageEmail({ recipientName, subject, message, logoUrl, heroImageUrl, primaryColor, backgroundColor }: PrivateMessageProps) {
  return (
    <EmailLayout preview={subject} footerVariant="guest-reply" logoUrl={logoUrl} heroImageUrl={heroImageUrl} primaryColor={primaryColor} backgroundColor={backgroundColor}>
      <EmailEyebrow>A personal note</EmailEyebrow>
      <EmailHeading size="medium">{subject}</EmailHeading>
      <EmailBodyText>{recipientName ? `Dear ${recipientName},` : "Hello,"}</EmailBodyText>
      <GoldDivider />
      <TeamMessage text={message} spaceAfter />
      <EmailBodyText muted>Warm regards, the Hathor team. Reply directly to this email whenever you need us.</EmailBodyText>
    </EmailLayout>
  );
}
