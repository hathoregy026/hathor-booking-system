"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, type CSSProperties, type ReactNode } from "react";
import rotatingWheel from "@/assets/LOGOS/rotating-wheel-hathor-cruise.png";
import { LuxuryMarquee } from "@/components/home/LuxuryMarquee";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { HathorLogoTuner } from "@/components/public/HathorLogoTuner";
import { useWebsiteText } from "@/components/public/WebsiteTextProvider";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { useExScrollMotion } from "@/hooks/useExScrollMotion";
import { useHome2EditorialScroll } from "@/hooks/useHome2EditorialScroll";
import { AMENITIES_SEQUENCE_IMAGE_SLOTS } from "@/lib/amenities-sequence-images";
import { amenitiesCopy, amenitiesTitleLines } from "@/lib/amenities-copy";
import {
  EX_ABOUT,
  EX_CAMPAIGN,
  EX_CAROUSEL,
  EX_GALLERY,
  EX_HERO,
  EX_PINNED,
  EX_TEXT_BLOCKS,
} from "@/lib/ex-page-content";
import type { HeroLogoTune } from "@/lib/hero-logo-tune-shared";
import type { HomepageAccordionCruise } from "@/lib/homepage-accordion-cruises";
import type { SiteImageName } from "@/lib/site-image-slots";
import type { WheelStageSettings } from "@/lib/wheel-stage-settings-shared";
import { PublicSiteHero } from "@/components/pages/PublicSiteHero";

type Home2EditorialPageProps = {
  heroLogoTune: HeroLogoTune;
  heroLogoTuneMobile: HeroLogoTune;
  accordionCruises: HomepageAccordionCruise[];
  wheelStage: WheelStageSettings;
};

function Scene({
  className = "",
  children,
  id,
}: {
  className?: string;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section className={`h2-scene ${className}`} id={id}>
      {children}
    </section>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="h2-eyebrow">({children})</p>;
}

function Home2Media({
  name,
  alt,
  className = "",
  wipe = "up",
  priority = false,
}: {
  name: SiteImageName;
  alt: string;
  className?: string;
  wipe?: "up" | "left" | "right";
  priority?: boolean;
}) {
  const wipeClass =
    wipe === "left"
      ? "h2-media--wipe-left"
      : wipe === "right"
        ? "h2-media--wipe-right"
        : "";
  return (
    <figure className={`h2-media ${wipeClass} ${className}`.trim()}>
      <ManagedImage
        name={name}
        alt={alt}
        fill
        sizes="(max-width: 620px) 100vw, (max-width: 1024px) 92vw, 68vw"
        className="h2-media__image"
        priority={priority}
        previewAnchor
      />
    </figure>
  );
}

function Home2FlipMedia({
  base,
  overlay,
  direction = "up",
  className = "",
}: {
  base: { name: SiteImageName; alt: string };
  overlay: { name: SiteImageName; alt: string };
  direction?: "up" | "left" | "right";
  className?: string;
}) {
  return (
    <div
      className={`h2-flip h2-flip--${direction} ${className}`.trim()}
      data-h2-flip
    >
      <Home2Media name={base.name} alt={base.alt} className="h2-flip__base" wipe="up" />
      <Home2Media
        name={overlay.name}
        alt={overlay.alt}
        className="h2-flip__overlay"
        wipe="up"
      />
    </div>
  );
}

function RevealTitle({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: 0 | 1 | 2;
}) {
  const delayClass =
    delay === 1 ? "h2-line--delay" : delay === 2 ? "h2-line--delay-2" : "";
  return (
    <span className={`h2-line ${delayClass}`.trim()}>
      <span>{children}</span>
    </span>
  );
}

/**
 * Scene map:
 * hero / marquee; welcome visual essay; six-letter VOYAGE monument;
 * itinerary folios; landmark sequence; lifestyle + dining; amenities archive;
 * Hathor itineraries ledger; helm; gallery; guest ledger; booking epilogue.
 */
export function Home2EditorialPage({
  heroLogoTune,
  heroLogoTuneMobile,
  accordionCruises,
  wheelStage,
}: Home2EditorialPageProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const runRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const { home } = useWebsiteText();
  useExScrollMotion();
  useHome2EditorialScroll({ rootRef, runRef, trackRef });

  const aboutLines = home.about.heading
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const landmarkSlides = EX_PINNED.slides.map((slide, index) => {
    const cms = home.stackSlides[index];
    return {
      ...slide,
      titleLines: amenitiesTitleLines(cms?.title, [slide.title]),
      indication: amenitiesCopy(cms?.indication, slide.indication),
      body: amenitiesCopy(cms?.body, slide.body),
    };
  });

  return (
    <>
      {/* Keep this opening structure identical to the main homepage so every
          homepage-only hero, logo and mobile-video rule resolves unchanged. */}
      <div className="ex-root" data-hathor-logo-tuned="">
        <HathorLogoTuner />
        <div id="top">
          <div className="home-hero-runway">
            <PublicSiteHero
              animate={false}
              splitLetterLogo
              playVideo
              lineRight={EX_HERO.lineRight}
              lineLeft={EX_HERO.lineLeft}
              heroPage="home"
              posterImageName={EX_HERO.imageName}
              logoPartsVariant={heroLogoTune.partsVariant}
              mobileLogoPartsVariant={heroLogoTuneMobile.partsVariant}
            />
          </div>
          <LuxuryMarquee />
        </div>
      </div>

      <div ref={rootRef} className="home2-editorial">
        <div className="h2-progress" aria-hidden="true">
          <i data-h2-progress />
        </div>

        <main>
          <section ref={runRef} className="h2-run" aria-label="The Hathor home story">
          <div className="h2-stage">
            <div ref={trackRef} className="h2-track">
              <Scene className="h2-welcome" id="about">
                <div className="h2-welcome__copy">
                  <Eyebrow>{home.about.eyebrow}</Eyebrow>
                  <h1 className="h2-display h2-display--xl" data-anima-title>
                    {(aboutLines.length ? aboutLines : [EX_ABOUT.heading]).map(
                      (line, index) => (
                        <RevealTitle
                          key={`${line}-${index}`}
                          delay={index === 0 ? 0 : index === 1 ? 1 : 2}
                        >
                          {line}
                        </RevealTitle>
                      ),
                    )}
                  </h1>
                  <p className="h2-copy">{home.about.body}</p>
                  <Link href="/about" className="h2-btn">
                    <span>{home.about.cta}</span>
                  </Link>
                </div>
                <Home2Media
                  name={EX_ABOUT.imageName}
                  alt={EX_ABOUT.imageAlt}
                  className="h2-welcome__media"
                  wipe="left"
                  priority
                />
                <p className="h2-corner h2-corner--bottom">Hathor Cruise ® 2026</p>
              </Scene>

              <Scene className="h2-monument">
                <span className="h2-monument__word" aria-hidden="true">
                  VOYAGE
                </span>
                <div className="h2-monument__note">
                  <Eyebrow>Between Luxor and Aswan</Eyebrow>
                  <p>The Nile, composed as a private passage.</p>
                </div>
              </Scene>

              <Scene className="h2-itinerary-intro" id="itineraries">
                <Eyebrow>{home.carousel.subtitle}</Eyebrow>
                <h2 className="h2-display h2-display--l">
                  <RevealTitle>{home.carousel.title}</RevealTitle>
                </h2>
                <p className="h2-copy">
                  Every route, room and suite from the Hathor homepage itinerary collection.
                </p>
                <Link href="/cruises-list" className="h2-btn">
                  <span>{home.carousel.exploreCta}</span>
                </Link>
              </Scene>

              {EX_CAROUSEL.slides.map((slide, index) => (
                <Scene className="h2-itinerary" key={slide.key}>
                  <Home2Media
                    name={slide.imageName}
                    alt={slide.alt}
                    className="h2-itinerary__media"
                    wipe={index % 2 === 0 ? "up" : "right"}
                  />
                  <div className="h2-itinerary__copy">
                    <span className="h2-index">
                      {String(index + 1).padStart(2, "0")} / {EX_CAROUSEL.slides.length}
                    </span>
                    <h3 className="h2-display h2-display--m">
                      <RevealTitle>{slide.title}</RevealTitle>
                    </h3>
                    <Link href="/cruises-list" className="h2-link">
                      View voyage
                    </Link>
                  </div>
                </Scene>
              ))}

              {landmarkSlides.map((slide, index) => {
                const next = landmarkSlides[(index + 1) % landmarkSlides.length];
                const useFlip = index % 2 === 0 && next;
                return (
                <Scene className={`h2-landmark h2-landmark--${(index % 3) + 1}`} key={slide.imageName}>
                  {useFlip ? (
                    <Home2FlipMedia
                      className="h2-landmark__media"
                      direction={index % 4 === 0 ? "up" : "left"}
                      base={{ name: slide.imageName, alt: slide.alt }}
                      overlay={{ name: next.imageName, alt: next.alt }}
                    />
                  ) : (
                    <Home2Media
                      name={slide.imageName}
                      alt={slide.alt}
                      className="h2-landmark__media"
                      wipe={index % 3 === 1 ? "left" : "up"}
                    />
                  )}
                  <div className="h2-landmark__copy">
                    <Eyebrow>{slide.indication}</Eyebrow>
                    <h2 className="h2-display h2-display--l">
                      {slide.titleLines.map((line, lineIndex) => (
                        <RevealTitle
                          key={`${line}-${lineIndex}`}
                          delay={lineIndex === 0 ? 0 : lineIndex === 1 ? 1 : 2}
                        >
                          {line}
                        </RevealTitle>
                      ))}
                    </h2>
                    <p className="h2-copy">{slide.body}</p>
                  </div>
                </Scene>
                );
              })}

              {EX_TEXT_BLOCKS.map((block, index) => {
                const cms = home.textBlocks[index];
                return (
                  <Scene className="h2-life" key={block.title}>
                    <div className="h2-life__copy">
                      <Eyebrow>{amenitiesCopy(cms?.indication, index === 0 ? "A Way of Life" : "Gastronomy")}</Eyebrow>
                      <h2 className="h2-display h2-display--l">
                        {amenitiesTitleLines(cms?.title, [block.title]).map((line, lineIndex) => (
                          <RevealTitle
                            key={`${line}-${lineIndex}`}
                            delay={lineIndex === 0 ? 0 : 1}
                          >
                            {line}
                          </RevealTitle>
                        ))}
                      </h2>
                      <p className="h2-copy">{amenitiesCopy(cms?.body, block.body)}</p>
                      <Link href={block.href} className="h2-btn">
                        <span>{amenitiesCopy(cms?.cta, block.cta)}</span>
                      </Link>
                    </div>
                    <Home2Media
                      name={block.imageName}
                      alt={block.alt}
                      className="h2-life__media"
                      wipe={index % 2 === 0 ? "right" : "left"}
                    />
                  </Scene>
                );
              })}

              <Scene className="h2-amenities-intro" id="amenities">
                <Eyebrow>Aboard Hathor</Eyebrow>
                <h2 className="h2-display h2-display--xl">
                  <RevealTitle>Eleven details</RevealTitle>
                  <RevealTitle delay={1}>of the journey</RevealTitle>
                </h2>
                <p className="h2-copy">
                  The complete amenities image sequence from the main homepage.
                </p>
              </Scene>

              {AMENITIES_SEQUENCE_IMAGE_SLOTS.map((slot, index) => (
                <Scene className="h2-amenity" key={slot.name}>
                  <span className="h2-index">{String(index + 1).padStart(2, "0")}</span>
                  <Home2Media
                    name={slot.name as SiteImageName}
                    alt={slot.alt}
                    className="h2-amenity__media"
                    wipe={index % 2 === 0 ? "up" : "left"}
                  />
                  <p className="h2-amenity__label">Hathor · Aboard</p>
                </Scene>
              ))}

              <Scene className="h2-voyages" id="voyages">
                <header className="h2-voyages__head">
                  <Eyebrow>Hathor itineraries</Eyebrow>
                  <h2 className="h2-display h2-display--l">
                    <RevealTitle>Choose your passage</RevealTitle>
                  </h2>
                </header>
                <ol className="h2-voyages__list">
                  {accordionCruises.map((cruise, index) => (
                    <li key={cruise.id}>
                      <span className="h2-index">{cruise.romanNumeral || String(index + 1).padStart(2, "0")}</span>
                      <div>
                        <h3 className="h2-display h2-display--s">
                          <RevealTitle>{cruise.name}</RevealTitle>
                        </h3>
                        <p className="h2-copy">{cruise.description}</p>
                        <p className="h2-meta">{cruise.meta}</p>
                      </div>
                      <Link href={cruise.href} className="h2-btn">
                        <span>View voyage</span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </Scene>

              <Scene className="h2-helm">
                <div
                  className="h2-helm__stage"
                  style={{ ["--h2-wheel-opacity" as string]: String(wheelStage.opacity) } as CSSProperties}
                >
                  <Home2Media name="home-wheel-stage" alt="" className="h2-helm__paper" />
                  <Home2Media
                    name="home-wheel-image"
                    alt="Hathor Dahabiya voyage on the Nile"
                    className="h2-helm__destination"
                  />
                  <Image src={rotatingWheel} alt="" className="h2-helm__wheel" sizes="(max-width: 1024px) 76vw, 58vh" />
                  <div className="h2-helm__copy">
                    <Eyebrow>Set your course</Eyebrow>
                    <h2 className="h2-display h2-display--l">
                      <RevealTitle>The Nile awaits</RevealTitle>
                    </h2>
                  </div>
                </div>
              </Scene>

              <Scene className="h2-gallery" id="gallery">
                <header>
                  <Eyebrow>Follow our journey</Eyebrow>
                  <h2 className="h2-display h2-display--l">
                    <RevealTitle>{home.gallery.title}</RevealTitle>
                  </h2>
                  <a className="h2-link" href={EX_GALLERY.indicationHref} target="_blank" rel="noopener noreferrer">
                    {EX_GALLERY.indication}
                  </a>
                </header>
                <div className="h2-gallery__grid">
                  {EX_GALLERY.images.map((item, index) => (
                    <Link href={item.href} key={item.imageName} aria-label={item.alt}>
                      <Home2Media
                        name={item.imageName}
                        alt={item.alt}
                        wipe={index % 3 === 0 ? "up" : index % 3 === 1 ? "left" : "right"}
                      />
                    </Link>
                  ))}
                </div>
              </Scene>

              <Scene className="h2-reviews" id="reviews">
                <h2 className="h2-display h2-display--l">
                  <RevealTitle>{home.testimonials.title}</RevealTitle>
                </h2>
                <div className="h2-reviews__grid">
                  {home.testimonials.cards.map((card, index) => (
                    <article key={`${card.name}-${index}`}>
                      <p className="h2-stars" aria-label="5 stars">★★★★★</p>
                      <h3 className="h2-display h2-display--s">
                        <RevealTitle delay={1}>{card.name}</RevealTitle>
                      </h3>
                      <blockquote>“{card.quote}”</blockquote>
                    </article>
                  ))}
                </div>
              </Scene>
            </div>
          </div>
          </section>

          <section className="h2-epilogue">
          <Home2Media name={EX_CAMPAIGN.imageName} alt={EX_CAMPAIGN.imageAlt} className="h2-epilogue__media" wipe="up" />
          <div className="h2-epilogue__copy">
            <Eyebrow>Welcome aboard</Eyebrow>
            <h2 className="h2-display h2-display--xl">
              <RevealTitle>{home.campaign.title}</RevealTitle>
            </h2>
            <div className="h2-epilogue__actions">
              <BookNowTrigger className="h2-btn h2-btn--solid"><span>Book now</span></BookNowTrigger>
              <Link href="/contact" className="h2-btn"><span>Contact us</span></Link>
            </div>
          </div>
          <footer className="h2-legal">
            <span>Hathor Cruise ® 2026</span>
            <nav aria-label="Legal"><Link href="/contact">Privacy</Link><Link href="/contact">Cookies</Link><Link href="/contact">Legal</Link></nav>
          </footer>
          </section>
        </main>
      </div>
    </>
  );
}
