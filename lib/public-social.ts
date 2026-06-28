export type SocialPlatform =
  | "facebook"
  | "linkedin"
  | "instagram"
  | "x"
  | "youtube"
  | "tiktok"
  | "google";

export type SocialLink = {
  key: SocialPlatform;
  label: string;
  href: string;
};

/** Placeholder links — update href values when social URLs are ready. */
export const PUBLIC_SOCIAL_LINKS: SocialLink[] = [
  { key: "facebook", label: "Facebook", href: "#" },
  { key: "linkedin", label: "LinkedIn", href: "#" },
  { key: "instagram", label: "Instagram", href: "#" },
  { key: "x", label: "X", href: "#" },
  { key: "youtube", label: "YouTube", href: "#" },
  { key: "tiktok", label: "TikTok", href: "#" },
  { key: "google", label: "Google", href: "#" },
];
