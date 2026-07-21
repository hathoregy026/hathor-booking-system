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
import type { SiteImageName } from "@/lib/site-image-slots";

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
  slides: [
    {
      title: HOMEPAGE_ITINERARIES.cards[0].title,
      imageName: "cruises-hero" as SiteImageName,
      alt: "Hathor Dahabiya on the Nile",
    },
    {
      title: HOMEPAGE_ITINERARIES.cards[1].title,
      imageName: "room-suite" as SiteImageName,
      alt: "Luxury suite aboard Hathor",
    },
    {
      title: HOMEPAGE_ITINERARIES.cards[2].title,
      imageName: "room-royal" as SiteImageName,
      alt: "Royal suite aboard Hathor",
    },
    {
      title: "Luxury Cabins",
      imageName: "room-luxury" as SiteImageName,
      alt: "Luxury cabin aboard Hathor Dahabiya",
    },
  ],
} as const;

export const EX_PINNED = {
  title: "Every landmark,\na pleasure.",
  body: HOMEPAGE_HIGHLIGHTS.body,
  slides: [
    {
      imageName: "cruises-hero" as SiteImageName,
      alt: "Hathor Dahabiya sailing on the Nile",
    },
    {
      imageName: "home-split-courtyard" as SiteImageName,
      alt: "Hathor Dahabiya on the Nile",
    },
    {
      imageName: "about-hero" as SiteImageName,
      alt: "Luxury Dahabiya Nile cruise",
    },
    {
      imageName: "home-story-legacy-large" as SiteImageName,
      alt: "Hathor Dahabiya ship on the Nile at golden hour",
    },
  ],
} as const;

export const EX_TEXT_BLOCKS = [
  {
    title: HOMEPAGE_LIFESTYLE.title,
    body: HOMEPAGE_LIFESTYLE.body,
    imageName: "home-split-courtyard" as SiteImageName,
    alt: "Hathor Dahabiya on the Nile",
    cta: "Discover Hathor",
    href: "/about",
  },
  {
    title: HOMEPAGE_DINING.title,
    body: HOMEPAGE_DINING.body,
    imageName: "gastronomy-restaurant" as SiteImageName,
    alt: "Fine dining aboard Hathor Dahabiya",
    cta: "Explore Gastronomy",
    href: "/gastronomy",
  },
] as const;

export const EX_GALLERY = {
  title: "Sail with Hathor",
  images: [
    {
      imageName: "home-collage-living" as SiteImageName,
      alt: "Luxury lounge aboard Hathor",
    },
    {
      imageName: "home-alt-highlights" as SiteImageName,
      alt: "Nile cruise highlights",
    },
    {
      imageName: "gastronomy-restaurant" as SiteImageName,
      alt: "Gastronomy on the Nile",
    },
    {
      imageName: "wellness-hero" as SiteImageName,
      alt: "Wellness aboard Hathor",
    },
    {
      imageName: "home-cinematic-still" as SiteImageName,
      alt: "Suite interior aboard Hathor",
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
