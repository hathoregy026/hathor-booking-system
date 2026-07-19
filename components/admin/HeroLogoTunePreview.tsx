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

function spaceStyle(gap: number): CSSProperties {
  return {
    width: Math.max(0, gap),
    marginRight: Math.min(0, gap),
    flex: "0 0 auto",
    height: 1,
    alignSelf: "center",
  };
}

/**
 * Desktop-width clone of live HathorLogoSplit:
 * H · ha · A · at · T · grow · t→btn | Book Now | btn→H · grow · H · ho · O · or · R
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

  const letter = (
    i: number,
    key: string,
    yNudge: number,
  ) => (
    <span
      key={key}
      className={`hlt-preview__letter letter-${key}`}
      style={{
        width: lw(i),
        height: letterH,
        transform: `translateY(${yNudge}px)`,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={HATHOR_LOGO_LETTERS[i].src}
        alt={HATHOR_LOGO_LETTERS[i].alt}
        width={lw(i)}
        height={letterH}
        draggable={false}
        className="hlt-preview__letter-img"
      />
    </span>
  );

  return (
    <div className="hlt-preview" data-hlt-preview="">
      <div className="hlt-preview__toolbar">
        <strong>Desktop preview · {stageW}px</strong>
        <span>
          Each gap moves only its neighbors — same layout as the live hero.
        </span>
      </div>

      <div className="hlt-preview__hud" aria-live="polite">
        <span>H→A {tune.gapHA}</span>
        <span>A→T {tune.gapAT}</span>
        <span>T→btn {tune.gapTButton}</span>
        <span>btn→H {tune.gapButtonH}</span>
        <span>H→O {tune.gapHO}</span>
        <span>O→R {tune.gapOR}</span>
        <span>size {tune.size.toFixed(2)}×</span>
        <span>y {tune.y}px</span>
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
              }}
            >
              {letter(0, "h1", tune.yH1)}
              <span className="hlt-preview__space" style={spaceStyle(tune.gapHA)} />
              {letter(1, "a", tune.yA)}
              <span className="hlt-preview__space" style={spaceStyle(tune.gapAT)} />
              {letter(2, "t", tune.yT)}
              <span className="hlt-preview__grow" />
              <span
                className="hlt-preview__space"
                style={spaceStyle(tune.gapTButton)}
              />
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
              }}
            >
              <span
                className="hlt-preview__space"
                style={spaceStyle(tune.gapButtonH)}
              />
              <span className="hlt-preview__grow" />
              {letter(3, "h2", tune.yH2)}
              <span className="hlt-preview__space" style={spaceStyle(tune.gapHO)} />
              {letter(4, "o", tune.yO)}
              <span className="hlt-preview__space" style={spaceStyle(tune.gapOR)} />
              {letter(5, "r", tune.yR)}
            </div>
          </div>

          <p className="hlt-preview__y-note">
            Live Y (homepage bottom): {tune.y}px · H→A moves A only relative to H ·
            A→T moves T only relative to A
          </p>
        </div>
      </div>
    </div>
  );
}
