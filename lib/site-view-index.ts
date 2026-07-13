/** Dev viewing index — all browsable routes for local preview (no deploy needed). */

export type SiteViewLink = {
  href: string;
  label: string;
  note?: string;
};

export type SiteViewSection = {
  id: string;
  title: string;
  description: string;
  links: SiteViewLink[];
};

export const SITE_VIEW_INDEX: SiteViewSection[] = [
  {
    id: "public",
    title: "Public website",
    description: "Marketing pages and main guest-facing site.",
    links: [
      { href: "/", label: "Home" },
      { href: "/cruises", label: "Cruises & Itineraries" },
      { href: "/about", label: "About Hathor" },
      { href: "/highlights", label: "Highlights & Experiences" },
      { href: "/gastronomy", label: "Gastronomy / Dining" },
      { href: "/wellness", label: "Wellness & Seneb Spa" },
      { href: "/charter", label: "Charter" },
      { href: "/contact", label: "Contact" },
      { href: "/blogs", label: "Blog" },
      { href: "/preview", label: "Homepage preview (partial)" },
    ],
  },
  {
    id: "booking",
    title: "Booking flow",
    description: "Reservation journey — unchanged; listed here for quick access only.",
    links: [
      { href: "/book", label: "Book (entry)" },
      { href: "/booking", label: "Booking hub" },
      {
        href: "/booking/checkout",
        label: "Checkout",
        note: "May require an active session / hold",
      },
      {
        href: "/booking/success",
        label: "Booking success",
        note: "Confirmation screen preview",
      },
    ],
  },
  {
    id: "admin",
    title: "Admin panel",
    description: "Dashboard and content management (login required).",
    links: [
      { href: "/admin/login", label: "Admin login" },
      { href: "/admin", label: "Dashboard" },
      { href: "/admin/bookings", label: "Bookings" },
      { href: "/admin/cruises", label: "Cruises & rooms" },
      {
        href: "/admin/content",
        label: "Website content & site images",
        note: "Includes #site-images anchor",
      },
      { href: "/admin/content#site-images", label: "Site images section" },
      { href: "/admin/email-templates", label: "Email templates" },
      { href: "/admin/settings", label: "Settings" },
    ],
  },
];

export const SITE_VIEW_HOME = {
  href: "/site-index",
  label: "Site viewing index",
} as const;
