import { prisma } from "@/lib/prisma";
import { withDb } from "@/lib/db-safe";
import {
  DEFAULT_SUITES_TYPOGRAPHY,
  DEFAULT_SUITES_TYPOGRAPHY_PHONE,
  suitesTypographySchema,
  type SuitesTypography,
} from "@/lib/suites-typography-shared";

export const SUITES_TYPOGRAPHY_KEY = "suites-typography";
export const SUITES_TYPOGRAPHY_MOBILE_KEY = "suites-typography-mobile";

export {
  DEFAULT_SUITES_TYPOGRAPHY,
  DEFAULT_SUITES_TYPOGRAPHY_PHONE,
  suitesTypographySchema,
};
export type { SuitesTypography };

function parse(value: string | null, fallback: SuitesTypography): SuitesTypography {
  try {
    return suitesTypographySchema.parse(JSON.parse(value ?? ""));
  } catch {
    return fallback;
  }
}

export async function getSuitesTypography(phone = false) {
  const key = phone ? SUITES_TYPOGRAPHY_MOBILE_KEY : SUITES_TYPOGRAPHY_KEY;
  const fallback = phone ? DEFAULT_SUITES_TYPOGRAPHY_PHONE : DEFAULT_SUITES_TYPOGRAPHY;
  const row = await withDb(() => prisma.siteSetting.findUnique({ where: { key } }));
  return parse(row?.value ?? null, fallback);
}

export async function saveSuitesTypography(value: unknown, phone = false) {
  const settings = suitesTypographySchema.parse(value);
  const key = phone ? SUITES_TYPOGRAPHY_MOBILE_KEY : SUITES_TYPOGRAPHY_KEY;
  await withDb(() =>
    prisma.siteSetting.upsert({
      where: { key },
      create: { key, value: JSON.stringify(settings) },
      update: { value: JSON.stringify(settings) },
    }),
  );
  return settings;
}
