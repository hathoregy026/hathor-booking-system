import {
  Body,
  Button,
  Head,
  Html,
  Img,
  Preview,
  Text,
} from "@react-email/components";
import type { EmailTemplateOverrides } from "@/lib/email-templates";
import { interpolateEmailText } from "@/lib/email-templates";
import { resolveEmailTheme } from "./theme";
import {
  emailColors,
  emailFonts,
  GOOGLE_FONTS_URL,
  SITE_URL,
} from "./styles";
import { sampleGuestName } from "./sample-data";

type ContactReceivedEmailProps = {
  guestName: string;
} & EmailTemplateOverrides;

export const PreviewProps: ContactReceivedEmailProps = {
  guestName: sampleGuestName,
};

const DEFAULT_HEADING = "Thank you, {guestName}";
const DEFAULT_BODY =
  "Your note has reached the Hathor reservations desk. We will reply within 24 hours.";
const REPLY_HINT =
  "You may reply directly to this email if you wish to add anything to your request.";
const SECURITY_NOTE =
  "For your security, never send passwords or card details by email. Hathor will not request payment through an unverified link in response to a contact message.";

export default function ContactReceivedEmail({
  guestName = sampleGuestName,
  logoUrl,
  primaryColor,
  backgroundColor,
  heroHeading,
  bodyText,
}: ContactReceivedEmailProps) {
  const theme = resolveEmailTheme({ logoUrl, primaryColor, backgroundColor });
  const paper = theme.backgroundColor || emailColors.cream;
  const card = "#f5eacf";
  const heading = interpolateEmailText(heroHeading?.trim() || DEFAULT_HEADING, {
    guestName,
  });
  const body = interpolateEmailText(bodyText?.trim() || DEFAULT_BODY, {
    guestName,
  });
  const siteUrl = SITE_URL.replace(/\/$/, "");
  const logoSrc = theme.logoUrl;

  return (
    <Html lang="en" dir="ltr">
      <Head>
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <link href={GOOGLE_FONTS_URL} rel="stylesheet" />
        <title>We received your message</title>
        <style>{`
          html, body { margin: 0 !important; padding: 0 !important; width: 100% !important; background: ${paper} !important; }
        `}</style>
      </Head>
      <Preview>We received your message — Hathor Dahabiya</Preview>
      <Body
        style={{
          backgroundColor: paper,
          color: emailColors.ink,
          fontFamily: emailFonts.body,
          margin: 0,
          padding: 0,
          width: "100%",
        }}
      >
        <table
          role="presentation"
          width="100%"
          cellPadding={0}
          cellSpacing={0}
          style={{ backgroundColor: paper, padding: "36px 16px" }}
        >
          <tbody>
            <tr>
              <td align="center">
                <table
                  role="presentation"
                  width="100%"
                  cellPadding={0}
                  cellSpacing={0}
                  style={{
                    maxWidth: "620px",
                    backgroundColor: card,
                    borderTop: `3px solid ${theme.primaryColor}`,
                  }}
                >
                  <tbody>
                    <tr>
                      <td
                        align="center"
                        style={{
                          padding: "36px 36px 8px",
                          backgroundColor: card,
                        }}
                      >
                        {logoSrc ? (
                          <Img
                            src={logoSrc}
                            width={64}
                            height={64}
                            alt="Hathor Dahabiya"
                            style={{
                              display: "block",
                              width: "64px",
                              height: "64px",
                              border: 0,
                              outline: "none",
                              textDecoration: "none",
                              backgroundColor: "transparent",
                            }}
                          />
                        ) : null}
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          padding: "12px 40px 8px",
                          textAlign: "center",
                          backgroundColor: card,
                        }}
                      >
                        <Text
                          style={{
                            margin: 0,
                            fontFamily: emailFonts.body,
                            fontSize: "11px",
                            fontWeight: 500,
                            letterSpacing: "0.28em",
                            textTransform: "uppercase",
                            color: theme.goldDark,
                          }}
                        >
                          Message received
                        </Text>
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          padding: "6px 40px 18px",
                          textAlign: "center",
                          backgroundColor: card,
                        }}
                      >
                        <Text
                          style={{
                            margin: 0,
                            fontFamily: emailFonts.editorial,
                            fontSize: "42px",
                            fontWeight: 400,
                            lineHeight: "1.05",
                            letterSpacing: "-0.03em",
                            color: emailColors.ink,
                          }}
                        >
                          {heading}
                        </Text>
                      </td>
                    </tr>
                    {body.split(/\n+/).map((paragraph, index) => (
                      <tr key={`body-${index}`}>
                        <td
                          style={{
                            padding: index === 0 ? "0 48px 8px" : "8px 48px 8px",
                            textAlign: "center",
                            backgroundColor: card,
                          }}
                        >
                          <Text
                            style={{
                              margin: 0,
                              fontFamily: emailFonts.editorial,
                              fontSize: "17px",
                              fontStyle: "italic",
                              lineHeight: "1.7",
                              color: emailColors.textSecondary,
                            }}
                          >
                            {paragraph}
                          </Text>
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td
                        style={{
                          padding: "8px 48px 28px",
                          textAlign: "center",
                          backgroundColor: card,
                        }}
                      >
                        <Text
                          style={{
                            margin: 0,
                            fontFamily: emailFonts.body,
                            fontSize: "14px",
                            lineHeight: "1.65",
                            color: emailColors.textSecondary,
                          }}
                        >
                          {REPLY_HINT}
                        </Text>
                      </td>
                    </tr>
                    <tr>
                      <td
                        align="center"
                        style={{
                          padding: "4px 40px 36px",
                          backgroundColor: card,
                        }}
                      >
                        <Button
                          href={`${siteUrl}/`}
                          style={{
                            display: "inline-block",
                            padding: "14px 34px",
                            border: `1px solid ${emailColors.ink}`,
                            borderRadius: "999px",
                            fontFamily: emailFonts.body,
                            fontSize: "11px",
                            fontWeight: 500,
                            letterSpacing: "0.2em",
                            textTransform: "uppercase",
                            textDecoration: "none",
                            color: emailColors.ink,
                            backgroundColor: card,
                          }}
                        >
                          Visit Dahabiya
                        </Button>
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          padding: "0 40px 36px",
                          backgroundColor: card,
                        }}
                      >
                        <Text
                          style={{
                            margin: 0,
                            borderTop: "1px solid rgba(128,107,53,.28)",
                            paddingTop: "20px",
                            fontFamily: emailFonts.body,
                            fontSize: "12px",
                            lineHeight: "1.65",
                            color: emailColors.textMuted,
                            textAlign: "center",
                          }}
                        >
                          {SECURITY_NOTE}
                        </Text>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </Body>
    </Html>
  );
}
