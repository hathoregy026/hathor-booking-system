import {
  HOMEPAGE_ABOUT,
  HOMEPAGE_DINING,
  HOMEPAGE_HERO,
  HOMEPAGE_HIGHLIGHTS,
  HOMEPAGE_ITINERARIES,
  HOMEPAGE_LIFESTYLE,
  HOMEPAGE_REVIEWS,
  HOMEPAGE_WELLNESS,
} from "@/lib/homepage-content";
import { HATHOR_CRUISES } from "@/lib/hathor-catalog";
import type {
  LuxuryRoomTypeValue,
  StayDurationValue,
} from "@/lib/booking-search-config";
import type { SiteImageName } from "@/lib/site-image-slots";

function formatCruisePorts(ports: string) {
  return ports.replace(/→/g, "/").replace(/\s*\/\s*/g, " / ").trim();
}

function roomImageName(roomType: string): SiteImageName {
  if (roomType.includes("Royal")) return "room-royal";
  if (roomType.includes("Suite")) return "room-suite";
  return "room-luxury";
}

function roomSearchType(roomType: string): LuxuryRoomTypeValue {
  if (roomType.includes("Royal")) return "luxury-royal-suites";
  if (roomType.includes("Suite")) return "luxury-suites";
  return "luxury-rooms";
}

function roomTitleSuffix(roomType: string) {
  if (roomType.includes("Royal")) return "Royal Suite";
  if (roomType.includes("Suite")) return "Suite";
  return "Cabin";
}

/** Homepage itineraries carousel — one slide per cruise room option. */
export type ExCarouselSlide = {
  key: string;
  title: string;
  imageName: SiteImageName;
  alt: string;
  duration: StayDurationValue;
  roomType: LuxuryRoomTypeValue;
};

function buildCarouselSlides(): ExCarouselSlide[] {
  return HATHOR_CRUISES.flatMap((cruise) => {
    const ports = formatCruisePorts(cruise.ports);
    const duration = cruise.slug as StayDurationValue;

    return cruise.rooms.map((room) => ({
      key: `${cruise.slug}-${room.roomNumber}`,
      title: `${ports} · ${roomTitleSuffix(room.roomType)}`,
      imageName: roomImageName(room.roomType),
      alt: `${room.name} — ${cruise.name}`,
      duration,
      roomType: roomSearchType(room.roomType),
    }));
  });
}

export const EX_GOLD_LOGO_SRC = "/branding/gold.svg";

export const EX_HERO = {
  kicker: "Nile · Egypt",
  lineRight: "Ultra Luxury",
  lineLeft: "Dahabiya Cruise",
  subtitle: HOMEPAGE_HERO.subtitle,
  sideLeft: "Luxor · Aswan",
  sideRight: "Private Nile Sailing",
  /** CMS slot for video poster / hero cover. */
  imageName: "home-hero-poster" as SiteImageName,
} as const;

export const EX_ABOUT = {
  eyebrow: HOMEPAGE_ABOUT.subtitle,
  heading: "Elegance and\na way of life.",
  body: HOMEPAGE_ABOUT.body,
  imageName: "home-story-craft-large" as SiteImageName,
  imageAlt: "Ornate interior aboard Hathor Dahabiya",
  decor: [
    { name: "home-collage-small" as SiteImageName, alt: "" },
    { name: "home-collage-large" as SiteImageName, alt: "" },
    { name: "home-split-courtyard" as SiteImageName, alt: "" },
  ],
} as const;

export const EX_CAROUSEL = {
  title: HOMEPAGE_ITINERARIES.title,
  subtitle: HOMEPAGE_ITINERARIES.subtitle,
  slides: buildCarouselSlides(),
} as const;

export const EX_PINNED = {
  title: "Every landmark,\na pleasure.",
  body: HOMEPAGE_HIGHLIGHTS.body,
  slides: [
    {
      imageName: "cruises-hero" as SiteImageName,
      alt: "Hathor Dahabiya sailing on the Nile",
      title: "Every landmark,\na pleasure.",
      indication: "Sail The Nile On Hathor",
      body: HOMEPAGE_HIGHLIGHTS.body,
    },
    {
      imageName: "home-split-courtyard" as SiteImageName,
      alt: "Hathor Dahabiya on the Nile",
      title: "Where time\nmoves gently.",
      indication: "Private Nile Sailing",
      body: "Glide between Luxor and Aswan on an intimate dahabiya — unhurried days, soft light on the water, and Egypt unfolding at a gracious pace.",
    },
    {
      imageName: "about-hero" as SiteImageName,
      alt: "Luxury Dahabiya Nile cruise",
      title: "Welcome aboard\nHathor.",
      indication: "Five-Star Small Boat",
      body: "A private, five-star vessel where refined cabins, attentive hospitality, and timeless Egyptian charm meet for a truly exclusive Nile voyage.",
    },
    {
      imageName: "home-story-legacy-large" as SiteImageName,
      alt: "Hathor Dahabiya ship on the Nile at golden hour",
      title: "Golden hour\non the Nile.",
      indication: "History · Comfort · Style",
      body: "From ancient landmarks to quiet decks at dusk, every moment aboard Hathor is composed for wonder, serenity, and lasting memory.",
    },
  ],
} as const;

export const EX_TEXT_BLOCKS = [
  {
    title: HOMEPAGE_LIFESTYLE.title,
    body: HOMEPAGE_LIFESTYLE.body,
    imageName: "home-split-courtyard" as SiteImageName,
    alt: "Hathor Dahabiya on the Nile",
    cta: "Discover More",
    href: "/about",
  },
  {
    title: HOMEPAGE_DINING.title,
    body: HOMEPAGE_DINING.body,
    imageName: "gastronomy-restaurant" as SiteImageName,
    alt: "Fine dining aboard Hathor Dahabiya",
    cta: "Explore Dining",
    href: "/gastronomy",
  },
] as const;

export const EX_GALLERY = {
  title: "Sail with Hathor",
  images: [
    {
      imageName: "home-collage-living" as SiteImageName,
      alt: "Luxury lounge aboard Hathor",
      href: "/about",
    },
    {
      imageName: "home-alt-highlights" as SiteImageName,
      alt: "Nile cruise highlights",
      href: "/highlights",
    },
    {
      imageName: "gastronomy-restaurant" as SiteImageName,
      alt: "Gastronomy on the Nile",
      href: "/gastronomy",
    },
    {
      imageName: "wellness-hero" as SiteImageName,
      alt: "Wellness aboard Hathor",
      href: "/wellness",
    },
    {
      imageName: "home-cinematic-still" as SiteImageName,
      alt: "Suite interior aboard Hathor",
      href: "/rooms",
    },
  ],
  /** Small indication under the gallery title — Instagram handle */
  indication: "@hathorcruise",
  indicationHref: "https://www.instagram.com/hathorcruise/",
} as const;

export const EX_TESTIMONIALS = {
  title: HOMEPAGE_REVIEWS.title,
  cards: [
    {
      name: "Sarah Mitchell",
      quote:
        "An absolutely magical journey. The Hathor Dahabiya exceeded every expectation — impeccable service, breathtaking views, and true luxury on the Nile.",
    },
    {
      name: "James & Elena Torres",
      quote:
        "The most elegant way to experience Egypt. Every detail was curated to perfection, from gourmet dining to our beautifully appointed suite.",
    },
    {
      name: "Dr. Amira Hassan",
      quote:
        "A once-in-a-lifetime cruise. The intimate atmosphere and personalized attention made us feel like royalty sailing through ancient history.",
    },
    {
      name: "Michael Chen",
      quote:
        "From the moment we stepped aboard, Hathor felt like a floating sanctuary. The crew, the cuisine, and the Nile views were unforgettable.",
    },
  ],
} as const;

export const EX_CTA = {
  title: "Begin your Nile escape",
  body: "Whether you are planning a private charter, selecting the perfect sailing dates, or reserving your suite, our team is here to make it effortless.",
} as const;

export const EX_WELLNESS = {
  tag: HOMEPAGE_WELLNESS.subtitle,
} as const;
