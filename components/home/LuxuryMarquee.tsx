"use client";

import "./luxury-marquee.css";
import {
  useTypographyInlineStyle,
  useTypographySettings,
} from "@/components/public/TypographySettingsProvider";
import { parseMarqueePhrases } from "@/lib/typography-settings-shared";

function MarqueeGroup({
  phrases,
  ariaHidden,
}: {
  phrases: string[];
  ariaHidden?: boolean;
}) {
  return (
    <span className="luxury-marquee__group" aria-hidden={ariaHidden || undefined}>
      {phrases.map((phrase, index) => (
        <span key={`${phrase}-${index}`} className="luxury-marquee__item typo-luxury-marquee">
          <span className="luxury-marquee__text">{phrase}</span>
          <span className="luxury-marquee__divider" aria-hidden="true">
            ✦
          </span>
        </span>
      ))}
    </span>
  );
}

export function LuxuryMarquee() {
  const typography = useTypographySettings();
  const style = useTypographyInlineStyle("luxury_marquee");
  const phrases = parseMarqueePhrases(typography.marquee_copy.text);

  return (
    <div className="luxury-marquee" aria-hidden="true" style={style}>
      <div className="luxury-marquee__blur" />
      <div className="luxury-marquee__track">
        <MarqueeGroup phrases={phrases} />
        <MarqueeGroup phrases={phrases} ariaHidden />
      </div>
    </div>
  );
}
