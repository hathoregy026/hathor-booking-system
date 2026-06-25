import { SiteContentPage } from "@/components/public/SiteContentPage";
import { SiteContentSection } from "@/components/public/SiteContentSection";
import { ScrollReveal } from "@/components/public/ScrollReveal";
import { ContentSection } from "@/app/generated/prisma/enums";
import { getSiteContentSection } from "@/lib/site-content";

export const revalidate = 3600;

const MENU_HIGHLIGHTS = [
  {
    name: "Nile Sunset Degustation",
    description: "A five-course tasting menu inspired by ancient Egyptian flavors, served on the sun deck.",
    price: "Included",
  },
  {
    name: "Royal Breakfast",
    description: "Fresh pastries, Egyptian foul, seasonal fruits, and champagne upon request.",
    price: "Included",
  },
  {
    name: "Chef's Table",
    description: "An intimate dining experience with our executive chef — seasonal ingredients, Nile views.",
    price: "On request",
  },
] as const;

export default async function GastronomyPage() {
  const content = await getSiteContentSection(ContentSection.GASTRONOMY);

  return (
    <SiteContentPage
      title={content.title}
      subtitle={content.subtitle}
      breadcrumb="Gastronomy"
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
            <p className="lux-section-eyebrow">Culinary Artistry</p>
            <h2 className="public-serif text-3xl font-medium">Signature Experiences</h2>
            <div className="lux-gold-line" />
          </div>
        </ScrollReveal>
        <div className="grid gap-6 md:grid-cols-3">
          {MENU_HIGHLIGHTS.map((dish, i) => (
            <ScrollReveal key={dish.name} delay={i * 100}>
              <article className="lux-card lux-card--light h-full">
                <h3 className="public-serif text-xl font-medium">{dish.name}</h3>
                <p className="mt-3 text-sm font-light italic leading-relaxed text-[var(--public-muted)]">
                  {dish.description}
                </p>
                <p className="mt-4 text-sm font-medium tracking-wide text-[var(--lux-gold)]">
                  {dish.price}
                </p>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </section>
    </SiteContentPage>
  );
}
