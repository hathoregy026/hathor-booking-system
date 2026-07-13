/** Split a page title into two hero lines (home hero layout). */
export function splitHeroTitle(title: string): [string, string] {
  const trimmed = title.trim();
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length <= 1) return [trimmed, ""];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}
