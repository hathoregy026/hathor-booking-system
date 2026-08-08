/**
 * Twelve unique CMS image mounts in the homepage amenities sequence,
 * ordered exactly as they first appear while scrolling the live site.
 * These slots are amenities-only — never reused on other pages.
 */
export const AMENITIES_SEQUENCE_IMAGE_SLOTS = [
  {
    name: "home-amenities-1",
    label: "1 — Intro fullscreen photo",
    alt: "Amenities sequence — fullscreen intro aboard Hathor",
  },
  {
    name: "home-amenities-2",
    label: "2 — Rising full-bleed photo",
    alt: "Amenities sequence — rising full-bleed Nile view",
  },
  {
    name: "home-amenities-3",
    label: "3 — Video inset photo",
    alt: "Amenities sequence — inset photo over the rising chapter",
  },
  {
    name: "home-amenities-4",
    label: "4 — Slider photo 1",
    alt: "Amenities sequence — first half/half slider photo",
  },
  {
    name: "home-amenities-5",
    label: "5 — Slider photo 2",
    alt: "Amenities sequence — second half/half slider photo",
  },
  {
    name: "home-amenities-6",
    label: "6 — Slider photo 3",
    alt: "Amenities sequence — third half/half slider photo",
  },
  {
    name: "home-amenities-7",
    label: "7 — Slider photo 4",
    alt: "Amenities sequence — fourth half/half slider photo",
  },
  {
    name: "home-amenities-8",
    label: "8 — Opening left photo",
    alt: "Amenities sequence — fixed left opening photo",
  },
  {
    name: "home-amenities-9",
    label: "9 — Opening card 1",
    alt: "Amenities sequence — first small opening card",
  },
  {
    name: "home-amenities-10",
    label: "10 — Opening card 2",
    alt: "Amenities sequence — second small opening card",
  },
  {
    name: "home-amenities-11",
    label: "11 — Opening card 3",
    alt: "Amenities sequence — third small opening card",
  },
  {
    name: "home-amenities-12",
    label: "12 — Nature fullscreen (after opening cards)",
    alt: "Amenities sequence — full-bleed nature chapter before Our Voyages",
  },
] as const;

export type AmenitiesSequenceImageName =
  (typeof AMENITIES_SEQUENCE_IMAGE_SLOTS)[number]["name"];

export const AMENITIES_SEQUENCE_IMAGE_NAMES = AMENITIES_SEQUENCE_IMAGE_SLOTS.map(
  (slot) => slot.name,
);
