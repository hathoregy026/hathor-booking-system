export const emailColors = {
  background: "#FAF8F5",
  card: "#FFFFFF",
  gold: "#C9A96E",
  goldDark: "#8B6914",
  textPrimary: "#1A1A1A",
  textSecondary: "#6B6B6B",
  border: "#E8E2D9",
  success: "#2D6A4F",
  infoBg: "#FDF8EF",
  rowAlt: "#FAF8F5",
} as const;

export const emailFonts = {
  serif: "Georgia, 'Times New Roman', serif",
  sans: "'Helvetica Neue', Helvetica, Arial, sans-serif",
} as const;

export const SITE_URL = "https://hathor-booking-system.vercel.app";

export const EMAIL_LOGO_FILENAME =
  "e-mail-logo-egypttoor-booking-cruise-honeymoon.png";

export const EMAIL_LOGO_URL = `${SITE_URL}/assets/${EMAIL_LOGO_FILENAME}`;

export const emailLayout = {
  maxWidth: "600px",
  paddingDesktop: "40px",
  paddingMobile: "20px",
  sectionGap: "32px",
} as const;
