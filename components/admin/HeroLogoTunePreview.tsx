"use client";

import type { CSSProperties } from "react";
import { HATHOR_LOGO_LETTERS } from "@/lib/hathor-logo-letters";
import {
  HATHOR_BTN_HEIGHT_PX,
  HATHOR_BTN_SLOT_PX,
  type HeroLogoTune,
} from "@/lib/hero-logo-tune-shared";

/**
 * Admin preview — always stays on-screen.
 * Y is shown as a marker (live uses CSS bottom); letter gaps / size move 1:1.
 */
export function HeroLogoTunePreview({ tune }: { tune: HeroLogoTune }) {
  const letterH = Math.max(56, Math.round(100 * tune.size));
  const scale = letterH / 2200;
  const lw = (i: number) =>
    Math.max(10, Math.round(HATHOR_LOGO_LETTERS[i].width * scale));

  const alignItems =
    tune.vAlign === "top"
      ? "flex-start"
      : tune.vAlign === "middle"
        ? "center"
        : "flex-end";

  const leftLetters = [
    {
      key: "h1",
      src: HATHOR_LOGO_LETTERS[0].src,
      alt: "H",
      width: lw(0),
      marginRight: tune.gapHA,
      yNudge: tune.yH1,
    },
    {
      key: "a",
      src: HATHOR_LOGO_LETTERS[1].src,
      alt: "A",
      width: lw(1),
      marginRight: tune.gapAT,
      yNudge: tune.yA,
    },
    {
      key: "t",
      src: HATHOR_LOGO_LETTERS[2].src,
      alt: "T",
      width: lw(2),
      marginRight: tune.gapTButton,
      yNudge: tune.yT,
    },
  ];

  const rightLetters = [
    {
      key: "h2",
      src: HATHOR_LOGO_LETTERS[3].src,
      alt: "H",
      width: lw(3),
      marginLeft: tune.gapButtonH,
      marginRight: tune.gapHO,
      yNudge: tune.yH2,
    },
    {
      key: "o",
      src: HATHOR_LOGO_LETTERS[4].src,
      alt: "O",
      width: lw(4),
      marginRight: tune.gapOR,
      yNudge: tune.yO,
    },
    {
      key: "r",
      src: HATHOR_LOGO_LETTERS[5].src,
      alt: "R",
      width: lw(5),
      marginRight: 0,
      yNudge: tune.yR,
    },
  ];

  return (
    <div className="hlt-preview" data-hlt-preview="">
      <div className="hlt-preview__toolbar">
        <strong>Instant preview</strong>
        <span>Drag sliders below — letters move here immediately</span>
      </div>

      <div className="hlt-preview__hud" aria-live="polite">
        <span>size {tune.size.toFixed(2)}×</span>
        <span>y {tune.y}px</span>
        <span>cta {tune.ctaNudge}px</span>
        <span>H→A {tune.gapHA}</span>
        <span>A→T {tune.gapAT}</span>
        <span>T→btn {tune.gapTButton}</span>
        <span>btn→H {tune.gapButtonH}</span>
        <span>H→O {tune.gapHO}</span>
        <span>O→R {tune.gapOR}</span>
      </div>

      <div className="hlt-preview__stage">
        <div className="hlt-preview__y-rail" aria-hidden>
          <span className="hlt-preview__y-label">Y {tune.y}px</span>
          <div
            className="hlt-preview__y-marker"
            style={{ top: `calc(50% + ${Math.max(-70, Math.min(70, tune.y * 0.2))}px)` }}
          />
        </div>

        <div
          className="hlt-preview__band hlt-preview__band--edges"
          style={
            {
              height: letterH + 16,
              alignItems,
            } as CSSProperties
          }
        >
          <div
            className="hlt-preview__side hlt-preview__side--left"
            style={{ paddingLeft: tune.edgeLeft }}
          >
            {leftLetters.map((letter) => (
              <span
                key={letter.key}
                className={`hlt-preview__letter letter-${letter.key}`}
                style={{
                  width: letter.width,
                  height: letterH,
                  marginRight: letter.marginRight,
                  transform: `translateY(${letter.yNudge}px)`,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={letter.src}
                  alt={letter.alt}
                  width={letter.width}
                  height={letterH}
                  draggable={false}
                  className="hlt-preview__letter-img"
                  onError={(e) => {
                    const el = e.currentTarget;
                    el.style.display = "none";
                    const fallback = el.nextElementSibling;
                    if (fallback instanceof HTMLElement) {
                      fallback.hidden = false;
                    }
                  }}
                />
                <span className="hlt-preview__letter-fallback" hidden>
                  {letter.alt}
                </span>
              </span>
            ))}
          </div>

          <span
            className="hlt-preview__btn"
            style={{
              width: HATHOR_BTN_SLOT_PX,
              height: HATHOR_BTN_HEIGHT_PX,
              transform: `translateY(${tune.ctaNudge}px)`,
            }}
          >
            Book Now
          </span>

          <div
            className="hlt-preview__side hlt-preview__side--right"
            style={{ paddingRight: tune.edgeRight }}
          >
            {rightLetters.map((letter) => (
              <span
                key={letter.key}
                className={`hlt-preview__letter letter-${letter.key}`}
                style={{
                  width: letter.width,
                  height: letterH,
                  marginLeft: letter.marginLeft ?? 0,
                  marginRight: letter.marginRight,
                  transform: `translateY(${letter.yNudge}px)`,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={letter.src}
                  alt={letter.alt}
                  width={letter.width}
                  height={letterH}
                  draggable={false}
                  className="hlt-preview__letter-img"
                  onError={(e) => {
                    const el = e.currentTarget;
                    el.style.display = "none";
                    const fallback = el.nextElementSibling;
                    if (fallback instanceof HTMLElement) {
                      fallback.hidden = false;
                    }
                  }}
                />
                <span className="hlt-preview__letter-fallback" hidden>
                  {letter.alt}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
