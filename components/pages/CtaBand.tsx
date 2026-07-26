"use client";

import { ScrollReveal } from "@/components/ui/ScrollReveal";

type CtaBandProps = {
  title?: string;
  body?: string;
};

export function CtaBand({
  title = "Ready to Embark on Your Journey?",
  body = "Reserve your place aboard Hathor Dahabiya and discover the Nile as it was meant to be experienced.",
}: CtaBandProps) {
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
        </ScrollReveal>
      </div>
    </section>
  );
}
