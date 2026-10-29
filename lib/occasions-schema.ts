import { z } from "zod";
import {
  DEFAULT_OCCASIONS_SETTINGS,
  OCCASION_EFFECT_PALETTES,
  OCCASION_HANGINGS,
  OCCASION_ICON_NAMES,
  OCCASION_LIMITS,
  OCCASION_NAV_EFFECTS,
  OCCASION_STRIPE_MODES,
  OCCASION_STRIPE_STYLES,
  type Occasion,
  type OccasionStripeItem,
  type OccasionsSettings,
} from "@/lib/occasions";

/* Server and dashboard only: public pages read occasions the server has
   already parsed, and never need zod in their bundle. */

/** Site paths and https links only — never javascript:, data: or protocol-relative URLs. */
const safeUrl = z
  .string()
  .trim()
  .max(OCCASION_LIMITS.url)
  .refine(
    (value) => (value.startsWith("/") && !value.startsWith("//")) || value.startsWith("https://"),
    "Use a site path like /cruises or a full https:// link.",
  );

const isoInstant = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), "Enter a valid date and time.")
  .transform((value) => new Date(value).toISOString());

const stripeItemSchema = z.object({
  icon: z.enum(OCCASION_ICON_NAMES),
  imageUrl: safeUrl.nullable(),
  text: z.string().trim().min(1, "Each message needs some text.").max(OCCASION_LIMITS.text),
  href: safeUrl.nullable(),
}) satisfies z.ZodType<OccasionStripeItem, unknown>;

export const occasionSchema = z
  .object({
    id: z
      .string()
      .trim()
      .regex(/^[a-z0-9][a-z0-9-]{0,63}$/, "Use lowercase letters, numbers and dashes for the id."),
    name: z.string().trim().min(1, "Give the occasion a name.").max(OCCASION_LIMITS.name),
    enabled: z.boolean(),
    startsAt: isoInstant,
    endsAt: isoInstant,
    countdownTo: isoInstant.nullable(),
    stripe: z.object({
      enabled: z.boolean(),
      mode: z.enum(OCCASION_STRIPE_MODES),
      style: z.enum(OCCASION_STRIPE_STYLES),
      speed: z.number().min(20).max(120),
      dismissible: z.boolean(),
      items: z.array(stripeItemSchema).max(OCCASION_LIMITS.items),
      itemsAfterCountdown: z.array(stripeItemSchema).max(OCCASION_LIMITS.items),
    }),
    navEffect: z.object({
      type: z.enum(OCCASION_NAV_EFFECTS),
      intensity: z.number().min(0.1).max(1),
      palette: z.enum(OCCASION_EFFECT_PALETTES),
    }),
    hanging: z.enum(OCCASION_HANGINGS),
    heroCountdown: z.boolean(),
  })
  .refine((occasion) => Date.parse(occasion.endsAt) > Date.parse(occasion.startsAt), {
    message: "The end must be after the start.",
    path: ["endsAt"],
  }) satisfies z.ZodType<Occasion, unknown>;

export const occasionsSettingsSchema = z
  .object({
    occasions: z.array(occasionSchema).max(OCCASION_LIMITS.occasions),
  })
  .refine(
    (settings) => new Set(settings.occasions.map((occasion) => occasion.id)).size === settings.occasions.length,
    { message: "Two occasions share the same id.", path: ["occasions"] },
  ) satisfies z.ZodType<OccasionsSettings, unknown>;

/**
 * Lenient read for stored rows: keeps every occasion that still validates and
 * drops the rest, so one bad entry never takes the others (or a page) down.
 */
export function parseOccasionsSettings(raw: unknown): OccasionsSettings {
  if (!raw || typeof raw !== "object" || !Array.isArray((raw as { occasions?: unknown }).occasions)) {
    return DEFAULT_OCCASIONS_SETTINGS;
  }
  const seen = new Set<string>();
  const occasions: Occasion[] = [];
  for (const candidate of (raw as { occasions: unknown[] }).occasions) {
    const parsed = occasionSchema.safeParse(candidate);
    if (!parsed.success || seen.has(parsed.data.id)) continue;
    seen.add(parsed.data.id);
    occasions.push(parsed.data);
    if (occasions.length >= OCCASION_LIMITS.occasions) break;
  }
  return { occasions };
}

/** First problem in a dashboard save, phrased for the editor. */
export function describeOccasionsError(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) return "Check the occasion fields and try again.";
  const [, index] = issue.path;
  const prefix = typeof index === "number" ? `Occasion ${index + 1}: ` : "";
  return `${prefix}${issue.message}`;
}
