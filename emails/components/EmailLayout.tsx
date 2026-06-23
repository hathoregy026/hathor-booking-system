import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";
import { emailColors, emailFonts } from "../styles";

type EmailLayoutProps = {
  preview: string;
  title: string;
  children: ReactNode;
};

export function EmailLayout({ preview, title, children }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Text style={brandMark}>HATHOR</Text>
            <Text style={brandTagline}>Luxury Dahabiya Nile Cruises</Text>
          </Section>

          <Section style={card}>
            <Heading as="h1" style={heading}>
              {title}
            </Heading>
            {children}
          </Section>

          <Section style={footer}>
            <Hr style={hr} />
            <Text style={footerText}>
              Hathor Dahabiya · Luxor & Aswan, Egypt
            </Text>
            <Text style={footerMuted}>
              This is an automated message. Please do not reply directly to this
              email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const body = {
  backgroundColor: emailColors.background,
  fontFamily: emailFonts.sans,
  margin: 0,
  padding: "32px 16px",
};

const container = {
  margin: "0 auto",
  maxWidth: "560px",
};

const header = {
  textAlign: "center" as const,
  marginBottom: "24px",
};

const brandMark = {
  color: emailColors.gold,
  fontFamily: emailFonts.serif,
  fontSize: "28px",
  fontWeight: 600,
  letterSpacing: "0.35em",
  margin: "0 0 4px",
};

const brandTagline = {
  color: emailColors.muted,
  fontSize: "12px",
  letterSpacing: "0.12em",
  margin: 0,
  textTransform: "uppercase" as const,
};

const card = {
  backgroundColor: emailColors.card,
  border: `1px solid ${emailColors.border}`,
  borderRadius: "12px",
  padding: "32px 28px",
};

const heading = {
  color: emailColors.cream,
  fontFamily: emailFonts.serif,
  fontSize: "24px",
  fontWeight: 400,
  lineHeight: "1.35",
  margin: "0 0 20px",
};

const footer = {
  marginTop: "28px",
  textAlign: "center" as const,
};

const hr = {
  borderColor: emailColors.border,
  margin: "0 0 16px",
};

const footerText = {
  color: emailColors.muted,
  fontSize: "12px",
  margin: "0 0 4px",
};

const footerMuted = {
  color: emailColors.muted,
  fontSize: "11px",
  margin: 0,
  opacity: 0.8,
};
