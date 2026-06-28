"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { HOMEPAGE_ACCOMMODATIONS } from "@/lib/homepage-content";
import { HOMEPAGE_BENTO_IMAGES } from "@/lib/homepage-sections";

export function AccommodationsBento() {
  return (
    <section className="owo-chapter owo-chapter--dark-2" id="accommodations">
      <div className="hathor-container">
        <ScrollReveal>
          <header className="owo-chapter__header">
            <p className="owo-eyebrow">Accommodations</p>
            <h2 className="owo-chapter__title">{HOMEPAGE_ACCOMMODATIONS.title}</h2>
            <p className="owo-chapter__intro">{HOMEPAGE_ACCOMMODATIONS.intro}</p>
          </header>
        </ScrollReveal>
      </div>

      <div className="owo-bento">
        {HOMEPAGE_ACCOMMODATIONS.cards.map((card, index) => (
          <ScrollReveal key={card.title} delay={index * 80}>
            <Link href={card.href} className="owo-bento__item cursor-hover group">
              <div className="owo-bento__image">
                <ManagedImage
                  name={HOMEPAGE_BENTO_IMAGES[index]}
                  alt={card.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="owo-bento__overlay" aria-hidden />
              </div>
              <div className="owo-bento__caption">
                <h3 className="owo-bento__title">{card.title}</h3>
                <p className="owo-bento__text">{card.description}</p>
              </div>
            </Link>
          </ScrollReveal>
        ))}
      </div>

      <div className="hathor-container">
        <ScrollReveal delay={120}>
          <Link href="/rooms" className="owo-discover cursor-hover">
            <span>Discover accommodations</span>
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
