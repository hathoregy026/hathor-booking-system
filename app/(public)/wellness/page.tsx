import Link from "next/link";
import { SiteContentPage } from "@/components/public/SiteContentPage";
import { SiteContentSection } from "@/components/public/SiteContentSection";
import { ScrollReveal } from "@/components/public/ScrollReveal";
import { ContentSection } from "@/app/generated/prisma/enums";
import { getSiteContentSection } from "@/lib/site-content";
import { Flower2, Sparkles, Sun, Waves } from "lucide-react";

export const revalidate = 3600;

const SERVICES = [
  {
    icon: Flower2,
    title: "Spa Treatments",
    text: "Rejuvenating therapies inspired by ancient Egyptian wellness rituals.",
  },
  {
    icon: Waves,
    title: "Massage",
    text: "Expert therapists offering Swedish, deep tissue, and aromatherapy sessions.",
  },
  {
    icon: Sun,
    title: "Yoga on Deck",
    text: "Sunrise sessions overlooking the Nile — balance body and mind.",
  },
  {
    icon: Sparkles,
    title: "Beauty Lounge",
    text: "Premium skincare and grooming services in our onboard lounge.",
  },
] as const;

export default async function WellnessPage() {
  const content = await getSiteContentSection(ContentSection.WELLNESS);

  return (
    <SiteContentPage
      title={content.title}
      subtitle={content.subtitle}
      breadcrumb="Wellness"
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
            <p className="lux-section-eyebrow">Restore & Renew</p>
            <h2 className="public-serif text-3xl font-medium">Wellness Services</h2>
            <div className="lux-gold-line" />
          </div>
        </ScrollReveal>
        <div className="lux-grid-2">
          {SERVICES.map((service, i) => {
            const Icon = service.icon;
            return (
              <ScrollReveal key={service.title} delay={i * 80}>
                <div className="lux-card lux-card--light flex h-full flex-col sm:flex-row sm:items-start sm:gap-6">
                  <div className="lux-card__icon shrink-0">
                    <Icon className="h-6 w-6" aria-hidden />
                  </div>
                  <div>
                    <h3 className="lux-card__title mt-0 sm:mt-0">{service.title}</h3>
                    <p className="lux-card__text">{service.text}</p>
                    <Link
                      href="/book"
                      className="public-btn-outline-gold mt-4 inline-flex py-2.5 text-xs text-[var(--lux-dark)]"
                    >
                      Enquire
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>
    </SiteContentPage>
  );
}
