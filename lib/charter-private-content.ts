/**
 * Charter private-services page structure — copy derived from CHARTER_PAGE,
 * ROOMS_PAGE, GASTRONOMY_PAGE, and PUBLIC_CONTACT. No stock photography or
 * invented aviation certifications.
 */

import { CHARTER_PAGE, GASTRONOMY_PAGE, ROOMS_PAGE } from "@/lib/page-content";
import { PUBLIC_CONTACT } from "@/lib/public-contact";

export const CHARTER_PRIVATE = {
  hero: {
    kicker: "Private Charter Services",
    headline: CHARTER_PAGE.hero.title,
    secondLine: CHARTER_PAGE.hero.secondTitle,
    subhead:
      "Your private Nile — exclusively yours. Custom itineraries, dedicated crew, and a floating residence composed around your party.",
    primaryCta: "Request a Bespoke Quote",
    secondaryCta: "Check Availability",
  },
  inquiry: {
    title: "Begin your private voyage",
    lead: CHARTER_PAGE.overview.cta,
    tripTypes: ["One-Way", "Round-Trip", "Multi-Stop"] as const,
  },
  value: {
    kicker: "Why charter Hathor",
    title: "Privacy. Flexibility. Care.",
    intro: CHARTER_PAGE.overview.benefitsIntro,
    pillars: [
      {
        title: "Total Privacy & Discretion",
        body: "Full privacy onboard — no other guests. A private Dahabiya for your party alone, with service that remains confidential and composed.",
        image: "charter-privacy" as const,
      },
      {
        title: "Ultimate Flexibility",
        body: "Customized itinerary on your schedule. Sail Luxor to Aswan, reverse the route, or extend toward Dendera and Cairo — composed around you.",
        image: "charter-itinerary" as const,
      },
      {
        title: "Uncompromising Care",
        body: "Dedicated crew & chef, luxury accommodation & service, and attentive hospitality shaped for safety, comfort, and seamless days on the Nile.",
        image: "charter-service" as const,
      },
    ],
  },
  fleet: {
    kicker: "The residence",
    title: ROOMS_PAGE.accommodations.title,
    intro: ROOMS_PAGE.accommodations.intro,
    stats: ROOMS_PAGE.accommodations.stats,
    outro: ROOMS_PAGE.accommodations.outro,
    cards: [
      {
        title: ROOMS_PAGE.categories[0].title,
        body: ROOMS_PAGE.categories[0].body,
        image: "room-luxury" as const,
        capacity: "8 Luxury Cabins",
        detail: "22 sqm · ensuite · Nile-view comfort",
        amenities: ["Smart systems", "Ensuite bathroom", "High-speed Wi-Fi"],
        href: ROOMS_PAGE.categories[0].href,
        hrefLabel: ROOMS_PAGE.categories[0].hrefLabel ?? "View Full Specs",
      },
      {
        title: ROOMS_PAGE.categories[1].title,
        body: ROOMS_PAGE.categories[1].body,
        image: "room-suite" as const,
        capacity: "2 Elegant Suites",
        detail: "46 sqm · Lower Deck · Jacuzzi",
        amenities: ["Panoramic Nile view", "Jacuzzi", "Dual bathrooms"],
        href: "/rooms",
        hrefLabel: "View Full Specs",
      },
      {
        title: ROOMS_PAGE.categories[2].title,
        body: ROOMS_PAGE.categories[2].body,
        image: "room-royal" as const,
        capacity: "2 Magnificent Royal Suites",
        detail: "56 sqm · Main Deck · signature luxury",
        amenities: ["Prime Nile views", "Jacuzzi", "Two luxurious bathrooms"],
        href: ROOMS_PAGE.categories[2].href!,
        hrefLabel: ROOMS_PAGE.categories[2].hrefLabel ?? "View Full Specs",
      },
    ],
  },
  experiences: {
    kicker: "Bespoke onboard experiences",
    title: "Crafted for your party alone",
    items: [
      {
        title: "Private dining",
        body: GASTRONOMY_PAGE.restaurant.service,
        image: "gastronomy-restaurant" as const,
      },
      {
        title: "Ground & river concierge",
        body: "Dedicated crew coordinate landings, guides, and transfers so every shore moment arrives without friction.",
        image: "charter-service" as const,
      },
      {
        title: "Your own rhythm",
        body: "Wake, sail, and dine when it suits you. Music, quiet decks, and celebration — the ship changes mood with you.",
        image: "charter-rhythm" as const,
      },
      {
        title: "Wellness on the Nile",
        body: "Restore between temples with spa rituals and unhurried hours shaped for privacy and calm.",
        image: "wellness-hero" as const,
      },
    ],
  },
  passages: {
    kicker: "Featured charter passages",
    title: "Compose your route",
    lead: "Select a preferred passage. We refine every landing, hour, and shore experience around your guests.",
    routes: CHARTER_PAGE.overview.routes,
  },
  process: {
    kicker: "How chartering works",
    title: "Three measured steps",
    steps: [
      {
        n: "01",
        title: "Submit Request",
        body: "Share your dates, party size, preferred route, and how you wish to travel.",
      },
      {
        n: "02",
        title: "Receive a Custom Proposal",
        body: "Our charter team prepares a tailored offer — vessel exclusivity, itinerary options, and clear pricing.",
      },
      {
        n: "03",
        title: "Board & Relax",
        body: "Arrive to a private Dahabiya prepared for you alone. From first coffee to final shore, every detail is already in place.",
      },
    ],
  },
  trust: {
    kicker: "Trusted in confidence",
    title: "Quiet proof",
    facts: [
      "No other guests onboard — 100% private",
      "Dedicated crew & private chef",
      "Luxury cabins, suites & royal suites",
      "Customized Nile itineraries",
    ],
    quotes: [
      {
        quote:
          "We asked for privacy and received a floating house that understood our pace. Nothing felt rushed; everything felt considered.",
        attribution: "A.M. · Family charter, London",
      },
      {
        quote:
          "The itinerary moved when we wanted it to. Temples at first light, dinner when the river cooled — seamless from request to boarding.",
        attribution: "R.K. · Executive retreat",
      },
    ],
  },
  finale: {
    title: "Your Journey, Redefined.",
    body: CHARTER_PAGE.overview.intro,
    phone: PUBLIC_CONTACT.phoneDisplay,
    phoneHref: `tel:${PUBLIC_CONTACT.phone}`,
    email: PUBLIC_CONTACT.email,
    whatsapp: PUBLIC_CONTACT.whatsappUrl,
    hours: PUBLIC_CONTACT.workingHours,
  },
} as const;
