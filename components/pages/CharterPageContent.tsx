"use client";

import { MarketingCtaBand } from "@/components/pages/MarketingCtaBand";
import { InquiryForm } from "@/components/pages/InquiryForm";
import { PageScrollTransition } from "@/components/pages/PageScrollTransition";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { useWebsiteText } from "@/components/public/WebsiteTextProvider";
import { CHARTER_PAGE } from "@/lib/page-content";

export function CharterPageContent() {
  const { pages } = useWebsiteText();
  const charter = pages.charter;

  return (
    <PageScrollTransition
      title={CHARTER_PAGE.hero.title}
      secondTitle={CHARTER_PAGE.hero.secondTitle}
      subtitle={CHARTER_PAGE.hero.subtitle}
      breadcrumb="Charter"
      imageName="charter-hero"
      heroPage="charter"
    >

      <section className="hathor-section hathor-section--dark">
        <div className="page-container">
          <div className="grid gap-12 lg:grid-cols-2">
            <ScrollReveal>
              <div>
                <h2 className="section-title typo-page-title">{charter.overviewTitle}</h2>
                <div className="hathor-gold-line hathor-gold-line--left" />
                <p className="section-body typo-body-text">{charter.overviewIntro}</p>
                <p className="section-body typo-body-text mt-4">
                  {charter.benefitsIntro}
                </p>
                <ul className="mt-6 space-y-3">
                  {charter.benefits.map((benefit) => (
                    <li key={benefit} className="hathor-feature-card">
                      <p className="section-body typo-body-text">{benefit}</p>
                    </li>
                  ))}
                </ul>
                <p className="section-body typo-body-text mt-8 font-medium">
                  {charter.cta}
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
              <h3 className="section-title typo-page-title text-2xl">Your Private Itinerary</h3>
              <p className="section-indication typo-page-subtitle">Route Options</p>
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
        <div className="page-container">
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
