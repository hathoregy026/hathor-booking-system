import { z } from "zod";

export const WHEEL_STAGE_SETTINGS_KEY = "wheel-stage";

/** Parchment behind the homepage helm wheel (`home-wheel-stage`). */
export const wheelStageSettingsSchema = z.object({
  /** 0 = invisible, 1 = fully opaque. */
  opacity: z.number().min(0).max(1),
});

export type WheelStageSettings = z.infer<typeof wheelStageSettingsSchema>;

export const DEFAULT_WHEEL_STAGE_SETTINGS: WheelStageSettings = {
  opacity: 0.5,
};

function asFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function clamp(value: number, min: number, max: number, fallback: number) {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

export function parseWheelStageSettings(raw: unknown): WheelStageSettings {
  const src =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};

  const candidate: WheelStageSettings = {
    opacity: clamp(
      asFiniteNumber(src.opacity) ?? DEFAULT_WHEEL_STAGE_SETTINGS.opacity,
      0,
      1,
      DEFAULT_WHEEL_STAGE_SETTINGS.opacity,
    ),
  };

  const parsed = wheelStageSettingsSchema.safeParse(candidate);
  return parsed.success ? parsed.data : DEFAULT_WHEEL_STAGE_SETTINGS;
}

export function isWheelStageSettingsEqual(
  a: WheelStageSettings,
  b: WheelStageSettings,
): boolean {
  return Math.abs(a.opacity - b.opacity) < 0.0005;
}
