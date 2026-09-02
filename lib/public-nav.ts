import type { PageVisibilitySettings } from "@/lib/page-visibility-shared";

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

export const NAV_HOME: NavLink = { href: "/", label: "Home" };

export const NAV_SUITES: NavGroup = {
  id: "suites",
  label: "Suites",
  links: [
    {
      href: "/suites",
      label: "Suites",
      description: "Luxury sanctuaries aboard Hathor",
    },
    {
      href: "/luxury-cabins-Nile-Cruise",
      label: "Luxury Rooms",
      description: "Nile-view cabins with quiet elegance",
    },
    {
      href: "/rooms",
      label: "Luxury Suites",
      description: "Spacious quarters on deck",
    },
    {
      href: "/royal-suites",
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
      href: "/voyages",
      label: "Cruises",
      description: "Private Dahabiya itineraries on the Nile",
    },
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
      href: "/partners",
      label: "Partners",
      description: "Those we sail with",
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
  { href: "/", label: "Home" },
  { href: "/suites", label: "Suites" },
  { href: "/luxury-cabins-Nile-Cruise", label: "Luxury Rooms" },
  { href: "/rooms", label: "Luxury Suites" },
  { href: "/royal-suites", label: "Royal Suites" },
  { href: "/voyages", label: "Our Voyages" },
  { href: "/cruises-list", label: "Scheduled Voyages" },
  { href: "/charter", label: "Private Charter" },
  { href: "/highlights", label: "Highlights" },
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

/** Desktop + mobile primary nav — Home plus four editorial dropdown groups. */
export const HEADER_NAV_ITEMS: HeaderNavItem[] = [
  {
    type: "link",
    href: NAV_HOME.href,
    label: NAV_HOME.label,
  },
  {
    type: "group",
    id: NAV_SUITES.id,
    label: NAV_SUITES.label,
    href: "/suites",
    links: NAV_SUITES.links,
  },
  {
    type: "group",
    id: NAV_CRUISES.id,
    label: NAV_CRUISES.label,
    href: "/voyages",
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
  { type: "link", href: "/blogs", label: "Journal" },
  { type: "link", href: "/contact", label: "Contact" },
];

/** Path aliases so active states match legacy or redirect routes. */
const NAV_PATH_ALIASES: Record<string, readonly string[]> = {
  "/cruises-list": ["/cruises"],
  "/suites": ["/rooms", "/Nile-Cruise-Luxury-Suites"],
  "/rooms": ["/Nile-Cruise-Luxury-Suites"],
  "/luxury-cabins-Nile-Cruise": ["/accommodation", "/accommodations"],
  "/gastronomy": ["/dining"],
  "/blogs": ["/blog"],
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

/**
 * Left editorial overlay nav — Suites / Cruises / Experiences / About / Contact
 * and their dropdown destinations only. Homepage keeps the current header.
 */
export function usesEditorialOverlayNav(pathname: string): boolean {
  if (
    !pathname ||
    pathname === "/" ||
    pathname === "/preview"
  ) {
    return false;
  }

  return HEADER_NAV_ITEMS.some((item) => {
    if (item.type === "link") {
      return item.href !== "/" && navHrefMatches(pathname, item.href);
    }

    return (
      navHrefMatches(pathname, item.href) ||
      item.links.some((link) => navHrefMatches(pathname, link.href))
    );
  });
}

/**
 * Nav always lists every destination. Dashboard "off" only gates the page
 * itself (Coming Soon via PageVisibilityChrome), not the menu labels.
 */
export function filterNavItemsForVisibility(
  items: readonly HeaderNavItem[],
  _settings: PageVisibilitySettings,
): HeaderNavItem[] {
  return [...items];
}

export function splitHeaderNavItems(items: readonly HeaderNavItem[]): {
  left: HeaderNavItem[];
  right: HeaderNavItem[];
} {
  const mid = Math.ceil(items.length / 2);
  return {
    left: items.slice(0, mid),
    right: items.slice(mid),
  };
}

/** @deprecated Use HEADER_NAV_ITEMS */
export const HEADER_NAV_LINKS: NavLink[] = HEADER_NAV_ITEMS.flatMap((item) =>
  item.type === "link"
    ? [{ href: item.href, label: item.label }]
    : [{ href: item.href, label: item.label }],
);
