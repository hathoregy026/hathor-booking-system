"use client";

import Image from "next/image";
import { useRef } from "react";
import { InquiryForm } from "@/components/pages/InquiryForm";
import { PageScrollTransition } from "@/components/pages/PageScrollTransition";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { useSiteImage } from "@/components/public/SiteImagesProvider";
import { useWebsiteText } from "@/components/public/WebsiteTextProvider";
import { useHathorLuxBodyMotion } from "@/hooks/useHathorLuxBodyMotion";
import { CONTACT_PAGE } from "@/lib/page-content";
import { PUBLIC_CONTACT } from "@/lib/public-contact";

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

function ContactPortrait({ slot, alt }: { slot: string; alt: string }) {
  const image = useSiteImage(slot);
  return (
    <figure className="contact-page__portrait">
      <Image
        src={image.src}
        alt={alt || image.alt}
        fill
        sizes="(max-width: 1024px) 100vw, 42vw"
        className="contact-page__portrait-image"
      />
    </figure>
  );
}

export function ContactPageContent() {
  const rootRef = useRef<HTMLDivElement>(null);
  useHathorLuxBodyMotion(rootRef);

  const { pages } = useWebsiteText();
  const contact = pages.contact;
  const formTitle = contact.formTitle.trim() || CONTACT_PAGE.form.title;
  const formIntro = contact.formIntro.trim() || CONTACT_PAGE.form.intro;

  return (
    <PageScrollTransition
      title={CONTACT_PAGE.hero.title}
      subtitle={CONTACT_PAGE.hero.subtitle}
      breadcrumb="Contact"
      imageName="contact-hero"
      heroPage="contact"
    >
      <div ref={rootRef} className="contact-page">
        <section className="contact-page__intro" aria-labelledby="contact-intro-title">
          <div className="contact-page__container">
            <p className="contact-page__marker" data-lux-reveal>
              Hathor reservations
            </p>
            <h2 id="contact-intro-title" className="contact-page__display" data-lux-title>
              {formTitle}
            </h2>
            <p className="contact-page__lead" data-lux-reveal>
              {formIntro}
            </p>
          </div>
        </section>

        <section className="contact-page__channels" aria-labelledby="contact-channels-title">
          <div className="contact-page__container">
            <p className="contact-page__marker" data-lux-reveal>
              Reach us
            </p>
            <h2 id="contact-channels-title" className="contact-page__section-title" data-lux-title>
              A quiet line to Hathor
            </h2>
            <ul className="contact-page__channel-list">
              {CHANNELS.map((channel) => (
                <li key={channel.number} className="contact-page__channel" data-lux-reveal>
                  <span className="contact-page__channel-num">{channel.number}</span>
                  <div className="contact-page__channel-copy">
                    <p className="contact-page__channel-meta">
                      {channel.meta} · {channel.label}
                    </p>
                    {channel.href ? (
                      <a
                        className="contact-page__channel-value"
                        href={channel.href}
                        target={"external" in channel ? "_blank" : undefined}
                        rel={
                          "external" in channel ? "noopener noreferrer" : undefined
                        }
                      >
                        {channel.value}
                      </a>
                    ) : (
                      <p className="contact-page__channel-value">{channel.value}</p>
                    )}
                  </div>
                  {channel.href && "cta" in channel ? (
                    <a
                      className="btn btn-dark contact-page__channel-btn"
                      href={channel.href}
                      target={"external" in channel ? "_blank" : undefined}
                      rel={
                        "external" in channel ? "noopener noreferrer" : undefined
                      }
                    >
                      {channel.cta}
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="contact-page__hours" aria-label={PUBLIC_CONTACT.workingHours}>
          <div className="contact-page__container contact-page__hours-inner">
            <div data-lux-reveal>
              <p className="contact-page__marker">Working hours</p>
              <p className="contact-page__hours-range">09:00 — 17:00</p>
              <p className="contact-page__hours-copy">{PUBLIC_CONTACT.workingHours}</p>
              <p className="contact-page__hours-copy">{PUBLIC_CONTACT.dayOff}</p>
            </div>
          </div>
        </section>

        <section className="contact-page__write" id="write" aria-labelledby="contact-write-title">
          <div className="contact-page__container">
            <p className="contact-page__marker" data-lux-reveal>
              Write to us
            </p>
            <h2 id="contact-write-title" className="contact-page__section-title" data-lux-title>
              Send your request
            </h2>
            <p className="contact-page__lead contact-page__lead--write" data-lux-reveal>
              Share dates, guests, and how you wish to sail. Our reservations team replies
              within 24 hours.
            </p>

            <div className="contact-page__write-grid">
              <ContactPortrait
                slot="room-royal"
                alt="Royal suite aboard Hathor Dahabiya on the Nile"
              />
              <InquiryForm
                type="contact"
                title="Your message"
                intro=""
                submitLabel="Send Request"
                className="contact-page__form"
                submitClassName="btn btn-dark"
              />
            </div>

            <div className="contact-page__actions" data-lux-reveal>
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
          </div>
        </section>
      </div>
    </PageScrollTransition>
  );
}
