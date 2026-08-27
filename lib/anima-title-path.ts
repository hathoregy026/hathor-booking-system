/**
 * Routes that receive the Suites “BEGIN YOUR NILE JOURNEY” clip-letter
 * scroll animation. Homepage and booking stay on their own motion.
 */

const DENY_EXACT = new Set(["/", "/ex", "/book"]);

const ALLOW_PREFIXES = [
  "/suites",
  "/luxury-cabins-Nile-Cruise",
  "/rooms",
  "/royal-suites",
  "/cruises",
  "/cruises-list",
  "/voyages",
  "/charter",
  "/highlights",
  "/wellness",
  "/gastronomy",
  "/dining",
  "/about",
  "/blog",
  "/blogs",
  "/partners",
  "/contact",
] as const;

function normalizePath(pathname: string): string {
  const trimmed = pathname.trim() || "/";
  if (trimmed === "/") return "/";
  return trimmed.replace(/\/+$/, "") || "/";
}

export function shouldApplyAnimaTitle(pathname: string): boolean {
  const path = normalizePath(pathname);
  if (DENY_EXACT.has(path)) return false;
  if (path.startsWith("/booking") || path.startsWith("/admin")) return false;
  return ALLOW_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}
