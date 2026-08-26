import { getSiteBaseUrl } from "@/lib/public-url";

/**
 * Contact / About editorial DNA for booking emails.
 * Paper ground, ink type, Hathor gold — matched to contact-editorial / about-editorial.
 */
export const emailColors = {
  gold: "#b69f64",
  goldDark: "#806b35",
  goldLight: "#ded4c6",
  dark: "#0b0a08",
  ink: "#14120e",
  cream: "#ece4da",
  paperWarm: "#f3ede4",
  card: "#f3ede4",
  textPrimary: "#14120e",
  textSecondary: "#4a453c",
  textMuted: "#6b6560",
  border: "rgba(20, 18, 14, 0.16)",
  borderSolid: "#cfc7ba",
  borderGold: "#b69f64",
  success: "#806b35",
  infoBg: "#ded4c6",
  rowAlt: "#ece4da",
  copyOnDark: "#f6efdf",
  /** @deprecated use cream */
  background: "#ece4da",
} as const;

/**
 * Mail-safe Google Fonts closest to Contact/About:
 * Italiana (display) · Playfair Display (editorial) · Plus Jakarta Sans (meta/body).
 */
export const emailFonts = {
  display: "'Italiana', Georgia, 'Times New Roman', Times, serif",
  editorial: "'Playfair Display', Georgia, 'Times New Roman', Times, serif",
  body: "'Plus Jakarta Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  /** @deprecated use display */
  serif: "'Italiana', Georgia, 'Times New Roman', serif",
  /** @deprecated use body */
  sans: "'Plus Jakarta Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif",
} as const;

export const SITE_URL = getSiteBaseUrl();

export const EMAIL_LOGO_FILENAME = "hathor-email-icon.png";

export const EMAIL_LOGO_URL = `${getSiteBaseUrl()}/email/${EMAIL_LOGO_FILENAME}`;

/** Full-bleed editorial canvas. */
export const emailLayout = {
  maxWidth: "100%",
  contentMaxWidth: "640px",
  paddingDesktop: "48px",
  paddingMobile: "28px",
  paddingCard: "44px 36px 52px",
  sectionGap: "28px",
  heroHeight: 420,
  iconSize: 64,
} as const;

export const GOOGLE_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Italiana&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap";
