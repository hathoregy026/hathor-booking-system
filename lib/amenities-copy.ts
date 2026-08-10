/**
 * Amenities Sequence copy contract:
 * - Non-empty CMS string → show it
 * - Explicit empty "" → hide line but keep layout (spacer)
 * - Missing/undefined → optional fallback (first paint / legacy only)
 */

export function amenitiesCopy(
  cmsValue: string | null | undefined,
  fallback?: string,
): string {
  if (cmsValue === undefined || cmsValue === null) {
    return fallback?.trim() ?? "";
  }
  return cmsValue.trim();
}

export function amenitiesHasCopy(value: string | null | undefined): boolean {
  return Boolean(typeof value === "string" && value.trim());
}

/** Title → line array; empty CMS title → no lines (spacer at call site). */
export function amenitiesTitleLines(
  cmsTitle: string | null | undefined,
  fallbackLines: string[] = [],
): string[] {
  if (cmsTitle === undefined || cmsTitle === null) {
    return fallbackLines.filter(Boolean);
  }
  const trimmed = cmsTitle.trim();
  if (!trimmed) return [];
  const lines = trimmed
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  return lines.length > 0 ? lines : [trimmed];
}
