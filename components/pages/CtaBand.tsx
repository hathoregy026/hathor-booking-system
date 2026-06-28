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
      <div className="hathor-container">
        <ScrollReveal>
          <div className="lux-cta-band__decor" aria-hidden />
          <h2 className="lux-cta-band__title">{title}</h2>
          <p className="mx-auto mt-4 max-w-lg text-sm font-light text-[var(--lux-text-grey)]">
            {body}
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
