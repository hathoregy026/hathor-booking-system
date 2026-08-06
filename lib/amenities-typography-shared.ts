import { z } from "zod";
import { typographyTextStyleSchema } from "@/lib/typography-settings-shared";

export const amenitiesTypographySchema = z.object({
  title: typographyTextStyleSchema,
  indication: typographyTextStyleSchema,
  body: typographyTextStyleSchema,
});

export type AmenitiesTypography = z.infer<typeof amenitiesTypographySchema>;

/** Defaults match the amenities sequence gold on-image look. */
export const DEFAULT_AMENITIES_TYPOGRAPHY: AmenitiesTypography = {
  title: {
    fontFamily: "Gamgote",
    fontSize: 56,
    color: "#B69F64",
    lineHeight: 1.05,
    letterSpacing: 0,
    innerShadow: false,
  },
  indication: {
    fontFamily: "Agraham",
    fontSize: 14,
    color: "#B69F64",
    lineHeight: 1.3,
    letterSpacing: 1.2,
    innerShadow: false,
  },
  body: {
    fontFamily: "Agraham",
    fontSize: 18,
    color: "#B69F64",
    lineHeight: 1.5,
    letterSpacing: 0,
    innerShadow: false,
  },
};

export function parseAmenitiesTypography(raw: unknown): AmenitiesTypography {
  try {
    return amenitiesTypographySchema.parse(raw);
  } catch {
    return DEFAULT_AMENITIES_TYPOGRAPHY;
  }
}
