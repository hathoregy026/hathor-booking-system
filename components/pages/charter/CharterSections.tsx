"use client";

import { AwImage } from "@/components/pages/awards/AwImage";
import { CE_IMG } from "@/lib/awards-cinema-media";

export function CharterReveal() {
  return (
    <section className="ch-reveal" aria-label="The Hathor">
      <p className="ce-label reveal-label mb-8" style={{ opacity: 0 }}>
        The Hathor
      </p>
      <h1 className="ch-reveal__h1 ce-serif">
        <span className="ch-reveal__mask">
          <span className="ch-reveal__line1 reveal-text">Your Floating</span>
        </span>
        <span className="ch-reveal__mask">
          <span className="ch-reveal__line2 reveal-text ce-italic">Palace.</span>
        </span>
      </h1>
      <div className="ch-reveal__media reveal-image">
        <AwImage
          src={CE_IMG.ship}
          alt="Luxury vessel on the Nile"
          priority
          sizes="(max-width: 1024px) 100vw, 64rem"
        />
      </div>
    </section>
  );
}

const SPECS = [
  { value: 240, label: "Feet of Pure Elegance" },
  { value: 24, label: "Royal Suites" },
  { value: 5, label: "Star Service" },
] as const;

export function CharterSpecs() {
  return (
    <section className="ch-specs" aria-label="Specifications" data-ch-specs="">
      <div className="ch-specs__grid">
        {SPECS.map((spec) => (
          <div key={spec.label} className="ch-spec">
            <span
              className="ch-spec__value ce-serif counter-anim"
              data-ch-count=""
              data-target={spec.value}
            >
              0
            </span>
            <span className="ch-spec__label">{spec.label}</span>
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
    <div aria-label="The Suites">
      {SUITES.map((suite) => (
        <section key={suite.name} className="ch-suite">
          <div className="ch-suite__media">
            <AwImage
              src={suite.src}
              alt={suite.name}
              sizes="(max-width: 767px) 100vw, 50vw"
            />
          </div>
          <div className="ch-suite__copy">
            <h2 className="ch-suite__name ce-serif">{suite.name}</h2>
            <p className="ch-suite__size">{suite.size}</p>
            <p className="ch-suite__body">{suite.body}</p>
            <p className="ch-suite__price ce-serif">{suite.price}</p>
            <a href="#charter-request" className="ce-btn-ghost">
              View Suite Details
            </a>
          </div>
        </section>
      ))}
    </div>
  );
}

export function CharterInvite() {
  return (
    <section className="ch-invite" aria-labelledby="ch-invite-title">
      <h2 id="ch-invite-title" className="ch-invite__title ce-serif">
        Begin Your Legacy.
      </h2>
      <p className="ce-body-copy ch-invite__sub">
        Spaces are strictly limited to ensure an intimate, bespoke experience.
        Secure your private passage today.
      </p>
      <a href="#charter-request" className="ce-btn">
        Reserve Your Voyage
      </a>
    </section>
  );
}
