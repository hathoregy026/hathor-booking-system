import Link from "next/link";
import { BedDouble, ConciergeBell, UtensilsCrossed } from "lucide-react";
import { HeroScrollIndicator } from "@/components/public/PublicHeader";
import { ScrollReveal } from "@/components/public/ScrollReveal";
import { SiteContentSection } from "@/components/public/SiteContentSection";
import { TestimonialsCarousel } from "@/components/public/TestimonialsCarousel";
import { HATHOR_CRUISES } from "@/lib/hathor-catalog";
import { formatPrice } from "@/lib/client-dates";
import {
  getContentBySection,
  getDefaultSiteContent,
  getSiteContent,
} from "@/lib/site-content";
import { ContentSection } from "@/app/generated/prisma/enums";

export const revalidate = 3600;

const HERO_FALLBACK =
  "linear-gradient(135deg, #0a0a0a 0%, #2a2218 45%, #1a1408 100%)";

const CRUISE_CARD_BG =
  "linear-gradient(135deg, #2a2218 0%, #5c4a2e 50%, #1a1a1a 100%)";

const FEATURES = [
  {
    icon: BedDouble,
    title: "Luxury Cabins",
    text: "Elegantly appointed suites with panoramic Nile views, premium linens, and bespoke amenities.",
  },
  {
    icon: UtensilsCrossed,
    title: "Gourmet Dining",
    text: "Exquisite Egyptian and international cuisine crafted by our executive chef aboard ship.",
  },
  {
    icon: ConciergeBell,
    title: "Personalized Service",
    text: "Dedicated butler service and intimate guest experiences tailored to your every desire.",
  },
] as const;

export default async function Home() {
  let allContent;

  try {
    allContent = await getSiteContent();
  } catch (error) {
    console.error("Home page failed to load site content:", error);
    allContent = getDefaultSiteContent();
  }

  const hero = getContentBySection(allContent, ContentSection.HERO);
  const about = getContentBySection(allContent, ContentSection.ABOUT);
  const itineraries = getContentBySection(allContent, ContentSection.ITINERARIES);
  const rooms = getContentBySection(allContent, ContentSection.ROOMS);
  const wellness = getContentBySection(allContent, ContentSection.WELLNESS);
  const gastronomy = getContentBySection(allContent, ContentSection.GASTRONOMY);

  const heroBg = hero.imageUrl
    ? { backgroundImage: `url(${hero.imageUrl})` }
    : { background: HERO_FALLBACK };

  const previewCruises = HATHOR_CRUISES.slice(0, 3);

  return (
    <>
      <section className="lux-hero">
        <div className="lux-hero__bg" style={heroBg} />
        <div className="lux-hero__overlay" />
        <div className="lux-hero__content">
          <p className="lux-hero__eyebrow">Ultra Luxury Dahabiya</p>
          <h1 className="lux-hero__title">
            {hero.title || "Luxury Cruises on the Nile"}
          </h1>
          <p className="lux-hero__subtitle">
            {hero.subtitle ||
              "Experience timeless elegance aboard Hathor Dahabiya — Egypt's most exclusive river cruise."}
          </p>
          <div className="lux-hero__actions">
            <Link href="/book" className="public-btn-gold">
              Book Your Journey
            </Link>
            <Link href="/cruises" className="public-btn-outline-gold">
              Explore Cruises
            </Link>
          </div>
        </div>
        <HeroScrollIndicator />
      </section>

      <section id="discover" className="lux-section lux-section--cream">
        <div className="lux-container">
          <ScrollReveal>
            <div className="lux-section-header">
              <p className="lux-section-eyebrow">The Hathor Experience</p>
              <h2 className="lux-section-title">Unparalleled Luxury</h2>
              <div className="lux-gold-line" />
            </div>
          </ScrollReveal>
          <div className="lux-grid-3">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <ScrollReveal key={feature.title} delay={i * 100}>
                  <div className="lux-card lux-card--light h-full text-center">
                    <div className="lux-card__icon mx-auto">
                      <Icon className="h-6 w-6" aria-hidden />
                    </div>
                    <h3 className="lux-card__title">{feature.title}</h3>
                    <p className="lux-card__text">{feature.text}</p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="lux-section lux-section--dark">
        <div className="lux-container">
          <ScrollReveal>
            <div className="lux-section-header">
              <p className="lux-section-eyebrow">Curated Journeys</p>
              <h2 className="lux-section-title">Our Exclusive Cruises</h2>
              <div className="lux-gold-line" />
            </div>
          </ScrollReveal>
          <div className="lux-grid-3">
            {previewCruises.map((cruise, i) => (
              <ScrollReveal key={cruise.slug} delay={i * 100}>
                <article className="lux-cruise-card h-full">
                  <div
                    className="lux-cruise-card__image"
                    style={{ background: CRUISE_CARD_BG }}
                  >
                    <span className="lux-cruise-card__badge">
                      {cruise.nights} Nights
                    </span>
                  </div>
                  <div className="lux-cruise-card__body">
                    <h3 className="lux-cruise-card__name">{cruise.name}</h3>
                    <p className="mt-2 text-sm font-light text-[var(--lux-text-grey)]">
                      {cruise.ports}
                    </p>
                    <p className="lux-cruise-card__price">
                      from {formatPrice(cruise.basePriceCents)}
                    </p>
                    <Link
                      href="/cruises"
                      className="public-btn-outline-gold mt-4 inline-flex w-full justify-center py-3 text-xs"
                    >
                      View Details
                    </Link>
                  </div>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <TestimonialsCarousel backgroundImage={hero.imageUrl} />

      <section className="lux-cta-band">
        <div className="lux-container">
          <ScrollReveal>
            <div className="lux-cta-band__decor" aria-hidden />
            <h2 className="lux-cta-band__title">
              Ready to Embark on Your Journey?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm font-light text-[var(--lux-text-grey)]">
              Reserve your place aboard Hathor Dahabiya and discover the Nile
              as it was meant to be experienced.
            </p>
            <Link href="/book" className="public-btn-gold mt-8 inline-flex">
              Book Now
            </Link>
          </ScrollReveal>
        </div>
      </section>

      <section className="lux-section lux-section--beige">
        <div className="lux-container space-y-10 sm:space-y-14">
          <SiteContentSection
            title={itineraries.title}
            subtitle={itineraries.subtitle}
            bodyText={itineraries.bodyText}
            imageUrl={itineraries.imageUrl}
            imagePosition="left"
          />
          <SiteContentSection
            title={rooms.title}
            subtitle={rooms.subtitle}
            bodyText={rooms.bodyText}
            imageUrl={rooms.imageUrl}
          />
          <SiteContentSection
            title={wellness.title}
            subtitle={wellness.subtitle}
            bodyText={wellness.bodyText}
            imageUrl={wellness.imageUrl}
            imagePosition="left"
          />
          <SiteContentSection
            title={gastronomy.title}
            subtitle={gastronomy.subtitle}
            bodyText={gastronomy.bodyText}
            imageUrl={gastronomy.imageUrl}
          />
          <SiteContentSection
            title={about.title}
            subtitle={about.subtitle}
            bodyText={about.bodyText}
            imageUrl={about.imageUrl}
            imagePosition="left"
          />
        </div>
      </section>
    </>
  );
}
