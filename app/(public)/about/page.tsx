import { SiteContentPage } from "@/components/public/SiteContentPage";
import { SiteContentSection } from "@/components/public/SiteContentSection";
import { ScrollReveal } from "@/components/public/ScrollReveal";
import { ContentSection } from "@/app/generated/prisma/enums";
import { getSiteContentSection } from "@/lib/site-content";
import { Anchor, Compass, Heart, Sparkles } from "lucide-react";

export const revalidate = 3600;

const VALUES = [
  { icon: Anchor, title: "Heritage", text: "Honoring Egypt's timeless river traditions with modern luxury." },
  { icon: Heart, title: "Hospitality", text: "Warm, attentive service that anticipates your every need." },
  { icon: Compass, title: "Discovery", text: "Curated excursions to ancient temples and hidden gems." },
  { icon: Sparkles, title: "Excellence", text: "Uncompromising standards in every detail of your voyage." },
] as const;

export default async function AboutPage() {
  const content = await getSiteContentSection(ContentSection.ABOUT);

  return (
    <SiteContentPage
      title={content.title}
      subtitle={content.subtitle}
      breadcrumb="About"
      darkHero
    >
      <SiteContentSection
        title={content.title}
        subtitle={content.subtitle}
        bodyText={content.bodyText}
        imageUrl={content.imageUrl}
        showHeading={false}
      />

      <section className="mt-16">
        <ScrollReveal>
          <div className="lux-section-header">
            <p className="lux-section-eyebrow">Our Values</p>
            <h2 className="public-serif text-3xl font-medium">What We Stand For</h2>
            <div className="lux-gold-line" />
          </div>
        </ScrollReveal>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((value, i) => {
            const Icon = value.icon;
            return (
              <ScrollReveal key={value.title} delay={i * 80}>
                <div className="lux-card lux-card--light h-full text-center">
                  <div className="lux-card__icon mx-auto">
                    <Icon className="h-6 w-6" aria-hidden />
                  </div>
                  <h3 className="lux-card__title">{value.title}</h3>
                  <p className="lux-card__text">{value.text}</p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>
    </SiteContentPage>
  );
}
