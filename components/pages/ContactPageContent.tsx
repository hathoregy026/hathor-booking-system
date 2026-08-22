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
import { useContactEditorialScroll } from "@/hooks/useContactEditorialScroll";
import { CONTACT_PAGE } from "@/lib/page-content";
import { PUBLIC_CONTACT } from "@/lib/public-contact";
import { SITE_IMAGE_QUALITY } from "@/lib/site-image-quality";
import { originSrcForNextImage } from "@/lib/local-optimized-site-images";

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

/** Parenthesised eyebrow — the reference's signature label form. */
function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="ce-eyebrow">({children})</p>;
}

const CHANNELS = [
  {
    number: "01",
    word: "Visit",
    label: "Company Address",
    value: PUBLIC_CONTACT.address,
    href: null,
    meta: "Cairo office",
  },
  {
    number: "02",
    word: "Call",
    label: "Call Us Hotline",
    value: PUBLIC_CONTACT.phoneDisplay,
    href: `tel:${PUBLIC_CONTACT.phone}`,
    meta: "Direct line",
    cta: "Call Now",
  },
  {
    number: "03",
    word: "Write",
    label: "Email",
    value: PUBLIC_CONTACT.email,
    href: `mailto:${PUBLIC_CONTACT.email}`,
    meta: "Reservations",
    cta: "Email Us",
  },
  {
    number: "04",
    word: "Message",
    label: "WhatsApp",
    value: "Message us on WhatsApp",
    href: PUBLIC_CONTACT.whatsappUrl,
    meta: "Instant",
    cta: "WhatsApp",
    external: true,
  },
] as const;

export function ContactPageContent() {
  const rootRef = useRef<HTMLDivElement>(null);
  const runRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const { pages } = useWebsiteText();
  const contact = pages.contact;
  useContactEditorialScroll({ rootRef, runRef, trackRef });

  const formTitle = contact.formTitle.trim() || CONTACT_PAGE.form.title;
  const formIntro = contact.formIntro.trim() || CONTACT_PAGE.form.intro;

  return (
    <div ref={rootRef} className="contact-editorial">
      <div className="ce-progress" aria-hidden="true">
        <i data-ce-progress />
      </div>

      <main>
        <section
          ref={runRef}
          className="ce-run"
          aria-label="Contact Hathor reservations"
        >
          <div className="ce-stage">
            <div ref={trackRef} className="ce-track">
              {/* 01 — Intro panel */}
              <Scene className="ce-intro">
                <nav className="ce-intro__nav" aria-label="Contact page sections">
                  <a href="#write">Write</a>
                  <a href="#channels">Reach</a>
                  <a href="#hours">Hours</a>
                  <Link href="/cruises">Cruises</Link>
                </nav>

                <div className="ce-intro__inner">
                  <Eyebrow>Contact</Eyebrow>

                  <div className="ce-intro__title" id="contact" data-anima-title>
                    <h1 className="ce-display ce-display--xl">
                      <span className="ce-line ce-line--a">
                        <AnimaSplitLine line={0}>We would love</AnimaSplitLine>
                      </span>
                      <span className="ce-line ce-line--b">
                        <AnimaSplitLine line={1}>to hear</AnimaSplitLine>
                      </span>
                      <span className="ce-line ce-line--c">
                        <AnimaSplitLine line={2}>from you</AnimaSplitLine>
                      </span>
                    </h1>
                  </div>

                  <p className="ce-intro__body">{CONTACT_PAGE.hero.subtitle}</p>
                </div>

                <p className="ce-intro__mark">
                  Hathor Cruise <span className="ce-reg">®</span> 2026
                </p>
                <p className="ce-intro__scroll">
                  <i />
                  Scroll
                </p>
              </Scene>

              {/* 02 — Image lead: hero with an overlapping second frame */}
              <Scene className="ce-lead">
                <ContactMedia
                  slot="contact-hero"
                  alt="Hathor reservations and Nile voyage"
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
                  frontAlt="Hathor Dahabiya on the Nile"
                  backAlt="Royal suite aboard Hathor Dahabiya"
                />
                <p className="ce-lead__caption">
                  <span>(Aboard)</span> Luxor — Aswan
                </p>
              </Scene>

              {/* 03 — Manifesto: narrow meta column against a large lyrical statement */}
              <Scene className="ce-manifesto">
                <div className="ce-manifesto__aside">
                  <Eyebrow>A line open</Eyebrow>
                  <p className="ce-meta-copy">{formIntro}</p>
                </div>
                <div className="ce-manifesto__headline" data-anima-title>
                  <h2 className="ce-edit ce-edit--xl">
                    <span className="ce-line">
                      <AnimaSplitLine line={0}>A private line</AnimaSplitLine>
                    </span>
                    <span className="ce-line">
                      <AnimaSplitLine line={1}>that invites you</AnimaSplitLine>
                    </span>
                    <span className="ce-line ce-line--indent">
                      <AnimaSplitLine line={2}>to begin the Nile</AnimaSplitLine>
                    </span>
                  </h2>
                </div>
              </Scene>

              {/* 04 — Ledger: numbered channels, display word + detail */}
              <Scene className="ce-ledger" id="channels">
                <div className="ce-ledger__head">
                  <Eyebrow>Reach us</Eyebrow>
                  <p className="ce-meta-copy">
                    Four ways to begin a conversation with our reservations desk
                    in Cairo.
                  </p>
                </div>

                <ol className="ce-ledger__list">
                  {CHANNELS.map((channel) => {
                    const isExternal = "external" in channel;
                    const cta = "cta" in channel ? channel.cta : null;

                    return (
                      <li key={channel.number} className="ce-row">
                        <span className="ce-row__num">{channel.number}</span>

                        <h3 className="ce-row__word ce-display">
                          {channel.word}
                        </h3>

                        <div className="ce-row__detail">
                          <p className="ce-row__label">
                            {channel.meta} · {channel.label}
                          </p>
                          {channel.href ? (
                            <a
                              className="ce-row__value ce-link"
                              href={channel.href}
                              target={isExternal ? "_blank" : undefined}
                              rel={isExternal ? "noopener noreferrer" : undefined}
                            >
                              {channel.value}
                            </a>
                          ) : (
                            <p className="ce-row__value">{channel.value}</p>
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
                    (Working hours)
                  </span>
                  <span className="ce-hours__corner ce-hours__corner--tr">
                    Cairo · EET
                  </span>

                  <p className="ce-hours__times">
                    <span>09</span>
                    <i />
                    <span>17</span>
                  </p>

                  <span className="ce-hours__corner ce-hours__corner--bl">
                    {PUBLIC_CONTACT.workingHours}
                  </span>
                  <span className="ce-hours__corner ce-hours__corner--br">
                    {PUBLIC_CONTACT.dayOff}
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
                  frontAlt="Sailing the Nile aboard Hathor"
                  backAlt="Life aboard Hathor Dahabiya"
                />
                <div className="ce-closing__copy">
                  <Eyebrow>Next</Eyebrow>
                  <p className="ce-display ce-display--l">Write to us</p>
                </div>
              </Scene>
            </div>
          </div>
        </section>

        {/* Epilogue — always vertical */}
        <section className="ce-epilogue" id="write">
          <header className="ce-epilogue__head">
            <Eyebrow>Write</Eyebrow>
            <h2 className="ce-display ce-display--l" data-anima-title>
              {formTitle}
            </h2>
          </header>

          <div className="ce-epilogue__board">
            <div className="ce-epilogue__compose">
              <p className="ce-epilogue__lead ce-edit">{formIntro}</p>
              <InquiryForm
                type="contact"
                title="Your message"
                intro="Share dates, guests, and how you wish to sail. Our reservations team replies within 24 hours."
                submitLabel="Send Request"
                className="ce-form"
                submitClassName="ce-btn ce-btn--xl"
              />
            </div>

            <aside className="ce-epilogue__card">
              <span className="ce-card__tag">(Reservations)</span>
              <ContactMedia
                slot="contact-hero"
                alt="Hathor Dahabiya on the Nile"
                className="ce-card__media"
                ratio="356 / 460"
              />
              <h3 className="ce-display">Correspondence</h3>
              <p className="ce-card__body">
                Cairo office · daily 09:00–17:00
                <br />
                <a className="ce-link" href={`mailto:${PUBLIC_CONTACT.email}`}>
                  {PUBLIC_CONTACT.email}
                </a>
              </p>
              <div className="ce-card__pills">
                <a className="ce-btn" href={`tel:${PUBLIC_CONTACT.phone}`}>
                  <span>Call</span>
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
                  Book Now
                </BookNowTrigger>
              </div>
            </aside>
          </div>

          <div className="ce-epilogue__legal">
            <span>
              Hathor Cruise <span className="ce-reg">®</span> 2026
            </span>
            <nav aria-label="Legal">
              <Link href="/contact">Privacy</Link>
              <Link href="/contact">Cookies</Link>
              <Link href="/contact">Legal</Link>
            </nav>
          </div>
        </section>
      </main>
    </div>
  );
}
