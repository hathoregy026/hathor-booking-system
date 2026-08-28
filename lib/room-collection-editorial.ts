export type RoomCollectionVariant = "cabins" | "suites" | "royal";

export type RoomCollectionEditorialConfig = {
  variant: RoomCollectionVariant;
  eyebrow: string;
  titleLines: [string, string];
  support: string;
  manifesto: {
    label: string;
    headline: [string, string, string];
    body: string;
  };
  ledger: readonly {
    value: string;
    label: string;
    note: string;
  }[];
  aperture: {
    image: string;
    caption: string;
    sub: string;
  };
  amenitiesTitle: string;
  amenitiesLead: string;
  crosslinksEyebrow: string;
  epilogue: {
    eyebrow: string;
    title: string;
    body: string;
  };
};

export const ROOM_COLLECTION_LINKS = [
  { href: "/luxury-cabins-Nile-Cruise", label: "Luxury Rooms", key: "cabins" },
  { href: "/rooms", label: "Luxury Suites", key: "suites" },
  { href: "/royal-suites", label: "Royal Suites", key: "royal" },
] as const;

export const ROOM_COLLECTION_CONFIG: Record<
  RoomCollectionVariant,
  RoomCollectionEditorialConfig
> = {
  cabins: {
    variant: "cabins",
    eyebrow: "Lower deck · Nile cabins",
    titleLines: ["Luxury", "Rooms"],
    support:
      "King and twin retreats composed for two guests — panoramic river light, calm proportions and Hathor's quiet cream-and-gold character.",
    manifesto: {
      label: "Cabins",
      headline: ["Twenty-two", "square metres", "of stillness"],
      body: "Every cabin is a practical sanctuary: air-conditioned comfort, handcrafted detail and a wide Nile window that frames each sailing day.",
    },
    ledger: [
      { value: "22", label: "Square metres", note: "Per cabin" },
      { value: "2", label: "Guests", note: "Maximum" },
      { value: "2", label: "Configurations", note: "King or twin" },
      { value: "Nile", label: "View", note: "Panoramic" },
    ],
    aperture: {
      image: "/media/hathor/scraped/cabin-1.webp",
      caption: "River light",
      sub: "King & twin cabins",
    },
    amenitiesTitle: "Included with every cabin",
    amenitiesLead:
      "Thoughtful provisions for rest between temple visits — nothing excessive, everything considered.",
    crosslinksEyebrow: "Explore the collection",
    epilogue: {
      eyebrow: "Reserve your cabin",
      title: "Pair a room with your voyage",
      body: "Save your preferred cabin to My Voyage or request availability — our team will match your sailing between Luxor and Aswan.",
    },
  },
  suites: {
    variant: "suites",
    eyebrow: "Lower deck · Suite residence",
    titleLines: ["Luxury", "Suites"],
    support:
      "A generous lower-deck residence with panoramic Nile views, expressive interiors and a private Jacuzzi for unhurried evenings.",
    manifesto: {
      label: "Suites",
      headline: ["Forty-six", "square metres", "to drift"],
      body: "More space, more privacy, more river — the Accessible Hathor Suite is crafted for guests who want room to breathe without leaving the Nile.",
    },
    ledger: [
      { value: "46", label: "Square metres", note: "Suite floorplan" },
      { value: "4", label: "Guests", note: "Maximum" },
      { value: "1", label: "Residence", note: "Lower deck" },
      { value: "Jacuzzi", label: "Wellness", note: "Private" },
    ],
    aperture: {
      image: "/media/hathor/scraped/luxsuite-1.webp",
      caption: "Suite light",
      sub: "Panoramic Nile",
    },
    amenitiesTitle: "Suite provisions",
    amenitiesLead:
      "Every comfort expected of a Nile view luxury suite — and the private Jacuzzi that sets Hathor apart.",
    crosslinksEyebrow: "Explore the collection",
    epilogue: {
      eyebrow: "Reserve your suite",
      title: "Claim your lower-deck retreat",
      body: "Add the Luxury Suite to My Voyage or speak with reservations — we will pair your residence with the right itinerary.",
    },
  },
  royal: {
    variant: "royal",
    eyebrow: "Main deck · Signature residence",
    titleLines: ["Royal", "Suites"],
    support:
      "Hathor's most expansive private residence — prime Main Deck views, signature furnishings and two luxurious bathrooms.",
    manifesto: {
      label: "Royal",
      headline: ["Fifty-six", "square metres", "of privilege"],
      body: "The crown of Hathor: exceptional views, ultimate relaxation and a fusion of modern elegance with authentic Egyptian charm.",
    },
    ledger: [
      { value: "56", label: "Square metres", note: "Royal floorplan" },
      { value: "4", label: "Guests", note: "Maximum" },
      { value: "2", label: "Bathrooms", note: "Luxurious" },
      { value: "Main", label: "Deck", note: "Prime views" },
    ],
    aperture: {
      image: "/media/hathor/scraped/royal-1.webp",
      caption: "Main deck",
      sub: "Signature residence",
    },
    amenitiesTitle: "Royal provisions",
    amenitiesLead:
      "The highest level of luxury aboard Hathor — Jacuzzi, dual bathrooms and every refined comfort for your private Nile cruise.",
    crosslinksEyebrow: "Explore the collection",
    epilogue: {
      eyebrow: "Reserve the Royal Suite",
      title: "The Nile, privately held",
      body: "Save the Royal Suite to Favorites or add it to My Voyage — our concierge will confirm your most private sailing.",
    },
  },
};
