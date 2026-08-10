/**
 * Floating BOOK NOW + chat — site-wide except booking flows and admin dashboard.
 */
export function shouldShowFloatingActions(pathname: string | null): boolean {
  if (!pathname) return true;
  const path = pathname.toLowerCase();
  if (path === "/admin" || path.startsWith("/admin/")) return false;
  if (path === "/booking" || path.startsWith("/booking/")) return false;
  if (path === "/book" || path.startsWith("/book/")) return false;
  return true;
}
