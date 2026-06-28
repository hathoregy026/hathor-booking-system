"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { HOMEPAGE_SKETCH } from "@/lib/homepage-sections";

export function SketchSection() {
  return (
    <section className="hathor-sketch" aria-label={HOMEPAGE_SKETCH.headline}>
      <div className="hathor-container">
        <ScrollReveal>
          <header className="hathor-sketch__header">
            <h2 className="hathor-sketch__title">{HOMEPAGE_SKETCH.headline}</h2>
            <p className="hathor-sketch__intro">{HOMEPAGE_SKETCH.body}</p>
          </header>
        </ScrollReveal>

        <div className="hathor-sketch__grid">
          <ScrollReveal>
            <div className="hathor-sketch__visual">
              <ManagedImage
                name={HOMEPAGE_SKETCH.imageName}
                alt="Hathor Dahabiya sailing on the Nile — deck plan reference"
                fill
                className="object-contain object-left hathor-sketch__image"
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
            </div>
          </ScrollReveal>

          <ScrollReveal delay={120}>
            <nav className="hathor-sketch__links" aria-label="Explore Hathor">
              {HOMEPAGE_SKETCH.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="hathor-sketch__link cursor-hover"
                >
                  {link.label}
                  <span className="hathor-sketch__dash" aria-hidden>
                    —
                  </span>
                </Link>
              ))}
              <Link href="/cruises" className="owo-discover cursor-hover">
                <span>Discover Hathor</span>
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </nav>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
