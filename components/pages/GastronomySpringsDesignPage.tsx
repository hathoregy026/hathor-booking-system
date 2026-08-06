"use client";

import { useCallback, useMemo, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import "@/app/gastronomy-springs-design.css";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { useSiteImage } from "@/components/public/SiteImagesProvider";
import { useWebsiteText } from "@/components/public/WebsiteTextProvider";
import { useGastronomySpringsScroll } from "@/hooks/useGastronomySpringsScroll";
import { GASTRONOMY_PAGE } from "@/lib/page-content";
import { resolveGastronomyDiningImageSrc } from "@/lib/gastronomy-dining-image-src";
import { siteImageAnchorId } from "@/lib/site-image-preview";

function DiningImg({
  name,
  alt = "",
  previewAnchor = false,
  className,
}: {
  name: string;
  alt?: string;
  previewAnchor?: boolean;
  className?: string;
}) {
  const image = useSiteImage(name);
  const src = resolveGastronomyDiningImageSrc(name, image.src);
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      id={previewAnchor ? siteImageAnchorId(name) : undefined}
      data-site-image={name}
      draggable={false}
    />
  );
}

function ArrowDownIcon() {
  return (
    <svg width="14" height="16" viewBox="0 0 14 16" aria-hidden="true">
      <path d="M7 15 1 8.5h3.5V1h5v7.5H13L7 15Z" fill="currentColor" />
    </svg>
  );
}

export function GastronomySpringsDesignPage() {
  const pageRef = useRef<HTMLElement>(null);
  const { pages } = useWebsiteText();
  const gastronomy = pages.gastronomy;
  const hero = GASTRONOMY_PAGE.hero;

  const [projectActive, setProjectActive] = useState(0);
  const [captionsActive, setCaptionsActive] = useState(0);
  const [sliderActive, setSliderActive] = useState(0);
  const [balconPin, setBalconPin] = useState<number | null>(null);

  const onCaptionsActive = useCallback((i: number) => setCaptionsActive(i), []);
  const onSliderActive = useCallback((i: number) => setSliderActive(i), []);

  useGastronomySpringsScroll(pageRef, onCaptionsActive, onSliderActive);

  const projectSlides = useMemo(
    () =>
      gastronomy.venues.slice(0, 3).map((venue, i) => ({
        title: venue.title,
        text: venue.description,
        image: ["gastronomy-plate-1", "gastronomy-plate-2", "gastronomy-plate-3"][i] ?? "gastronomy-plate-1",
      })),
    [gastronomy.venues],
  );

  const captionPanels = useMemo(
    () => [
      { image: "gastronomy-hero", preview: true },
      { image: "gastronomy-restaurant" },
      { image: "gastronomy-courses" },
      { image: "gastronomy-wine" },
      { image: "gastronomy-chef" },
    ],
    [],
  );

  const captionBodies = useMemo(
    () => [gastronomy.intro[0], gastronomy.restaurantService, gastronomy.atmosphere, gastronomy.intro[1], gastronomy.closing],
    [gastronomy],
  );

  const sliderSlides = useMemo(
    () => [
      { text: gastronomy.intro[0], image: "gastronomy-table" },
      { text: gastronomy.restaurantService, image: "gastronomy-service" },
    ],
    [gastronomy],
  );

  const balconPins = useMemo(
    () =>
      gastronomy.venues.map((venue, i) => ({
        ...venue,
        left: ["32%", "49.4%", "62%", "38%"][i] ?? "50%",
        top: ["22%", "51%", "68%", "38%"][i] ?? "50%",
      })),
    [gastronomy.venues],
  );

  return (
    <section ref={pageRef} className="gastronomy-springs-page de-section section ui-dark-background">
      {/* ── INTRO ── */}
      <div
        className="ui-dark ui-background de-intro sticky sticky--full-height sticky--under-next sticky--under-next:lg-up"
        id="de-intro"
      >
        <div className="de-anchor" id="de-intro-next" />
        <div className="sticky__layer sticky__layer--sticky sticky--full-height">
          <div className="de-intro__content px-layout py-layout p-relative">
            <div className="de-intro__background background background--bottom background--cover" data-gs-intro-bg>
              <DiningImg name="gastronomy-hero" previewAnchor />
              <div className="de-intro__gradient">
                <div />
              </div>
            </div>

            <div className="de-intro__caption p-relative">
              <div className="de-intro__caption-title is-hidden--md-down">
                <h1 className="g1 leading-trim mt-0.5 mt-0:lg">{hero.title}</h1>
              </div>
              <a className="btn de-intro__next btn--outline btn--square btn--sm is-hidden--sm-down" href="#de-intro-next">
                <span className="btn__content">
                  <span className="btn__icon">
                    <ArrowDownIcon />
                  </span>
                </span>
              </a>
              <div className="de-intro__caption-subtitle">
                <p className="h3 leading-trim text-right text-left:lg">
                  {hero.secondTitle}
                  <br />
                  {hero.subtitle}
                </p>
              </div>
            </div>
          </div>

          <div className="de-intro__text">
            <div className="row pl-layout pl-0:lg">
              <div className="col col--md-6 ui-dark ui-background px-layout py-layout pt-1:md pb-2:md">
                <div data-gs-intro-text-inner>
                  <h3 className="h3 leading-trim">{gastronomy.intro[0]}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SPIRAL ── */}
      <div className="ui-dark ui-background de-spiral sticky sticky:lg-up sticky--under-next sticky--under-previous" id="de-spiral">
        <div className="sticky__layer sticky__layer--sticky sticky--full-height">
          <div className="de-spiral__gradient ui-background background background--cover">
            <div /><div /><div /><div />
          </div>
          <div className="de-spiral__background background background--cover flicker-fix" data-gs-spiral-bg>
            <DiningImg name="gastronomy-table" />
          </div>
          <div className="de-spiral__caption col col--md-10 mx-auto text-center px-layout pb-2 pb-0:md p-relative">
            <div className="de-spiral__uptitle">
              <span className="text-c1 leading-trim">{gastronomy.atmosphereTitle}</span>
            </div>
            <div className="de-spiral__title">
              <h2 className="h1 leading-trim">{gastronomy.atmosphere}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* ── PROJECTS ── */}
      <div className="ui-dark ui-background de-projects sticky sticky--under-previous sticky--under-previous:lg-up sticky--under-next sticky--under-next:lg-up" id="de-projects">
        <div className="sticky__layer sticky__layer--sticky sticky--full-height">
          <div className="de-projects__background background background--cover">
            <DiningImg name="gastronomy-restaurant" />
          </div>
          <div className="de-projects__text">
            <div className="row pl-layout pl-0:lg">
              <div className={`col col--md-6 ui-light ui-background pb-1 p-relative de-projects__slider-item ${projectActive === 0 ? "" : "is-hidden"}`}>
                <p className="h3 leading-trim de-projects__slider-item__text pl-layout pl-6:md py-layout pr-layout">
                  <strong>{projectSlides[0]?.title}</strong>
                  <br />
                  {projectSlides[0]?.text}
                </p>
              </div>
              <div className={`col col--md-6 ui-light ui-background pb-1 p-relative de-projects__slider-item ${projectActive === 1 ? "" : "is-hidden"}`}>
                <p className="h3 leading-trim de-projects__slider-item__text pl-layout pl-6:md py-layout pr-layout">
                  <strong>{projectSlides[1]?.title}</strong>
                  <br />
                  {projectSlides[1]?.text}
                </p>
              </div>
              <div className={`col col--md-6 ui-light ui-background pb-1 p-relative de-projects__slider-item ${projectActive === 2 ? "" : "is-hidden"}`}>
                <p className="h3 leading-trim de-projects__slider-item__text pl-layout pl-6:md py-layout pr-layout">
                  <strong>{projectSlides[2]?.title}</strong>
                  <br />
                  {projectSlides[2]?.text}
                </p>
              </div>
              <div className="de-projects__slider-item pt-1 pb-3 px-layout ui-background ui-light col col--md-6">
                <div className="de-projects__pagination row">
                  {projectSlides.map((slide, i) => (
                    <button
                      key={slide.title}
                      type="button"
                      className={`de-projects__thumb ${projectActive === i ? "is-active" : ""}`}
                      onClick={() => setProjectActive(i)}
                      aria-label={slide.title}
                    >
                      <DiningImg name={slide.image} alt={slide.title} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CAPTIONS (Fixed-Background Mask Reveal) ── */}
      <div className="ui-dark ui-background de-captions p-relative sticky sticky--under-previous sticky--under-previous:lg-up sticky--under-next sticky--under-next:lg-up js-captions-container" id="de-captions">
        <div className="sticky__layer sticky__layer--sticky sticky--full-height">
          <div className="de-captions__canvas background background--cover" data-gs-mask-stage>
            {captionPanels.map((panel) => (
              <div key={panel.image} data-gs-mask-panel className="background background--cover">
                <DiningImg name={panel.image} previewAnchor={panel.preview} />
              </div>
            ))}
          </div>
          <div className="de-captions__content">
            <div className="de-captions__content-title">
              <h3 className="h1 leading-trim">{gastronomy.restaurantTitle}</h3>
            </div>
            <div className="de-captions__content-text col col--md-3">
              <p className="leading-trim">{captionBodies[captionsActive] ?? gastronomy.intro[0]}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── BALCONS / VENUES ── */}
      <div className="p-relative ui-light ui-background de-balcons px-layout pt-1 pt-2:lg" id="de-balcons">
        <div className="mb-3">
          <h3 className="h0 leading-trim text-right">{gastronomy.restaurantTitle}</h3>
        </div>
        <div className="de-balcons__content-text col col--md-3 mb-1">
          <p className="leading-trim">{gastronomy.intro[1]}</p>
        </div>
        <div className="de-balcons__content p-relative ui-dark">
          <div className="parallax-image-move img-full">
            <DiningImg name="gastronomy-table" />
          </div>
          {balconPins.map((pin, i) => (
            <div
              key={pin.title}
              className={`de-balcons__pin ui-dark is-hidden--sm-down${balconPin === i ? " is-active" : ""}`}
              style={{ "--left": pin.left, "--top": pin.top } as CSSProperties}
              tabIndex={0}
              onMouseEnter={() => setBalconPin(i)}
              onMouseLeave={() => setBalconPin(null)}
              onFocus={() => setBalconPin(i)}
              onBlur={() => setBalconPin(null)}
            >
              <span className="btn de-balcons__pin-button btn--square btn--outline">
                <span className="btn__content">
                  <span className="btn__text">{i + 1}</span>
                </span>
              </span>
              <div className={`de-balcons__pin-tooltip px-0.5 pt-3 pb-layout pb-0.5:lg ui-dark ui-background ${balconPin === i ? "" : ""}`}>
                <p className="text-c2 leading-trim">
                  <strong>{pin.title}</strong> — {pin.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MATERIALS ── */}
      <div className="p-relative ui-light ui-background de-materials px-layout pb-1 pb-2:lg pt-1" id="de-materials">
        <div className="de-materials__uptitle">
          <span className="text-c1 leading-trim">{hero.subtitle}</span>
        </div>
        <div className="col col--xs-4 col--md-7 mb-7:lg">
          <h3 className="h1 leading-trim">{gastronomy.restaurantService}</h3>
        </div>
        <div className="de-materials__image">
          <DiningImg name="gastronomy-plate-1" className="img-full" />
        </div>
        <div className="de-materials__text ml-auto mr-0">
          <p className="leading-trim">{gastronomy.closing}</p>
        </div>
      </div>

      {/* ── SLIDER (Fixed-Background Mask Reveal) ── */}
      <div className="ui-light ui-background de-slider sticky sticky--full-height sticky--under-next sticky--under-next:lg-up is-hidden--sm-down" id="de-slider">
        <div className="sticky__layer sticky__layer--sticky sticky--full-height">
          <div className="de-slider__content row">
            <div className="de-slider__caption col col--md-4 ui-light px-layout py-layout p-relative">
              <div className="de-slider__scrollbar-container row">
                <div className="de-slider__caption__title text-right mr-0.5">
                  <h3 className="h3 leading-trim">
                    {hero.title}
                    <br />
                    {hero.secondTitle}
                  </h3>
                </div>
                <div className="de-slider__scrollbar mr-layout">
                  <div className="de-slider__scrollbar__progress" data-gs-scroll-progress />
                </div>
              </div>
              {sliderSlides.map((slide, i) => (
                <div key={slide.image} className={`de-slider__caption__text ${sliderActive === i ? "" : "is-hidden"}`}>
                  <p className="text-t1 leading-trim">{slide.text}</p>
                </div>
              ))}
            </div>
            <div className="de-slider__images col col--md-8 parallax-image-move">
              {sliderSlides.map((slide) => (
                <div key={slide.image} data-gs-slider-image className="background background--cover">
                  <DiningImg name={slide.image} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── GALLERY ── */}
      <div className="p-relative ui-dark ui-background de-gallery pb-3 sticky sticky:lg-up sticky--under-next" id="de-gallery">
        <div className="sticky__layer sticky__layer--sticky">
          <div>
            <div className="de-gallery__gradient background background--cover">
              <div /><div />
            </div>
            <div className="offset--xs-1 col--xs-3 col--md-9 offset--md-3 mb-3 text-right pr-layout p-relative pt-2.5 py-2:lg">
              <h2 className="h0 leading-trim">{gastronomy.closing}</h2>
            </div>
            <div className="row p-relative px-layout">
              <div className="col col--md-6 de-gallery__image">
                <DiningImg name="gastronomy-celebration" className="img-full parallax-image-move" />
                <div className="col col--md-3 de-gallery__col--no-stretch ml-2 pt-2 is-hidden--md-down">
                  <p className="leading-trim">{gastronomy.venues[0]?.description}</p>
                </div>
              </div>
              <div className="col col--md-6 de-gallery__image col--reverse mt-3 mt-0:lg">
                <DiningImg name="gastronomy-chef" className="img-full parallax-image-move" />
                <div className="col col--md-3 de-gallery__col--no-stretch ml-1 pb-3 is-hidden--md-down">
                  <p className="leading-trim">{gastronomy.venues[1]?.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FLATS 1 ── */}
      <div className="ui-dark de-flats de-flats--first de-flats--light sticky sticky--under-next sticky--under-next:lg-up" id="de-flats-1" data-gs-flat-reveal>
        <div className="sticky__layer sticky__layer--sticky sticky--full-height ui-light-background">
          <div className="de-flats__content ui-light-background px-layout py-1 p-relative">
            <div className="background background--cover">
              <DiningImg name="gastronomy-courses" />
            </div>
            <div className="de-flats__caption p-relative">
              <div className="de-flats__caption-title">
                <h2 className="g1 leading-trim mt-0.5 mt-0:lg text-right text-left:lg">{gastronomy.venues[0]?.title}</h2>
              </div>
              <div className="de-flats__caption-uptitle text-c1 leading-trim text-right text-left:lg mt-1">
                <span>{gastronomy.venues[1]?.title}</span>
              </div>
            </div>
          </div>
          <div className="de-flats__text col col--lg-6 mr-0 ml-auto ui-light px-layout py-layout is-hidden--md-down">
            <div className="de-flats__text-text">
              <p className="leading-trim">{gastronomy.atmosphere}</p>
            </div>
            {gastronomy.venues.slice(0, 4).map((venue) => (
              <div key={venue.title} className="de-flats__list-item py-0.5:lg">
                <p className="h3 leading-trim">{venue.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FLATS 2 / FINALE ── */}
      <div className="ui-dark de-flats sticky--under-previous sticky--under-previous:lg-up de-flats--dark sticky sticky--under-next sticky--under-next:lg-up" id="de-flats-2" data-gs-flat-reveal>
        <div className="sticky__layer sticky__layer--sticky sticky--full-height ui-dark-background">
          <div className="de-flats__content ui-dark-background px-layout py-1 p-relative">
            <div className="background background--cover">
              <DiningImg name="gastronomy-hero" />
            </div>
            <div className="de-flats__caption p-relative">
              <div className="de-flats__caption-title">
                <h2 className="g1 leading-trim mt-0.5 mt-0:lg text-right text-left:lg">{hero.title}</h2>
              </div>
              <div className="de-flats__caption-uptitle text-c1 leading-trim text-right text-left:lg mt-1">
                <span>{hero.secondTitle}</span>
              </div>
            </div>
          </div>
          <div className="de-flats__text col col--lg-6 mr-0 ml-auto ui-dark px-layout py-layout is-hidden--md-down">
            <div className="de-flats__text-text">
              <p className="leading-trim">{gastronomy.closing}</p>
            </div>
            <div className="gs-finale-actions">
              <BookNowTrigger className="btn btn-primary">Book Now</BookNowTrigger>
              <Link className="btn btn-secondary" href="/wellness">
                Wellness
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="de-flats__text ui-dark-background col col--lg-6 mr-0 ml-auto ui-dark px-layout pt-1 is-hidden--lg-up">
        <div className="de-flats__text-text mb-1 mb-2:lg p-relative">
          <p className="leading-trim">{gastronomy.closing}</p>
        </div>
        <div className="gs-finale-actions">
          <BookNowTrigger className="btn btn-primary">Book Now</BookNowTrigger>
          <Link className="btn btn-secondary" href="/wellness">
            Wellness
          </Link>
        </div>
      </div>
    </section>
  );
}
