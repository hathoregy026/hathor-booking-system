import {
  Body,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";
import type { EmailTemplateOverrides } from "@/lib/email-templates";
import { resolveEmailHostedImageUrl } from "@/lib/email-image-shared";
import { resolveEmailTheme } from "../theme";
import { emailColors, emailFonts, emailLayout } from "../styles";

export type EmailFooterVariant = "guest" | "guest-reply" | "admin";

type EmailLayoutProps = {
  preview: string;
  children: ReactNode;
  footerVariant?: EmailFooterVariant;
  logoWidth?: number;
} & EmailTemplateOverrides;

const cellReset = {
  padding: 0,
  margin: 0,
} as const;

export function EmailHeroBanner({
  heroImageUrl,
  alt = "Hathor Dahabiya — Luxury Nile Cruise",
}: {
  heroImageUrl: string;
  alt?: string;
}) {
  const src = resolveEmailHostedImageUrl(heroImageUrl) ?? heroImageUrl;

  return (
    <table
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      width="100%"
      style={{ borderCollapse: "collapse", margin: "0 0 24px" }}
    >
      <tbody>
        <tr>
          <td align="center" style={cellReset}>
            <Img
              src={src}
              alt={alt}
              width={600}
              height={220}
              style={{
                border: 0,
                borderRadius: "8px",
                display: "block",
                height: "auto",
                margin: "0 auto",
                maxHeight: "220px",
                maxWidth: "100%",
                outline: "none",
                textDecoration: "none",
                width: "100%",
              }}
            />
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export function EmailLogo({
  width = 180,
  logoUrl,
  primaryColor,
}: {
  width?: number;
  logoUrl: string;
  primaryColor: string;
}) {
  const src = resolveEmailHostedImageUrl(logoUrl) ?? logoUrl;

  return (
    <table
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      width="100%"
      style={{ borderCollapse: "collapse", margin: "0 0 24px" }}
    >
      <tbody>
        <tr>
          <td align="center" style={cellReset}>
            <Img
              src={src}
              alt="Hathor Dahabiya — Luxury Nile Cruises"
              width={width}
              style={{
                border: 0,
                display: "block",
                height: "auto",
                margin: "0 auto",
                maxWidth: `${width}px`,
                outline: "none",
                textDecoration: "none",
                width: "100%",
              }}
            />
            <Hr
              style={{
                border: "none",
                borderTop: `2px solid ${primaryColor}`,
                margin: "20px auto 0",
                width: "60px",
              }}
            />
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export function GoldSectionTitle({
  children,
  color,
}: {
  children: string;
  color?: string;
}) {
  return (
    <Text
      style={{
        color: color ?? emailColors.goldDark,
        fontFamily: emailFonts.sans,
        fontSize: "13px",
        fontWeight: 700,
        letterSpacing: "2px",
        lineHeight: "1.4",
        margin: "0 0 16px",
        textAlign: "left",
        textTransform: "uppercase",
      }}
    >
      {children}
    </Text>
  );
}

export function EmailFooter({
  variant = "guest",
  primaryColor,
}: {
  variant?: EmailFooterVariant;
  primaryColor: string;
}) {
  if (variant === "admin") {
    return (
      <table
        role="presentation"
        cellPadding={0}
        cellSpacing={0}
        width="100%"
        style={{ borderCollapse: "collapse", marginTop: "32px" }}
      >
        <tbody>
          <tr>
            <td align="center" style={cellReset}>
              <Hr
                style={{
                  border: "none",
                  borderTop: `1px solid ${primaryColor}`,
                  margin: "0 0 20px",
                }}
              />
              <Text
                style={{
                  color: emailColors.textSecondary,
                  fontFamily: emailFonts.sans,
                  fontSize: "13px",
                  lineHeight: "1.5",
                  margin: "0 0 8px",
                }}
              >
                Hathor Dahabiya Admin System
              </Text>
              <Text
                style={{
                  color: primaryColor,
                  fontFamily: emailFonts.sans,
                  fontSize: "12px",
                  lineHeight: "1.5",
                  margin: 0,
                }}
              >
                © 2025 Hathor Dahabiya. All rights reserved.
              </Text>
            </td>
          </tr>
        </tbody>
      </table>
    );
  }

  return (
    <table
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      width="100%"
      style={{ borderCollapse: "collapse", marginTop: "32px" }}
    >
      <tbody>
        <tr>
          <td align="center" style={{ ...cellReset, paddingTop: "30px" }}>
            <Hr
              style={{
                border: "none",
                borderTop: `1px solid ${primaryColor}`,
                margin: "0 0 24px",
              }}
            />
            <Text
              style={{
                color: emailColors.textPrimary,
                fontFamily: emailFonts.serif,
                fontSize: "16px",
                fontWeight: 400,
                lineHeight: "1.5",
                margin: "0 0 6px",
              }}
            >
              Hathor Dahabiya
            </Text>
            <Text
              style={{
                color: emailColors.textSecondary,
                fontFamily: emailFonts.sans,
                fontSize: "13px",
                fontStyle: "italic",
                lineHeight: "1.5",
                margin: "0 0 16px",
              }}
            >
              Luxury Cruises on the Nile
            </Text>
            <Text
              style={{
                color: emailColors.textSecondary,
                fontFamily: emailFonts.sans,
                fontSize: "13px",
                lineHeight: "1.6",
                margin: "0 0 4px",
              }}
            >
              <Link
                href="mailto:reservations@hathorcruise.com"
                style={{
                  color: emailColors.textSecondary,
                  textDecoration: "underline",
                }}
              >
                reservations@hathorcruise.com
              </Link>
            </Text>
            <Text
              style={{
                color: emailColors.textSecondary,
                fontFamily: emailFonts.sans,
                fontSize: "13px",
                lineHeight: "1.6",
                margin: "0 0 20px",
              }}
            >
              +20 127 049 6896
            </Text>
            {variant === "guest-reply" ? (
              <Text
                style={{
                  color: emailColors.textSecondary,
                  fontFamily: emailFonts.sans,
                  fontSize: "13px",
                  lineHeight: "1.6",
                  margin: "0 0 20px",
                }}
              >
                If you have any questions, reply directly to this email.
              </Text>
            ) : null}
            <Text
              style={{
                color: primaryColor,
                fontFamily: emailFonts.sans,
                fontSize: "12px",
                lineHeight: "1.5",
                margin: 0,
              }}
            >
              © 2025 Hathor Dahabiya. All rights reserved.
            </Text>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export function EmailLayout({
  preview,
  children,
  footerVariant = "guest",
  logoWidth = 180,
  logoUrl,
  heroImageUrl,
  primaryColor,
  backgroundColor,
}: EmailLayoutProps) {
  const theme = resolveEmailTheme({ logoUrl, primaryColor, backgroundColor });
  const bannerUrl = resolveEmailHostedImageUrl(heroImageUrl);

  return (
    <Html lang="en" dir="ltr">
      <Head>
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="x-apple-disable-message-reformatting" />
        <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no" />
        <title>{preview}</title>
      </Head>
      <Preview>{preview}</Preview>
      <Body
        style={{
          backgroundColor: theme.backgroundColor,
          fontFamily: emailFonts.sans,
          margin: 0,
          padding: 0,
          WebkitTextSizeAdjust: "100%",
          textSizeAdjust: "100%",
        }}
      >
        <table
          role="presentation"
          cellPadding={0}
          cellSpacing={0}
          width="100%"
          style={{
            backgroundColor: theme.backgroundColor,
            borderCollapse: "collapse",
            margin: 0,
            padding: 0,
            width: "100%",
          }}
        >
          <tbody>
            <tr>
              <td
                align="center"
                style={{
                  backgroundColor: theme.backgroundColor,
                  padding: `${emailLayout.paddingMobile} 12px`,
                }}
              >
                <table
                  role="presentation"
                  cellPadding={0}
                  cellSpacing={0}
                  width="600"
                  style={{
                    borderCollapse: "collapse",
                    maxWidth: emailLayout.maxWidth,
                    width: "100%",
                  }}
                >
                  <tbody>
                    {bannerUrl ? (
                      <tr>
                        <td style={cellReset}>
                          <EmailHeroBanner heroImageUrl={bannerUrl} />
                        </td>
                      </tr>
                    ) : null}
                    <tr>
                      <td style={cellReset}>
                        <EmailLogo
                          width={logoWidth}
                          logoUrl={theme.logoUrl}
                          primaryColor={theme.primaryColor}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          backgroundColor: theme.cardBackground,
                          border: `1px solid ${theme.borderColor}`,
                          borderRadius: "8px",
                          padding: emailLayout.paddingMobile,
                        }}
                      >
                        {children}
                      </td>
                    </tr>
                    <tr>
                      <td style={cellReset}>
                        <EmailFooter
                          variant={footerVariant}
                          primaryColor={theme.primaryColor}
                        />
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
