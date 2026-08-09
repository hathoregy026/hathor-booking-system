import { z } from "zod";
import { typographyTextStyleSchema } from "@/lib/typography-settings-shared";

export const amenitiesSpacingSchema = z.object({
  /** Space under the big title (to sub, or to body when no sub). */
  titleToIndication: z.number().min(0).max(120),
  /** Space under the small label / sub, before body. */
  indicationToBody: z.number().min(0).max(120),
  /** Space under body, before CTA (opening + nature). */
  bodyToCta: z.number().min(0).max(160),
});

export type AmenitiesSpacing = z.infer<typeof amenitiesSpacingSchema>;

export const DEFAULT_AMENITIES_SPACING: AmenitiesSpacing = {
  titleToIndication: 14,
  indicationToBody: 14,
  bodyToCta: 22,
};

export const amenitiesTypographySchema = z.object({
  title: typographyTextStyleSchema,
  indication: typographyTextStyleSchema,
  body: typographyTextStyleSchema,
  spacing: amenitiesSpacingSchema,
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
  spacing: { ...DEFAULT_AMENITIES_SPACING },
};

export type AmenitiesStyleRole = "title" | "indication" | "body";

export const AMENITIES_STYLE_ROLES: AmenitiesStyleRole[] = [
  "title",
  "indication",
  "body",
];

/** Soft-merge so older saved JSON without `spacing` still loads. */
export function parseAmenitiesTypography(raw: unknown): AmenitiesTypography {
  if (!raw || typeof raw !== "object") return DEFAULT_AMENITIES_TYPOGRAPHY;
  const o = raw as Record<string, unknown>;
  try {
    return amenitiesTypographySchema.parse({
      title: {
        ...DEFAULT_AMENITIES_TYPOGRAPHY.title,
        ...(typeof o.title === "object" && o.title ? o.title : {}),
      },
      indication: {
        ...DEFAULT_AMENITIES_TYPOGRAPHY.indication,
        ...(typeof o.indication === "object" && o.indication
          ? o.indication
          : {}),
      },
      body: {
        ...DEFAULT_AMENITIES_TYPOGRAPHY.body,
        ...(typeof o.body === "object" && o.body ? o.body : {}),
      },
      spacing: {
        ...DEFAULT_AMENITIES_TYPOGRAPHY.spacing,
        ...(typeof o.spacing === "object" && o.spacing ? o.spacing : {}),
      },
    });
  } catch {
    return DEFAULT_AMENITIES_TYPOGRAPHY;
  }
}
