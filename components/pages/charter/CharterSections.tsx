"use client";

import { ManagedImage } from "@/components/ui/ManagedImage";

type Privilege = { title: string; body: string };

type CharterIntroductionProps = {
  overviewTitle?: string | null;
  overviewIntro?: string | null;
};

type CharterPrivilegesProps = {
  benefits: Privilege[];
};

const PRIVILEGE_TITLES = [
  "Complete Privacy",
  "Dedicated Service",
  "A Voyage at Your Rhythm",
  "An Itinerary of Your Own",
] as const;

export function CharterIntroduction({
  overviewTitle,
  overviewIntro,
}: CharterIntroductionProps) {
  const custom =
    Boolean(overviewTitle?.trim()) &&
    overviewTitle!.trim() !== "Charter Dahabiya Cruise";

  return (
    <section
      id="charter-introduction"
      className="ch-open"
      aria-labelledby="charter-intro-heading"
    >
      <div className="lx-shell">
        <div className="lx-grid ch-open__grid">
          <div className="ch-open__text" data-ch-reveal="">
            <p className="lx-label">Private Charter</p>
            <h2 id="charter-intro-heading" className="lx-title ch-open__title">
              {custom ? (
                overviewTitle
              ) : (
                <>
                  <span className="lx-mask" data-ch-open-line="">
                    <span>A private vessel.</span>
                  </span>
                  <span className="lx-mask" data-ch-open-line="">
                    <span>
                      A journey shaped{" "}
                      <em className="ch-open__em">entirely around you.</em>
                    </span>
                  </span>
                </>
              )}
            </h2>
            <p className="lx-copy ch-open__copy" data-ch-reveal="">
              {overviewIntro ||
                "Turn your Nile journey into a private experience. Book the entire Dahabiya exclusively for your group."}
            </p>
          </div>
          <div className="ch-open__media" data-ch-curtain="">
            <ManagedImage
              name="charter-hero"
              alt="Private deck and pools aboard Hathor Dahabiya"
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover"
              previewAnchor={false}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export function CharterPrivileges({ benefits }: CharterPrivilegesProps) {
  const items = benefits.map((b, i) => ({
    title: b.title || PRIVILEGE_TITLES[i] || b.title,
    body: b.body,
  }));

  return (
    <section
      className="ch-priv"
      aria-labelledby="charter-privileges-heading"
      data-ch-priv=""
    >
      <div className="lx-shell">
        <h2 id="charter-privileges-heading" className="lx-sr">
          Charter privileges
        </h2>
        <div className="ch-priv__stage">
          <div className="ch-priv__media-col">
            <div className="ch-priv__media" data-ch-priv-media="">
              <ManagedImage
                name="charter-hero"
                alt="Hathor Dahabiya — private charter"
                fill
                sizes="(max-width: 1024px) 100vw, 56vw"
                className="ch-priv__img object-cover"
                previewAnchor={false}
              />
              <div className="ch-priv__progress" aria-hidden="true">
                <span data-ch-priv-progress="" />
              </div>
            </div>
          </div>
          <ul className="ch-priv__list">
            {items.map((item, index) => (
              <li
                key={item.title}
                className="ch-priv__item"
                data-ch-priv-item=""
                data-index={index}
              >
                <span className="ch-priv__num">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="ch-priv__title">{item.title}</h3>
                <p className="lx-copy">{item.body}</p>
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
    <section className="ch-night" aria-labelledby="charter-night-heading" data-ch-night="">
      <div className="ch-night__media" data-ch-night-media="">
        <ManagedImage
          name="charter"
          alt="Private dining under moonlight aboard Hathor"
          fill
          sizes="100vw"
          className="object-cover"
          id="site-image-charter"
        />
        <div className="ch-night__shade" aria-hidden="true" />
      </div>
      <div className="lx-shell ch-night__copy" data-ch-night-copy="">
        <h2 id="charter-night-heading" className="lx-title ch-night__title">
          Evenings,{" "}
          <em className="ch-open__em">entirely your own.</em>
        </h2>
        <p className="lx-copy lx-copy--light">
          Private dining, unhurried conversation and the Nile after dark.
        </p>
      </div>
    </section>
  );
}

export function CharterFinalCta() {
  return (
    <section className="ch-close" aria-labelledby="charter-final-heading">
      <div className="ch-close__media" data-ch-close-media="">
        <ManagedImage
          name="about-hero"
          alt="Sunset on the Nile from Hathor Dahabiya"
          fill
          sizes="100vw"
          className="object-cover"
          previewAnchor={false}
        />
        <div className="ch-close__shade" aria-hidden="true" />
      </div>
      <div className="lx-shell ch-close__inner" data-ch-reveal="">
        <h2 id="charter-final-heading" className="lx-display ch-close__title">
          The Nile,
          <br />
          exclusively yours.
        </h2>
        <p className="lx-copy lx-copy--light">
          Charter Hathor for the people and moments that matter most.
        </p>
        <a href="#charter-request" className="lx-btn lx-btn--ivory">
          Request Your Charter
        </a>
      </div>
    </section>
  );
}
