/**
 * Charter private-chapter media — distinct Hathor vessel states.
 * Defaults reuse approved local assets (no stock). CMS may override per slot.
 */

export const CHARTER_CHAPTER_SLOTS = [
  "charter-privacy",
  "charter-service",
  "charter-rhythm",
  "charter-itinerary",
] as const;

export type CharterChapterSlot = (typeof CHARTER_CHAPTER_SLOTS)[number];

export type CharterChapterMedia = {
  slot: CharterChapterSlot;
  alt: string;
  objectPosition: string;
};

/** Index-aligned with private chapter list (01–04). */
export const CHARTER_CHAPTER_MEDIA: CharterChapterMedia[] = [
  {
    slot: "charter-privacy",
    alt: "Private sun deck reserved exclusively for your party",
    objectPosition: "58% 28%",
  },
  {
    slot: "charter-service",
    alt: "Dedicated hospitality and service aboard Hathor",
    objectPosition: "42% 48%",
  },
  {
    slot: "charter-rhythm",
    alt: "Unhurried sailing rhythm along the Nile",
    objectPosition: "62% 40%",
  },
  {
    slot: "charter-itinerary",
    alt: "A voyage composed around your itinerary",
    objectPosition: "35% 55%",
  },
];
