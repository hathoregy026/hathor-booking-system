export const ADMIN_CMS_PATHS = [
  "/admin/cms",
  "/admin/website-text",
  "/admin/content",
  "/admin/images",
  "/admin/pages",
  "/admin/live-site",
  "/admin/preload-screen",
  "/admin/hero-logo-tune",
  "/admin/hieroglyph-tune",
  "/admin/typography",
  "/admin/blogs",
  "/admin/email-templates",
  "/admin/storage",
] as const;

export type AdminCmsLink = {
  href: string;
  label: string;
  description: string;
};

export const ADMIN_CMS_LINKS: AdminCmsLink[] = [
  {
    href: "/admin/website-text",
    label: "Website Text",
    description: "Homepage and page copy, desktop and phone",
  },
  {
    href: "/admin/content",
    label: "Website Images",
    description: "Named photo slots the public site reads",
  },
  {
    href: "/admin/typography",
    label: "Typography & Styles",
    description: "Type roles, hero wording, dining type",
  },
  {
    href: "/admin/pages",
    label: "Pages",
    description: "Show live or Coming Soon",
  },
  {
    href: "/admin/live-site",
    label: "Live Site",
    description: "Coming Soon on the custom domain",
  },
  {
    href: "/admin/preload-screen",
    label: "Preload Screen",
    description: "Welcome splash assets",
  },
  {
    href: "/admin/hero-logo-tune",
    label: "Hero Logo Tune",
    description: "HATHOR letter layout",
  },
  {
    href: "/admin/hieroglyph-tune",
    label: "Background Glyphs",
    description: "Hieroglyph layer",
  },
  {
    href: "/admin/blogs",
    label: "Blog Posts",
    description: "Journal entries on /blogs",
  },
  {
    href: "/admin/email-templates",
    label: "Email Templates",
    description: "Booking received, confirmed, admin alert",
  },
  {
    href: "/admin/storage",
    label: "Storage",
    description: "Uploaded media inventory",
  },
];

export function isAdminCmsPath(pathname: string): boolean {
  return ADMIN_CMS_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export function isAdminInventoryPath(pathname: string): boolean {
  return (
    pathname === "/admin/inventory" ||
    pathname === "/admin/cruises" ||
    pathname.startsWith("/admin/cruises/")
  );
}