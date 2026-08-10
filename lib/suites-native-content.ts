/**
 * Native Suites page content — migrated from bake-time Springs copy
 * (scripts/build-suites-exact-homepage.mjs). Image defaults align with
 * /api/suites-config dashboard slots.
 */

export const SUITES_NATIVE_MEDIA = {
  hero: "/media/hathor/scraped/suites-hero.webp",
  rooms: "/media/hathor/scraped/suites-luxury-rooms.webp",
  suites: "/media/hathor/scraped/suites-luxury-suites.webp",
  royal: "/media/hathor/scraped/suites-royal.webp",
  roomHero: "/media/hathor/r2/room-suite.webp",
  luxury: "/media/hathor/r2/room-luxury.webp",
  royalHero: "/media/hathor/r2/room-royal.webp",
  cabin1: "/media/hathor/scraped/cabin-1.webp",
  cabin2: "/media/hathor/scraped/cabin-2.webp",
  cabin3: "/media/hathor/scraped/cabin-3.webp",
  cabin5: "/media/hathor/scraped/cabin-5.webp",
  cabin6: "/media/hathor/scraped/cabin-6.webp",
  lux1: "/media/hathor/scraped/luxsuite-1.webp",
  lux2: "/media/hathor/scraped/luxsuite-2.webp",
  lux3: "/media/hathor/scraped/luxsuite-3.webp",
  lux4: "/media/hathor/scraped/luxsuite-4.webp",
  lux5: "/media/hathor/scraped/luxsuite-5.webp",
  lux6: "/media/hathor/scraped/luxsuite-6.webp",
  royal1: "/media/hathor/scraped/royal-1.webp",
  royal2: "/media/hathor/scraped/royal-2.webp",
  royal3: "/media/hathor/scraped/royal-3.webp",
  royal4: "/media/hathor/scraped/royal-4.webp",
  royal5: "/media/hathor/scraped/royal-5.webp",
  royal6: "/media/hathor/scraped/royal-6.webp",
} as const;

/** Slot name → default path (for /api/suites-config merge). */
export const SUITES_NATIVE_SLOT_DEFAULTS: Record<string, string> = {
  "scraped-suites-hero": SUITES_NATIVE_MEDIA.hero,
  "scraped-royal-5": SUITES_NATIVE_MEDIA.royal5,
  "scraped-luxsuite-2": SUITES_NATIVE_MEDIA.lux2,
  "scraped-suites-royal": SUITES_NATIVE_MEDIA.royal,
  "scraped-luxsuite-6": SUITES_NATIVE_MEDIA.lux6,
  "scraped-luxsuite-1": SUITES_NATIVE_MEDIA.lux1,
  "scraped-suites-luxury-rooms": SUITES_NATIVE_MEDIA.rooms,
  "scraped-royal-1": SUITES_NATIVE_MEDIA.royal1,
  "scraped-cabin-2": SUITES_NATIVE_MEDIA.cabin2,
  "scraped-cabin-3": SUITES_NATIVE_MEDIA.cabin3,
  "scraped-cabin-1": SUITES_NATIVE_MEDIA.cabin1,
  "scraped-royal-3": SUITES_NATIVE_MEDIA.royal3,
  "scraped-luxsuite-3": SUITES_NATIVE_MEDIA.lux3,
  "scraped-luxsuite-4": SUITES_NATIVE_MEDIA.lux4,
  "scraped-cabin-5": SUITES_NATIVE_MEDIA.cabin5,
  "scraped-suites-luxury-suites": SUITES_NATIVE_MEDIA.suites,
  "scraped-luxsuite-5": SUITES_NATIVE_MEDIA.lux5,
  "room-suite": SUITES_NATIVE_MEDIA.roomHero,
  "room-royal": SUITES_NATIVE_MEDIA.royalHero,
  "scraped-royal-2": SUITES_NATIVE_MEDIA.royal2,
  "scraped-royal-4": SUITES_NATIVE_MEDIA.royal4,
  "scraped-royal-6": SUITES_NATIVE_MEDIA.royal6,
  "scraped-cabin-6": SUITES_NATIVE_MEDIA.cabin6,
  "room-luxury": SUITES_NATIVE_MEDIA.luxury,
};

export const SUITES_NATIVE_GALLERY_SLOTS = [
  "scraped-suites-hero",
  "scraped-suites-luxury-suites",
  "scraped-suites-luxury-rooms",
  "scraped-suites-royal",
  "scraped-luxsuite-6",
  "scraped-luxsuite-1",
  "scraped-luxsuite-2",
  "scraped-cabin-1",
  "scraped-cabin-2",
  "scraped-cabin-3",
  "scraped-royal-1",
  "scraped-royal-3",
  "scraped-luxsuite-3",
  "scraped-luxsuite-4",
  "scraped-cabin-5",
  "scraped-royal-5",
  "scraped-luxsuite-5",
  "room-suite",
  "room-royal",
] as const;

export const SUITES_NATIVE_CTAS = {
  exploreSuites: { label: "Explore the Suites", href: "/rooms" },
  concierge: { label: "Speak with Concierge", href: "/contact" },
  discoverCollection: {
    label: "Discover the Collection",
    href: "/luxury-cabins-Nile-Cruise",
  },
  compareSuites: { label: "Compare Suites", href: "#suites-collection" },
  viewSuiteDetails: {
    label: "View Suite Details",
    href: "/Luxury-Royal-Suites-Nile-Dahabiya-Cruise",
  },
  exploreRooms: {
    label: "Explore rooms",
    href: "/luxury-cabins-Nile-Cruise",
  },
  viewSuites: { label: "View suites", href: "/rooms" },
  viewRoyal: {
    label: "View suites",
    href: "/Luxury-Royal-Suites-Nile-Dahabiya-Cruise",
  },
  requestAvailability: {
    label: "Request Availability",
    href: "/suites?book=1",
  },
  speakConcierge: { label: "Speak With Concierge", href: "/contact" },
} as const;

export const SUITES_NATIVE_CONTENT = {
  hero: {
    eyebrow: "The Private Nile",
    titleLines: ["River", "Suites"] as const,
    support:
      "Luxury suites aboard Hathor Dahabiya: private Nile journeys shaped for stillness, craft, and panoramic river light",
  },
  unrivaled: {
    eyebrow: "Views",
    title: "Luxury Suites with Unrivaled Views",
    body: "Luxury Rooms, Elegant Suites, and Royal Suites with panoramic Nile views aboard Hathor Dahabiya.",
  },
  stepAboard: {
    eyebrow: "Arrival",
    title: "Step aboard Hathor and settle into your Nile sanctuary",
    body: "Experience Hathor Dahabiya Cruise that blends authenticity with luxury, offering an unforgettable journey by the timeless Nile. Whether you stay in our Elegant Suites or Royal Suites with panoramic Nile view, you enjoy unmatched comfort and exclusive privacy.",
  },
  comfort: {
    eyebrow: "Essence of Suite Comfort",
    title: "Comfort",
    lead:
      "Every Hathor suite is crafted for comfort and ease: LED screens, walk-in showers or bathtubs, safe boxes, and quiet privacy as the Nile drifts past your windows.",
    amenities: [
      {
        id: "shower",
        label: "Shower",
        body: "Return from temple shores to a suite shower and soft river light. Bathtub or walk-in shower, quiet air, and the Nile beyond the glass. Worries of the day dissolve into water and gold dusk.",
        imageSlot: "scraped-luxsuite-1",
      },
      {
        id: "balcony",
        label: "Balcony",
        body: "Private balcony stillness mellows the mind. Finding balance is easy when the river itself sets the tempo of your voyage.",
        imageSlot: "scraped-luxsuite-2",
      },
      {
        id: "smart-tv",
        label: "Smart TV",
        body: "Smart entertainment and suite systems wait a few steps from your bed: LED screens, climate, and quiet modern comfort shaped for Nile nights.",
        imageSlot: "scraped-luxsuite-3",
      },
      {
        id: "minibar",
        label: "Minibar",
        body: "Tea and coffee facilities wait in your suite. Cozy up with a quiet pour as ambient river sounds replace the city: a private café of one aboard Hathor.",
        imageSlot: "scraped-luxsuite-4",
      },
    ] as const,
  },
  nile: {
    eyebrow: "River",
    title: "The Nile",
    subtitle: "Lightness of the Nile",
    body: "Here, the Nile becomes part of your suite. River light fills panoramic windows; temple banks and soft water become the backdrop to morning coffee, afternoon stillness, and evenings of quiet conversation.",
    captions: [
      "Enjoy the Nile’s embrace that shields you from the world outside. Soft banks, temple silhouettes, gold water at dusk. Hathor lets you learn the art of leisure afloat.",
      "Panoramic suite windows, framed with river light, create the atmosphere of a private horizon floating above the Nile.",
      "Quiet suite interiors that evoke cool retreats, handcrafted detail, and sunlit Nile glades beyond the glass.",
      "Artfully designed suite spaces that delight you with Egyptian craft, soft textiles, and the living panorama of the river outside.",
    ] as const,
    imageSlots: [
      "scraped-luxsuite-2",
      "scraped-royal-2",
      "scraped-royal-4",
      "scraped-cabin-6",
    ] as const,
  },
  statement: {
    eyebrow: "Voyage",
    title: "Essence of River Light",
    body: "Hathor sails the classic Luxor to Aswan corridor of the Nile, surrounded by temples and close to the riverbanks that shaped ancient Egypt: a private Dahabiya route of rare stillness.",
    secondary:
      "Breathe in the river air and open space. As Hathor glides, delight in the kaleidoscope of shifting panoramas from Luxor to Aswan. Set your pace to three, four, or seven nights, and change it at your desire.",
    panels: [
      "scraped-suites-luxury-rooms",
      "scraped-suites-luxury-suites",
      "scraped-suites-hero",
      "scraped-luxsuite-4",
    ] as const,
  },
  map: {
    eyebrow: "Route",
    title: "Sail between Luxor and Aswan",
    caption:
      "Landscapes of river light and temple banks that belong only to your voyage.",
    stats: [
      { value: "8", label: "Luxury Cabins & Suites" },
      { value: "2", label: "Elegant Suites" },
      { value: "2", label: "Magnificent Royal Suites" },
    ] as const,
    imageSlot: "scraped-suites-luxury-suites",
  },
  craft: {
    eyebrow: "Design",
    title: "Craft",
    subtitle: "Inspired Nile Craft",
    body: "Handcrafted Dahabiya elegance on the water. Suites shaped with Egyptian artistry, modern comfort, and windows that open onto the eternal Nile.",
    followOns: [
      "Each suite reflects boundless Nile perspectives in its panoramic windows, inviting you to look farther with a fuller palette of voyage possibilities.",
      "Hathor’s suite craft emphasizes panoramic glass, private balconies, and calm volume. Timeless Egyptian charm meets modern comfort: freedom of rest, elegance of detail, and visual lightness on the water.",
    ] as const,
    imageSlots: [
      "scraped-luxsuite-3",
      "scraped-luxsuite-5",
      "scraped-royal-3",
    ] as const,
  },
  collection: {
    eyebrow: "Collection",
    title: "Suites",
    subtitle: "Collection of Nile sanctuaries",
    cards: [
      {
        index: "01",
        label: "Rooms",
        title: "Luxury Rooms",
        hint: "12 Luxury Cabins & Suites · up to 56 m²",
        href: SUITES_NATIVE_CTAS.exploreRooms.href,
        cta: SUITES_NATIVE_CTAS.exploreRooms.label,
        imageSlot: "scraped-suites-luxury-rooms",
      },
      {
        index: "02",
        label: "Suites",
        title: "Luxury Suites",
        hint: "2 Elegant Suites",
        href: SUITES_NATIVE_CTAS.viewSuites.href,
        cta: SUITES_NATIVE_CTAS.viewSuites.label,
        imageSlot: "scraped-suites-luxury-suites",
      },
      {
        index: "03",
        label: "Royal",
        title: "Royal Suites",
        hint: "2 Royal Suites",
        href: SUITES_NATIVE_CTAS.viewRoyal.href,
        cta: SUITES_NATIVE_CTAS.viewRoyal.label,
        imageSlot: "scraped-suites-royal",
      },
    ] as const,
  },
  interiors: {
    eyebrow: "Inside",
    title: "Interiors",
    subtitle: "Beauty in the Essence of Suite Life",
    body: "Our suites are chosen with a delicate treatment of materials and time; time that becomes a Nile memory. Warm woods, soft textiles, and modern suite systems. This is how we create a visual and tactile space for authentically high-class comfort afloat.",
    closing:
      "Each Hathor suite offers a complete turnkey sanctuary, so you can enjoy refined Nile living from the very first moments aboard. Muted palette, soft curves, panoramic glass. Refinement is the new luxury on the Dahabiya.",
    imageSlots: [
      "scraped-luxsuite-5",
      "scraped-royal-6",
      "room-suite",
    ] as const,
  },
  closing: {
    eyebrow: "Your Nile Awaits",
    title: "Begin Your Journey",
    body: "A voyage shaped around you. Join our exclusive circle for private itineraries and early access to rare voyages.",
  },
} as const;

export function resolveSuitesImage(
  images: Record<string, string> | undefined,
  slot: string,
): string {
  return (
    images?.[slot]?.trim() ||
    SUITES_NATIVE_SLOT_DEFAULTS[slot] ||
    SUITES_NATIVE_MEDIA.hero
  );
}
