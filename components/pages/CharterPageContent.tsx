"use client";

import { MarketingCtaBand } from "@/components/pages/MarketingCtaBand";
import { InquiryForm } from "@/components/pages/InquiryForm";
import { PageScrollTransition } from "@/components/pages/PageScrollTransition";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { CHARTER_PAGE } from "@/lib/page-content";

export function CharterPageContent() {
  return (
    <PageScrollTransition
      title={CHARTER_PAGE.hero.title}
      subtitle={CHARTER_PAGE.hero.subtitle}
      breadcrumb="Charter"
      imageName="charter-hero"
    >

      <section className="hathor-section hathor-section--dark">
        <div className="hathor-container">
          <div className="grid gap-12 lg:grid-cols-2">
            <ScrollReveal>
              <div>
                <h2 className="hathor-section-title">{CHARTER_PAGE.overview.title}</h2>
                <div className="hathor-gold-line hathor-gold-line--left" />
                <p className="hathor-body-text">{CHARTER_PAGE.overview.intro}</p>
                <p className="hathor-body-text mt-4">
                  {CHARTER_PAGE.overview.benefitsIntro}
                </p>
                <ul className="mt-6 space-y-3">
                  {CHARTER_PAGE.overview.benefits.map((benefit) => (
                    <li key={benefit} className="hathor-feature-card">
                      <p className="hathor-body-text">{benefit}</p>
                    </li>
                  ))}
                </ul>
                <p className="hathor-body-text mt-8 font-medium">
                  {CHARTER_PAGE.overview.cta}
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={120}>
              <div
                id="site-image-charter"
                data-site-image="charter"
                className="hathor-editorial__image-wrap hathor-editorial__image-wrap--tall"
              >
                <ManagedImage
                  name="charter"
                  alt="Private charter aboard Hathor Dahabiya"
                  fill
                  previewAnchor={false}
                  className="hathor-editorial__image object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal>
            <div className="mt-12">
              <p className="hathor-section-eyebrow">Route Options</p>
              <h3 className="hathor-section-title text-2xl">Your Private Itinerary</h3>
              <div className="hathor-gold-line hathor-gold-line--left" />
              <div className="mt-6 flex flex-wrap gap-3">
                {CHARTER_PAGE.overview.routes.map((route) => (
                  <span key={route} className="hathor-route-chip">
                    {route}
                  </span>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="hathor-section hathor-section--dark-2">
        <div className="hathor-container">
          <div className="mx-auto max-w-2xl">
            <ScrollReveal>
              <InquiryForm
                type="charter"
                title="Charter Request"
                intro="Tell us about your group and preferred dates — we will craft a personalized offer."
                submitLabel="Send Request"
                showCharterFields
              />
            </ScrollReveal>
          </div>
        </div>
      </section>

      <MarketingCtaBand
        title="The Nile, Exclusively Yours"
        body="Charter the entire Hathor Dahabiya for your family, friends, or celebration."
      />
    </PageScrollTransition>
  );
}
