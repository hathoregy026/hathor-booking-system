/** Homepage copy from RAW_DATA.md — typos corrected per brief. */

export const HOMEPAGE_HERO = {
  eyebrow: "Hathor",
  title: "Luxury Dahabiya Nile Cruise",
  subtitle:
    "Your luxurious Nile escape begins with the Hathor Dahabiya",
  cta: "Book Now",
} as const;

/** Post-hero editorial band — RAW_DATA.md (About + Itineraries intro + Welcome). */
export const HOMEPAGE_POST_HERO = {
  headline: "Elegance and Serenity on the Nile",
  paragraphs: [
    "Welcome aboard Hathor, an intimate luxury Dahabiya created for unhurried journeys between Luxor and Aswan. Thoughtful service, refined accommodation and the quiet rhythm of the Nile define every voyage.",
    "Experience Egypt from the water, with temples, villages and open river light unfolding at a measured pace.",
  ],
  signOff: "Welcome aboard Hathor.",
} as const;

export const HOMEPAGE_ITINERARIES = {
  title: "Private Sailing Luxor to Aswan",
  subtitle: "Explore, Relax, Discover",
  intro:
    "Choose a Hathor voyage between Luxor and Aswan — intimate sailings shaped around the river’s pace.",
  cards: [
    {
      title: "Aswan → Luxor",
      duration: "3 Nights / 4 Days",
      schedule: "Every Wednesday",
      href: "/cruises-list",
    },
    {
      title: "Luxor → Aswan",
      duration: "4 Nights / 5 Days",
      schedule: "Every Saturday",
      href: "/cruises-list",
    },
    {
      title: "Luxor → Aswan → Luxor",
      duration: "7 Nights / 8 Days",
      schedule: "Every Saturday",
      href: "/cruises-list",
    },
  ],
} as const;

export const HOMEPAGE_ACCOMMODATIONS = {
  title: "Luxury Rooms & Suites",
  intro:
    "Hathor's cabins and suites combine thoughtful proportions, Nile views and contemporary comfort for a quieter way to sail between Luxor and Aswan.",
  cards: [
    {
      title: "Luxury Rooms",
      description:
        "Hathor's cabins combine thoughtful proportions, Nile views and practical comfort in a calm, contemporary setting.",
      href: "/luxury-cabins-Nile-Cruise",
    },
    {
      title: "Luxury Suites",
      description:
        "The suites provide additional space for guests who value greater privacy, generous proportions and uninterrupted river views.",
      href: "/rooms",
    },
    {
      title: "Luxury Royal Suites",
      description:
        "The Royal Suites offer Hathor's most spacious accommodation, with additional private space and a stronger sense of seclusion.",
      href: "/royal-suites",
    },
    {
      title: "Charter Request",
      description:
        "Private charter gives your group exclusive use of Hathor, shaped around your preferred pace and dates.",
      cta: "Discover Charter",
      href: "/charter",
    },
  ],
} as const;

export const HOMEPAGE_LIFESTYLE = {
  title: "NOT JUST A CRUISE\nA WAY OF LIFE",
  body: "Aboard a quiet Dahabiya, Egypt arrives without hurry: warm company, refined cabins and the river unfolding one measured bend at a time.",
  href: "/about",
} as const;

export const HOMEPAGE_HIGHLIGHTS = {
  title: "Dahabiya Cruise Highlights",
  subtitle: "Cruise in True Elegance",
  body: "A five-star Dahabiya where Nile history, contemporary comfort and intimate sailing come together.",
  href: "/highlights",
  pillars: [
    {
      title: "The Unfinished Obelisk",
      body: "A remarkable Ancient Egyptian monument in Aswan, a powerful reminder of Egypt's engineering brilliance, over 3,500 years old.",
    },
    {
      title: "Temple of Hatshepsut",
      body: "Djeser-Djeseru beneath the cliffs at Deir el-Bahari, relief sculptures recounting the divine birth of a first-of-its-kind female pharaoh.",
    },
    {
      title: "The Valley of the Kings",
      body: "A magnificent burial ground of pharaohs: Ramses II, Tutankhamun and Seti I, a UNESCO World Heritage Site since 1979.",
    },
  ],
} as const;

export const HOMEPAGE_WELCOME = {
  eyebrow: "Why Choose Our Accommodations",
  title: "Welcome Aboard Hathor",
  body: "Welcome aboard Hathor, an intimate luxury Dahabiya created for unhurried journeys between Luxor and Aswan. Thoughtful service, refined accommodation and the quiet rhythm of the Nile define every voyage.",
} as const;

export const HOMEPAGE_DINING = {
  title: "FINE DINING\nON DAHABIYA",
  body: "Seasonal menus bring together Egyptian flavours, fresh ingredients and attentive service, served in settings shaped by the river.",
  tag: "Gastronomy",
  href: "/gastronomy",
} as const;

export const HOMEPAGE_WELLNESS = {
  title: "Wellness",
  subtitle: "Renew Your Soul",
  body: "A calm onboard space for restorative treatments designed around rest, recovery and the rhythm of the journey.",
  href: "/wellness",
} as const;

export const HOMEPAGE_ABOUT = {
  title: "About Hathor",
  subtitle: "Elegance and Serenity on the Nile",
  body: "Hathor is an intimate luxury Dahabiya for travellers who prefer space, privacy and an unhurried pace between Luxor and Aswan.",
  href: "/about",
} as const;

export const HOMEPAGE_REVIEWS = {
  title: "What Our Guests Say",
  body: "Guest reflections on sailing with Hathor — from attentive service and refined suites to the quieter pace of life on the Nile.",
} as const;

export const HOMEPAGE_PARTNERS = {
  title: "Our Partners",
  chapter: "Trusted Worldwide",
  partners: [
    "Easy Trav Tourism",
    "Booking",
    "Expedia",
    "X Luxury Hospitality",
  ],
  href: "/partners",
  hrefLabel: "Learn more",
} as const;
