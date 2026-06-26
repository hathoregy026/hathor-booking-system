import { getSiteBaseUrl } from "@/lib/public-url";

/** Hathor luxury email design tokens — inline CSS only at render time. */
export const emailColors = {
  gold: "#C9A96E",
  goldDark: "#A8864E",
  goldLight: "#E8D5B5",
  dark: "#0A0A0A",
  cream: "#FAF8F5",
  card: "#FFFFFF",
  textPrimary: "#0A0A0A",
  textSecondary: "#5C5C5C",
  textMuted: "#8A8A8A",
  border: "#E8E2D9",
  borderGold: "#C9A96E",
  success: "#2D6A4F",
  infoBg: "#FDF8EF",
  rowAlt: "#FAF8F5",
  /** @deprecated use cream */
  background: "#FAF8F5",
} as const;

export const emailFonts = {
  display:
    "'Playfair Display', Georgia, 'Times New Roman', Times, serif",
  body: "Inter, 'Helvetica Neue', Helvetica, Arial, sans-serif",
  /** @deprecated use display */
  serif: "'Playfair Display', Georgia, 'Times New Roman', serif",
  /** @deprecated use body */
  sans: "Inter, 'Helvetica Neue', Helvetica, Arial, sans-serif",
} as const;

export const SITE_URL = getSiteBaseUrl();

export const EMAIL_LOGO_FILENAME =
  "e-mail-logo-egypttoor-booking-cruise-honeymoon.png";

export const EMAIL_LOGO_URL = `${getSiteBaseUrl()}/assets/${EMAIL_LOGO_FILENAME}`;

export const emailLayout = {
  maxWidth: "600px",
  paddingDesktop: "40px",
  paddingMobile: "32px",
  paddingCard: "36px 32px",
  sectionGap: "32px",
} as const;

export const GOOGLE_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&display=swap";
