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
  { key: "facebook", label: "Facebook", href: "https://www.facebook.com/HathorLuxuryDahabiya" },
  { key: "instagram", label: "Instagram", href: "https://www.instagram.com/hathorluxurydahabiya/?hl=en" },
  { key: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/company/hathor-dahabiya-cruise/home/" },
  { key: "youtube", label: "YouTube", href: "https://www.youtube.com/@HathorDahabiyaCruise" },
  { key: "tiktok", label: "TikTok", href: "https://www.tiktok.com/@hathordahabiyacruise" },
  {
    key: "google",
    label: "Google",
    href: "https://www.google.com/travel/search?q=hathor%20cruise&g2lb=4965990%2C72471280%2C72560029%2C72573224%2C72647020%2C72686036%2C72803964%2C72880339%2C72882230%2C72958624%2C73059275%2C73064764&hl=en-EG&gl=eg&ssta=1&ts=CAEaSQopEicyJTB4MTQ0OTE1YzEwZDQxMWZiOToweDgwYWRiNjhkMTYzOWE3MWYSHBIUCgcI6g8QAxgUEgcI6g8QAxgXGAMyBAgAEAAqBwoFOgNFR1A&qs=CAEyFENnc0luODdtc2RIUjdkYUFBUkFCOAJCCQkfpzkWjbatgEIJCR-nORaNtq2ASAA&ap=MAC6AQdyZXZpZXdz&ictx=111&ved=0CAAQ5JsGahcKEwiIxLmy2ZCXAxUAAAAAHQAAAAAQBA",
  },
];
