function pathOf(pathname: string | null): string {
  return (pathname ?? "").toLowerCase();
}

export function isAdminPath(pathname: string | null): boolean {
  const path = pathOf(pathname);
  return path === "/admin" || path.startsWith("/admin/");
}

export function isBookingPath(pathname: string | null): boolean {
  const path = pathOf(pathname);
  return (
    path === "/booking" ||
    path.startsWith("/booking/") ||
    path === "/book" ||
    path.startsWith("/book/")
  );
}

/**
 * Phone dock Book Now + contact. Hidden on booking and admin so the
 * desktop chat rules below do not leak into the phone dock.
 */
export function shouldShowFloatingActions(pathname: string | null): boolean {
  if (!pathname) return true;
  if (isAdminPath(pathname) || isBookingPath(pathname)) return false;
  return true;
}

/** Desktop chat bubble — every public page, including booking. */
export function shouldShowDesktopChat(pathname: string | null): boolean {
  return !isAdminPath(pathname);
}

/** Desktop Book Now pill sits beside the chat, except on booking. */
export function shouldShowDesktopBookNow(pathname: string | null): boolean {
  return shouldShowDesktopChat(pathname) && !isBookingPath(pathname);
}
