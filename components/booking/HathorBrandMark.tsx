import {
  HATHOR_BRAND_NAME,
  HATHOR_LOGO_DAY_SRC,
  HATHOR_LOGO_SRC,
} from "@/lib/branding";

type HathorBrandMarkProps = {
  className?: string;
  /** Light logo on dark backgrounds; day logo on cream/light backgrounds. */
  variant?: "on-dark" | "on-light";
  priority?: boolean;
};

export function HathorBrandMark({
  className = "h-9 w-auto object-contain",
  variant = "on-dark",
}: HathorBrandMarkProps) {
  const src = variant === "on-light" ? HATHOR_LOGO_DAY_SRC : HATHOR_LOGO_SRC;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={HATHOR_BRAND_NAME} className={className} />
  );
}
