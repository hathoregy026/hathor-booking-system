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

/**
 * Closest Google Fonts pairing to the live site stack
 * (Plus Jakarta Sans body + editorial serif display).
 * Custom faces (Gamgote / Bitho) are not loadable in most email clients.
 */
export const emailFonts = {
  display:
    "'Cormorant Garamond', Georgia, 'Times New Roman', Times, serif",
  body: "'Plus Jakarta Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  /** @deprecated use display */
  serif: "'Cormorant Garamond', Georgia, 'Times New Roman', serif",
  /** @deprecated use body */
  sans: "'Plus Jakarta Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif",
} as const;

export const SITE_URL = getSiteBaseUrl();

export const EMAIL_LOGO_FILENAME = "hathor-email-icon.png";

export const EMAIL_LOGO_URL = `${getSiteBaseUrl()}/email/${EMAIL_LOGO_FILENAME}`;

/** Full-bleed editorial canvas — fills the client viewport width up to max. */
export const emailLayout = {
  maxWidth: "100%",
  contentMaxWidth: "680px",
  paddingDesktop: "48px",
  paddingMobile: "28px",
  paddingCard: "48px 40px",
  sectionGap: "32px",
  heroHeight: 360,
  iconSize: 72,
} as const;

export const GOOGLE_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap";
