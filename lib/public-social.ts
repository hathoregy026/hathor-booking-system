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

/** Public social profiles for Hathor Dahabiya Cruise. */
export const PUBLIC_SOCIAL_LINKS: SocialLink[] = [
  { key: "facebook", label: "Facebook", href: "https://www.facebook.com/Hathorcruise" },
  { key: "instagram", label: "Instagram", href: "https://www.instagram.com/hathorcruise/" },
  { key: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/company/hathor-dahabiya-cruise" },
  { key: "youtube", label: "YouTube", href: "https://www.youtube.com/@hathorcruise" },
  { key: "tiktok", label: "TikTok", href: "https://www.tiktok.com/@hathorcruise" },
];
