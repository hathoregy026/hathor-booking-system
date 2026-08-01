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
      className="ch-intro"
      aria-labelledby="charter-intro-heading"
    >
      <div className="lux-ed-shell">
        <div className="lux-ed-grid ch-intro__grid">
          <aside className="lux-ed-rail ch-intro__rail" data-charter-reveal="">
            <span className="lux-ed-rail__num">02</span>
            <span>A Private World</span>
            <hr className="lux-ed-rule lux-ed-rule--gold ch-intro__rail-rule" />
            <span>Exclusive · Invitation only</span>
          </aside>

          <div className="ch-intro__statement" data-charter-reveal="">
            <h2 id="charter-intro-heading" className="lux-ed-title ch-intro__title">
              {hasCustomTitle ? (
                overviewTitle
              ) : (
                <>
                  Charter your own{" "}
                  <em className="ch-intro__em">private sanctuary</em>
                  <br />
                  on the eternal river.
                </>
              )}
            </h2>
            <p className="lux-ed-script ch-intro__script">composed entirely around you</p>
          </div>

          <div className="ch-intro__body" data-charter-reveal="">
            {overviewIntro ? (
              <p className="lux-ed-copy">{overviewIntro}</p>
            ) : (
              <p className="lux-ed-copy">
                Turn your Nile journey into a private experience. Book the
                entire Dahabiya exclusively for your group.
              </p>
            )}
            {benefitsIntro ? (
              <p className="lux-ed-copy">{benefitsIntro}</p>
            ) : null}
            {cta ? <p className="ch-intro__micro">{cta}</p> : null}
            <p className="ch-intro__micro">
              Created for families, friends, celebrations and extraordinary
              occasions.
            </p>
          </div>

          <div className="ch-intro__detail" data-charter-reveal="">
            <div className="lux-ed-frame ch-intro__frame">
              <ManagedImage
                name="charter"
                alt="Private moments aboard Hathor Dahabiya"
                fill
                sizes="(max-width: 768px) 70vw, 28vw"
                className="object-cover"
                previewAnchor={false}
              />
            </div>
            <p className="ch-intro__caption">Detail · The vessel at rest</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CharterPrivileges({ benefits, intro }: CharterPrivilegesProps) {
  return (
    <section
      className="ch-privileges"
      aria-labelledby="charter-privileges-heading"
      data-charter-privileges=""
    >
      <div className="lux-ed-shell">
        <header className="ch-privileges__head" data-charter-reveal="">
          <p className="lux-ed-label">The Privilege of Privacy</p>
          <h2 id="charter-privileges-heading" className="lux-ed-title">
            An exclusive world,
            <br />
            composed for you.
          </h2>
          {intro ? <p className="lux-ed-copy">{intro}</p> : null}
        </header>

        <div className="ch-privileges__stage">
          <div className="ch-privileges__media" data-charter-privilege-media="">
            <div className="lux-ed-frame ch-privileges__frame">
              <ManagedImage
                name="charter-hero"
                alt="Hathor Dahabiya — private charter vessel"
                fill
                sizes="(max-width: 1024px) 100vw, 48vw"
                className="ch-privileges__img"
                previewAnchor={false}
              />
            </div>
            <div className="ch-privileges__progress" aria-hidden="true">
              <span data-charter-privilege-progress="" />
            </div>
          </div>

          <ul className="ch-privileges__list">
            {benefits.map((benefit, index) => (
              <li
                key={benefit.title}
                className="ch-privilege"
                data-charter-privilege=""
                data-index={index}
              >
                <span className="ch-privilege__bg" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="ch-privilege__num">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="ch-privilege__copy">
                  <h3 className="ch-privilege__title">{benefit.title}</h3>
                  <hr className="lux-ed-rule lux-ed-rule--short lux-ed-rule--gold" />
                  <p className="lux-ed-copy">{benefit.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function CharterEditorialImage() {
  return (
    <section
      className="ch-dining"
      aria-labelledby="charter-editorial-heading"
      data-charter-dining=""
    >
      <div className="lux-ed-shell">
        <div className="lux-ed-grid ch-dining__grid">
          <div
            id="site-image-charter"
            data-site-image="charter"
            className="ch-dining__media"
            data-charter-dining-media=""
          >
            <div className="ch-dining__frame">
              <ManagedImage
                name="charter"
                alt="Private dining under moonlight aboard Hathor Dahabiya"
                fill
                previewAnchor={false}
                sizes="(max-width: 768px) 100vw, 62vw"
                className="ch-dining__img"
              />
              <div className="ch-dining__veil" aria-hidden="true" />
            </div>
            <p className="ch-dining__meta">After dark · Private table</p>
          </div>

          <div className="ch-dining__type" data-charter-dining-type="">
            <p className="lux-ed-label">Evening Ritual</p>
            <h2 id="charter-editorial-heading" className="lux-ed-display ch-dining__title">
              An evening,
              <br />
              entirely
              <br />
              your own.
            </h2>
            <p className="lux-ed-script ch-dining__script">under Nile moonlight</p>
            <p className="lux-ed-copy">
              Private dining, unhurried moments and the river after dark —
              shaped only for your party.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CharterExperienceBand() {
  return (
    <section
      className="ch-experience"
      aria-labelledby="charter-experience-heading"
    >
      <div className="lux-ed-shell">
        <h2 id="charter-experience-heading" className="lux-ed-sr">
          A bespoke charter experience
        </h2>
        <div className="lux-ed-grid ch-experience__grid" data-charter-reveal="">
          {EXPERIENCE_ITEMS.map((item, i) => (
            <article key={item.label} className="ch-experience__item">
              <span className="ch-experience__idx" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="ch-experience__label">{item.label}</p>
              <hr className="lux-ed-rule lux-ed-rule--short" />
              <p className="lux-ed-copy">{item.body}</p>
            </article>
          ))}
        </div>
        <p className="ch-experience__statement" data-charter-reveal="">
          No two private voyages should feel the same.
        </p>
      </div>
    </section>
  );
}

export function CharterFinalCta() {
  return (
    <section className="ch-final" aria-labelledby="charter-final-heading">
      <div className="ch-final__media">
        <ManagedImage
          name="highlights-lifestyle"
          alt="Quiet Nile waters awaiting a private Hathor charter"
          fill
          previewAnchor={false}
          sizes="100vw"
          className="ch-final__img"
        />
        <div className="ch-final__overlay" aria-hidden="true" />
      </div>

      <div className="lux-ed-shell ch-final__inner" data-charter-reveal="">
        <div className="lux-ed-grid ch-final__grid">
          <div className="ch-final__rail">
            <span className="lux-ed-rail__num">08</span>
            <span className="lux-ed-label lux-ed-label--gold">Ownership of the Journey</span>
          </div>
          <div className="ch-final__copy">
            <h2 id="charter-final-heading" className="lux-ed-display ch-final__title">
              The Nile,
              <br />
              exclusively yours.
            </h2>
            <p className="lux-ed-copy lux-ed-copy--light">
              Charter Hathor for the people, moments and memories that matter
              most — a voyage held entirely in your name.
            </p>
            <div className="ch-final__actions">
              <a href="#charter-request" className="lux-ed-btn lux-ed-btn--ivory">
                Request Your Charter
                <span className="lux-ed-btn__arrow" aria-hidden="true">→</span>
              </a>
              <a href="/contact" className="lux-ed-link" style={{ color: "rgba(245,239,228,0.85)" }}>
                Speak With the Concierge
                <span className="lux-ed-link__arrow" aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
