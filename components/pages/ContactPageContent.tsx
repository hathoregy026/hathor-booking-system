"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useRef,
  type ComponentPropsWithoutRef,
} from "react";
import { InquiryForm } from "@/components/pages/InquiryForm";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { AnimaSplitLine } from "@/components/public/AnimaSplitLine";
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

function FlipImage({
  front,
  back,
  frontAlt,
  backAlt = "",
  className = "",
  axis = "left",
}: {
  front: string;
  back: string;
  frontAlt: string;
  backAlt?: string;
  className?: string;
  axis?: "up" | "left" | "right";
}) {
  return (
    <div className={`ce-flip ce-flip--${axis} ${className}`} data-ce-flip>
      <ContactMedia slot={front} alt={frontAlt} className="ce-flip__base" />
      <ContactMedia slot={back} alt={backAlt} className="ce-flip__overlay" />
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

const CHANNELS = [
  {
    number: "01",
    label: "Company Address",
    value: PUBLIC_CONTACT.address,
    href: null,
    meta: "Cairo office",
  },
  {
    number: "02",
    label: "Call Us Hotline",
    value: PUBLIC_CONTACT.phoneDisplay,
    href: `tel:${PUBLIC_CONTACT.phone}`,
    meta: "Direct line",
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
        <section ref={runRef} className="ce-run" aria-label="Contact Hathor reservations">
          <div className="ce-stage">
            <div ref={trackRef} className="ce-track">
              <Scene className="ce-intro">
                <div className="ce-intro__inner">
                  <nav className="ce-intro__menu" aria-label="Contact page sections">
                    <a href="#write">Write</a>
                    <a href="#channels">Reach</a>
                    <a href="#hours">Hours</a>
                    <Link href="/suites">Suites</Link>
                  </nav>
                  <p className="ce-marker">Contact</p>
                  <p className="ce-copyright">Hathor Cruise ©2026</p>

                  <div className="ce-intro__title" id="contact" data-anima-title>
                    <h1 className="ce-intro__title-part ce-intro__title-part--one">
                      <AnimaSplitLine line={0}>We would</AnimaSplitLine>
                      <br />
                      <AnimaSplitLine line={1}>love to</AnimaSplitLine>
                    </h1>
                    <h1 className="ce-intro__title-part ce-intro__title-part--two">
                      <AnimaSplitLine line={2}>hear</AnimaSplitLine>
                      <br />
                      <AnimaSplitLine line={3}>from you</AnimaSplitLine>
                    </h1>
                    <h1 className="ce-intro__title-part ce-intro__title-part--three">
                      <AnimaSplitLine line={4}>on the</AnimaSplitLine>
                      <br />
                      <AnimaSplitLine line={5}>Nile</AnimaSplitLine>
                    </h1>
                  </div>

                  <p className="ce-intro__body">{CONTACT_PAGE.hero.subtitle}</p>
                  <div className="ce-intro__wordmark" aria-label="Hathor Nile correspondence">
                    <span>HATHOR</span>
                    <em>Nile</em>
                    <strong>correspondence</strong>
                  </div>
                </div>
              </Scene>

              <Scene className="ce-image-lead">
                <ContactMedia
                  slot="contact-hero"
                  alt="Hathor reservations and Nile voyage"
                  priority
                  className="ce-image-lead__main"
                />
                <FlipImage
                  className="ce-image-lead__flip"
                  axis="left"
                  front="about-hero"
                  back="room-royal"
                  frontAlt="Hathor Dahabiya on the Nile"
                  backAlt="Royal suite aboard Hathor Dahabiya"
                />
              </Scene>

              <Scene className="ce-manifesto">
                <p className="ce-marker">A line open</p>
                <div className="ce-manifesto__headline ce-big-title" data-anima-title>
                  <AnimaSplitLine line={0}>A private line</AnimaSplitLine>
                  <AnimaSplitLine line={1}>that invites you</AnimaSplitLine>
                  <AnimaSplitLine line={2}>to begin</AnimaSplitLine>
                  <AnimaSplitLine line={3}>the Nile</AnimaSplitLine>
                </div>
                <p className="ce-manifesto__body">{formIntro}</p>
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

              <Scene className="ce-ledger" id="channels">
                <div className="ce-ledger__title">
                  <p className="ce-marker">Reach us</p>
                  <h2 data-anima-title>
                    <span>
                      <AnimaSplitLine line={0}>A quiet</AnimaSplitLine>
                    </span>
                    <span>
                      <AnimaSplitLine line={1}>line to</AnimaSplitLine>
                    </span>
                    <span>
                      <AnimaSplitLine line={2}>Hathor</AnimaSplitLine>
                    </span>
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
                          {channel.href ? (
                            <a
                              className="ce-ledger__value"
                              href={channel.href}
                              target={"external" in channel ? "_blank" : undefined}
                              rel={
                                "external" in channel
                                  ? "noopener noreferrer"
                                  : undefined
                              }
                            >
                              {channel.value}
                            </a>
                          ) : (
                            <p className="ce-ledger__value">{channel.value}</p>
                          )}
                        </div>
                        {action}
                      </li>
                    );
                  })}
                </ol>
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

              <Scene className="ce-closing">
                <FlipImage
                  className="ce-closing__media"
                  axis="up"
                  front="home-voyage-nile-majesty"
                  back="home-split-courtyard"
                  frontAlt="Sailing the Nile aboard Hathor"
                  backAlt="Life aboard Hathor Dahabiya"
                />
              </Scene>
            </div>
          </div>
        </section>

        <section className="ce-epilogue" id="write">
          <header className="ce-epilogue__title">
            <span>(Write)</span>
            <h2 data-anima-title>{formTitle.toUpperCase()}</h2>
          </header>

          <div className="ce-epilogue__form-wrap">
            <p className="ce-epilogue__form-lead">{formIntro}</p>
            <InquiryForm
              type="contact"
              title="Your message"
              intro="Share dates, guests, and how you wish to sail. Our reservations team replies within 24 hours."
              submitLabel="Send Request"
              className="ce-form"
              submitClassName="btn btn-dark"
            />
          </div>

          <div className="ce-epilogue__pills">
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

          <div className="ce-epilogue__feature">
            <div className="ce-epilogue__monogram" aria-hidden="true">
              HATHOR
            </div>
            <span>(RESERVATIONS)</span>
            <ContactMedia slot="contact-hero" alt="Hathor Dahabiya on the Nile" />
            <h3>CORRESPONDENCE</h3>
            <p>
              Cairo office · daily 09:00–17:00
              <br />
              {PUBLIC_CONTACT.email}
            </p>
          </div>

          <div className="ce-epilogue__legal">
            <span>HATHOR CRUISE ©2026</span>
            <Link href="/contact">PRIVACY</Link>
            <Link href="/contact">COOKIES</Link>
            <Link href="/contact">LEGAL</Link>
          </div>
        </section>
      </main>
    </div>
  );
}
