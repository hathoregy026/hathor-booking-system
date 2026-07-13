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
import { HATHOR_MEDIA } from "@/lib/hathor-media";

export const EX_GOLD_LOGO_SRC = "/branding/gold.svg";

export const EX_HERO = {
  kicker: "Nile · Egypt",
  lineRight: "Ultra Luxury",
  lineLeft: "Dahabiya Cruise",
  subtitle: HOMEPAGE_HERO.subtitle,
  sideLeft: "Luxor · Aswan",
  sideRight: "Private Nile Sailing",
} as const;

export const EX_ABOUT = {
  eyebrow: HOMEPAGE_ABOUT.subtitle,
  heading: "Elegance and\na way of life.",
  body: HOMEPAGE_ABOUT.body,
  image: HATHOR_MEDIA.storyCraftLarge,
  imageAlt: "Ornate interior aboard Hathor Dahabiya",
  decor: [
    HATHOR_MEDIA.collageSmall,
    HATHOR_MEDIA.collageLarge,
    HATHOR_MEDIA.splitCourtyard,
  ],
} as const;

export const EX_CAROUSEL = {
  title: HOMEPAGE_ITINERARIES.title,
  subtitle: HOMEPAGE_ITINERARIES.subtitle,
  slides: [
    {
      title: HOMEPAGE_ITINERARIES.cards[0].title,
      image: HATHOR_MEDIA.heroCruises,
      alt: "Hathor Dahabiya on the Nile",
    },
    {
      title: HOMEPAGE_ITINERARIES.cards[1].title,
      image: HATHOR_MEDIA.luxurySuite,
      alt: "Luxury suite aboard Hathor",
    },
    {
      title: HOMEPAGE_ITINERARIES.cards[2].title,
      image: HATHOR_MEDIA.royalSuite,
      alt: "Royal suite aboard Hathor",
    },
    {
      title: "Luxury Cabins",
      image: HATHOR_MEDIA.luxuryRoom,
      alt: "Luxury cabin aboard Hathor Dahabiya",
    },
  ],
} as const;

export const EX_PINNED = {
  title: "Every landmark,\na pleasure.",
  body: HOMEPAGE_HIGHLIGHTS.body,
  slides: [
    {
      src: HATHOR_MEDIA.obelisk,
      alt: "Ancient obelisk along the Nile",
    },
    {
      src: HATHOR_MEDIA.templeHatshepsut,
      alt: "Temple of Hatshepsut, Luxor",
    },
    {
      src: HATHOR_MEDIA.valleyOfKings,
      alt: "Valley of the Kings",
    },
    {
      src: HATHOR_MEDIA.postHeroMedia,
      alt: HATHOR_MEDIA.postHeroMediaAlt,
    },
  ],
} as const;

export const EX_TEXT_BLOCKS = [
  {
    title: HOMEPAGE_LIFESTYLE.title,
    body: HOMEPAGE_LIFESTYLE.body,
    image: HATHOR_MEDIA.splitCourtyard,
    alt: HATHOR_MEDIA.splitCourtyardAlt,
    cta: "Discover Hathor",
    href: "/about",
  },
  {
    title: HOMEPAGE_DINING.title,
    body: HOMEPAGE_DINING.body,
    image: HATHOR_MEDIA.restaurant,
    alt: "Fine dining aboard Hathor Dahabiya",
    cta: "Explore Gastronomy",
    href: "/gastronomy",
  },
] as const;

export const EX_GALLERY = {
  title: "@hathorcruise",
  images: [
    { src: HATHOR_MEDIA.collageLiving, alt: "Luxury lounge aboard Hathor" },
    { src: HATHOR_MEDIA.altHighlights, alt: "Nile cruise highlights" },
    { src: HATHOR_MEDIA.restaurant, alt: "Gastronomy on the Nile" },
    { src: HATHOR_MEDIA.wellness, alt: "Wellness aboard Hathor" },
    { src: HATHOR_MEDIA.cinematicStill, alt: "Suite interior aboard Hathor" },
  ],
  ctaTitle: "Sail with Hathor",
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
