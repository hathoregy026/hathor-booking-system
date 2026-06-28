"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";
import { useSiteImage } from "@/components/public/SiteImagesProvider";

const TESTIMONIALS = [
  {
    quote:
      "An absolutely magical journey. The Hathor Dahabiya exceeded every expectation — impeccable service, breathtaking views, and true luxury on the Nile.",
    name: "Sarah Mitchell",
    location: "London, UK",
  },
  {
    quote:
      "The most elegant way to experience Egypt. Every detail was curated to perfection, from gourmet dining to our beautifully appointed suite.",
    name: "James & Elena Torres",
    location: "Barcelona, Spain",
  },
  {
    quote:
      "A once-in-a-lifetime cruise. The intimate atmosphere and personalized attention made us feel like royalty sailing through ancient history.",
    name: "Dr. Amira Hassan",
    location: "Cairo, Egypt",
  },
] as const;

const HERO_PLACEHOLDER =
  "linear-gradient(135deg, #1a1a1a 0%, #3d2e1a 50%, #0a0a0a 100%)";

type TestimonialsCarouselProps = {
  backgroundImageName?: string;
};

export function TestimonialsCarousel({
  backgroundImageName = "home-testimonials-bg",
}: TestimonialsCarouselProps) {
  const managedBackground = useSiteImage(backgroundImageName);
  const background = managedBackground.src;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % TESTIMONIALS.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const current = TESTIMONIALS[index];
  const bgStyle = background
    ? { backgroundImage: `url(${background})` }
    : { background: HERO_PLACEHOLDER };

  return (
    <section className="lux-testimonials" style={bgStyle}>
      <div className="lux-testimonials__overlay" />
      <div className="lux-container relative z-10">
        <ScrollReveal>
          <div className="mx-auto max-w-3xl text-center">
            <div className="lux-stars justify-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" aria-hidden />
              ))}
            </div>
            <blockquote className="lux-testimonial-quote mt-6">
              &ldquo;{current.quote}&rdquo;
            </blockquote>
            <p className="mt-6 text-sm font-medium tracking-wide text-[var(--lux-gold)]">
              {current.name}
            </p>
            <p className="mt-1 text-xs font-light uppercase tracking-[0.15em] text-[var(--lux-text-grey)]">
              {current.location}
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() =>
                  setIndex((i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)
                }
                className="flex h-10 w-10 items-center justify-center border border-[rgb(201_169_110/0.4)] text-[var(--lux-gold)] transition-colors hover:border-[var(--lux-gold)]"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex gap-2">
                {TESTIMONIALS.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIndex(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === index
                        ? "w-6 bg-[var(--lux-gold)]"
                        : "w-1.5 bg-[var(--lux-text-grey)]"
                    }`}
                    aria-label={`Go to testimonial ${i + 1}`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => setIndex((i) => (i + 1) % TESTIMONIALS.length)}
                className="flex h-10 w-10 items-center justify-center border border-[rgb(201_169_110/0.4)] text-[var(--lux-gold)] transition-colors hover:border-[var(--lux-gold)]"
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
