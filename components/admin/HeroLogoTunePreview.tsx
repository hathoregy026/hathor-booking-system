"use client";

import type { CSSProperties } from "react";
import { HATHOR_LOGO_LETTERS } from "@/lib/hathor-logo-letters";
import {
  HATHOR_BTN_HEIGHT_PX,
  HATHOR_BTN_SLOT_PX,
  type HeroLogoTune,
  heroLogoTuneToCssVars,
} from "@/lib/hero-logo-tune-shared";

type Spacer = { type: "spacer"; key: string; width: number };
type Letter = {
  type: "letter";
  key: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  yNudge: number;
};
type Btn = { type: "btn" };
type Item = Spacer | Letter | Btn;

/**
 * Admin-only instant preview — isolated from the live homepage.
 *
 * One left-to-right chain (no competing anchors):
 *   edgeL | H | HA | A | AT | T | T→btn | BookNow(168) | btn→H | H | HO | O | OR | R | edgeR
 */
export function HeroLogoTunePreview({ tune }: { tune: HeroLogoTune }) {
  const cssVars = heroLogoTuneToCssVars(tune) as CSSProperties;
  const letterH = Math.max(56, 128 * tune.size);
  const scale = letterH / 2200;
  const lw = (i: number) => HATHOR_LOGO_LETTERS[i].width * scale;

  const items: Item[] = [
    {
      type: "letter",
      key: "h1",
      src: HATHOR_LOGO_LETTERS[0].src,
      alt: "H",
      width: lw(0),
      height: letterH,
      yNudge: tune.yH1,
    },
    { type: "spacer", key: "ha", width: tune.gapHA },
    {
      type: "letter",
      key: "a",
      src: HATHOR_LOGO_LETTERS[1].src,
      alt: "A",
      width: lw(1),
      height: letterH,
      yNudge: tune.yA,
    },
    { type: "spacer", key: "at", width: tune.gapAT },
    {
      type: "letter",
      key: "t",
      src: HATHOR_LOGO_LETTERS[2].src,
      alt: "T",
      width: lw(2),
      height: letterH,
      yNudge: tune.yT,
    },
    { type: "spacer", key: "tbtn", width: tune.gapTButton },
    { type: "btn" },
    { type: "spacer", key: "btnh", width: tune.gapButtonH },
    {
      type: "letter",
      key: "h2",
      src: HATHOR_LOGO_LETTERS[3].src,
      alt: "H",
      width: lw(3),
      height: letterH,
      yNudge: tune.yH2,
    },
    { type: "spacer", key: "ho", width: tune.gapHO },
    {
      type: "letter",
      key: "o",
      src: HATHOR_LOGO_LETTERS[4].src,
      alt: "O",
      width: lw(4),
      height: letterH,
      yNudge: tune.yO,
    },
    { type: "spacer", key: "or", width: tune.gapOR },
    {
      type: "letter",
      key: "r",
      src: HATHOR_LOGO_LETTERS[5].src,
      alt: "R",
      width: lw(5),
      height: letterH,
      yNudge: tune.yR,
    },
  ];

  return (
    <div className="hlt-preview" style={cssVars}>
      <div className="hlt-preview__toolbar">
        <strong>Instant preview</strong>
        <span>
          Exact letter files · Book Now {HATHOR_BTN_SLOT_PX}×{HATHOR_BTN_HEIGHT_PX}px ·
          not live until Save
        </span>
      </div>

      <div className="hlt-preview__stage">
        <div
          className="hlt-preview__band"
          style={
            {
              height: letterH,
              paddingLeft: tune.edgeLeft,
              paddingRight: tune.edgeRight,
              alignItems:
                tune.vAlign === "top"
                  ? "flex-start"
                  : tune.vAlign === "middle"
                    ? "center"
                    : "flex-end",
              transform: `translateY(${tune.y * 0.1}px)`,
            } as CSSProperties
          }
        >
          {items.map((item) => {
            if (item.type === "spacer") {
              const w = item.width;
              return (
                <span
                  key={item.key}
                  className="hlt-preview__spacer"
                  style={{
                    width: Math.max(0, w),
                    flex: `0 0 ${Math.max(0, w)}px`,
                    /* Negative gaps pull the next piece left (true overlap control). */
                    marginInlineEnd: w < 0 ? w : 0,
                  }}
                  aria-hidden
                />
              );
            }
            if (item.type === "btn") {
              return (
                <span
                  key="btn"
                  className="hlt-preview__btn"
                  style={{
                    width: HATHOR_BTN_SLOT_PX,
                    height: HATHOR_BTN_HEIGHT_PX,
                    transform: `translateY(${tune.ctaNudge * 0.35}px)`,
                  }}
                >
                  Book Now
                </span>
              );
            }
            return (
              <span
                key={item.key}
                className={`hlt-preview__letter letter-${item.key}`}
                style={{
                  width: item.width,
                  height: item.height,
                  transform: `translateY(${item.yNudge * 0.45}px)`,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.src}
                  alt={item.alt}
                  width={item.width}
                  height={item.height}
                  draggable={false}
                  className="hlt-preview__letter-img"
                />
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
