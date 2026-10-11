/** Shared labels/navigation only. Authority always comes from the database. */
export const ADMIN_AREAS = [
  { id: "dashboard", label: "Dashboard", description: "Booking totals, revenue and recent guest details." },
  { id: "analytics", label: "Analytics", description: "Website traffic and live visitor reports." },
  { id: "bookings", label: "Bookings", description: "Guest details, payments and booking conversations. Edit can send guest emails." },
  { id: "inbox", label: "Emails", description: "Guest emails and attachments. Edit can send and organize messages." },
  { id: "availability", label: "Availability", description: "Cabin occupancy and guest names. Edit can close or reopen cabins." },
  { id: "cruises", label: "Cruises", description: "Voyages, sailing schedules and cabin catalogue." },
  { id: "prices", label: "Prices & cabins", description: "Cabin and sailing prices." },
  { id: "website", label: "Website", description: "Copy, images, typography, visibility and homepage controls." },
  { id: "ship", label: "Ship experience", description: "Ship map, physical cabin information and public room labels." },
  { id: "blogs", label: "Blog posts", description: "Journal content and publishing." },
  { id: "templates", label: "Email templates", description: "Templates and previews. Edit can send test emails." },
  { id: "storage", label: "Media storage", description: "Media inventory and uploads used by other editors." },
] as const;
export type AdminArea = typeof ADMIN_AREAS[number]["id"];
export type AdminPermission = `${AdminArea}.view` | `${AdminArea}.manage`;
export type AdminRequirement = AdminPermission | "administrator" | "signed-in";
export type AdminAccess = { isOwner: boolean; permissions: readonly string[] };
export const ADMIN_PERMISSIONS: AdminPermission[] = ADMIN_AREAS.flatMap(area => [
  `${area.id}.view` as AdminPermission, `${area.id}.manage` as AdminPermission,
]);
export function hasAdminPermission(access: AdminAccess, requirement: AdminRequirement): boolean {
  if (requirement === "signed-in") return true;
  if (requirement === "administrator") return access.isOwner;
  if (!ADMIN_PERMISSIONS.includes(requirement)) return false;
  if (access.isOwner) return true;
  return access.permissions.includes(requirement) ||
    (requirement.endsWith(".view") && access.permissions.includes(requirement.replace(".view", ".manage")));
}
const API_AREAS: Record<string, AdminArea> = {
  dashboard: "dashboard", analytics: "analytics", bookings: "bookings", inbox: "inbox",
  notifications: "bookings", "cabin-closures": "availability", inventory: "availability",
  cruises: "cruises", rooms: "cruises", "cabin-prices": "prices", "sailing-prices": "prices",
  content: "website", images: "website", "website-text": "website", typography: "website",
  "amenities-typography": "website", "gastronomy-typography": "website", "suites-typography": "website",
  "hero-logo-tune": "website", "hieroglyph-tune": "website", "wheel-stage": "website",
  "welcome-splash": "website", "page-visibility": "website", "live-site": "website",
  "ship-experience": "ship", "blog-posts": "blogs", "email-templates": "templates",
  "test-email": "templates", upload: "storage", "storage-analyze": "storage",
};
export function adminApiRequirement(pathname: string, method: string): AdminRequirement | null {
  if (!pathname.startsWith("/api/admin/")) return null;
  const section = pathname.slice("/api/admin/".length).split("/")[0];
  if (["security", "access"].includes(section)) return "signed-in";
  if (section === "people") return "administrator";
  const area = API_AREAS[section];
  if (!area) return null; // New/unmapped routes fail closed.
  if (section === "notifications") return "bookings.view";
  if (section === "test-email") return "templates.manage";
  if (pathname === "/api/admin/email-templates/preview" && method.toUpperCase() === "POST") return "templates.view";
  return `${area}.${["GET", "HEAD"].includes(method.toUpperCase()) ? "view" : "manage"}`;
}
const PAGE_AREAS: Record<string, AdminArea> = {
  analytics: "analytics", bookings: "bookings", inbox: "inbox", availability: "availability",
  inventory: "cruises", cruises: "cruises", prices: "prices", "ship-experience": "ship",
  content: "website", images: "website", "website-text": "website", typography: "website",
  pages: "website", "live-site": "website", "preload-screen": "website",
  "hero-logo-tune": "website", "hieroglyph-tune": "website", blogs: "blogs",
  "email-templates": "templates", storage: "storage", cms: "website",
};
export function adminPageRequirement(pathname: string): AdminRequirement | null {
  if (pathname === "/admin") return "dashboard.view";
  if (!pathname.startsWith("/admin/")) return null;
  const section = pathname.slice("/admin/".length).split("/")[0];
  if (["settings", "access", "cms"].includes(section)) return "signed-in";
  if (section === "people") return "administrator";
  const area = PAGE_AREAS[section];
  if (!area) return null;
  if (section === "blogs" && pathname !== "/admin/blogs") return "blogs.manage";
  return `${area}.view`;
}
export function canVisitAdminPage(access: AdminAccess, path: string): boolean {
  if (path === "/admin/cms") return ["website.view", "blogs.view", "templates.view", "storage.view"].some(permission => hasAdminPermission(access, permission as AdminPermission));
  const requirement = adminPageRequirement(path);
  return requirement !== null && hasAdminPermission(access, requirement);
}
export function firstAdminPage(access: AdminAccess): string {
  return ["/admin", "/admin/bookings", "/admin/inbox", "/admin/availability", "/admin/cruises",
    "/admin/prices", "/admin/analytics", "/admin/website-text", "/admin/ship-experience",
    "/admin/blogs", "/admin/email-templates", "/admin/storage", "/admin/people"]
    .find(path => canVisitAdminPage(access, path)) ?? "/admin/access";
}
