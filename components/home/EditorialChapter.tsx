"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export type EditorialPillar = {
  title: string;
  body: string;
};

type EditorialChapterProps = {
  id?: string;
  eyebrow: string;
  title: string;
  intro?: string;
  pillars: readonly EditorialPillar[];
  discoverHref: string;
  discoverLabel: string;
  variant?: "dark" | "dark-2";
};

export function EditorialChapter({
  id,
  eyebrow,
  title,
  intro,
  pillars,
  discoverHref,
  discoverLabel,
  variant = "dark",
}: EditorialChapterProps) {
  return (
    <section
      id={id}
      className={`owo-chapter owo-chapter--${variant}`}
    >
      <div className="hathor-container">
        <ScrollReveal>
          <header className="owo-chapter__header">
            <h2 className="owo-chapter__title">{title}</h2>
            <p className="owo-eyebrow">{eyebrow}</p>
            {intro ? <p className="owo-chapter__intro">{intro}</p> : null}
          </header>
        </ScrollReveal>

        <div className="owo-pillars">
          {pillars.map((pillar, index) => (
            <ScrollReveal key={pillar.title} delay={index * 100}>
              <article className="owo-pillar">
                <h3 className="owo-pillar__title">{pillar.title}</h3>
                <p className="owo-pillar__body">{pillar.body}</p>
              </article>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={200}>
          <Link href={discoverHref} className="owo-discover cursor-hover">
            <span>{discoverLabel}</span>
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
