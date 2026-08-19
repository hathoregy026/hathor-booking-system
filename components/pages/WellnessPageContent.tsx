"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, type ComponentPropsWithoutRef, type CSSProperties } from "react";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { useWellnessBoringScroll } from "@/hooks/useWellnessBoringScroll";

const MEDIA = {
  spa: "/media/hathor/r2/wellness-hero.webp",
  fitness: "/media/hathor/r2/wellness-fitness.webp",
  suite: "/media/hathor/optimized/room-suite.webp",
  royal: "/media/hathor/optimized/room-royal.webp",
  luxury: "/media/hathor/optimized/room-luxury.webp",
  voyage: "/media/hathor/optimized/cruises-hero.webp",
  deck: "/media/hathor/optimized/home-call-to-action.webp",
  craft: "/media/hathor/optimized/home-story-craft-large.webp",
  dining: "/media/hathor/optimized/dining-intro-hero.webp",
  river: "/media/hathor/optimized/home-voyage-nile-majesty.webp",
  legacy: "/media/hathor/optimized/home-story-legacy-large.webp",
} as const;

type MediaProps = {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
};

function BoringMedia({ src, alt, priority = false, className = "" }: MediaProps) {
  return (
    <figure className={`wb-media ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 1024px) 100vw, 70vw"
        className="wb-media__image"
      />
    </figure>
  );
}

function SplitText({ children, className = "" }: { children: string; className?: string }) {
  return (
    <span className={`wb-split ${className}`} aria-label={children}>
      {Array.from(children).map((character, index) => (
        <span
          key={`${character}-${index}`}
          aria-hidden="true"
          className="wb-split__char"
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

function Scene({ className = "", children, ...props }: ComponentPropsWithoutRef<"section">) {
  return <section className={`wb-scene ${className}`} {...props}>{children}</section>;
}

const principles = [
  {
    number: "01",
    title: "RESTORATION",
    text: "A quiet spa ritual shaped around Egyptian botanicals, warm touch, and the unhurried cadence of the Nile.",
    image: MEDIA.spa,
  },
  {
    number: "02",
    title: "MOVEMENT",
    text: "Panoramic training in Historia Fitness, with considered equipment and a river horizon that makes every breath feel lighter.",
    image: MEDIA.fitness,
  },
  {
    number: "03",
    title: "REPOSE",
    text: "Private suites become part of the ritual: deep sleep, soft morning light, generous bathrooms, and space to return to yourself.",
    image: MEDIA.royal,
  },
] as const;

const experiences = [
  { meta: "DAILY", place: "SENEB SPA", number: "01", title: "The Spa", image: MEDIA.spa, href: "#reserve" },
  { meta: "DAILY", place: "HISTORIA", number: "02", title: "Fitness", image: MEDIA.fitness, href: "#reserve" },
  { meta: "SUNRISE", place: "NILE DECK", number: "03", title: "Breathwork", image: MEDIA.deck, href: "#reserve" },
  { meta: "PRIVATE", place: "ROYAL SUITE", number: "04", title: "Deep Rest", image: MEDIA.royal, href: "/Luxury-Royal-Suites-Nile-Dahabiya-Cruise" },
  { meta: "MORNING", place: "LUXURY SUITE", number: "05", title: "Slow Living", image: MEDIA.luxury, href: "/luxury-cabins-Nile-Cruise" },
] as const;

export function WellnessPageContent() {
  const rootRef = useRef<HTMLDivElement>(null);
  const runRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  useWellnessBoringScroll({ rootRef, runRef, trackRef });

  return (
    <div ref={rootRef} className="wellness-boring">
      <div className="wb-progress" aria-hidden="true"><i data-wb-progress /></div>

      <main>
        <section ref={runRef} className="wb-run" aria-label="Hathor wellness journey">
          <div className="wb-stage">
            <div ref={trackRef} className="wb-track">
              <Scene className="wb-intro">
                <div className="wb-intro__inner">
                  <nav className="wb-intro__menu" aria-label="Wellness page sections">
                    <a href="#wellness">Wellness</a>
                    <a href="#fitness">Gym</a>
                    <Link href="/suites">Suites</Link>
                    <a href="#reserve">Reserve</a>
                  </nav>
                  <p className="wb-marker">Wellness</p>
                  <p className="wb-copyright">Hathor Cruise ©2026</p>

                  <div className="wb-intro__title" id="wellness">
                    <h1 className="wb-intro__title-part wb-intro__title-part--one">
                      <SplitText>Rituals</SplitText><br /><SplitText>of renewal</SplitText>
                    </h1>
                    <h1 className="wb-intro__title-part wb-intro__title-part--two">
                      <SplitText>that</SplitText><br /><SplitText>travel</SplitText><br /><SplitText>with you</SplitText>
                    </h1>
                    <h1 className="wb-intro__title-part wb-intro__title-part--three">
                      <SplitText>on</SplitText><br /><SplitText>the Nile</SplitText>
                    </h1>
                  </div>

                  <p className="wb-intro__body">
                    In a world that rarely pauses, Hathor creates time for the body to soften. Seneb Spa, Historia Fitness, and deeply restful suites move with you between Luxor and Aswan.
                  </p>
                  <div className="wb-intro__wordmark" aria-label="Hathor Nile wellness">
                    <span>HATHOR</span><em>Nile</em><strong>wellness</strong>
                  </div>
                </div>
              </Scene>

              <Scene className="wb-image-lead">
                <BoringMedia src={MEDIA.spa} alt="Seneb Spa aboard Hathor" priority className="wb-image-lead__main" />
                <div className="wb-flip wb-image-lead__flip">
                  <BoringMedia src={MEDIA.suite} alt="Hathor suite prepared for rest" />
                  <BoringMedia src={MEDIA.fitness} alt="Historia Fitness overlooking the Nile" />
                </div>
              </Scene>

              <Scene className="wb-manifesto">
                <p className="wb-marker">Our ritual</p>
                <div className="wb-manifesto__headline wb-big-title">
                  <SplitText>Spaces that invite</SplitText>
                  <SplitText>the body to</SplitText>
                  <SplitText>release</SplitText>
                  <SplitText>and recover</SplitText>
                </div>
                <p className="wb-manifesto__body">
                  Every moment aboard Hathor is designed as part of your well-being. The spa restores, the gym energises, and each suite protects the quiet that follows—so discovery along the Nile never asks you to leave comfort behind.
                </p>
              </Scene>

              <Scene className="wb-collage">
                <div className="wb-collage__tile wb-collage__tile--one wb-flip"><BoringMedia src={MEDIA.royal} alt="Royal suite calm" /><BoringMedia src={MEDIA.suite} alt="Suite details aboard Hathor" /></div>
                <div className="wb-collage__tile wb-collage__tile--two wb-flip"><BoringMedia src={MEDIA.fitness} alt="Fitness with Nile views" /><BoringMedia src={MEDIA.spa} alt="Private wellness ritual" /></div>
                <p>At Hathor, wellness is not a room you visit. It is the quality of the light, the privacy of your suite, the freedom to move, and the feeling of returning from an Egyptian temple to a vessel that already knows how you wish to rest.</p>
              </Scene>

              <Scene className="wb-marquee" aria-label="Wellness values">
                <div className="wb-marquee__rail">
                  {[0, 1, 2].map((item) => <span key={item}>WELLNESS <b>✦</b></span>)}
                </div>
              </Scene>

              <Scene className="wb-image-pair">
                <div className="wb-flip wb-image-pair__left"><BoringMedia src={MEDIA.deck} alt="Open-air calm on the Nile" /><BoringMedia src={MEDIA.river} alt="Hathor sailing the Nile" /></div>
                <div className="wb-flip wb-image-pair__right"><BoringMedia src={MEDIA.luxury} alt="Luxury suite repose" /><BoringMedia src={MEDIA.dining} alt="Nourishing dining aboard Hathor" /></div>
              </Scene>

              <Scene className="wb-principles" id="fitness">
                {principles.map((principle) => (
                  <article className="wb-principle" key={principle.number}>
                    <p className="wb-principle__copy">{principle.text}</p>
                    <div className="wb-principle__heading">
                      <span>{principle.number}</span>
                      <h2>{principle.title}</h2>
                    </div>
                    <BoringMedia src={principle.image} alt={`${principle.title.toLowerCase()} aboard Hathor`} className="wb-principle__hover" />
                  </article>
                ))}
              </Scene>

              <Scene className="wb-projects-intro">
                <p className="wb-marker">Experiences</p>
                <p>Luxury never needs to announce itself. On Hathor it is felt in private care, intelligent spaces, and the freedom to choose movement, stillness, or sleep as the Nile carries you onward.</p>
              </Scene>

              {experiences.map((experience, index) => (
                <Scene className={`wb-project wb-project--${index + 1}`} key={experience.number}>
                  <div className="wb-project__shell">
                    <BoringMedia src={experience.image} alt={`${experience.title} aboard Hathor`} className="wb-project__image" />
                    <div className="wb-project__data">
                      <span>{experience.meta}</span><span>{experience.place}</span><span>{experience.number}</span>
                      <Link href={experience.href}>The experience</Link>
                    </div>
                    <h2>{experience.title}</h2>
                  </div>
                </Scene>
              ))}

              <Scene className="wb-last-project">
                <div className="wb-last-project__images">
                  <BoringMedia src={MEDIA.suite} alt="Hathor suite living space" />
                  <BoringMedia src={MEDIA.craft} alt="Handcrafted detail aboard Hathor" />
                  <BoringMedia src={MEDIA.legacy} alt="Egyptian character aboard Hathor" />
                  <Link href="/suites" className="wb-last-project__link"><span>↗</span> Explore suites</Link>
                </div>
                <div className="wb-last-project__copy">
                  <p className="wb-marker">Suites</p>
                  <div className="wb-big-title">
                    <SplitText>Who said</SplitText>
                    <SplitText>that true rest</SplitText>
                    <SplitText>cannot be</SplitText>
                    <SplitText>adventurous</SplitText>
                  </div>
                  <p>Our suites ignore passing trends in favour of craftsmanship, generous proportions, considered storage, private bathrooms, and the rare luxury of waking beside a different Nile horizon.</p>
                </div>
              </Scene>

              <Scene className="wb-closing">
                <div className="wb-flip wb-closing__media"><BoringMedia src={MEDIA.voyage} alt="Hathor journeying through Egypt" /><BoringMedia src={MEDIA.deck} alt="Golden hour aboard Hathor" /></div>
              </Scene>
            </div>
          </div>
        </section>

        <section className="wb-epilogue" id="reserve">
          <header className="wb-epilogue__title">
            <span>(Reserve)</span>
            <h2>BEGIN YOUR<br />NILE RETURN</h2>
          </header>
          <div className="wb-epilogue__images">
            <BoringMedia src={MEDIA.fitness} alt="Historia Fitness experience" />
            <BoringMedia src={MEDIA.spa} alt="Seneb Spa experience" />
          </div>
          <div className="wb-epilogue__statement wb-big-title">
            <span>Wellness at</span><span>its most</span><span>personal</span>
          </div>
          <div className="wb-epilogue__contact">
            <p>Tell us how you want to feel on the Nile. Our team will help shape a private voyage with time for Seneb Spa, Historia Fitness, restorative suite rituals, nourishing cuisine, and the temples of Egypt.</p>
            <a href="mailto:reservations@hathorcruise.com">reservations@hathorcruise.com</a>
          </div>
          <BookNowTrigger className="wb-epilogue__button">Book your voyage</BookNowTrigger>
          <div className="wb-epilogue__social"><a href="https://www.instagram.com/hathorcruise/">INSTAGRAM</a><span>|</span><a href="mailto:reservations@hathorcruise.com">reservations@hathorcruise.com</a><span>|</span></div>
          <div className="wb-epilogue__feature">
            <div className="wb-epilogue__monogram" aria-hidden="true">HATHOR</div>
            <span>(NILE)</span>
            <BoringMedia src={MEDIA.royal} alt="Hathor Royal Suite" />
            <h3>ROYAL SUITES</h3>
            <p>Privacy and renewal in the heart<br />of an ever-changing Nile landscape</p>
          </div>
          <div className="wb-epilogue__legal"><span>HATHOR CRUISE ©2026</span><Link href="/contact">PRIVACY</Link><Link href="/contact">COOKIES</Link><Link href="/contact">LEGAL</Link></div>
        </section>
      </main>
    </div>
  );
}
