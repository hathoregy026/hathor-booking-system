export type BlogCommercialLink = {
  href: string;
  label: string;
};

const DEFAULT_LINK: BlogCommercialLink = {
  href: "/voyages",
  label: "Explore voyages",
};

const RULES: Array<{
  test: RegExp;
  link: BlogCommercialLink;
}> = [
  {
    test: /royal|honeymoon|suite/,
    link: { href: "/royal-suites", label: "See Royal Suites" },
  },
  {
    test: /cabin|room|pack|what to wear|clothes/,
    link: { href: "/luxury-cabins-Nile-Cruise", label: "See luxury rooms" },
  },
  {
    test: /charter|private party|entire boat|exclusive use/,
    link: { href: "/charter", label: "Private charter" },
  },
  {
    test: /aswan to luxor|aswan-to-luxor|south to north/,
    link: { href: "/voyages/aswan-to-luxor", label: "Aswan to Luxor voyage" },
  },
  {
    test: /luxor to aswan|luxor-to-aswan/,
    link: { href: "/voyages/luxor-to-aswan", label: "Luxor to Aswan voyage" },
  },
  {
    test: /dahabiya|nile cruise|itinerary|best time|choose/,
    link: DEFAULT_LINK,
  },
];

export function blogCommercialLink(slug: string, title: string): BlogCommercialLink {
  const haystack = `${slug} ${title}`.toLowerCase();
  const match = RULES.find((rule) => rule.test.test(haystack));
  return match?.link ?? DEFAULT_LINK;
}
