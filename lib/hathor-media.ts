export const HATHOR_MEDIA_BASE = "/media/hathor";

/** Public URL for a synced Hathor WebP image by slot key. */
export function hathorImage(key: string): string {
  return `${HATHOR_MEDIA_BASE}/${key}.webp`;
}

export function hathorVideo(key: string): string {
  return `${HATHOR_MEDIA_BASE}/videos/${key}.mp4`;
}

/** Default site image URLs — local Hathor media (WebP), not Unsplash. */
export const HATHOR_MEDIA = {
  heroHomepage: hathorImage("home-hero-poster"),
  heroHomepageAlt: "Hathor Dahabiya sailing on the Nile at sunset",
  postHeroMedia: hathorImage("home-post-hero-media"),
  postHeroMediaAlt: "Hathor Dahabiya on the Nile with ancient Egyptian landmarks",
  storyCraftLarge: hathorImage("home-story-craft-large"),
  storyCraftSmall: hathorImage("home-story-craft-small"),
  storyTransform: hathorImage("home-story-transform"),
  storyLegacyLarge: hathorImage("home-story-legacy-large"),
  storyLegacySmall: hathorImage("home-story-legacy-small"),
  cinematicVideo: hathorImage("home-cinematic-video"),
  cinematicVideoAlt: "Fine dining aboard Hathor Dahabiya",
  cinematicStill: hathorImage("home-cinematic-still"),
  cinematicStillAlt: "Luxury suite aboard Hathor Dahabiya",
  splitCourtyard: hathorImage("home-split-courtyard"),
  splitCourtyardAlt: "Hathor Dahabiya on the Nile",
  splitService: hathorImage("home-split-service"),
  splitInteriors: hathorImage("home-split-interiors"),
  splitVenue: hathorImage("home-split-venue"),
  collageBg: hathorImage("home-collage-bg"),
  collageLarge: hathorImage("home-collage-large"),
  collageSmall: hathorImage("home-collage-small"),
  collageLiving: hathorImage("home-collage-living"),
  residencesKitchen: hathorImage("home-residences-kitchen"),
  residencesLounge: hathorImage("home-residences-lounge"),
  residencesRooftop: hathorImage("home-residences-rooftop"),
  sketchBoat: hathorImage("home-sketch-boat"),
  altDining: hathorImage("home-alt-dining"),
  altWellness: hathorImage("home-alt-wellness"),
  altHighlights: hathorImage("home-alt-highlights"),
  testimonials: hathorImage("home-testimonials-bg"),
  luxuryRoom: hathorImage("room-luxury"),
  luxurySuite: hathorImage("room-suite"),
  royalSuite: hathorImage("room-royal"),
  charter: hathorImage("charter"),
  lifestyle: hathorImage("highlights-lifestyle"),
  highlights: hathorImage("highlights-hero"),
  dining: hathorImage("gastronomy-hero"),
  wellness: hathorImage("wellness-hero"),
  about: hathorImage("about-hero"),
  templeHatshepsut: hathorImage("landmark-hatshepsut"),
  obelisk: hathorImage("landmark-obelisk"),
  valleyOfKings: hathorImage("landmark-valley-kings"),
  fitness: hathorImage("wellness-fitness"),
  restaurant: hathorImage("gastronomy-restaurant"),
  heroCruises: hathorImage("cruises-hero"),
  heroBlog: hathorImage("blog-hero"),
  heroContact: hathorImage("contact-hero"),
  heroCharter: hathorImage("charter-hero"),
  legacyCabin: hathorImage("legacy-cabin"),
  legacySuite: hathorImage("legacy-suite"),
  legacyRoyal: hathorImage("legacy-royal"),
  legacyInterior: hathorImage("legacy-interior"),
  heroReel: hathorVideo("hero-reel"),
} as const;

export const LEGACY_SCROLL_IMAGES = [
  {
    headline: "Luxury Cabins",
    body: "Handsome cabins overlook iconic Nile landmarks — refined comfort and thoughtful design for every sailing.",
    src: HATHOR_MEDIA.legacyCabin,
    alt: "Luxury cabin aboard Hathor Dahabiya",
  },
  {
    headline: "Luxury Suites",
    body: "Expansive suites blend modern elegance with timeless Egyptian charm aboard our luxury Dahabiya.",
    src: HATHOR_MEDIA.legacySuite,
    alt: "Luxury suite aboard Hathor Dahabiya",
  },
  {
    headline: "Royal Suite",
    body: "The pinnacle of aboard accommodation — generous space, privacy, and uninterrupted Nile vistas.",
    src: HATHOR_MEDIA.legacyRoyal,
    alt: "Royal suite aboard Hathor Dahabiya",
  },
  {
    headline: "Suite Interiors",
    body: "Each room is tailored for the Nile journey — bespoke details, panoramic views, and quiet luxury.",
    src: HATHOR_MEDIA.legacyInterior,
    alt: "Luxury suite interior aboard Hathor Dahabiya",
  },
] as const;
