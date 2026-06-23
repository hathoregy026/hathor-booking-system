import { SiteContentPage } from "@/components/public/SiteContentPage";
import { SiteContentSection } from "@/components/public/SiteContentSection";
import { ContentSection } from "@/app/generated/prisma/enums";
import { getSiteContentSection } from "@/lib/site-content";

export const revalidate = 3600;

export default async function GastronomyPage() {
  const content = await getSiteContentSection(ContentSection.GASTRONOMY);

  return (
    <SiteContentPage title={content.title} subtitle={content.subtitle}>
      <SiteContentSection
        title={content.title}
        subtitle={content.subtitle}
        bodyText={content.bodyText}
        imageUrl={content.imageUrl}
        showHeading={false}
      />
    </SiteContentPage>
  );
}
