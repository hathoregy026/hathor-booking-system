/** Bust Supabase CDN cache after re-uploads (stable paths keep serving stale corrupt bytes). */
export function withEmailImageCacheBust(
  url: string | null | undefined,
  version: string | null | undefined,
): string | null {
  const base = url?.trim();
  if (!base) return null;

  const token = version?.trim();
  if (!token) return base;

  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}v=${encodeURIComponent(token)}`;
}
