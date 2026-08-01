"use client";

import { ManagedImage } from "@/components/ui/ManagedImage";

type Privilege = {
  title: string;
  body: string;
};

type CharterIntroductionProps = {
  overviewTitle?: string | null;
  overviewIntro?: string | null;
  benefitsIntro?: string | null;
  cta?: string | null;
};

type CharterPrivilegesProps = {
  benefits: Privilege[];
  intro?: string | null;
};

const EXPERIENCE_ITEMS = [
  {
    label: "Your Dates",
    body: "Travel according to your preferred season and schedule.",
  },
  {
    label: "Your Rhythm",
    body: "Spend longer at places that matter and move gently along the Nile.",
  },
  {
    label: "Your Occasion",
    body: "Family voyages, celebrations, reunions and private escapes.",
  },
] as const;

export function CharterIntroduction({
  overviewTitle,
  overviewIntro,
  benefitsIntro,
  cta,
}: CharterIntroductionProps) {
  const hasCustomTitle =
    Boolean(overviewTitle?.trim()) &&
    overviewTitle!.trim() !== "Charter Dahabiya Cruise";

  return (
    <section
      id="charter-introduction"
      className="charter-section charter-intro"
      aria-labelledby="charter-intro-heading"
    >
      <div className="charter-shell">
        <div className="charter-intro__grid" data-charter-reveal="">
          <div className="charter-index">
            <span className="charter-index__num">02</span>
            <span>A Private World</span>
          </div>

          <div className="charter-intro__heading-col">
            <h2 id="charter-intro-heading" className="charter-heading">
              {hasCustomTitle ? (
                overviewTitle
              ) : (
                <>
                  Charter your own{" "}
                  <em className="charter-heading__em">private sanctuary</em> on
                  the Nile.
                </>
              )}
            </h2>
            <hr className="charter-rule charter-rule--short" />
            <p className="charter-signature">Hathor Private Voyages</p>
          </div>

          <div className="charter-intro__body-col">
            {overviewIntro ? (
              <p className="charter-copy">{overviewIntro}</p>
            ) : (
              <p className="charter-copy">
                Turn your Nile journey into a private experience. Book the
                entire Dahabiya exclusively for your group.
              </p>
            )}
            {benefitsIntro ? (
              <p className="charter-copy">{benefitsIntro}</p>
            ) : null}
            {cta ? <p className="charter-micro">{cta}</p> : null}
            <p className="charter-micro">
              Created for families, friends, celebrations and extraordinary
              occasions.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CharterPrivileges({ benefits, intro }: CharterPrivilegesProps) {
  return (
    <section
      className="charter-section charter-privileges"
      aria-labelledby="charter-privileges-heading"
    >
      <div className="charter-shell">
        <header className="charter-privileges__header" data-charter-reveal="">
          <p className="charter-eyebrow">The Privilege of Privacy</p>
          <h2 id="charter-privileges-heading" className="charter-heading">
            An exclusive world,
            <br />
            composed for you.
          </h2>
          {intro ? <p className="charter-copy">{intro}</p> : null}
        </header>

        <ul className="charter-privileges__list">
          {benefits.map((benefit, index) => (
            <li
              key={benefit.title}
              className="charter-privilege"
              data-charter-reveal=""
            >
              <span className="charter-privilege__num">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="charter-privilege__title">{benefit.title}</h3>
                <p className="charter-privilege__body">{benefit.body}</p>
                <div className="charter-privilege__rule" aria-hidden="true" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function CharterEditorialImage() {
  return (
    <section
      className="charter-editorial"
      aria-labelledby="charter-editorial-heading"
    >
      <div
        id="site-image-charter"
        data-site-image="charter"
        className="charter-editorial__frame"
        data-charter-reveal=""
      >
        <ManagedImage
          name="charter"
          alt="Private dining under moonlight aboard Hathor Dahabiya"
          fill
          previewAnchor={false}
          sizes="(max-width: 768px) 100vw, 88vw"
          className="charter-editorial__img"
        />
        <div className="charter-editorial__veil" aria-hidden="true" />
        <div className="charter-editorial__copy">
          <h2 id="charter-editorial-heading" className="charter-editorial__title">
            An evening,
            <br />
            entirely your own.
          </h2>
          <p className="charter-editorial__body">
            Private dining, unhurried moments and the Nile after dark.
          </p>
          <p className="charter-editorial__caption">Hathor · Private Charter</p>
        </div>
      </div>
    </section>
  );
}

export function CharterExperienceBand() {
  return (
    <section
      className="charter-section charter-experience"
      aria-labelledby="charter-experience-heading"
    >
      <div className="charter-shell">
        <h2 id="charter-experience-heading" className="charter-sr-only">
          A bespoke charter experience
        </h2>
        <div className="charter-experience__grid" data-charter-reveal="">
          {EXPERIENCE_ITEMS.map((item) => (
            <article key={item.label} className="charter-experience__item">
              <p className="charter-experience__label">{item.label}</p>
              <p className="charter-experience__body">{item.body}</p>
            </article>
          ))}
        </div>
        <p className="charter-experience__statement" data-charter-reveal="">
          No two private voyages should feel the same.
        </p>
      </div>
    </section>
  );
}

export function CharterFinalCta() {
  return (
    <section className="charter-final" aria-labelledby="charter-final-heading">
      <div className="charter-final__media">
        <ManagedImage
          name="highlights-lifestyle"
          alt="Scenic Nile views from Hathor Dahabiya at golden hour"
          fill
          previewAnchor={false}
          sizes="100vw"
          className="charter-final__img"
        />
        <div className="charter-final__overlay" aria-hidden="true" />
      </div>

      <div className="charter-final__inner" data-charter-reveal="">
        <p className="charter-eyebrow charter-eyebrow--gold">
          A Journey Reserved for You
        </p>
        <h2 id="charter-final-heading" className="charter-heading charter-heading--light">
          The Nile,
          <br />
          exclusively yours.
        </h2>
        <p className="charter-copy charter-copy--light">
          Charter Hathor for the people, moments and memories that matter most.
        </p>
        <div className="charter-final__actions">
          <a href="#charter-request" className="charter-btn charter-btn--ivory">
            Request Your Charter
            <span className="charter-btn__arrow" aria-hidden="true">
              →
            </span>
          </a>
          <a href="/contact" className="charter-link">
            Speak With the Concierge
            <span className="charter-link__arrow" aria-hidden="true">
              →
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
