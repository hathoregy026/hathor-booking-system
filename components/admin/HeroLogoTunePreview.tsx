"use client";

import { useEffect, useState, type CSSProperties } from "react";
import {
  HATHOR_LOGO_ARTBOARD_HEIGHT,
  HATHOR_LOGO_LETTERS,
  HATHOR_LOGO_LEFT_WIDTH,
} from "@/lib/hathor-logo-letters";
import {
  HATHOR_BTN_HEIGHT_PX,
  HATHOR_BTN_SLOT_PX,
  type HeroLogoTune,
} from "@/lib/hero-logo-tune-shared";

function spaceStyle(gap: number): CSSProperties {
  const w = Math.max(0, gap);
  return {
    width: w,
    flex: `0 0 ${w}px`,
    flexBasis: w,
    height: 1,
    alignSelf: "center",
    background: "transparent",
    border: 0,
  };
}

/**
 * Full-viewport preview — same zone model as the live hero:
 * Left:  edge → H · ha · A · at · T · t→btn → Book Now
 * Right: Book Now → btn→H · H · ho · O · or · R → edge
 * Gap spacers are fixed; letters flex so they stay inside each zone.
 */
export function HeroLogoTunePreview({ tune }: { tune: HeroLogoTune }) {
  const [stageW, setStageW] = useState(1440);

  useEffect(() => {
    const sync = () => setStageW(Math.max(1024, window.innerWidth));
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  const sideW = (stageW - HATHOR_BTN_SLOT_PX) / 2;
  const letterH = Math.max(
    48,
    Math.round(
      sideW * (HATHOR_LOGO_ARTBOARD_HEIGHT / HATHOR_LOGO_LEFT_WIDTH) * tune.size,
    ),
  );

  const alignItems =
    tune.vAlign === "top"
      ? "flex-start"
      : tune.vAlign === "middle"
        ? "center"
        : "flex-end";

  const letter = (i: number, key: string, yNudge: number) => (
    <span
      key={key}
      className={`hlt-preview__letter letter-${key}`}
      style={{
        flex: `${HATHOR_LOGO_LETTERS[i].flexGrow} 1 0`,
        minWidth: 0,
        height: letterH,
        transform: `translateY(${yNudge}px)`,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={HATHOR_LOGO_LETTERS[i].src}
        alt={HATHOR_LOGO_LETTERS[i].alt}
        draggable={false}
        className="hlt-preview__letter-img"
      />
    </span>
  );

  return (
    <div className="hlt-preview" data-hlt-preview="">
      <div className="hlt-preview__toolbar">
        <strong>Live-width preview · {stageW}px</strong>
        <span>
          Left zone: edge → H A T → Book Now · Right zone: Book Now → H O R →
          edge
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
              {letter(3, "h2", tune.yH2)}
              <span className="hlt-preview__space" style={spaceStyle(tune.gapHO)} />
              {letter(4, "o", tune.yO)}
              <span className="hlt-preview__space" style={spaceStyle(tune.gapOR)} />
              {letter(5, "r", tune.yR)}
            </div>
          </div>

          <p className="hlt-preview__y-note">
            Full browser width ({stageW}px) · letters stay between edge and Book
            Now · Y on live site: {tune.y}px
          </p>
        </div>
      </div>
    </div>
  );
}
