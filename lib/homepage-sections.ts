/** Homepage section chapters — mapped from OWO analysis + RAW_DATA.md */

import type { SiteImageName } from "@/lib/site-image-slots";

export type HomeChapterImage = {
  name: SiteImageName;
  alt: string;
};

export type HomeChapter = {
  id: string;
  headline: string;
  body: string;
  image: HomeChapterImage;
  imageSecondary?: HomeChapterImage;
  discoverLabel?: string;
  discoverHref?: string;
};

export const HOMEPAGE_SCROLL_STORY: readonly HomeChapter[] = [
  {
    id: "craftsmanship",
    headline: "Timeless Nile Craftsmanship",
    body: "A meticulous restoration carried out by master artisans has refined every detail aboard Hathor — where traditional Dahabiya charm meets contemporary elegance on the Nile.",
    image: {
      name: "home-story-craft-large",
      alt: "Ornate interior corridor aboard a luxury Dahabiya",
    },
    imageSecondary: {
      name: "home-collage-small",
      alt: "Detailed craftsmanship on the Hathor Dahabiya",
    },
  },
] as const;

export type LegacyRoomStep = {
  id: string;
  label: string;
  body: string;
  image: HomeChapterImage;
};

export const HOMEPAGE_LEGACY_ROOM_STACK = {
  headline: "Continuing a Legacy",
  intro:
    "Indulge yourself in timeless luxury on the Hathor Dahabiya Nile Cruise. From panoramic Nile view suites to gourmet fine dining and tranquil spa moments, every detail is crafted for relaxation and exclusivity.",
  steps: [
    {
      id: "luxury-cabin",
      label: "Luxury Cabin",
      body: "Handsome cabins overlook iconic Nile landmarks — refined comfort and thoughtful design for every sailing.",
      image: {
        name: "room-luxury",
        alt: "Luxury cabin aboard Hathor Dahabiya",
      },
    },
    {
      id: "luxury-suite",
      label: "Luxury Suite",
      body: "Expansive suites blend modern elegance with timeless Egyptian charm aboard our luxury Dahabiya.",
      image: {
        name: "room-suite",
        alt: "Luxury suite aboard Hathor",
      },
    },
    {
      id: "royal-suite",
      label: "Royal Suite",
      body: "The pinnacle of aboard accommodation — generous space, privacy, and uninterrupted Nile vistas.",
      image: {
        name: "room-royal",
        alt: "Royal suite aboard Hathor Dahabiya",
      },
    },
    {
      id: "suite-interior",
      label: "Suite Interiors",
      body: "Each room is tailored for the Nile journey — bespoke details, panoramic views, and quiet luxury.",
      image: {
        name: "home-cinematic-still",
        alt: "Luxury cabin interior aboard Hathor Dahabiya",
      },
    },
  ],
} as const satisfies {
  headline: string;
  intro: string;
  steps: readonly LegacyRoomStep[];
};

export const HOMEPAGE_SPLIT_CHAPTERS: readonly HomeChapter[] = [
  {
    id: "service",
    headline: "Legendary Service",
    body: "From the moment you step aboard, experience the warmth of Hathor's genuine hospitality — bespoke attention, intimate service, and the tranquil rhythm of the Nile.",
    image: {
      name: "home-split-courtyard",
      alt: "Elegant hallway aboard the Hathor Dahabiya",
    },
  },
  {
    id: "interiors",
    headline: "Exquisite Interiors",
    body: "Handsome cabins and suites overlook iconic Nile landmarks. Each expansive room blends modern comfort with timeless Egyptian charm aboard our luxury Dahabiya.",
    image: {
      name: "home-cinematic-still",
      alt: "Luxury suite interior on the Hathor Dahabiya",
    },
  },
  {
    id: "venue",
    headline: "An Iconic Journey",
    body: "From magnificent temples to lively riverbanks, Hathor Dahabiya heralds a new era of Nile cruising — history, comfort, and style on Egypt's legendary waterway.",
    image: {
      name: "home-alt-highlights",
      alt: "Temple of Hatshepsut along the Nile cruise route",
    },
  },
] as const;

export const HOMEPAGE_RESIDENCES_CHAPTERS: readonly HomeChapter[] = [
  {
    id: "details",
    headline: "The Finest Details",
    body: "Each cabin and suite is tailored for the Nile journey — refined luxury rooms, thoughtful design, and panoramic views from the best Dahabiya on the river.",
    image: {
      name: "room-luxury",
      alt: "Luxury cabin interior aboard Hathor Dahabiya",
    },
  },
  {
    id: "access",
    headline: "Exclusive Access",
    body: "Unrivalled amenities offer relaxation, wellness, and entertainment with intimate spaces separate from the crowds — a private Nile cruise Egypt at its finest.",
    image: {
      name: "home-collage-living",
      alt: "Luxury lounge aboard the Hathor Dahabiya",
    },
  },
] as const;

export const HOMEPAGE_ALTERNATING_CHAPTERS: readonly HomeChapter[] = [
  {
    id: "taste",
    headline: "A World of Taste",
    body: "There is a culinary experience for every occasion from morning until night — fine dining prepared with the freshest locally sourced ingredients aboard Egypt's finest Dahabiya.",
    image: {
      name: "gastronomy-restaurant",
      alt: "Fine dining restaurant aboard Hathor Dahabiya",
    },
    discoverLabel: "Explore Dining",
    discoverHref: "/gastronomy",
  },
  {
    id: "wellness",
    headline: "The Pinnacle of Wellness",
    body: "Holistic wellbeing at Hathor with the exclusive Seneb Spa and world-class wellness — a peaceful oasis on your luxury Dahabiya Nile cruise.",
    image: {
      name: "wellness-hero",
      alt: "Seneb Spa wellness pool aboard Hathor",
    },
    discoverLabel: "Explore Spa",
    discoverHref: "/wellness",
  },
  {
    id: "address",
    headline: "Egypt's Most Storied Waterway",
    body: "Sailing the Nile aboard Hathor, you are moments from the Unfinished Obelisk, the Valley of the Kings, and the timeless monuments of Luxor and Aswan.",
    image: {
      name: "home-alt-highlights",
      alt: "Ancient landmarks along the Nile",
    },
    discoverLabel: "Explore More",
    discoverHref: "/highlights",
  },
] as const;

export const HOMEPAGE_LAYERED_COLLAGE = {
  eyebrow: "Accommodations",
  headline: "Homes Without Precedent",
  body: "Hathor Dahabiya — an invitation to a superlative lifestyle on the Nile, within a vessel of illustrious Egyptian heritage and contemporary refinement.",
  images: {
    large: {
      name: "home-collage-large" as const,
      alt: "Luxury corridor with chandelier aboard Hathor",
    },
    small: {
      name: "home-collage-small" as const,
      alt: "Marble and mosaic detail aboard Hathor Dahabiya",
    },
  },
  backgroundName: "home-split-courtyard" as const,
} as const;

export const HOMEPAGE_SKETCH = {
  headline: "A Nile Landmark",
  body: "Hathor's extraordinary experience includes luxury accommodations, fine dining, Seneb Spa, and active wellness — sailing the legendary route between Luxor and Aswan.",
  imageName: "home-story-legacy-large" as const,
  links: [
    { label: "Luxury Rooms & Suites", href: "/rooms" },
    { label: "Hathor Itineraries", href: "/cruises" },
  ],
} as const;

export const HOMEPAGE_CINEMATIC_BRIDGE = {
  headline: "Luxury Dining on Egypt's Finest Dahabiya",
  body: "Where fine dining meets warm hospitality in unforgettable culinary delight on Hathor Dahabiya — dishes prepared with restaurant-level expertise using the freshest locally sourced ingredients.",
} as const;

export const HOMEPAGE_BENTO_IMAGES = [
  "room-luxury",
  "room-suite",
  "room-royal",
  "charter",
] as const;
