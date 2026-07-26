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
      <div className="page-container">
        <ScrollReveal>
          <div className="section-header">
            <h2 className="section-title typo-page-title lux-cta-band__title">
              {title}
            </h2>
            <p className="section-body typo-body-text">{body}</p>
          </div>
          <div className="mt-2 flex justify-center">
            <BookNowTrigger className="btn btn-primary">{ctaLabel}</BookNowTrigger>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
