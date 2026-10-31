"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useRef,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { InquiryForm } from "@/components/pages/InquiryForm";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { AnimaSplitLine } from "@/components/public/AnimaSplitLine";
import { useSiteImage } from "@/components/public/SiteImagesProvider";
import { useWebsiteText } from "@/components/public/WebsiteTextProvider";
import { useTypographySettings } from "@/components/public/TypographySettingsProvider";
import { useContactEditorialScroll } from "@/hooks/useContactEditorialScroll";
import { CONTACT_PAGE } from "@/lib/page-content";
import { PUBLIC_CONTACT } from "@/lib/public-contact";
import { SITE_IMAGE_QUALITY } from "@/lib/site-image-quality";
import { originSrcForNextImage } from "@/lib/local-optimized-site-images";
import { resolveHeroPageCopy } from "@/lib/typography-settings-shared";
import { stackedHeroLines } from "@/lib/website-text-shared";
import { useLocalizedHref, usePublicLocale } from "@/hooks/usePublicLocale";
import { CONTACT_COPY } from "@/lib/i18n/contact-copy";

function ContactMedia({
  slot,
  alt,
  priority = false,
  className = "",
  ratio,
}: {
  slot: string;
  alt: string;
  priority?: boolean;
  className?: string;
  ratio?: string;
}) {
  const image = useSiteImage(slot);
  return (
    <figure
      className={`ce-media ${className}`}
      data-site-image={image.slot ?? slot}
      style={ratio ? ({ ["--ce-ratio" as string]: ratio } as CSSProperties) : undefined}
    >
      <Image
        src={originSrcForNextImage(image.src)}
        alt={alt || image.alt}
        fill
        priority={priority}
        sizes="(max-width: 950px) 100vw, 70vw"
        quality={SITE_IMAGE_QUALITY}
        className="ce-media__image"
      />
    </figure>
  );
}

function FlipImage({
  front,
  back,
  frontAlt,
  backAlt = "",
  className = "",
  axis = "left",
  ratio,
}: {
  front: string;
  back: string;
  frontAlt: string;
  backAlt?: string;
  className?: string;
  axis?: "up" | "left" | "right";
  ratio?: string;
}) {
  return (
    <div className={`ce-flip ce-flip--${axis} ${className}`} data-ce-flip>
      <ContactMedia slot={front} alt={frontAlt} className="ce-flip__base" ratio={ratio} />
      <ContactMedia slot={back} alt={backAlt} className="ce-flip__overlay" ratio={ratio} />
    </div>
  );
}

function Scene({
  className = "",
  children,
  ...props
}: ComponentPropsWithoutRef<"section">) {
  return (
    <section className={`ce-scene ${className}`} {...props}>
      {children}
    </section>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="ce-eyebrow">{children}</p>;
}

/*
 * The four ways to reach the desk. Words (giant word, label, meta, call to
 * action, and any value that is a sentence) come from CONTACT_COPY.channels,
 * in this order; numbers, phone and email are the same in every language.
 */
const CHANNELS = [
  { number: "01", value: null, href: null },
  { number: "02", value: PUBLIC_CONTACT.phoneDisplay, href: `tel:${PUBLIC_CONTACT.phone}` },
  { number: "03", value: PUBLIC_CONTACT.email, href: `mailto:${PUBLIC_CONTACT.email}` },
  { number: "04", value: null, href: PUBLIC_CONTACT.whatsappUrl, external: true },
] as const;

export function ContactPageContent() {
  const rootRef = useRef<HTMLDivElement>(null);
  const runRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const t = CONTACT_COPY[usePublicLocale()];
  const localHref = useLocalizedHref();
  const { pages } = useWebsiteText();
  const contact = pages.contact;
  const typography = useTypographySettings();
  const contactHero = resolveHeroPageCopy(typography, "contact");
  const contactHeroLines = stackedHeroLines(contactHero.main, contactHero.second);
  const contactLineClass = ["ce-line--a", "ce-line--b", "ce-line--c"] as const;
  useContactEditorialScroll({ rootRef, runRef, trackRef });

  const formTitle = contact.formTitle.trim() || CONTACT_PAGE.form.title;

  return (
    <div ref={rootRef} className="contact-editorial">
      <div className="ce-progress" aria-hidden="true">
        <i data-ce-progress />
      </div>

      <main>
        <section
          ref={runRef}
          className="ce-run"
          aria-label={t.runLabel}
        >
          <div className="ce-stage">
            <div ref={trackRef} className="ce-track">
              {/* 01 — Intro panel */}
              <Scene className="ce-intro">
                <nav className="ce-intro__nav" aria-label={t.navLabel}>
                  <a href="#write">{t.nav.write}</a>
                  <a href="#channels">{t.nav.reach}</a>
                  <a href="#hours">{t.nav.hours}</a>
                  <Link href={localHref("/cruises-list")}>{t.nav.cruises}</Link>
                </nav>

                <div className="ce-intro__inner">
                  <Eyebrow>{t.eyebrow}</Eyebrow>

                  <div className="ce-intro__title" id="contact">
                    <h1 className="ce-display ce-display--xl wt-page-hero">
                      {contactHeroLines.map((line, index) => (
                        <span
                          key={`${line}-${index}`}
                          className={`ce-line ${contactLineClass[index] ?? ""}`}
                        >
                          {line}
                        </span>
                      ))}
                    </h1>
                  </div>

                  <p className="ce-intro__body wt-page-body">
                    {contact.heroSupport.trim() || CONTACT_PAGE.hero.subtitle}
                  </p>
                </div>

                <p className="ce-intro__mark">
                  Hathor Cruise <span className="ce-reg">®</span> 2026
                </p>
                <p className="ce-intro__scroll">
                  <i />
                  {t.scroll}
                </p>
              </Scene>

              {/* 02 — Image lead: hero with an overlapping second frame */}
              <Scene className="ce-lead">
                <ContactMedia
                  slot="contact-hero"
                  alt={t.alts.hero}
                  priority
                  className="ce-lead__main"
                  ratio="1279 / 960"
                />
                <FlipImage
                  className="ce-lead__inset"
                  axis="left"
                  ratio="835 / 557"
                  front="about-hero"
                  back="room-royal"
                  frontAlt={t.alts.boat}
                  backAlt={t.alts.royal}
                />
                <p className="ce-lead__caption">
                  <span>{t.aboard}</span> {t.route}
                </p>
              </Scene>

              {/* 03 — Manifesto: narrow meta column against a large lyrical statement */}
              <Scene className="ce-manifesto">
                <div className="ce-manifesto__aside">
                  <Eyebrow>{t.manifestoEyebrow}</Eyebrow>
                </div>
                <div className="ce-manifesto__headline" data-anima-title>
                  <h2 className="ce-edit ce-edit--xl">
                    <span className="ce-line">
                      <AnimaSplitLine line={0}>{t.manifesto[0]}</AnimaSplitLine>
                    </span>
                    <span className="ce-line">
                      <AnimaSplitLine line={1}>{t.manifesto[1]}</AnimaSplitLine>
                    </span>
                    <span className="ce-line ce-line--indent">
                      <AnimaSplitLine line={2}>{t.manifesto[2]}</AnimaSplitLine>
                    </span>
                  </h2>
                </div>
              </Scene>

              {/* 04 — Ledger: numbered channels, display word + detail */}
              <Scene className="ce-ledger" id="channels">
                <div className="ce-ledger__head">
                  <Eyebrow>{t.reachEyebrow}</Eyebrow>
                  <p className="ce-meta-copy">{t.reachIntro}</p>
                </div>

                <ol className="ce-ledger__list">
                  {CHANNELS.map((channel, index) => {
                    const isExternal = "external" in channel;
                    const words = t.channels[index];
                    const cta = words.cta ?? null;
                    const value = channel.value ?? words.value ?? t.address;

                    return (
                      <li key={channel.number} className="ce-row">
                        <span className="ce-row__num">{channel.number}</span>

                        <h3 className="ce-row__word ce-display">
                          {words.word}
                        </h3>

                        <div className="ce-row__detail">
                          <p className="ce-row__label">
                            {words.meta} · {words.label}
                          </p>
                          {channel.href ? (
                            <a
                              className="ce-row__value ce-link"
                              href={channel.href}
                              target={isExternal ? "_blank" : undefined}
                              rel={isExternal ? "noopener noreferrer" : undefined}
                            >
                              {value}
                            </a>
                          ) : (
                            <p className="ce-row__value">{value}</p>
                          )}
                        </div>

                        {channel.href && cta ? (
                          <a
                            className="ce-btn"
                            href={channel.href}
                            target={isExternal ? "_blank" : undefined}
                            rel={isExternal ? "noopener noreferrer" : undefined}
                          >
                            <span>{cta}</span>
                          </a>
                        ) : (
                          <span className="ce-row__spacer" aria-hidden="true" />
                        )}
                      </li>
                    );
                  })}
                </ol>
              </Scene>

              {/* 05 — Hours, set as a museum wall label */}
              <Scene className="ce-hours" id="hours">
                <div className="ce-hours__frame">
                  <span className="ce-hours__corner ce-hours__corner--tl">
                    {t.hoursLabel}
                  </span>
                  <span className="ce-hours__corner ce-hours__corner--tr">
                    {t.hoursZone}
                  </span>

                  <p className="ce-hours__times">
                    <span>09</span>
                    <i />
                    <span>17</span>
                  </p>

                  <span className="ce-hours__corner ce-hours__corner--bl">
                    {t.workingHours}
                  </span>
                  <span className="ce-hours__corner ce-hours__corner--br">
                    {t.dayOff}
                  </span>
                </div>
              </Scene>

              {/* 06 — Closing frame */}
              <Scene className="ce-closing">
                <FlipImage
                  className="ce-closing__media"
                  axis="up"
                  ratio="1483 / 960"
                  front="home-voyage-nile-majesty"
                  back="home-split-courtyard"
                  frontAlt={t.alts.sailing}
                  backAlt={t.alts.life}
                />
                <div className="ce-closing__copy">
                  <Eyebrow>{t.nextEyebrow}</Eyebrow>
                  <p className="ce-display ce-display--l">{t.nextTitle}</p>
                </div>
              </Scene>
            </div>
          </div>
        </section>

        {/* Epilogue — always vertical */}
        <section className="ce-epilogue" id="write">
          <header className="ce-epilogue__head">
            <Eyebrow>{t.writeEyebrow}</Eyebrow>
            <h2 className="ce-display ce-display--l" data-anima-title>
              {formTitle}
            </h2>
          </header>

          <div className="ce-epilogue__board">
            <div className="ce-epilogue__compose">
              <InquiryForm
                type="contact"
                title={t.composeTitle}
                intro={contact.formIntro}
                submitLabel={t.submit}
                className="ce-form"
                submitClassName="ce-btn ce-btn--xl"
              />
            </div>

            <aside className="ce-epilogue__card">
              <span className="ce-card__tag">{t.cardTag}</span>
              <ContactMedia
                slot="contact-hero"
                alt={t.alts.card}
                className="ce-card__media"
                ratio="356 / 460"
              />
              <h3 className="ce-display">{t.cardTitle}</h3>
              <p className="ce-card__body">
                {t.cardOffice}
                <br />
                <a className="ce-link" href={`mailto:${PUBLIC_CONTACT.email}`}>
                  {PUBLIC_CONTACT.email}
                </a>
              </p>
              <div className="ce-card__pills">
                <a className="ce-btn" href={`tel:${PUBLIC_CONTACT.phone}`}>
                  <span>{t.call}</span>
                </a>
                <a
                  className="ce-btn"
                  href={PUBLIC_CONTACT.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>WhatsApp</span>
                </a>
                <BookNowTrigger className="ce-btn ce-btn--solid">
                  <span>{t.bookNow}</span>
                </BookNowTrigger>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}
