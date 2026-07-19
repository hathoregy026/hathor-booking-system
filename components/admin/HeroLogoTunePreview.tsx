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

/**
 * Same per-letter math as live — each letter moves on its own control.
 */
export function HeroLogoTunePreview({ tune }: { tune: HeroLogoTune }) {
  const [stageW, setStageW] = useState(1440);

  useEffect(() => {
    const sync = () => setStageW(window.innerWidth);
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
  const scale = letterH / HATHOR_LOGO_ARTBOARD_HEIGHT;
  const lw = (i: number) =>
    Math.max(8, Math.round(HATHOR_LOGO_LETTERS[i].width * scale));

  const h1W = lw(0);
  const aW = lw(1);
  const tW = lw(2);
  const h2W = lw(3);
  const oW = lw(4);
  const rW = lw(5);

  const leftInner = Math.max(0, sideW - tune.edgeLeft);
  const rightInner = Math.max(0, sideW - tune.edgeRight);

  const h1Left = 0;
  const aLeft = h1W + Math.max(0, tune.gapHA);
  const tFromChain = aLeft + aW + Math.max(0, tune.gapAT);
  const tFromBtn = leftInner - tW - Math.max(0, tune.gapTButton);
  const tLeft = Math.min(tFromChain, tFromBtn);

  const rLeft = rightInner - rW;
  const oLeft = rLeft - Math.max(0, tune.gapOR) - oW;
  const h2FromBtn = Math.max(0, tune.gapButtonH);
  const h2FromOr = oLeft - Math.max(0, tune.gapHO) - h2W;
  const h2Left = Math.min(h2FromBtn, h2FromOr);

  const letter = (
    i: number,
    key: string,
    yNudge: number,
    left: number,
    width: number,
  ) => (
    <span
      key={key}
      className={`hlt-preview__letter letter-${key}`}
      style={{
        position: "absolute",
        left,
        top: 0,
        width,
        height: letterH,
        transform: `translateY(${yNudge}px)`,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={HATHOR_LOGO_LETTERS[i].src}
        alt={HATHOR_LOGO_LETTERS[i].alt}
        width={width}
        height={letterH}
        draggable={false}
        className="hlt-preview__letter-img"
      />
    </span>
  );

  const sideBase: CSSProperties = {
    position: "relative",
    height: letterH,
    overflow: "hidden",
  };

  return (
    <div className="hlt-preview" data-hlt-preview="">
      <div className="hlt-preview__toolbar">
        <strong>1:1 hero width · {stageW}px</strong>
        <span>Each letter moves on its own — not as a HAT/HOR block</span>
      </div>

      <div className="hlt-preview__hud" aria-live="polite">
        <span>edge L {tune.edgeLeft}</span>
        <span>edge R {tune.edgeRight}</span>
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
                position: "relative",
              } as CSSProperties
            }
          >
            <div
              className="hlt-preview__side hlt-preview__side--left"
              style={{
                ...sideBase,
                width: sideW,
                paddingLeft: tune.edgeLeft,
                boxSizing: "border-box",
              }}
            >
              {letter(0, "h1", tune.yH1, h1Left, h1W)}
              {letter(1, "a", tune.yA, aLeft, aW)}
              {letter(2, "t", tune.yT, tLeft, tW)}
            </div>

            <span
              className="hlt-preview__gap"
              style={{
                width: HATHOR_BTN_SLOT_PX,
                flex: `0 0 ${HATHOR_BTN_SLOT_PX}px`,
                position: "relative",
                height: letterH,
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
                ...sideBase,
                width: sideW,
                paddingRight: tune.edgeRight,
                boxSizing: "border-box",
              }}
            >
              {letter(3, "h2", tune.yH2, h2Left, h2W)}
              {letter(4, "o", tune.yO, oLeft, oW)}
              {letter(5, "r", tune.yR, rLeft, rW)}
            </div>
          </div>

          <p className="hlt-preview__y-note">
            H / A / T each free on the left · H / O / R each free on the right ·
            edges hard-clip
          </p>
        </div>
      </div>
    </div>
  );
}
