"use client";

import Link from "next/link";
import {
  useRef,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { HathorLogoTuner } from "@/components/public/HathorLogoTuner";
import { useWebsiteText } from "@/components/public/WebsiteTextProvider";
import { PublicSiteHero } from "@/components/pages/PublicSiteHero";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { useHome2EditorialFlow } from "@/hooks/useHome2EditorialFlow";
import { EX_GALLERY, EX_HERO } from "@/lib/ex-page-content";
import type { HathorLogoPartsVariant } from "@/lib/hathor-logo-letters";
import {
  HOMEPAGE_ITINERARIES,
  HOMEPAGE_LIFESTYLE,
} from "@/lib/homepage-content";
import type { SiteImageName } from "@/lib/site-image-slots";

const VOYAGE_IMAGES: SiteImageName[] = [
  "home-voyage-3n-aswan-luxor",
  "home-voyage-4n-luxor-aswan",
  "home-voyage-7n-roundtrip",
];

function Media({
  name,
  alt,
  className = "",
  ratio,
}: {
  name: SiteImageName;
  alt: string;
  className?: string;
  ratio?: string;
}) {
  return (
    <figure
      className={`h2-media ${className}`}
      style={
        ratio ? ({ ["--h2-ratio" as string]: ratio } as CSSProperties) : undefined
      }
    >
      <ManagedImage
        name={name}
        alt={alt}
        fill
        sizes="(max-width: 950px) 100vw, 60vw"
        className="h2-media__image"
      />
    </figure>
  );
}

function Scene({
  children,
  className = "",
  ...props
}: {
  children: ReactNode;
  className?: string;
} & ComponentPropsWithoutRef<"section">) {
  return (
    <section className={`h2-scene ${className}`} {...props}>
      {children}
    </section>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="h2-eyebrow">({children})</p>;
}

type Home2PageContentProps = {
  logoPartsVariant?: HathorLogoPartsVariant;
  mobileLogoPartsVariant?: HathorLogoPartsVariant;
};

export function Home2PageContent({
  logoPartsVariant,
  mobileLogoPartsVariant,
}: Home2PageContentProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const runRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const websiteText = useWebsiteText();
  const home = websiteText.home;
  const aboutLines = home.about.heading
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const lifestyle = home.textBlocks[0];
  const dining = home.textBlocks[1];

  useHome2EditorialFlow({ rootRef, runRef, trackRef });

  return (
    <div ref={rootRef} className="home2-editorial ex-root" data-hathor-logo-tuned="">
      <HathorLogoTuner />
      <div className="h2-progress" aria-hidden="true">
        <i data-h2-progress />
      </div>

      <section ref={runRef} className="h2-run" aria-label="Home 2 editorial journey">
        <div className="h2-stage">
          <div ref={trackRef} className="h2-track">
            <Scene className="h2-hero" aria-label="Hathor Dahabiya hero">
              <div className="home-hero-runway">
                <PublicSiteHero
                  animate={false}
                  splitLetterLogo
                  playVideo
                  lineRight={EX_HERO.lineRight}
                  lineLeft={EX_HERO.lineLeft}
                  heroPage="home"
                  posterImageName={EX_HERO.imageName}
                  logoPartsVariant={logoPartsVariant}
                  mobileLogoPartsVariant={mobileLogoPartsVariant}
                />
              </div>
            </Scene>

            <Scene className="h2-arrival" id="home2-about">
              <div className="h2-arrival__copy">
                <Eyebrow>{home.about.eyebrow}</Eyebrow>
                <h2 className="h2-display h2-display--xl">
                  {aboutLines.map((line) => (
                    <span className="h2-line" key={line}>
                      <span>{line}</span>
                    </span>
                  ))}
                </h2>
                <p className="h2-body">{home.about.body}</p>
                <Link href="/about" className="h2-btn">
                  <span>{home.about.cta}</span>
                </Link>
              </div>
              <Media
                name="home-story-craft-large"
                alt="Ornate interior aboard Hathor Dahabiya"
                className="h2-arrival__media"
                ratio="4 / 5"
              />
              <p className="h2-folio h2-arrival__folio">Hathor · 01</p>
            </Scene>

            <Scene className="h2-voyages" id="home2-voyages">
              <header className="h2-voyages__head">
                <Eyebrow>{home.carousel.subtitle}</Eyebrow>
                <h2 className="h2-display h2-display--l">{home.carousel.title}</h2>
                <p className="h2-body">{HOMEPAGE_ITINERARIES.intro}</p>
              </header>
              <ol className="h2-voyages__list">
                {HOMEPAGE_ITINERARIES.cards.map((voyage, index) => (
                  <li className="h2-voyage" key={voyage.title}>
                    <span className="h2-voyage__number">0{index + 1}</span>
                    <Media
                      name={VOYAGE_IMAGES[index]}
                      alt={`${voyage.title} aboard Hathor Dahabiya`}
                      className="h2-voyage__media"
                      ratio="16 / 10"
                    />
                    <div className="h2-voyage__copy">
                      <h3 className="h2-edit">{voyage.title}</h3>
                      <p>{voyage.duration} · {voyage.schedule}</p>
                    </div>
                    <Link href={voyage.href} className="h2-text-link">
                      View voyage
                    </Link>
                  </li>
                ))}
              </ol>
            </Scene>

            <Scene className="h2-river" id="home2-life">
              <Media
                name="home-amenities-2"
                alt="Hathor Dahabiya moving gently along the Nile"
                className="h2-river__wide"
                ratio="16 / 11"
              />
              <div className="h2-river__statement">
                <Eyebrow>{home.stackSlides[1]?.indication || "Private Nile Sailing"}</Eyebrow>
                <h2 className="h2-display h2-display--l">
                  {(home.stackSlides[1]?.title || "Where time moves gently")
                    .split("\n")
                    .map((line) => (
                      <span className="h2-line" key={line}>
                        <span>{line}</span>
                      </span>
                    ))}
                </h2>
                <p className="h2-body">
                  {home.stackSlides[1]?.body || HOMEPAGE_LIFESTYLE.body}
                </p>
              </div>
              <Media
                name="home-amenities-4"
                alt="Golden hour aboard Hathor Dahabiya"
                className="h2-river__inset"
                ratio="4 / 5"
              />
            </Scene>

            <Scene className="h2-life-ledger">
              <header className="h2-life-ledger__head">
                <Eyebrow>Life aboard</Eyebrow>
                <h2 className="h2-display h2-display--l">The river, considered</h2>
              </header>
              <div className="h2-life-ledger__grid">
                <article className="h2-life-note">
                  <span>01</span>
                  <h3 className="h2-edit">{lifestyle?.indication || "A Way of Life"}</h3>
                  <p>{lifestyle?.body || HOMEPAGE_LIFESTYLE.body}</p>
                  <Link href="/about" className="h2-text-link">
                    {lifestyle?.cta || "Discover More"}
                  </Link>
                </article>
                <Media
                  name="home-amenities-6"
                  alt="Life aboard Hathor Dahabiya"
                  className="h2-life-ledger__media h2-life-ledger__media--one"
                  ratio="4 / 5"
                />
                <article className="h2-life-note">
                  <span>02</span>
                  <h3 className="h2-edit">{dining?.indication || "Gastronomy"}</h3>
                  <p>{dining?.body}</p>
                  <Link href="/gastronomy" className="h2-text-link">
                    {dining?.cta || "Explore Dining"}
                  </Link>
                </article>
                <Media
                  name="home-amenities-7"
                  alt="Fine dining aboard Hathor Dahabiya"
                  className="h2-life-ledger__media h2-life-ledger__media--two"
                  ratio="5 / 4"
                />
              </div>
            </Scene>

            <Scene className="h2-gallery" id="home2-gallery">
              <header className="h2-gallery__head">
                <Eyebrow>{home.gallery.followEyebrow}</Eyebrow>
                <h2 className="h2-display h2-display--l">{home.gallery.title}</h2>
                <a
                  className="h2-text-link"
                  href="https://www.instagram.com/hathorcruise/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {home.gallery.indication}
                </a>
              </header>
              <div className="h2-gallery__strip">
                {EX_GALLERY.images.map((image, index) => (
                  <Link href={image.href} className={`h2-gallery__item h2-gallery__item--${index + 1}`} key={image.imageName}>
                    <Media name={image.imageName} alt={image.alt} ratio={index % 2 ? "4 / 5" : "5 / 4"} />
                  </Link>
                ))}
              </div>
            </Scene>

            <Scene className="h2-reviews" id="home2-reviews">
              <header className="h2-reviews__head">
                <Eyebrow>Guest notes</Eyebrow>
                <h2 className="h2-display h2-display--l">{home.testimonials.title}</h2>
              </header>
              <div className="h2-reviews__quotes">
                {home.testimonials.cards.slice(0, 3).map((review, index) => (
                  <blockquote className="h2-review" key={`${review.name}-${index}`}>
                    <span>0{index + 1}</span>
                    <p className="h2-edit">“{review.quote}”</p>
                    <cite>{review.name}</cite>
                  </blockquote>
                ))}
              </div>
            </Scene>

            <Scene className="h2-closing">
              <Media
                name="home-call-to-action"
                alt="Hathor Dahabiya at golden hour on the Nile"
                className="h2-closing__media"
                ratio="16 / 10"
              />
              <div className="h2-closing__copy">
                <Eyebrow>Next</Eyebrow>
                <h2 className="h2-display h2-display--l">{home.campaign.title}</h2>
              </div>
            </Scene>
          </div>
        </div>
      </section>

      <section className="h2-epilogue" id="home2-reserve">
        <div className="h2-epilogue__copy">
          <Eyebrow>Reserve</Eyebrow>
          <h2 className="h2-display h2-display--xl">
            <span>Timeless luxury</span>
            <span>on the Nile</span>
          </h2>
          <p className="h2-body">{home.cta.body}</p>
          <div className="h2-actions">
            <BookNowTrigger className="h2-btn h2-btn--solid">
              <span>Book Now</span>
            </BookNowTrigger>
            <Link href="/cruises-list" className="h2-btn">
              <span>Explore voyages</span>
            </Link>
          </div>
        </div>
        <Media
          name="home-voyage-nile-majesty"
          alt="Hathor Dahabiya sailing the Nile"
          className="h2-epilogue__media"
          ratio="4 / 5"
        />
        <div className="h2-epilogue__legal">
          <span>Hathor Cruise ® 2026</span>
          <Link href="/contact">Contact</Link>
        </div>
      </section>
    </div>
  );
}
