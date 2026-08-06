import { z } from "zod";
import { typographyTextStyleSchema } from "@/lib/typography-settings-shared";

export const gastronomyTypographySchema = z.object({
  display: typographyTextStyleSchema,
  indication: typographyTextStyleSchema,
  body: typographyTextStyleSchema,
});

export type GastronomyTypography = z.infer<typeof gastronomyTypographySchema>;

export const DEFAULT_GASTRONOMY_TYPOGRAPHY: GastronomyTypography = {
  display: { fontFamily: "Gamgote", fontSize: 64, color: "#F5E8D1", lineHeight: 0.95, letterSpacing: 0, innerShadow: false },
  indication: { fontFamily: "Agraham", fontSize: 14, color: "#B69F64", lineHeight: 1.2, letterSpacing: 1.2, innerShadow: false },
  body: { fontFamily: "Agraham", fontSize: 18, color: "#B69F64", lineHeight: 1.45, letterSpacing: 0, innerShadow: false },
};
