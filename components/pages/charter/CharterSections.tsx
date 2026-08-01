"use client";

import { ManagedImage } from "@/components/ui/ManagedImage";
import {
  CHARTER_CHAPTER_MEDIA,
  type CharterChapterMedia,
} from "@/lib/charter-chapters";

type Privilege = { title: string; body: string };

type CharterPrivilegesProps = {
  benefits: Privilege[];
};

const PRIVILEGE_TITLES = [
  "Complete Privacy",
  "Dedicated Service",
  "Your Own Rhythm",
  "A Voyage Created Around You",
] as const;

export function CharterPrivileges({ benefits }: CharterPrivilegesProps) {
  const items = benefits.map((b, i) => ({
    title: b.title || PRIVILEGE_TITLES[i] || b.title,
    body: b.body,
  }));

  const mediaSlides: CharterChapterMedia[] = items.map(
    (_, index) =>
      CHARTER_CHAPTER_MEDIA[index] ??
      CHARTER_CHAPTER_MEDIA[CHARTER_CHAPTER_MEDIA.length - 1]!,
  );

  return (
    <section
      className="ch-chapters"
      aria-labelledby="charter-chapters-heading"
      data-ch-chapters=""
    >
      <div className="lx-shell">
        <header className="ch-chapters__head" data-ch-reveal="">
          <p className="lx-label">Private Chapters</p>
          <h2 id="charter-chapters-heading" className="lx-title ch-chapters__heading">
            Ownership of
            <br />
            the vessel.
          </h2>
        </header>

        <div className="ch-chapters__stage">
          <div className="ch-chapters__media-col">
            <div className="ch-chapters__media" data-ch-chapters-media="">
              {mediaSlides.map((meta, index) => (
                <div
                  key={meta.slot}
                  className="ch-chapters__slide"
                  data-ch-chapter-slide=""
                  data-index={index}
                  id={index === 0 ? `site-image-${meta.slot}` : undefined}
                  data-site-image={meta.slot}
                >
                  <ManagedImage
                    name={meta.slot}
                    alt={meta.alt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 56vw"
                    className="ch-chapters__img object-cover"
                    loading={index === 0 ? "eager" : "lazy"}
                    previewAnchor={false}
                    style={{ objectPosition: meta.objectPosition }}
                  />
                </div>
              ))}
              <div className="ch-chapters__progress" aria-hidden="true">
                <span data-ch-chapters-progress="" />
              </div>
            </div>
          </div>

          <ul className="ch-chapters__list">
            {items.map((item, index) => (
              <li
                key={item.title}
                className="ch-chapters__item"
                data-ch-chapter-item=""
                data-index={index}
              >
                <span className="ch-chapters__num">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="ch-chapters__title">{item.title}</h3>
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
          Evenings,
          <br />
          <em className="ch-night__em">entirely your own.</em>
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
