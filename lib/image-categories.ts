export const IMAGE_CATEGORIES = [
  "hero",
  "room",
  "suite",
  "dining",
  "spa",
  "landmark",
  "itinerary",
  "general",
] as const;

export type ImageCategory = (typeof IMAGE_CATEGORIES)[number];
