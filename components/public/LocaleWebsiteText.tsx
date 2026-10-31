import type { ReactNode } from "react";
import { WebsiteTextProvider } from "@/components/public/WebsiteTextProvider";
import { localizeWebsiteText } from "@/lib/i18n/website-text-it";
import type { PublicLocale } from "@/lib/i18n/locale";
import { loadPublicCmsBundle } from "@/lib/public-cms-bundle";

/**
 * Gives a translated page its own dashboard text: the live English with the
 * language's translated sections laid over it. Nested inside the public
 * layout's provider, so only this page's content reads it — English pages,
 * the header and the footer are untouched.
 */
export async function LocaleWebsiteText({
  locale,
  children,
}: {
  locale: PublicLocale;
  children: ReactNode;
}) {
  if (locale === "en") return <>{children}</>;
  const cms = await loadPublicCmsBundle();
  return (
    <WebsiteTextProvider
      initial={localizeWebsiteText(cms.websiteText, locale)}
      initialMobile={localizeWebsiteText(cms.websiteTextMobile, locale)}
    >
      {children}
    </WebsiteTextProvider>
  );
}
