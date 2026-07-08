/** Public navigation structure — aligned with RAW_DATA.md site map. */

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

export const NAV_ACCOMMODATIONS: NavGroup = {
  id: "accommodations",
  label: "Accommodations",
  links: [
    {
      href: "/rooms",
      label: "Luxury Rooms",
      description: "Elegant cabins with Nile-inspired décor",
    },
    {
      href: "/rooms",
      label: "Luxury Suites",
      description: "Spacious suites with thoughtful design",
    },
    {
      href: "/Luxury-Royal-Suites-Nile-Dahabiya-Cruise",
      label: "Royal Suites",
      description: "The pinnacle of comfort on the Nile",
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
      description: "Ancient wonders along the Nile",
    },
    {
      href: "/wellness",
      label: "Wellness",
      description: "Seneb Spa — a floating oasis",
    },
    {
      href: "/gastronomy",
      label: "Gastronomy",
      description: "Fine dining on Egypt's finest Dahabiya",
    },
  ],
};

export const NAV_PAGES: NavGroup = {
  id: "pages",
  label: "Pages",
  links: [
    { href: "/blogs", label: "Blog", description: "Stories from the Nile" },
    { href: "/about", label: "About Us", description: "Welcome aboard Hathor" },
    {
      href: "/charter",
      label: "Charter",
      description: "Private Dahabiya experiences",
    },
    { href: "/contact", label: "Contact", description: "Reach our reservations team" },
  ],
};

export const NAV_GROUPS = [NAV_ACCOMMODATIONS, NAV_EXPERIENCES, NAV_PAGES] as const;

export const EXPLORE_LINKS: NavLink[] = [
  { href: "/", label: "Homepage" },
  { href: "/homepage-2", label: "Homepage 2" },
  { href: "/cruises", label: "Cruises" },
  { href: "/gastronomy", label: "Dining" },
  { href: "/wellness", label: "Seneb Spa" },
  { href: "/charter", label: "Charter Enquiry" },
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

/** Desktop + mobile primary nav — groups match explore panel dropdowns. */
export const HEADER_NAV_ITEMS: HeaderNavItem[] = [
  { type: "link", href: "/", label: "Homepage" },
  { type: "link", href: "/homepage-2", label: "Homepage 2" },
  { type: "link", href: "/cruises", label: "Cruises" },
  {
    type: "group",
    id: "accommodations",
    label: "Accommodations",
    href: "/rooms",
    links: NAV_ACCOMMODATIONS.links,
  },
  {
    type: "group",
    id: "experiences",
    label: "Experiences",
    href: "/highlights",
    links: NAV_EXPERIENCES.links,
  },
  { type: "link", href: "/about", label: "About" },
  { type: "link", href: "/contact", label: "Contact" },
];

/** @deprecated Use HEADER_NAV_ITEMS */
export const HEADER_NAV_LINKS: NavLink[] = HEADER_NAV_ITEMS.flatMap((item) =>
  item.type === "link"
    ? [{ href: item.href, label: item.label }]
    : [{ href: item.href, label: item.label }],
);
