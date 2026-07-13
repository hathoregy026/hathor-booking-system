/** Public navigation structure — editorial labels, four dropdown groups. */

export type NavLink = {
  href: string;
  label: string;
  description?: string;
};

export type NavGroup = {
  id: string;
  label: string;
  links: NavLink[];
};

export const NAV_SUITES: NavGroup = {
  id: "suites",
  label: "Suites",
  links: [
    {
      href: "/rooms",
      label: "Luxury Rooms",
      description: "Nile-view cabins with quiet elegance",
    },
    {
      href: "/rooms",
      label: "Luxury Suites",
      description: "Spacious quarters on deck",
    },
    {
      href: "/Luxury-Royal-Suites-Nile-Dahabiya-Cruise",
      label: "Royal Suites",
      description: "Our finest rooms on the Nile",
    },
  ],
};

export const NAV_CRUISES: NavGroup = {
  id: "cruises",
  label: "Cruises",
  links: [
    {
      href: "/cruises-list",
      label: "Scheduled Voyages",
      description: "Join a sailing on the Nile",
    },
    {
      href: "/charter",
      label: "Private Charter",
      description: "The Dahabiya, yours alone",
    },
  ],
};

export const NAV_EXPERIENCES: NavGroup = {
  id: "experiences",
  label: "Experiences",
  links: [
    {
      href: "/highlights",
      label: "Highlights",
      description: "Ancient wonders along the river",
    },
    {
      href: "/wellness",
      label: "Wellness & Spa",
      description: "Seneb Spa — a floating oasis",
    },
    {
      href: "/gastronomy",
      label: "Dining",
      description: "Fine cuisine on the water",
    },
  ],
};

export const NAV_ABOUT: NavGroup = {
  id: "about",
  label: "About",
  links: [
    {
      href: "/about",
      label: "Our Story",
      description: "Welcome aboard Hathor",
    },
    {
      href: "/blog",
      label: "Journal",
      description: "Notes from the Nile",
    },
    {
      href: "/partners",
      label: "Partners",
      description: "Those we sail with",
    },
    {
      href: "/contact",
      label: "Contact",
      description: "Reach our reservations team",
    },
  ],
};

/** @deprecated Use NAV_SUITES */
export const NAV_ACCOMMODATIONS = NAV_SUITES;

/** @deprecated Use NAV_ABOUT */
export const NAV_PAGES = NAV_ABOUT;

export const NAV_GROUPS = [
  NAV_SUITES,
  NAV_CRUISES,
  NAV_EXPERIENCES,
  NAV_ABOUT,
] as const;

export const EXPLORE_LINKS: NavLink[] = [
  { href: "/cruises-list", label: "Scheduled Voyages" },
  { href: "/charter", label: "Private Charter" },
  { href: "/wellness", label: "Wellness & Spa" },
  { href: "/gastronomy", label: "Dining" },
  { href: "/contact", label: "Contact" },
];

export type HeaderNavLink = {
  type: "link";
  href: string;
  label: string;
};

export type HeaderNavGroup = {
  type: "group";
  id: string;
  label: string;
  href: string;
  links: NavLink[];
};

export type HeaderNavItem = HeaderNavLink | HeaderNavGroup;

/** Desktop + mobile primary nav — four editorial dropdown groups. */
export const HEADER_NAV_ITEMS: HeaderNavItem[] = [
  {
    type: "group",
    id: NAV_SUITES.id,
    label: NAV_SUITES.label,
    href: "/rooms",
    links: NAV_SUITES.links,
  },
  {
    type: "group",
    id: NAV_CRUISES.id,
    label: NAV_CRUISES.label,
    href: "/cruises-list",
    links: NAV_CRUISES.links,
  },
  {
    type: "group",
    id: NAV_EXPERIENCES.id,
    label: NAV_EXPERIENCES.label,
    href: "/highlights",
    links: NAV_EXPERIENCES.links,
  },
  {
    type: "group",
    id: NAV_ABOUT.id,
    label: NAV_ABOUT.label,
    href: "/about",
    links: NAV_ABOUT.links,
  },
];

/** Path aliases so active states match legacy or redirect routes. */
const NAV_PATH_ALIASES: Record<string, readonly string[]> = {
  "/cruises-list": ["/cruises"],
  "/blog": ["/blogs"],
};

/** Whether the current pathname matches a nav href (including aliases). */
export function navHrefMatches(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  if (pathname === href || pathname.startsWith(`${href}/`)) return true;

  const aliases = NAV_PATH_ALIASES[href];
  return (
    aliases?.some(
      (alias) => pathname === alias || pathname.startsWith(`${alias}/`),
    ) ?? false
  );
}

/** @deprecated Use HEADER_NAV_ITEMS */
export const HEADER_NAV_LINKS: NavLink[] = HEADER_NAV_ITEMS.flatMap((item) =>
  item.type === "link"
    ? [{ href: item.href, label: item.label }]
    : [{ href: item.href, label: item.label }],
);
