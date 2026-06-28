"use client";

import { ScrollReveal } from "@/components/ui/ScrollReveal";

type TextBridgeProps = {
  headline: string;
  body: string;
};

export function TextBridge({ headline, body }: TextBridgeProps) {
  return (
    <section className="hathor-text-bridge" aria-label={headline}>
      <div className="hathor-container">
        <ScrollReveal>
          <div className="hathor-text-bridge__inner">
            <h2 className="hathor-text-bridge__headline">{headline}</h2>
            <p className="hathor-text-bridge__body">{body}</p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
