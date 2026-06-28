import type { ImageCategory } from "@/lib/image-categories";
import { HATHOR_MEDIA } from "@/lib/hathor-media";

export type SiteImageSlot = {
  name: string;
  altText: string;
  url: string;
  category: ImageCategory;
  pagePath: string;
  displayOrder: number;
};

/** Canonical image slots — seeded to SiteImage and editable in admin → Site Images. */
export const SITE_IMAGE_SLOTS: SiteImageSlot[] = [
  // Homepage
  {
    name: "home-hero-poster",
    altText: HATHOR_MEDIA.heroHomepageAlt,
    url: HATHOR_MEDIA.heroHomepage,
    category: "hero",
    pagePath: "/",
    displayOrder: 0,
  },
  {
    name: "home-post-hero-media",
    altText: HATHOR_MEDIA.postHeroMediaAlt,
    url: HATHOR_MEDIA.postHeroMedia,
    category: "general",
    pagePath: "/",
    displayOrder: 1,
  },
  {
    name: "home-story-craft-large",
    altText: "Ornate interior corridor aboard a luxury Dahabiya",
    url: HATHOR_MEDIA.storyCraftLarge,
    category: "general",
    pagePath: "/",
    displayOrder: 10,
  },
  {
    name: "home-story-craft-small",
    altText: "Detailed craftsmanship on the Hathor Dahabiya",
    url: HATHOR_MEDIA.storyCraftSmall,
    category: "general",
    pagePath: "/",
    displayOrder: 11,
  },
  {
    name: "home-story-transform",
    altText: "Grand staircase and elegant interior aboard Hathor",
    url: HATHOR_MEDIA.storyTransform,
    category: "general",
    pagePath: "/",
    displayOrder: 12,
  },
  {
    name: "home-story-legacy-large",
    altText: "Hathor Dahabiya sailing on the Nile",
    url: HATHOR_MEDIA.storyLegacyLarge,
    category: "general",
    pagePath: "/",
    displayOrder: 13,
  },
  {
    name: "home-story-legacy-small",
    altText: "Ancient Egyptian temple viewed from the Nile",
    url: HATHOR_MEDIA.storyLegacySmall,
    category: "general",
    pagePath: "/",
    displayOrder: 14,
  },
  {
    name: "home-cinematic-video",
    altText: HATHOR_MEDIA.cinematicVideoAlt,
    url: HATHOR_MEDIA.cinematicVideo,
    category: "general",
    pagePath: "/",
    displayOrder: 20,
  },
  {
    name: "home-cinematic-still",
    altText: HATHOR_MEDIA.cinematicStillAlt,
    url: HATHOR_MEDIA.cinematicStill,
    category: "suite",
    pagePath: "/",
    displayOrder: 21,
  },
  {
    name: "home-split-courtyard",
    altText: HATHOR_MEDIA.splitCourtyardAlt,
    url: HATHOR_MEDIA.splitCourtyard,
    category: "landmark",
    pagePath: "/",
    displayOrder: 22,
  },
  {
    name: "home-split-service",
    altText: "Elegant hallway aboard the Hathor Dahabiya",
    url: HATHOR_MEDIA.splitService,
    category: "general",
    pagePath: "/",
    displayOrder: 30,
  },
  {
    name: "home-split-interiors",
    altText: "Luxury suite interior on the Hathor Dahabiya",
    url: HATHOR_MEDIA.splitInteriors,
    category: "suite",
    pagePath: "/",
    displayOrder: 31,
  },
  {
    name: "home-split-venue",
    altText: "Temple of Hatshepsut along the Nile cruise route",
    url: HATHOR_MEDIA.splitVenue,
    category: "landmark",
    pagePath: "/",
    displayOrder: 32,
  },
  {
    name: "home-collage-bg",
    altText: "Hathor Dahabiya on the Nile at golden hour",
    url: HATHOR_MEDIA.collageBg,
    category: "hero",
    pagePath: "/",
    displayOrder: 40,
  },
  {
    name: "home-collage-large",
    altText: "Luxury corridor with chandelier aboard Hathor",
    url: HATHOR_MEDIA.collageLarge,
    category: "general",
    pagePath: "/",
    displayOrder: 41,
  },
  {
    name: "home-collage-small",
    altText: "Marble and mosaic detail aboard Hathor Dahabiya",
    url: HATHOR_MEDIA.collageSmall,
    category: "general",
    pagePath: "/",
    displayOrder: 42,
  },
  {
    name: "home-collage-living",
    altText: "Luxury suite aboard Hathor Dahabiya",
    url: HATHOR_MEDIA.collageLiving,
    category: "suite",
    pagePath: "/",
    displayOrder: 43,
  },
  {
    name: "home-residences-kitchen",
    altText: "Luxury cabin interior aboard Hathor Dahabiya",
    url: HATHOR_MEDIA.residencesKitchen,
    category: "room",
    pagePath: "/",
    displayOrder: 50,
  },
  {
    name: "home-residences-lounge",
    altText: "Luxury lounge aboard the Hathor Dahabiya",
    url: HATHOR_MEDIA.residencesLounge,
    category: "general",
    pagePath: "/",
    displayOrder: 51,
  },
  {
    name: "home-residences-rooftop",
    altText: "Sun deck aboard Hathor Dahabiya at golden hour",
    url: HATHOR_MEDIA.residencesRooftop,
    category: "hero",
    pagePath: "/",
    displayOrder: 52,
  },
  {
    name: "home-sketch-boat",
    altText: "Hathor Dahabiya sailing on the Nile — deck plan reference",
    url: HATHOR_MEDIA.sketchBoat,
    category: "general",
    pagePath: "/",
    displayOrder: 53,
  },
  {
    name: "home-alt-dining",
    altText: "Fine dining restaurant aboard Hathor Dahabiya",
    url: HATHOR_MEDIA.altDining,
    category: "dining",
    pagePath: "/",
    displayOrder: 60,
  },
  {
    name: "home-alt-wellness",
    altText: "Seneb Spa wellness pool aboard Hathor",
    url: HATHOR_MEDIA.altWellness,
    category: "spa",
    pagePath: "/",
    displayOrder: 61,
  },
  {
    name: "home-alt-highlights",
    altText: "Ancient landmarks along the Nile",
    url: HATHOR_MEDIA.altHighlights,
    category: "landmark",
    pagePath: "/",
    displayOrder: 62,
  },
  {
    name: "home-testimonials-bg",
    altText: "Hathor Dahabiya on the Nile at sunset",
    url: HATHOR_MEDIA.testimonials,
    category: "general",
    pagePath: "/",
    displayOrder: 70,
  },
  // Shared accommodations
  {
    name: "room-luxury",
    altText: "Luxury cabin aboard Hathor Dahabiya",
    url: HATHOR_MEDIA.luxuryRoom,
    category: "room",
    pagePath: "/rooms",
    displayOrder: 0,
  },
  {
    name: "room-suite",
    altText: "Luxury suite aboard Hathor Dahabiya",
    url: HATHOR_MEDIA.luxurySuite,
    category: "suite",
    pagePath: "/rooms",
    displayOrder: 1,
  },
  {
    name: "room-royal",
    altText: "Royal suite aboard Hathor Dahabiya",
    url: HATHOR_MEDIA.royalSuite,
    category: "suite",
    pagePath: "/rooms",
    displayOrder: 2,
  },
  {
    name: "charter",
    altText: "Private charter aboard Hathor Dahabiya",
    url: HATHOR_MEDIA.charter,
    category: "general",
    pagePath: "/charter",
    displayOrder: 0,
  },
  // Page heroes
  {
    name: "cruises-hero",
    altText: "Luxury Dahabiya cruise on the Nile",
    url: HATHOR_MEDIA.heroCruises,
    category: "hero",
    pagePath: "/cruises",
    displayOrder: 0,
  },
  {
    name: "about-hero",
    altText: "Hathor Dahabiya sailing on the Nile",
    url: HATHOR_MEDIA.about,
    category: "hero",
    pagePath: "/about",
    displayOrder: 0,
  },
  {
    name: "gastronomy-hero",
    altText: "Gourmet dining aboard Hathor Dahabiya with Nile views",
    url: HATHOR_MEDIA.dining,
    category: "dining",
    pagePath: "/gastronomy",
    displayOrder: 0,
  },
  {
    name: "gastronomy-restaurant",
    altText: "Hathor Dahabiya restaurant interior",
    url: HATHOR_MEDIA.restaurant,
    category: "dining",
    pagePath: "/gastronomy",
    displayOrder: 1,
  },
  {
    name: "wellness-hero",
    altText: "Seneb Spa wellness aboard Hathor Dahabiya",
    url: HATHOR_MEDIA.wellness,
    category: "spa",
    pagePath: "/wellness",
    displayOrder: 0,
  },
  {
    name: "wellness-fitness",
    altText: "Fitness and active wellness aboard Hathor",
    url: HATHOR_MEDIA.fitness,
    category: "spa",
    pagePath: "/wellness",
    displayOrder: 1,
  },
  {
    name: "highlights-hero",
    altText: "Dahabiya sailing past ancient Egyptian monuments",
    url: HATHOR_MEDIA.highlights,
    category: "landmark",
    pagePath: "/highlights",
    displayOrder: 0,
  },
  {
    name: "highlights-lifestyle",
    altText: "Scenic Nile views from Hathor Dahabiya",
    url: HATHOR_MEDIA.lifestyle,
    category: "landmark",
    pagePath: "/highlights",
    displayOrder: 1,
  },
  {
    name: "landmark-obelisk",
    altText: "Unfinished Obelisk, Aswan",
    url: HATHOR_MEDIA.obelisk,
    category: "landmark",
    pagePath: "/highlights",
    displayOrder: 2,
  },
  {
    name: "landmark-hatshepsut",
    altText: "Temple of Hatshepsut",
    url: HATHOR_MEDIA.templeHatshepsut,
    category: "landmark",
    pagePath: "/highlights",
    displayOrder: 3,
  },
  {
    name: "landmark-valley-kings",
    altText: "Valley of the Kings, Luxor",
    url: HATHOR_MEDIA.valleyOfKings,
    category: "landmark",
    pagePath: "/highlights",
    displayOrder: 4,
  },
  {
    name: "charter-hero",
    altText: "Private charter on the Hathor Dahabiya",
    url: HATHOR_MEDIA.heroCharter,
    category: "hero",
    pagePath: "/charter",
    displayOrder: 0,
  },
  {
    name: "contact-hero",
    altText: "Hathor Dahabiya on the Nile",
    url: HATHOR_MEDIA.heroContact,
    category: "hero",
    pagePath: "/contact",
    displayOrder: 0,
  },
  {
    name: "blog-hero",
    altText: "Hathor Dahabiya blog — stories from the Nile",
    url: HATHOR_MEDIA.heroBlog,
    category: "general",
    pagePath: "/blogs",
    displayOrder: 0,
  },
  {
    name: "about-dining",
    altText: "Fine dining aboard Hathor Dahabiya",
    url: HATHOR_MEDIA.dining,
    category: "dining",
    pagePath: "/about",
    displayOrder: 1,
  },
];

export type SiteImageName = (typeof SITE_IMAGE_SLOTS)[number]["name"];

const SLOT_BY_NAME = new Map(SITE_IMAGE_SLOTS.map((slot) => [slot.name, slot]));

export function getSiteImageSlot(name: string): SiteImageSlot | undefined {
  return SLOT_BY_NAME.get(name);
}

export function getDefaultSiteImage(name: string): { src: string; alt: string } {
  const slot = getSiteImageSlot(name);
  if (!slot) {
    return { src: HATHOR_MEDIA.heroHomepage, alt: "Hathor Dahabiya" };
  }
  return { src: slot.url, alt: slot.altText };
}
