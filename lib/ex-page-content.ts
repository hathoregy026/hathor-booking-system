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
import { homeCarouselImageName } from "@/lib/home-carousel-images";
import type {
  LuxuryRoomTypeValue,
  StayDurationValue,
} from "@/lib/booking-search-config";
import type { SiteImageName } from "@/lib/site-image-slots";

function formatCruisePorts(ports: string) {
  return ports.replace(/→/g, "/").replace(/\s*\/\s*/g, " / ").trim();
}

function roomSearchType(roomType: string): LuxuryRoomTypeValue {
  if (roomType.includes("Royal")) return "luxury-royal-suites";
  if (roomType.includes("Suite")) return "luxury-suites";
  return "luxury-rooms";
}

function roomTitleSuffix(room: { roomType: string; roomNumber: string }) {
  if (room.roomType.includes("Royal")) return "Royal Suite";
  if (room.roomType.includes("Suite")) return "Suite";
  if (room.roomNumber.startsWith("KING")) return "King Cabin";
  if (room.roomNumber.startsWith("TWIN")) return "Twin Cabin";
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
      title: `${ports} · ${roomTitleSuffix(room)}`,
      imageName: homeCarouselImageName(room.roomNumber),
      alt: `${room.name}, ${cruise.name}`,
      duration,
      roomType: roomSearchType(room.roomType),
    }));
  });
}

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
} as const;

export const EX_CAROUSEL = {
  title: HOMEPAGE_ITINERARIES.title,
  subtitle: HOMEPAGE_ITINERARIES.subtitle,
  slides: buildCarouselSlides(),
} as const;

export const EX_PINNED = {
  title: "EVERY LANDMARK,\nA PLEASURE.",
  body: HOMEPAGE_HIGHLIGHTS.body,
  slides: [
    {
      imageName: "home-amenities-1" as SiteImageName,
      alt: "Hathor Dahabiya sailing on the Nile",
      title: "EVERY LANDMARK,\nA PLEASURE.",
      indication: "Sail The Nile On Hathor",
      body: "A five-star dahabiya on the ancient Nile: history, comfort, and style in one intimate voyage.",
    },
    {
      imageName: "home-amenities-2" as SiteImageName,
      alt: "Hathor Dahabiya on the Nile",
      title: "WHERE TIME\nMOVES GENTLY.",
      indication: "Private Nile Sailing",
      body: "Glide between Luxor and Aswan, soft light on the water, Egypt unfolding at a gracious pace.",
    },
    {
      imageName: "home-amenities-3" as SiteImageName,
      alt: "Luxury Dahabiya Nile cruise",
      title: "WHERE HISTORY\nMEETS ELEGANCE",
      indication: "Bar Hathor",
      body: "Refined evenings aboard Hathor: history, comfort, and style where the Nile meets luxury.",
    },
    {
      imageName: "home-amenities-4" as SiteImageName,
      alt: "Hathor Dahabiya ship on the Nile at golden hour",
      title: "GOLDEN HOUR\nON THE NILE.",
      indication: "History · Comfort · Style",
      body: "From ancient shores to quiet decks at dusk. Every moment aboard Hathor is composed for wonder.",
    },
  ],
} as const;

export const EX_TEXT_BLOCKS = [
  {
    title: HOMEPAGE_LIFESTYLE.title,
    body: HOMEPAGE_LIFESTYLE.body,
    /** Text only — photo is amenities slot 6 / card 9. */
    imageName: "home-amenities-6" as SiteImageName,
    alt: "Guests enjoying a Nile sunset moment aboard Hathor Dahabiya",
    cta: "Discover More",
    href: "/about",
  },
  {
    title: HOMEPAGE_DINING.title,
    body: HOMEPAGE_DINING.body,
    /** Text only — photo is amenities slot 7 / card 10. */
    imageName: "home-amenities-7" as SiteImageName,
    alt: "Fine dining aboard Hathor Dahabiya",
    cta: "Explore Dining",
    href: "/gastronomy",
  },
] as const;

export const EX_GALLERY = {
  title: "Sail with Hathor",
  images: [
    {
      imageName: "moving-tilted-1" as SiteImageName,
      alt: "Luxury lounge aboard Hathor",
      href: "/about",
    },
    {
      imageName: "moving-tilted-2" as SiteImageName,
      alt: "Nile cruise highlights",
      href: "/highlights",
    },
    {
      imageName: "moving-tilted-3" as SiteImageName,
      alt: "Gastronomy on the Nile",
      href: "/gastronomy",
    },
    {
      imageName: "moving-tilted-4" as SiteImageName,
      alt: "Wellness aboard Hathor",
      href: "/wellness",
    },
    {
      imageName: "moving-tilted-5" as SiteImageName,
      alt: "Suite interior aboard Hathor",
      href: "/rooms",
    },
  ],
  /** Small indication under the gallery title — Instagram handle */
  indication: "@hathorcruise",
  indicationHref: "https://www.instagram.com/hathorcruise/",
  followEyebrow: "Follow our journey",
  /** Dedicated Floating IG slots — editable under Admin → Floating IG images */
  followPreviews: [
    {
      imageName: "floating-ig-1" as SiteImageName,
      alt: "Hathor Instagram lounge",
    },
    {
      imageName: "floating-ig-2" as SiteImageName,
      alt: "Hathor Instagram Nile highlights",
    },
    {
      imageName: "floating-ig-3" as SiteImageName,
      alt: "Hathor Instagram dining",
    },
    {
      imageName: "floating-ig-4" as SiteImageName,
      alt: "Hathor Instagram suite",
    },
  ],
} as const;

export const EX_TESTIMONIALS = {
  title: HOMEPAGE_REVIEWS.title,
  cards: [
    {
      name: "Sarah Mitchell",
      quote:
        "An absolutely magical journey. The Hathor Dahabiya exceeded every expectation: impeccable service, breathtaking views, and true luxury on the Nile.",
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

export const EX_CAMPAIGN = {
  title: "Sail Beyond the Ordinary",
  imageName: "home-call-to-action",
  imageAlt: "Call to action: Hathor Dahabiya on the Nile at golden hour",
} as const;

export const EX_CTA = {
  /** @deprecated Prefer WebsiteText `home.cta` → MarketingCtaBand */
  title: "Ready to Embark on Your Journey?",
  body: "Reserve your place aboard Hathor Dahabiya and discover the Nile as it was meant to be experienced.",
} as const;

export const EX_WELLNESS = {
  tag: HOMEPAGE_WELLNESS.subtitle,
} as const;
