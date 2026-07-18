"use client";

import type { CSSProperties } from "react";
import { HATHOR_LOGO_LETTERS } from "@/lib/hathor-logo-letters";
import {
  heroLogoTuneToCssVars,
  type HeroLogoTune,
} from "@/lib/hero-logo-tune-shared";

const LEFT = HATHOR_LOGO_LETTERS.slice(0, 3);
const RIGHT = HATHOR_LOGO_LETTERS.slice(3);

type HeroLogoTunePreviewProps = {
  tune: HeroLogoTune;
};

/**
 * Instant visual preview of homepage HATHOR letters for the admin tuner.
 * Mirrors the live CSS knobs — updates as sliders move (before Save).
 */
export function HeroLogoTunePreview({ tune }: HeroLogoTunePreviewProps) {
  const vars = heroLogoTuneToCssVars(tune);

  return (
    <div className="hlt-preview" style={vars as CSSProperties}>
      <div className="hlt-preview__label">
        Live preview
        <span>updates as you move sliders — Save to push to the real homepage</span>
      </div>

      <div className="hlt-preview__stage">
        <div className="hlt-preview__hero-chrome" aria-hidden="true">
          <p className="hlt-preview__title">Ultra Luxury</p>
          <p className="hlt-preview__script">Dahabiya Cruise</p>
        </div>

        <div className="hlt-preview__logo-band">
          <div className="hlt-preview__letters">
            <div className="hlt-preview__side hlt-preview__side--left">
              {LEFT.map((letter) => (
                <span
                  key={letter.key}
                  className="hlt-preview__letter-wrap"
                  style={{ aspectRatio: `${letter.width} / ${letter.height}` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={letter.src}
                    alt={letter.alt}
                    className="hlt-preview__letter"
                    draggable={false}
                  />
                </span>
              ))}
            </div>

            <div className="hlt-preview__gap">
              <span className="hlt-preview__cta">BOOK NOW</span>
            </div>

            <div className="hlt-preview__side hlt-preview__side--right">
              {RIGHT.map((letter) => (
                <span
                  key={letter.key}
                  className="hlt-preview__letter-wrap"
                  style={{ aspectRatio: `${letter.width} / ${letter.height}` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={letter.src}
                    alt={letter.alt}
                    className="hlt-preview__letter"
                    draggable={false}
                  />
                </span>
              ))}
            </div>
          </div>

          <div className="hlt-preview__sheet" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
