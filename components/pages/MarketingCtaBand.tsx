"use client";

import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

type MarketingCtaBandProps = {
  title?: string;
  body?: string;
  ctaLabel?: string;
};

/** Public marketing CTA with a wired Book Now action (opens booking modal). */
export function MarketingCtaBand({
  title = "Ready to Embark on Your Journey?",
  body = "Reserve your place aboard Hathor Dahabiya and discover the Nile as it was meant to be experienced.",
  ctaLabel = "Book Now",
}: MarketingCtaBandProps) {
  return (
    <section className="lux-cta-band">
      <div className="hathor-container">
        <ScrollReveal>
          <div className="lux-cta-band__decor" aria-hidden />
          <h2 className="lux-cta-band__title">{title}</h2>
          <p className="mx-auto mt-4 max-w-lg text-sm font-light text-[var(--lux-text-grey)]">
            {body}
          </p>
          <div className="mt-8">
            <BookNowTrigger className="public-btn-gold">
              {ctaLabel}
            </BookNowTrigger>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
