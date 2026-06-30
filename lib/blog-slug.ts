const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidBlogSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug) && slug.length <= 200;
}

export function slugifyBlogTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 200);
}

export function resolveBlogSlug(title: string, slugInput: string): string {
  const slug = slugInput.trim() || slugifyBlogTitle(title);
  if (!slug || !isValidBlogSlug(slug)) {
    throw new Error(
      "Slug must use lowercase letters, numbers, and hyphens only.",
    );
  }
  return slug;
}
