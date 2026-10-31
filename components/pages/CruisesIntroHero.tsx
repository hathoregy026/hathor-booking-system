"use client";

import Link from "next/link";
import {
  useRef,
  type ComponentPropsWithoutRef,
} from "react";
import { AnimaSplitLine } from "@/components/public/AnimaSplitLine";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { useCruisesIntroScroll } from "@/hooks/useCruisesIntroScroll";
import { CRUISES_PAGE } from "@/lib/page-content";
import { useWebsiteText } from "@/components/public/WebsiteTextProvider";
import { useTypographySettings } from "@/components/public/TypographySettingsProvider";
import { resolveHeroPageCopy } from "@/lib/typography-settings-shared";
import {
  normalizeOptionalText,
  stackedHeroLines,
} from "@/lib/website-text-shared";
import { useLocalizedHref, usePublicLocale } from "@/hooks/usePublicLocale";
import { CRUISES_COPY } from "@/lib/i18n/cruises-copy";

function Scene({
  className = "",
  children,
  ...props
}: ComponentPropsWithoutRef<"section">) {
  return (
    <section
      className={`cr-intro__scene ${className}`}
      data-cr-intro-scene=""
      {...props}
    >
      {children}
    </section>
  );
}

const LINE_CLASS = ["cr-intro__line--a", "cr-intro__line--b", "cr-intro__line--c"] as const;

/**
 * Contact-page opener on /cruises: cream panel, Italiana ladder, then the
 * Nile still. Copy stays cruises-specific; the type, scale and scene rhythm
 * are the Contact intro.
 */
export function CruisesIntroHero() {
  const runRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  useCruisesIntroScroll({ runRef, trackRef });
  const t = CRUISES_COPY[usePublicLocale()].intro;
  const localHref = useLocalizedHref();
  const { pages } = useWebsiteText();
  const typography = useTypographySettings();
  const cruisesHero = resolveHeroPageCopy(typography, "cruises");
  const cruisesHeroLines = stackedHeroLines(cruisesHero.main, cruisesHero.second);
  const introBody =
    normalizeOptionalText(pages.cruises.overviewIntro) ??
    CRUISES_PAGE.hero.subtitle;

  return (
    <div className="cr-intro" aria-label={t.label}>
      <section ref={runRef} className="cr-intro__run">
        <div className="cr-intro__stage">
          <div className="cr-intro__progress" aria-hidden="true">
            <i data-cr-intro-progress />
          </div>
          <div ref={trackRef} className="cr-intro__track">
            <Scene className="cr-intro__copy" aria-label={t.scene}>
              <nav className="cr-intro__nav" aria-label={t.nav}>
                <a href="#cruises-listing">{t.links.cruises}</a>
                <Link href={localHref("/voyages")}>{t.links.voyages}</Link>
                <Link href={localHref("/suites")}>{t.links.suites}</Link>
                <Link href={localHref("/contact")}>{t.links.contact}</Link>
              </nav>

              <div className="cr-intro__inner">
                <p className="cr-intro__eyebrow">{t.eyebrow}</p>

                <div className="cr-intro__title" data-anima-title>
                  <h1 className="cr-intro__display wt-page-hero">
                    {cruisesHeroLines.map((line, index) => (
                      <span
                        key={`${line}-${index}`}
                        className={`cr-intro__line ${LINE_CLASS[index] ?? ""}`}
                      >
                        <AnimaSplitLine line={index}>{line}</AnimaSplitLine>
                      </span>
                    ))}
                  </h1>
                </div>

                <p className="cr-intro__body wt-page-body">{introBody}</p>
              </div>

              <p className="cr-intro__mark">
                Hathor Cruise <span className="cr-intro__reg">®</span> 2026
              </p>
              <p className="cr-intro__scroll">
                <i />
                {t.scroll}
              </p>
            </Scene>

            <Scene className="cr-intro__media" aria-hidden="true">
              <figure className="cr-intro__still">
                <ManagedImage
                  name="cruises-hero"
                  alt=""
                  fill
                  priority
                  previewAnchor={false}
                  className="cr-intro__image"
                  sizes="(max-width: 1024px) 100vw, 92vw"
                />
              </figure>
              <div className="cr-intro__flip" data-cr-intro-flip>
                <figure>
                  <ManagedImage
                    name="home-voyage-4n-luxor-aswan"
                    alt=""
                    fill
                    previewAnchor={false}
                    className="cr-intro__image"
                    sizes="(max-width: 1024px) 70vw, 42vw"
                  />
                </figure>
                <figure>
                  <ManagedImage
                    name="home-voyage-nile-majesty"
                    alt=""
                    fill
                    previewAnchor={false}
                    className="cr-intro__image"
                    sizes="(max-width: 1024px) 70vw, 42vw"
                  />
                </figure>
              </div>
              <p className="cr-intro__caption">
                <span>{t.aboard}</span> {t.route}
              </p>
            </Scene>
          </div>
        </div>
      </section>
    </div>
  );
}
