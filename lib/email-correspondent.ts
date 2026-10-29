export function mailboxDisplayName(value: string): string | null {
  const name = value.match(/^\s*(.*?)\s*<[^<>]+>\s*$/)?.[1]?.replace(/^"|"$/g, "").replace(/[\u0000-\u001f\u007f\u200b\u200e\u200f\u202a-\u202e\u2060-\u2069\ufeff]/g, "").trim();
  return name ? name.slice(0, 160) : null;
}

export function correspondentLabel(name: string | null | undefined, address: string): string {
  return name?.trim() || mailboxDisplayName(address) || address;
}

export function correspondentInitials(name: string): string {
  return name.split(/[\s@._-]+/).filter(Boolean).slice(0, 2).map(part => Array.from(part)[0]).join("").toUpperCase() || "H";
}
