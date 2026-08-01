"use client";

import { AwImage } from "@/components/pages/awards/AwImage";
import { CE_IMG } from "@/lib/awards-cinema-media";

export function CharterReveal() {
  return (
    <section className="ch-reveal" aria-label="The Hathor">
      <p className="ce-label" data-ce-line="">
        The Hathor
      </p>
      <h1 className="ch-reveal__title">
        <span className="ch-reveal__line1 ce-display" data-ce-line="">
          Your Floating
        </span>
        <span className="ch-reveal__line2 ce-italic" data-ce-line="">
          Palace.
        </span>
      </h1>
      <div className="ch-reveal__media ce-img-frame">
        <div className="luxury-image" data-ce-image="">
          <AwImage
            src={CE_IMG.ship}
            alt="Luxury vessel on the Nile"
            priority
            sizes="80vw"
          />
        </div>
      </div>
    </section>
  );
}

const SPECS = [
  {
    value: 240,
    label: "Feet of Pure Elegance",
    icon: (
      <svg viewBox="0 0 28 28" aria-hidden="true">
        <path d="M4 20 L14 6 L24 20" />
        <path d="M8 20 H20" />
      </svg>
    ),
  },
  {
    value: 24,
    label: "Royal Suites",
    icon: (
      <svg viewBox="0 0 28 28" aria-hidden="true">
        <rect x="6" y="10" width="16" height="12" />
        <path d="M10 10 V7 H18 V10" />
      </svg>
    ),
  },
  {
    value: 45,
    label: "Crew Members",
    icon: (
      <svg viewBox="0 0 28 28" aria-hidden="true">
        <circle cx="14" cy="10" r="4" />
        <path d="M6 22 C6 17 10 15 14 15 C18 15 22 17 22 22" />
      </svg>
    ),
  },
  {
    value: 5,
    label: "Star Service",
    icon: (
      <svg viewBox="0 0 28 28" aria-hidden="true">
        <path d="M14 4 L16.5 11 H24 L18 15.5 L20.5 23 L14 18.5 L7.5 23 L10 15.5 L4 11 H11.5 Z" />
      </svg>
    ),
  },
] as const;

export function CharterSpecs() {
  return (
    <section className="ch-specs" aria-label="Specifications" data-ch-specs="">
      <div className="ch-specs__grid">
        {SPECS.map((spec) => (
          <div key={spec.label} className="ch-spec" data-ce-reveal="">
            <span className="ch-spec__icon">{spec.icon}</span>
            <p
              className="ch-spec__value ce-display"
              data-ch-count=""
              data-target={spec.value}
            >
              0
            </p>
            <p className="ch-spec__label">{spec.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const SUITES = [
  {
    src: CE_IMG.suite,
    name: "Royal Suite",
    size: "45 m² · River View",
    body: "A sanctuary of calm with panoramic Nile light — composed for unhurried mornings and absolute privacy.",
    price: "From $7,000 / night",
  },
  {
    src: CE_IMG.suite2,
    name: "Grand Terrace Suite",
    size: "55 m² · Upper Deck",
    body: "Expansive terrace living above the water — soft gold at dawn, desert stars at dusk.",
    price: "From $7,000 / night",
  },
  {
    src: CE_IMG.suite3,
    name: "Owner’s Cabin",
    size: "70 m² · Full Privacy",
    body: "The most intimate quarters aboard — designed for hosts who require stillness without compromise.",
    price: "From $7,000 / night",
  },
] as const;

export function CharterSuites() {
  return (
    <section className="ch-suites" aria-label="The Suites" data-ch-suites="">
      <div className="ch-suites__runway">
        <div className="ch-suites__pin" data-ch-suites-pin="">
          <div className="ch-suites__track" data-ch-suites-track="">
            {SUITES.map((suite) => (
              <article key={suite.name} className="ch-suites__slide">
                <div className="ch-suites__media">
                  <div className="luxury-image" data-ce-image="" style={{ position: "absolute", inset: 0 }}>
                    <AwImage
                      src={suite.src}
                      alt={suite.name}
                      sizes="(max-width: 1023px) 100vw, 55vw"
                    />
                  </div>
                </div>
                <div className="ch-suites__copy">
                  <h2 className="ch-suites__name ce-display">{suite.name}</h2>
                  <p className="ch-suites__size">{suite.size}</p>
                  <p className="ch-suites__body">{suite.body}</p>
                  <p className="ch-suites__price ce-display">{suite.price}</p>
                  <a href="#charter-request" className="ce-btn ce-btn--ghost">
                    View Suite Details
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function CharterInvite() {
  return (
    <section className="ch-invite" aria-labelledby="ch-invite-title">
      <h2 id="ch-invite-title" className="ch-invite__title ce-display" data-ce-reveal="">
        Begin Your Legacy
      </h2>
      <p className="ch-invite__sub" data-ce-reveal="">
        Spaces are strictly limited to ensure an intimate, bespoke experience.
        Secure your private passage today.
      </p>
      <div data-ce-reveal="">
        <a href="#charter-request" className="ce-btn">
          Reserve Your Voyage
        </a>
      </div>
    </section>
  );
}
