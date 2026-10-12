import { EmailLayout } from "./components/EmailLayout";
import { EmailBodyText, EmailEyebrow, EmailHeading, GoldDivider } from "./components/EmailUi";
import { Text, Link } from "@react-email/components";
import type { EmailTemplateOverrides } from "@/lib/email-templates";
import { Fragment } from "react";

export default function BulkMessageEmail({ subject, message, signature, unsubscribeUrl, eyebrow = "A note from Hathor", ...theme }: { subject: string; message: string; signature?: string; unsubscribeUrl?: string; eyebrow?: string } & EmailTemplateOverrides) {
  return <EmailLayout preview={message.slice(0, 120)} footerVariant="guest-reply" {...theme}>
    {eyebrow && <EmailEyebrow color={theme.primaryColor || undefined}>{eyebrow}</EmailEyebrow>}
    <EmailHeading size="medium">{subject}</EmailHeading>
    <GoldDivider />
    {message.split(/\r?\n\s*\r?\n/).map((paragraph, index) => <EmailBodyText key={index}>{paragraph.split(/\r?\n/).map((line, lineIndex) => <Fragment key={lineIndex}>{lineIndex > 0 && <br />}{line}</Fragment>)}</EmailBodyText>)}
    {signature?.trim() && <><GoldDivider /><EmailBodyText>{signature.split(/\r?\n/).map((line, index) => <Fragment key={index}>{index > 0 && <br />}{line}</Fragment>)}</EmailBodyText></>}
    {unsubscribeUrl ? <Text style={{ fontSize: "12px", textAlign: "center", marginTop: "30px" }}><Link href={unsubscribeUrl}>Unsubscribe from bulk emails</Link></Text> : null}
  </EmailLayout>;
}
