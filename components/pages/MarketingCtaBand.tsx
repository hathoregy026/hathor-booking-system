"use client";

import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { useWebsiteText } from "@/components/public/WebsiteTextProvider";
import { normalizeOptionalText } from "@/lib/website-text-shared";

type MarketingCtaBandProps = {
  title?: string;
  body?: string;
  ctaLabel?: string;
};

const FALLBACK_TITLE = "Ready to Embark on Your Journey?";
const FALLBACK_BODY =
  "Reserve your place aboard Hathor Dahabiya and discover the Nile as it was meant to be experienced.";

/**
 * Public marketing CTA with a wired Book Now action (opens booking modal).
 * Defaults come from WebsiteText `home.cta` (shared across marketing pages).
 */
export function MarketingCtaBand({
  title,
  body,
  ctaLabel = "Book Now",
}: MarketingCtaBandProps) {
  const { home } = useWebsiteText();
  const resolvedTitle =
    normalizeOptionalText(title) ??
    normalizeOptionalText(home.cta.title) ??
    FALLBACK_TITLE;
  const resolvedBody =
    normalizeOptionalText(body) ??
    normalizeOptionalText(home.cta.body) ??
    FALLBACK_BODY;

  return (
    <section className="lux-cta-band">
      <div className="page-container">
        <ScrollReveal>
          <div className="section-header" style={{ minWidth: 0 }}>
            <h2 className="section-title typo-page-title lux-cta-band__title">
              {resolvedTitle}
            </h2>
            <p
              className="section-body typo-body-text"
              style={{ overflowWrap: "anywhere" }}
            >
              {resolvedBody}
            </p>
          </div>
          <div className="mt-2 flex justify-center">
            <BookNowTrigger className="btn btn-primary">{ctaLabel}</BookNowTrigger>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
