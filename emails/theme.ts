import type { EmailTemplateOverrides } from "@/lib/email-templates";
import { resolveEmailLogoSrcForSend } from "@/lib/email-image-resolve";
import { emailColors } from "./styles";

export type ResolvedEmailTheme = {
  logoUrl: string;
  primaryColor: string;
  goldDark: string;
  backgroundColor: string;
  cardBackground: string;
  borderColor: string;
  infoBg: string;
};

export function resolveEmailTheme(
  overrides?: EmailTemplateOverrides | null,
): ResolvedEmailTheme {
  const primaryColor = overrides?.primaryColor?.trim() || emailColors.gold;
  const backgroundColor =
    overrides?.backgroundColor?.trim() || emailColors.background;

  return {
    logoUrl: resolveEmailLogoSrcForSend(overrides?.logoUrl),
    primaryColor,
    goldDark:
      primaryColor === emailColors.gold ? emailColors.goldDark : primaryColor,
    backgroundColor,
    cardBackground: emailColors.card,
    borderColor: emailColors.border,
    infoBg: emailColors.infoBg,
  };
}
