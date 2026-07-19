"use client";

import type { CSSProperties } from "react";
import {
  HATHOR_LOGO_ARTBOARD_HEIGHT,
  HATHOR_LOGO_LETTERS,
  HATHOR_LOGO_LEFT_WIDTH,
} from "@/lib/hathor-logo-letters";
import {
  HATHOR_BTN_HEIGHT_PX,
  HATHOR_BTN_SLOT_PX,
  HERO_DESKTOP_PREVIEW_WIDTH,
  type HeroLogoTune,
} from "@/lib/hero-logo-tune-shared";

/**
 * Desktop-width hero clone (1440px = typical full-bleed desktop).
 * Same shell as live: left | 168 Book Now slot | right.
 * T→btn / btn→H = side padding (exact), letter gaps = margins.
 */
export function HeroLogoTunePreview({ tune }: { tune: HeroLogoTune }) {
  const stageW = HERO_DESKTOP_PREVIEW_WIDTH;
  const sideW = (stageW - HATHOR_BTN_SLOT_PX) / 2;
  const letterH = Math.max(
    40,
    Math.round(
      sideW * (HATHOR_LOGO_ARTBOARD_HEIGHT / HATHOR_LOGO_LEFT_WIDTH) * tune.size,
    ),
  );
  const scale = letterH / HATHOR_LOGO_ARTBOARD_HEIGHT;
  const lw = (i: number) =>
    Math.max(8, Math.round(HATHOR_LOGO_LETTERS[i].width * scale));

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
      marginRight: 0,
      yNudge: tune.yT,
    },
  ];

  const rightLetters = [
    {
      key: "h2",
      src: HATHOR_LOGO_LETTERS[3].src,
      alt: "H",
      width: lw(3),
      marginLeft: 0,
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
        <strong>Desktop preview · {stageW}px</strong>
        <span>
          Same layout as the live hero (full desktop width). Scroll sideways if
          your admin panel is narrower.
        </span>
      </div>

      <div className="hlt-preview__hud" aria-live="polite">
        <span>size {tune.size.toFixed(2)}×</span>
        <span>y {tune.y}px</span>
        <span>H→A {tune.gapHA}</span>
        <span>A→T {tune.gapAT}</span>
        <span>T→btn {tune.gapTButton}</span>
        <span>btn→H {tune.gapButtonH}</span>
        <span>H→O {tune.gapHO}</span>
        <span>O→R {tune.gapOR}</span>
      </div>

      <div className="hlt-preview__viewport">
        <div
          className="hlt-preview__stage"
          style={{ width: stageW, minWidth: stageW }}
        >
          <div
            className="hlt-preview__band"
            style={
              {
                width: stageW,
                height: letterH,
                alignItems,
              } as CSSProperties
            }
          >
            <div
              className="hlt-preview__side hlt-preview__side--left"
              style={{
                width: sideW,
                paddingLeft: tune.edgeLeft,
                paddingRight: Math.max(0, tune.gapTButton),
              }}
            >
              {leftLetters.map((letter) => (
                <span
                  key={letter.key}
                  className={`hlt-preview__letter letter-${letter.key}`}
                  style={{
                    width: letter.width,
                    height: letterH,
                    marginRight:
                      letter.key === "t"
                        ? Math.min(0, tune.gapTButton)
                        : letter.marginRight,
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
                  />
                </span>
              ))}
            </div>

            <span
              className="hlt-preview__gap"
              style={{
                width: HATHOR_BTN_SLOT_PX,
                flex: `0 0 ${HATHOR_BTN_SLOT_PX}px`,
              }}
            >
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
            </span>

            <div
              className="hlt-preview__side hlt-preview__side--right"
              style={{
                width: sideW,
                paddingRight: tune.edgeRight,
                paddingLeft: Math.max(0, tune.gapButtonH),
              }}
            >
              {rightLetters.map((letter) => (
                <span
                  key={letter.key}
                  className={`hlt-preview__letter letter-${letter.key}`}
                  style={{
                    width: letter.width,
                    height: letterH,
                    marginLeft:
                      letter.key === "h2"
                        ? Math.min(0, tune.gapButtonH)
                        : (letter.marginLeft ?? 0),
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
                  />
                </span>
              ))}
            </div>
          </div>

          <p className="hlt-preview__y-note">
            Live Y position (homepage bottom): {tune.y}px
          </p>
        </div>
      </div>
    </div>
  );
}
