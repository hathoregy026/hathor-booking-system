import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";
import type { EmailTemplateOverrides } from "@/lib/email-templates";
import { resolveEmailTheme } from "../theme";
import { emailColors, emailFonts, emailLayout } from "../styles";

export type EmailFooterVariant = "guest" | "guest-reply" | "admin";

type EmailLayoutProps = {
  preview: string;
  children: ReactNode;
  footerVariant?: EmailFooterVariant;
  logoWidth?: number;
} & EmailTemplateOverrides;

export function EmailHeroBanner({ heroImageUrl }: { heroImageUrl: string }) {
  return (
    <Section style={{ margin: "0 0 24px", textAlign: "center" }}>
      <Img
        src={heroImageUrl}
        alt="Hathor Dahabiya"
        width={600}
        style={{
          borderRadius: "8px",
          display: "block",
          height: "auto",
          margin: "0 auto",
          maxHeight: "220px",
          maxWidth: "100%",
          objectFit: "cover",
          width: "100%",
        }}
      />
    </Section>
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
  return (
    <Section style={{ textAlign: "center", margin: "0 0 24px" }}>
      <Img
        src={logoUrl}
        alt="Hathor Dahabiya — Luxury Nile Cruises"
        width={width}
        style={{
          display: "block",
          margin: "0 auto",
          maxWidth: `${width}px`,
          width: "100%",
          height: "auto",
        }}
      />
      <Hr
        style={{
          border: "none",
          borderTop: `2px solid ${primaryColor}`,
          width: "60px",
          margin: "20px auto 0",
        }}
      />
    </Section>
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
      <Section style={{ marginTop: "32px", textAlign: "center" }}>
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
            margin: 0,
          }}
        >
          © 2025 Hathor Dahabiya. All rights reserved.
        </Text>
      </Section>
    );
  }

  return (
    <Section style={{ marginTop: "32px", textAlign: "center", paddingTop: "30px" }}>
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
          style={{ color: emailColors.textSecondary, textDecoration: "underline" }}
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
          margin: 0,
        }}
      >
        © 2025 Hathor Dahabiya. All rights reserved.
      </Text>
    </Section>
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
  const bannerUrl = heroImageUrl?.trim() || null;

  return (
    <Html lang="en">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="x-apple-disable-message-reformatting" />
      </Head>
      <Preview>{preview}</Preview>
      <Body
        style={{
          backgroundColor: theme.backgroundColor,
          fontFamily: emailFonts.sans,
          margin: 0,
          padding: 0,
          WebkitTextSizeAdjust: "100%",
        }}
      >
        <Container
          style={{
            backgroundColor: theme.backgroundColor,
            margin: "0 auto",
            maxWidth: emailLayout.maxWidth,
            padding: `${emailLayout.paddingMobile} ${emailLayout.paddingMobile}`,
            width: "100%",
          }}
        >
          {bannerUrl ? <EmailHeroBanner heroImageUrl={bannerUrl} /> : null}

          <EmailLogo
            width={logoWidth}
            logoUrl={theme.logoUrl}
            primaryColor={theme.primaryColor}
          />

          <Section
            style={{
              backgroundColor: theme.cardBackground,
              border: `1px solid ${theme.borderColor}`,
              borderRadius: "8px",
              padding: emailLayout.paddingMobile,
            }}
          >
            {children}
          </Section>

          <EmailFooter variant={footerVariant} primaryColor={theme.primaryColor} />
        </Container>
      </Body>
    </Html>
  );
}
