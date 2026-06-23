import { BookingWizard } from "@/components/booking/BookingWizard";
import { SiteContentSection } from "@/components/public/SiteContentSection";
import {
  getContentBySection,
  getDefaultSiteContent,
  getSiteContent,
} from "@/lib/site-content";
import { ContentSection } from "@/app/generated/prisma/enums";

export const revalidate = 3600;

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

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-6 sm:px-6 sm:pt-10 lg:px-8">
      <div className="mb-6 space-y-3 text-center sm:mb-10">
        <p
          className="text-xs font-semibold uppercase tracking-[0.2em]"
          style={{ color: "var(--booking-muted)" }}
        >
          Ultra Luxury Dahabiya Cruise
        </p>
        <h1 className="booking-serif text-2xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
          {hero.title}
        </h1>
        {hero.subtitle && (
          <p
            className="mx-auto max-w-2xl text-sm leading-relaxed sm:text-base"
            style={{ color: "var(--booking-muted)" }}
          >
            {hero.subtitle}
          </p>
        )}
      </div>

      <div id="booking">
        <BookingWizard heroImageUrl={hero.imageUrl ?? null} />
      </div>

      <div className="mt-12 space-y-8 sm:mt-20 sm:space-y-12">
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
    </div>
  );
}
