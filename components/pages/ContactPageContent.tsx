"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useRef,
  type ComponentPropsWithoutRef,
  type CSSProperties,
} from "react";
import { Footer } from "@/components/layout/Footer";
import { InquiryForm } from "@/components/pages/InquiryForm";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { useSiteImage } from "@/components/public/SiteImagesProvider";
import { useWebsiteText } from "@/components/public/WebsiteTextProvider";
import { useContactEditorialScroll } from "@/hooks/useContactEditorialScroll";
import { CONTACT_PAGE } from "@/lib/page-content";
import { PUBLIC_CONTACT } from "@/lib/public-contact";

function ContactMedia({
  slot,
  alt,
  priority = false,
  className = "",
}: {
  slot: string;
  alt: string;
  priority?: boolean;
  className?: string;
}) {
  const image = useSiteImage(slot);
  return (
    <figure className={`ce-media ${className}`}>
      <Image
        src={image.src}
        alt={alt || image.alt}
        fill
        priority={priority}
        sizes="(max-width: 1024px) 100vw, 70vw"
        className="ce-media__image"
      />
    </figure>
  );
}

function SplitWords({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) {
  const words = children.split(/\s+/).filter(Boolean);
  return (
    <span className={`ce-split ${className}`} aria-label={children}>
      {words.map((word, index) => (
        <span
          key={`${word}-${index}`}
          aria-hidden="true"
          className="ce-split__word"
          style={{ "--i": index } as CSSProperties}
        >
          {word}
        </span>
      ))}
    </span>
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

const CHANNELS = [
  {
    number: "01",
    label: "Company Address",
    value: PUBLIC_CONTACT.address,
    href: null,
    meta: "Cairo",
  },
  {
    number: "02",
    label: "Call Us Hotline",
    value: PUBLIC_CONTACT.phoneDisplay,
    href: `tel:${PUBLIC_CONTACT.phone}`,
    meta: "Direct",
    cta: "Call Now",
  },
  {
    number: "03",
    label: "Email",
    value: PUBLIC_CONTACT.email,
    href: `mailto:${PUBLIC_CONTACT.email}`,
    meta: "Reservations",
    cta: "Write",
  },
  {
    number: "04",
    label: "WhatsApp",
    value: "Message us on WhatsApp",
    href: PUBLIC_CONTACT.whatsappUrl,
    meta: "Instant",
    cta: "WhatsApp",
    external: true,
  },
] as const;

export function ContactPageContent() {
  const { pages } = useWebsiteText();
  const contact = pages.contact;
  const rootRef = useRef<HTMLDivElement>(null);
  const runRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  useContactEditorialScroll({ rootRef, runRef, trackRef });

  const formTitle = contact.formTitle.trim() || CONTACT_PAGE.form.title;
  const formIntro = contact.formIntro.trim() || CONTACT_PAGE.form.intro;

  return (
    <>
    <div ref={rootRef} className="contact-editorial">
      <div className="ce-progress" aria-hidden="true">
        <i data-ce-progress />
      </div>

      <main>
        <section ref={runRef} className="ce-run" aria-label="Contact Hathor reservations">
          <div className="ce-stage">
            <div ref={trackRef} className="ce-track">
              <Scene className="ce-intro">
                <div className="ce-intro__inner">
                  <nav className="ce-intro__menu" aria-label="Contact page sections">
                    <a href="#write">Write</a>
                    <a href={`tel:${PUBLIC_CONTACT.phone}`}>Call</a>
                    <Link href="/suites">Suites</Link>
                    <Link href="/cruises">Cruises</Link>
                  </nav>
                  <p className="ce-marker">Contact</p>
                  <p className="ce-copyright">Hathor Dahabiya ©2026</p>

                  <h1 className="ce-intro__title">
                    <span className="ce-intro__line ce-intro__line--one">
                      <SplitWords>We would</SplitWords>
                    </span>
                    <span className="ce-intro__line ce-intro__line--two">
                      <SplitWords>love to hear</SplitWords>
                    </span>
                    <span className="ce-intro__line ce-intro__line--three">
                      <SplitWords>from you</SplitWords>
                    </span>
                    <span className="ce-intro__script">reservations</span>
                  </h1>

                  <p className="ce-intro__body">{CONTACT_PAGE.hero.subtitle}</p>
                  <div className="ce-intro__wordmark" aria-label="Hathor Nile correspondence">
                    <span>HATHOR</span>
                    <em>Nile</em>
                    <strong>correspondence</strong>
                  </div>
                </div>
              </Scene>

              <Scene className="ce-dispatch">
                <ContactMedia
                  slot="contact-hero"
                  alt="Hathor reservations and Nile voyage"
                  priority
                  className="ce-dispatch__hero"
                />
                <div className="ce-flip ce-dispatch__flip">
                  <ContactMedia slot="about-hero" alt="Hathor Dahabiya on the Nile" />
                  <ContactMedia
                    slot="home-voyage-nile-majesty"
                    alt="Sailing the Nile aboard Hathor"
                  />
                </div>
              </Scene>

              <Scene className="ce-manifesto">
                <p className="ce-marker">A line open</p>
                <div className="ce-manifesto__headline">
                  <SplitWords>A private line</SplitWords>
                  <SplitWords>that invites you</SplitWords>
                  <SplitWords>to begin</SplitWords>
                  <SplitWords>the Nile</SplitWords>
                </div>
                <p className="ce-manifesto__body">{formIntro}</p>
              </Scene>

              <Scene className="ce-atelier">
                <div className="ce-flip ce-atelier__left">
                  <ContactMedia slot="room-royal" alt="Royal suite calm aboard Hathor" />
                  <ContactMedia slot="room-suite" alt="Suite interiors aboard Hathor" />
                </div>
                <div className="ce-flip ce-atelier__right">
                  <ContactMedia
                    slot="home-call-to-action"
                    alt="Golden hour on the Nile"
                  />
                  <ContactMedia
                    slot="home-story-craft-large"
                    alt="Handcrafted detail aboard Hathor"
                  />
                </div>
                <article className="ce-letter">
                  <p className="ce-letter__kicker">Cairo atelier</p>
                  <h2>Company Address</h2>
                  <p>{PUBLIC_CONTACT.address}</p>
                </article>
              </Scene>

              <Scene className="ce-marquee" aria-label="Correspondence">
                <div className="ce-marquee__rail">
                  {[0, 1, 2].map((item) => (
                    <span key={item}>
                      CORRESPONDENCE <b>✦</b>
                    </span>
                  ))}
                </div>
              </Scene>

              <Scene className="ce-hours" id="hours">
                <p className="ce-marker">Working hours</p>
                <div className="ce-hours__times" aria-label={PUBLIC_CONTACT.workingHours}>
                  <span>09:00</span>
                  <i />
                  <span>17:00</span>
                </div>
                <p className="ce-hours__note">{PUBLIC_CONTACT.workingHours}</p>
                <p className="ce-hours__rest">{PUBLIC_CONTACT.dayOff}</p>
              </Scene>

              <Scene className="ce-ledger" id="channels">
                <div className="ce-ledger__title">
                  <p className="ce-marker">Reach us</p>
                  <h2>
                    <SplitWords>A quiet</SplitWords>
                    <SplitWords>line to</SplitWords>
                    <SplitWords>Hathor</SplitWords>
                  </h2>
                </div>
                <ol className="ce-ledger__list">
                  {CHANNELS.map((channel) => {
                    const action =
                      channel.href && "cta" in channel ? (
                        <a
                          className="btn btn-dark"
                          href={channel.href}
                          target={"external" in channel ? "_blank" : undefined}
                          rel={
                            "external" in channel
                              ? "noopener noreferrer"
                              : undefined
                          }
                        >
                          {channel.cta}
                        </a>
                      ) : null;

                    return (
                      <li key={channel.number} className="ce-ledger__row">
                        <span className="ce-ledger__num">{channel.number}</span>
                        <div className="ce-ledger__copy">
                          <p className="ce-ledger__label">
                            {channel.meta} · {channel.label}
                          </p>
                          <p className="ce-ledger__value">{channel.value}</p>
                        </div>
                        {action}
                      </li>
                    );
                  })}
                </ol>
              </Scene>
            </div>
          </div>
        </section>

        <section className="ce-salon" id="write">
          <header className="ce-salon__header">
            <p className="ce-marker">(Write)</p>
            <h2>{formTitle}</h2>
            <p className="ce-salon__intro">{formIntro}</p>
          </header>

          <div className="ce-salon__stage">
            <div className="ce-salon__media">
              <ContactMedia
                slot="cruises-hero"
                alt="Hathor Dahabiya waiting on the Nile"
              />
              <ContactMedia
                slot="home-split-courtyard"
                alt="Life aboard Hathor"
              />
            </div>

            <InquiryForm
              type="contact"
              title="Your message"
              intro="Share dates, guests, and how you wish to sail. Our reservations team replies within 24 hours."
              submitLabel="Send Request"
              className="ce-form"
              submitClassName="btn btn-dark"
            />
          </div>

          <div className="ce-salon__actions">
            <a className="btn btn-dark" href={`tel:${PUBLIC_CONTACT.phone}`}>
              Call Now
            </a>
            <a
              className="btn btn-dark"
              href={PUBLIC_CONTACT.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>
            <BookNowTrigger className="btn btn-dark">Book Now</BookNowTrigger>
          </div>
        </section>
      </main>
    </div>
    <Footer />
    </>
  );
}
