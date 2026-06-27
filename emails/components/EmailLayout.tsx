import {
  Body,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";
import type { EmailTemplateOverrides } from "@/lib/email-templates";
import { resolveEmailTheme } from "../theme";
import {
  emailColors,
  emailFonts,
  emailLayout,
  GOOGLE_FONTS_URL,
} from "../styles";

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
  alt = "Luxury Hathor Dahabiya cruise on the Nile at sunset",
}: {
  heroImageUrl: string;
  alt?: string;
}) {
  const src = heroImageUrl?.trim() || "";

  return (
    <table
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      width="100%"
      style={{ borderCollapse: "collapse", margin: 0 }}
    >
      <tbody>
        <tr>
          <td align="center" style={cellReset}>
            <Img
              src={src}
              alt={alt}
              width={600}
              height={240}
              style={{
                border: 0,
                display: "block",
                height: "auto",
                margin: 0,
                maxHeight: "240px",
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
  width = 200,
  logoUrl,
}: {
  width?: number;
  logoUrl: string;
}) {
  const src = logoUrl?.trim() || "";

  return (
    <table
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      width="100%"
      style={{ borderCollapse: "collapse", margin: 0 }}
    >
      <tbody>
        <tr>
          <td
            align="center"
            style={{
              ...cellReset,
              backgroundColor: emailColors.dark,
              padding: "28px 32px",
            }}
          >
            <Img
              src={src}
              alt="Hathor Luxury Dahabiya Cruise"
              width={width}
              height={64}
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
          </td>
        </tr>
        <tr>
          <td
            style={{
              backgroundColor: emailColors.gold,
              fontSize: 0,
              height: "3px",
              lineHeight: 0,
            }}
          >
            &nbsp;
          </td>
        </tr>
      </tbody>
    </table>
  );
}

/** @deprecated Use EmailEyebrow from EmailUi instead. */
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
        color: color ?? emailColors.gold,
        fontFamily: emailFonts.body,
        fontSize: "11px",
        fontWeight: 600,
        letterSpacing: "3px",
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
        style={{ borderCollapse: "collapse", marginTop: "0" }}
      >
        <tbody>
          <tr>
            <td
              align="center"
              style={{
                ...cellReset,
                backgroundColor: emailColors.dark,
                padding: "32px 24px",
              }}
            >
              <Text
                style={{
                  color: emailColors.cream,
                  fontFamily: emailFonts.body,
                  fontSize: "13px",
                  fontWeight: 500,
                  letterSpacing: "1px",
                  lineHeight: "1.5",
                  margin: "0 0 8px",
                  textTransform: "uppercase",
                }}
              >
                Hathor Dahabiya Admin
              </Text>
              <Text
                style={{
                  color: primaryColor,
                  fontFamily: emailFonts.body,
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
      style={{ borderCollapse: "collapse", marginTop: "0" }}
    >
      <tbody>
        <tr>
          <td
            align="center"
            style={{
              ...cellReset,
              backgroundColor: emailColors.dark,
              padding: "40px 32px",
            }}
          >
            <table
              role="presentation"
              cellPadding={0}
              cellSpacing={0}
              style={{ borderCollapse: "collapse", margin: "0 auto 20px" }}
            >
              <tbody>
                <tr>
                  <td
                    style={{
                      backgroundColor: primaryColor,
                      fontSize: 0,
                      height: "2px",
                      lineHeight: 0,
                      width: "60px",
                    }}
                  >
                    &nbsp;
                  </td>
                </tr>
              </tbody>
            </table>

            <Text
              style={{
                color: emailColors.cream,
                fontFamily: emailFonts.display,
                fontSize: "22px",
                fontWeight: 500,
                lineHeight: "1.4",
                margin: "0 0 6px",
              }}
            >
              Hathor Dahabiya
            </Text>
            <Text
              style={{
                color: primaryColor,
                fontFamily: emailFonts.body,
                fontSize: "12px",
                fontStyle: "italic",
                fontWeight: 400,
                letterSpacing: "1px",
                lineHeight: "1.5",
                margin: "0 0 24px",
              }}
            >
              Luxury Cruises on the Nile
            </Text>

            <Text
              style={{
                color: emailColors.textMuted,
                fontFamily: emailFonts.body,
                fontSize: "14px",
                lineHeight: "1.7",
                margin: "0 0 6px",
              }}
            >
              <Link
                href="mailto:reservations@hathorcruise.com"
                style={{
                  color: emailColors.cream,
                  textDecoration: "underline",
                }}
              >
                reservations@hathorcruise.com
              </Link>
            </Text>
            <Text
              style={{
                color: emailColors.textMuted,
                fontFamily: emailFonts.body,
                fontSize: "14px",
                lineHeight: "1.7",
                margin: "0 0 24px",
              }}
            >
              +20 127 049 6896
            </Text>

            {variant === "guest-reply" ? (
              <Text
                style={{
                  color: emailColors.textMuted,
                  fontFamily: emailFonts.body,
                  fontSize: "13px",
                  lineHeight: "1.7",
                  margin: "0 0 24px",
                }}
              >
                Questions? Reply directly to this email — we are here to help.
              </Text>
            ) : null}

            <Text
              style={{
                color: primaryColor,
                fontFamily: emailFonts.body,
                fontSize: "11px",
                letterSpacing: "1px",
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
  logoWidth = 200,
  logoUrl,
  heroImageUrl,
  primaryColor,
  backgroundColor,
}: EmailLayoutProps) {
  const theme = resolveEmailTheme({ logoUrl, primaryColor, backgroundColor });
  const bannerUrl = heroImageUrl?.trim() || null;

  return (
    <Html lang="en" dir="ltr">
      <Head>
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="x-apple-disable-message-reformatting" />
        <meta
          name="format-detection"
          content="telephone=no,address=no,email=no,date=no,url=no"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link href={GOOGLE_FONTS_URL} rel="stylesheet" />
        <title>{preview}</title>
        <style>{`
          @media only screen and (max-width: 620px) {
            .email-container { width: 100% !important; }
            .email-card { padding: 28px 20px !important; }
            .email-heading { font-size: 26px !important; }
          }
        `}</style>
      </Head>
      <Preview>{preview}</Preview>
      <Body
        style={{
          backgroundColor: theme.backgroundColor,
          fontFamily: emailFonts.body,
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
                  padding: "24px 12px",
                }}
              >
                <table
                  role="presentation"
                  cellPadding={0}
                  cellSpacing={0}
                  width="600"
                  className="email-container"
                  style={{
                    borderCollapse: "collapse",
                    maxWidth: emailLayout.maxWidth,
                    width: "100%",
                  }}
                >
                  <tbody>
                    <tr>
                      <td style={cellReset}>
                        <EmailLogo
                          width={logoWidth}
                          logoUrl={theme.logoUrl}
                        />
                      </td>
                    </tr>
                    {bannerUrl ? (
                      <tr>
                        <td style={cellReset}>
                          <EmailHeroBanner heroImageUrl={bannerUrl} />
                        </td>
                      </tr>
                    ) : null}
                    <tr>
                      <td
                        className="email-card"
                        style={{
                          backgroundColor: theme.cardBackground,
                          borderLeft: `1px solid ${theme.borderColor}`,
                          borderRight: `1px solid ${theme.borderColor}`,
                          padding: emailLayout.paddingCard,
                        }}
                      >
                        <table
                          role="presentation"
                          cellPadding={0}
                          cellSpacing={0}
                          width="100%"
                          style={{ borderCollapse: "collapse" }}
                        >
                          <tbody>
                            <tr>
                              <td
                                style={{
                                  borderTop: `3px solid ${theme.primaryColor}`,
                                  fontSize: 0,
                                  height: 0,
                                  lineHeight: 0,
                                  padding: 0,
                                }}
                              >
                                &nbsp;
                              </td>
                            </tr>
                          </tbody>
                        </table>
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
