"use client";

import Image from "next/image";
import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { useGastronomyDiningScroll } from "@/hooks/useGastronomyDiningScroll";
import { GASTRONOMY_DINING_MEDIA as dining } from "@/lib/gastronomy-dining-media";

type WellnessImageProps = {
  src: string;
  alt: string;
  priority?: boolean;
};

function WellnessImage({ src, alt, priority = false }: WellnessImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes="100vw"
      className="wellness-editorial__image"
    />
  );
}

function ChapterTitle({ children }: { children: React.ReactNode }) {
  return <h2>{children}</h2>;
}

export function WellnessPageContent() {
  const rootRef = useRef<HTMLDivElement>(null);
  useGastronomyDiningScroll(rootRef);

  useLayoutEffect(() => {
    document.documentElement.setAttribute("data-wellness-editorial", "");
    return () => document.documentElement.removeAttribute("data-wellness-editorial");
  }, []);

  return (
    <div ref={rootRef} className="wellness-editorial">
      <div className="wellness-editorial__progress" aria-hidden="true">
        <i data-v6-progress />
      </div>

      <main>
        <section className="dining-hero" data-v6-scroll aria-labelledby="wellness-title">
          <div className="dining-hero__sticky">
            <figure className="dining-hero__layer dining-hero__layer--a">
              <WellnessImage src={dining.hero} alt="Hathor dining salon prepared for a restorative Nile evening" priority />
            </figure>
            <figure className="dining-hero__layer dining-hero__layer--b">
              <WellnessImage src={dining.table} alt="A quiet table aboard Hathor at dusk" />
            </figure>
            <figure className="dining-hero__layer dining-hero__layer--c">
              <WellnessImage src={dining.wine} alt="Golden details in Hathor's dining room" />
            </figure>
            <figure className="dining-hero__layer dining-hero__layer--d">
              <WellnessImage src={dining.chef} alt="Thoughtful service aboard Hathor" />
            </figure>
            <div className="dining-hero__veil" aria-hidden="true" />

            <div className="dining-hero__copy dining-hero__copy--open">
              <span>Seneb · private hours · Nile light</span>
              <h1 id="wellness-title">Wellness,<em>held by the river.</em></h1>
              <p>On Hathor, restoration begins with space: unhurried mornings, warm Egyptian rituals, and a horizon that asks nothing of you.</p>
            </div>
            <div className="dining-hero__copy dining-hero__copy--mid">
              <span>Ancient wisdom · modern ease</span>
              <ChapterTitle>Breath returns.<em>The Nile carries on.</em></ChapterTitle>
            </div>
            <div className="dining-hero__copy dining-hero__copy--end">
              <span>Enter Seneb</span>
              <ChapterTitle>Arrive softly.<em>Leave renewed.</em></ChapterTitle>
              <a className="btn btn-primary" href="#ritual">Begin the ritual</a>
            </div>
            <div className="wellness-editorial__edge">WELLNESS · HATHOR</div>
          </div>
        </section>

        <section id="ritual" className="dining-orbit" data-v6-scroll aria-labelledby="ritual-title">
          <div className="dining-orbit__sticky">
            <div className="dining-orbit__word" aria-hidden="true">SENEB</div>
            <figure className="dining-plate dining-plate--one"><WellnessImage src={dining.restaurant} alt="Quiet dining salon aboard Hathor" /></figure>
            <figure className="dining-plate dining-plate--two"><WellnessImage src={dining.courses} alt="Egyptian ingredients prepared with care" /></figure>
            <figure className="dining-plate dining-plate--three"><WellnessImage src={dining.wine} alt="A golden detail at blue hour" /></figure>
            <figure className="dining-plate dining-plate--four"><WellnessImage src={dining.chef} alt="Personal care and service aboard Hathor" /></figure>
            <div className="dining-orbit__copy">
              <span>Rituals of renewal</span>
              <ChapterTitle>Warmth settles.<em>Thoughts grow quiet.</em></ChapterTitle>
              <p>Fragrant oils, soft linen, and measured care create a private rhythm inspired by Egypt’s timeless devotion to body and spirit.</p>
            </div>
          </div>
        </section>

        <section className="dining-course" data-v6-scroll aria-labelledby="course-one-title">
          <div className="dining-course__sticky">
            <figure className="dining-course__bg dining-course__bg--1"><WellnessImage src={dining.table} alt="Hathor's serene interior in evening light" /></figure>
            <figure className="dining-course__bg dining-course__bg--2"><WellnessImage src={dining.experience} alt="A composed private moment aboard Hathor" /></figure>
            <figure className="dining-course__cutout"><WellnessImage src={dining.courses} alt="Botanical textures inspired by the Nile Valley" /></figure>
            <div className="dining-course__meta">
              <span>01 · Seneb Spa</span>
              <ChapterTitle><span id="course-one-title">A sanctuary</span><em>between two shores.</em></ChapterTitle>
              <p>Retreat from the day into a calm, intimate space where Egyptian botanicals and attentive hands restore ease.</p>
            </div>
          </div>
        </section>

        <section className="dining-course dining-course--reverse" data-v6-scroll aria-labelledby="course-two-title">
          <div className="dining-course__sticky">
            <figure className="dining-course__bg dining-course__bg--1"><WellnessImage src={dining.wine} alt="Nile evening reflected in fine glassware" /></figure>
            <figure className="dining-course__bg dining-course__bg--2"><WellnessImage src={dining.celebration} alt="Golden-hour atmosphere on Hathor" /></figure>
            <figure className="dining-course__cutout dining-course__cutout--right"><WellnessImage src={dining.hero} alt="Open views and soft light aboard Hathor" /></figure>
            <div className="dining-course__meta dining-course__meta--left">
              <span>02 · River rhythm</span>
              <ChapterTitle><span id="course-two-title">A horizon</span><em>that does the healing.</em></ChapterTitle>
              <p>Morning light, slow water, and a voyage paced by the Nile invite the nervous system to loosen its hold.</p>
            </div>
          </div>
        </section>

        <section className="dining-cascade" data-v6-scroll aria-labelledby="passage-title">
          <div className="dining-cascade__sticky">
            <header>
              <span>The passage of quiet</span>
              <ChapterTitle><span id="passage-title">Layer after</span><em>luminous layer.</em></ChapterTitle>
            </header>
            <div className="dining-cascade__stack">
              {[dining.hero, dining.table, dining.courses, dining.wine, dining.chef, dining.service].map((src, index) => (
                <figure key={src}><WellnessImage src={src} alt={`Hathor wellness atmosphere ${index + 1}`} /></figure>
              ))}
            </div>
          </div>
        </section>

        <section className="dining-wine" data-v6-scroll aria-labelledby="steam-title">
          <div className="dining-wine__sticky">
            <WellnessImage src={dining.wine} alt="A quiet golden-hour ritual aboard Hathor" />
            <div className="dining-wine__veil" aria-hidden="true" />
            <div className="dining-wine__copy">
              <span>Steam · stillness · discretion</span>
              <ChapterTitle><span id="steam-title">The ritual</span><em>belongs only to you.</em></ChapterTitle>
              <p>No crowded schedule and no hurried treatment list—only private care arranged around the way you wish to feel.</p>
            </div>
          </div>
        </section>

        <section className="dining-chef" data-v6-scroll aria-labelledby="fitness-title">
          <div className="dining-chef__sticky">
            <figure className="dining-chef__frame dining-chef__frame--back"><WellnessImage src={dining.service} alt="Discreet personal service aboard Hathor" /></figure>
            <figure className="dining-chef__frame dining-chef__frame--front"><WellnessImage src={dining.chef} alt="Personal attention in Hathor's private spaces" /></figure>
            <div className="dining-chef__copy">
              <span>Historia Fitness</span>
              <ChapterTitle><span id="fitness-title">Move gently.</span><em>Meet the morning.</em></ChapterTitle>
              <p>Stretch, train, and breathe with the Nile in view, then carry that lightness into the day’s discoveries.</p>
            </div>
          </div>
        </section>

        <section className="dining-course dining-course--last" data-v6-scroll aria-labelledby="last-light-title">
          <div className="dining-course__sticky">
            <figure className="dining-course__bg dining-course__bg--1"><WellnessImage src={dining.chef} alt="A calm private interior aboard Hathor" /></figure>
            <figure className="dining-course__bg dining-course__bg--2"><WellnessImage src={dining.celebration} alt="Last light across Hathor's deck" /></figure>
            <figure className="dining-course__cutout"><WellnessImage src={dining.table} alt="An intimate evening setting aboard Hathor" /></figure>
            <div className="dining-course__meta">
              <span>03 · Last light</span>
              <ChapterTitle><span id="last-light-title">Stillness</span><em>without a clock.</em></ChapterTitle>
              <p>As palms turn to silhouettes, the river keeps one final hour for rest, reflection, and a slower breath.</p>
            </div>
          </div>
        </section>

        <section id="reserve" className="dining-finale" data-v6-scroll aria-labelledby="reserve-title">
          <div className="dining-finale__sticky">
            <WellnessImage src={dining.hero} alt="Hathor glowing on the Nile at golden hour" />
            <div className="dining-finale__veil" aria-hidden="true" />
            <div className="dining-finale__copy">
              <span>Your private Nile sanctuary</span>
              <ChapterTitle><span id="reserve-title">Tell us how</span><em>you wish to arrive.</em></ChapterTitle>
              <p>Reserve a Hathor voyage and let Seneb Spa, Historia Fitness, and the quiet current shape your return to yourself.</p>
              <div className="dining-finale__actions">
                <BookNowTrigger className="btn btn-primary">Book Now</BookNowTrigger>
                <Link className="btn btn-secondary" href="/gastronomy">Explore Dining</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
