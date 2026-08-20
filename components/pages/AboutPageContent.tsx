"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useRef,
  type ComponentPropsWithoutRef,
  type CSSProperties,
} from "react";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { useSiteImage } from "@/components/public/SiteImagesProvider";
import { useWebsiteText } from "@/components/public/WebsiteTextProvider";
import { useAboutEditorialFlow } from "@/hooks/useAboutEditorialFlow";
import { ABOUT_PAGE } from "@/lib/page-content";

function AboutMedia({
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
    <figure className={`ab-media ${className}`}>
      <Image
        src={image.src}
        alt={alt || image.alt}
        fill
        priority={priority}
        sizes="(max-width: 1024px) 100vw, 70vw"
        className="ab-media__image"
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
    <div className={`ab-flip ab-flip--${axis} ${className}`} data-ab-flip>
      <AboutMedia slot={front} alt={frontAlt} className="ab-flip__base" />
      <AboutMedia slot={back} alt={backAlt} className="ab-flip__overlay" />
    </div>
  );
}

function SplitText({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) {
  return (
    <span className={`ab-split ${className}`} aria-label={children}>
      {Array.from(children).map((character, index) => (
        <span
          key={`${character}-${index}`}
          aria-hidden="true"
          className="ab-split__char"
          style={
            {
              "--char-index": index,
              "--char-direction": index % 2 === 0 ? 1 : -1,
            } as CSSProperties
          }
        >
          {character === " " ? "\u00a0" : character}
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
    <section className={`ab-scene ${className}`} {...props}>
      {children}
    </section>
  );
}

const STATS = [
  {
    number: "01",
    title: "CABINS",
    count: "08",
    text: "Eight luxury cabins of refined comfort — 22 sqm of contemporary Nile living with ensuite bathrooms and smart systems.",
    slot: "room-luxury",
  },
  {
    number: "02",
    title: "SUITES",
    count: "02",
    text: "Two elegant suites on the Lower Deck — 46 sqm of distinctive luxury with panoramic Nile views and private jacuzzi.",
    slot: "room-suite",
  },
  {
    number: "03",
    title: "ROYAL",
    count: "02",
    text: "Two magnificent Royal Suites on the Main Deck — 56 sqm, the crown jewel, designed for those who seek the extraordinary.",
    slot: "room-royal",
  },
] as const;

const STAYS = [
  {
    number: "01",
    meta: "22 SQM",
    place: "CABIN",
    title: "Cabin",
    slot: "room-luxury",
    href: "/rooms",
    tone: "cream",
  },
  {
    number: "02",
    meta: "46 SQM",
    place: "LOWER DECK",
    title: "Suite",
    slot: "room-suite",
    href: "/luxury-cabins-Nile-Cruise",
    tone: "ink",
  },
  {
    number: "03",
    meta: "56 SQM",
    place: "MAIN DECK",
    title: "Royal",
    slot: "room-royal",
    href: "/Luxury-Royal-Suites-Nile-Dahabiya-Cruise",
    tone: "gold",
  },
] as const;

export function AboutPageContent() {
  const rootRef = useRef<HTMLDivElement>(null);
  const runRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const { pages } = useWebsiteText();
  const about = pages.about;
  useAboutEditorialFlow({ rootRef, runRef, trackRef });

  const lead = about.intro[0] ?? ABOUT_PAGE.intro[0];
  const second = about.intro[1] ?? ABOUT_PAGE.intro[1];

  return (
    <div ref={rootRef} className="about-boring">
      <div className="ab-progress" aria-hidden="true">
        <i data-ab-progress />
      </div>

      <main>
        <section ref={runRef} className="ab-run" aria-label="About Hathor Dahabiya">
          <div className="ab-stage">
            <div ref={trackRef} className="ab-track">
              <Scene className="ab-intro">
                <div className="ab-intro__inner">
                  <nav className="ab-intro__menu" aria-label="About page sections">
                    <a href="#about">About</a>
                    <a href="#stay">Stay</a>
                    <Link href="/gastronomy">Dining</Link>
                    <a href="#reserve">Reserve</a>
                  </nav>
                  <p className="ab-marker">About</p>
                  <p className="ab-copyright">Hathor Cruise ©2026</p>

                  <div className="ab-intro__title" id="about">
                    <h1 className="ab-intro__title-part ab-intro__title-part--one">
                      <SplitText>Welcome</SplitText>
                      <br />
                      <SplitText>Aboard</SplitText>
                    </h1>
                    <h1 className="ab-intro__title-part ab-intro__title-part--two">
                      <SplitText>Hathor</SplitText>
                      <br />
                      <SplitText>Dahabiya</SplitText>
                    </h1>
                    <h1 className="ab-intro__title-part ab-intro__title-part--three">
                      <SplitText>on the</SplitText>
                      <br />
                      <SplitText>Nile</SplitText>
                    </h1>
                  </div>

                  <p className="ab-intro__body">{ABOUT_PAGE.hero.subtitle}</p>
                  <div className="ab-intro__wordmark" aria-label="Hathor Nile dahabiya">
                    <span>HATHOR</span>
                    <em>Nile</em>
                    <strong>dahabiya</strong>
                  </div>
                </div>
              </Scene>

              <Scene className="ab-image-lead">
                <AboutMedia
                  slot="about-hero"
                  alt="Hathor Dahabiya on the Nile"
                  priority
                  className="ab-image-lead__main"
                />
                <FlipImage
                  className="ab-image-lead__flip"
                  axis="left"
                  front="room-suite"
                  back="about-dining"
                  frontAlt="Suite aboard Hathor"
                  backAlt="Dining aboard Hathor"
                />
              </Scene>

              <Scene className="ab-manifesto">
                <p className="ab-marker">The dahabiya</p>
                <div className="ab-manifesto__headline ab-big-title">
                  <SplitText>Experience Egypt</SplitText>
                  <SplitText>in a whole</SplitText>
                  <SplitText>new light</SplitText>
                </div>
                <p className="ab-manifesto__body">{lead}</p>
              </Scene>

              <Scene className="ab-collage">
                <FlipImage
                  className="ab-collage__tile ab-collage__tile--one"
                  axis="up"
                  front="home-story-way-of-life"
                  back="home-cinematic-still"
                  frontAlt="Life aboard Hathor"
                  backAlt="Hathor on the river"
                />
                <FlipImage
                  className="ab-collage__tile ab-collage__tile--two"
                  axis="right"
                  front="home-story-craft-large"
                  back="room-luxury"
                  frontAlt="Craft aboard Hathor"
                  backAlt="Cabin aboard Hathor"
                />
                <p>{second}</p>
              </Scene>

              <Scene className="ab-marquee" aria-label="Dahabiya">
                <div className="ab-marquee__rail">
                  {[0, 1, 2].map((item) => (
                    <span key={item}>
                      DAHABIYA <b>✦</b>
                    </span>
                  ))}
                </div>
              </Scene>

              <Scene className="ab-image-pair">
                <FlipImage
                  className="ab-image-pair__left"
                  axis="left"
                  front="home-voyage-nile-majesty"
                  back="home-call-to-action"
                  frontAlt="Nile voyage"
                  backAlt="Deck on the Nile"
                />
                <FlipImage
                  className="ab-image-pair__right"
                  axis="right"
                  front="gastronomy-table"
                  back="room-royal"
                  frontAlt="Dining on the Nile"
                  backAlt="Royal Suite aboard Hathor"
                />
              </Scene>

              <Scene className="ab-principles" id="stay">
                {STATS.map((stat) => (
                  <article className="ab-principle" key={stat.number}>
                    <p className="ab-principle__copy">{stat.text}</p>
                    <div className="ab-principle__heading">
                      <span>{stat.count}</span>
                      <h2>{stat.title}</h2>
                    </div>
                    <AboutMedia
                      slot={stat.slot}
                      alt={`${stat.title.toLowerCase()} aboard Hathor`}
                      className="ab-principle__hover"
                    />
                  </article>
                ))}
              </Scene>

              <Scene className="ab-projects-intro">
                <p className="ab-marker">{about.accommodationsTitle}</p>
                <p>{about.accommodationsIntro}</p>
              </Scene>

              {STAYS.map((stay, index) => (
                <Scene
                  className={`ab-project ab-project--${index + 1} ab-project--${stay.tone}`}
                  key={stay.number}
                >
                  <div className="ab-project__shell">
                    <AboutMedia
                      slot={stay.slot}
                      alt={`${stay.title} aboard Hathor`}
                      className="ab-project__image"
                    />
                    <div className="ab-project__data">
                      <span>{stay.meta}</span>
                      <span>{stay.place}</span>
                      <span>{stay.number}</span>
                      <Link href={stay.href}>The experience</Link>
                    </div>
                    <h2>{stay.title}</h2>
                  </div>
                </Scene>
              ))}

              <Scene className="ab-last-project">
                <div className="ab-last-project__images">
                  <AboutMedia
                    slot="gastronomy-restaurant"
                    alt="Indoor restaurant aboard Hathor"
                    className="ab-last-project__main"
                  />
                  <FlipImage
                    className="ab-last-project__stack"
                    axis="left"
                    front="gastronomy-wine"
                    back="about-dining"
                    frontAlt="Bar aboard Hathor"
                    backAlt="Fine dining aboard Hathor"
                  />
                  <Link href="/gastronomy" className="ab-last-project__link">
                    <span>↗</span> Explore Dining
                  </Link>
                </div>
                <div className="ab-last-project__copy">
                  <p className="ab-marker">{about.diningTitle}</p>
                  <div className="ab-big-title">
                    <SplitText>Luxury dining</SplitText>
                    <SplitText>on Egypt’s</SplitText>
                    <SplitText>finest</SplitText>
                    <SplitText>dahabiya</SplitText>
                  </div>
                  <p>{ABOUT_PAGE.diningPromo.body}</p>
                </div>
              </Scene>

              <Scene className="ab-closing">
                <FlipImage
                  className="ab-closing__media"
                  axis="up"
                  front="home-story-legacy-large"
                  back="home-split-courtyard"
                  frontAlt="Hathor legacy on the Nile"
                  backAlt="Hathor deck living"
                />
              </Scene>
            </div>
          </div>
        </section>

        <section className="ab-epilogue" id="reserve">
          <header className="ab-epilogue__title">
            <span>(Reserve)</span>
            <h2>
              WELCOME
              <br />
              ABOARD
            </h2>
          </header>
          <div className="ab-epilogue__images">
            <AboutMedia slot="room-royal" alt="Royal Suite experience" />
            <AboutMedia slot="about-dining" alt="Dining experience" />
          </div>
          <div className="ab-epilogue__statement ab-big-title">
            <span>Timeless</span>
            <span>luxury on</span>
            <span>the Nile</span>
          </div>
          <div className="ab-epilogue__contact">
            <p>{about.welcomeBody}</p>
          </div>
          <div className="ab-epilogue__pills">
            <BookNowTrigger className="btn btn-dark">Book Now</BookNowTrigger>
            <Link href="/cruises" className="btn btn-dark">
              Explore Cruises
            </Link>
          </div>
          <p className="ab-epilogue__outro">{about.diningOutro}</p>
          <div className="ab-epilogue__social">
            <a href="https://www.instagram.com/hathorcruise/">INSTAGRAM</a>
            <span>|</span>
            <a href="mailto:reservations@hathorcruise.com">
              reservations@hathorcruise.com
            </a>
            <span>|</span>
          </div>
          <div className="ab-epilogue__feature">
            <div className="ab-epilogue__monogram" aria-hidden="true">
              HATHOR
            </div>
            <span>(VESSEL)</span>
            <AboutMedia slot="about-hero" alt="Hathor Dahabiya" />
            <h3>DAHABIYA</h3>
            <p>
              Three decks of stillness
              <br />
              on a private Nile cruise
            </p>
          </div>
          <div className="ab-epilogue__legal">
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
