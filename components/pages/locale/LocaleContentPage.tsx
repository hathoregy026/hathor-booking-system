import type { ReactNode } from "react";
import { LocaleWebsiteText } from "@/components/public/LocaleWebsiteText";
import { PageStructuredData } from "@/components/seo/PageStructuredData";
import { LOCALE_CRUMBS } from "@/lib/i18n/locale-pages";
import type { TranslatedLocale } from "@/lib/i18n/locale";
import type { LocalePage } from "@/lib/i18n/pages-seo";

/**
 * A translated content page: its structured data and breadcrumbs, then the
 * English page's own component with the language's dashboard text.
 */
export function LocaleContentPage({
  locale,
  page,
  image,
  plainText,
  children,
}: {
  locale: TranslatedLocale;
  page: LocalePage;
  image?: string;
  /** The page takes its words from its props, not from the dashboard text. */
  plainText?: boolean;
  children: ReactNode;
}) {
  return (
    <>
      <PageStructuredData
        path={page.path}
        name={page.name}
        description={page.description}
        breadcrumbs={[
          { name: LOCALE_CRUMBS[locale].home, path: `/${locale}` },
          { name: page.crumb, path: page.path },
        ]}
        image={image}
      />
      {plainText ? children : <LocaleWebsiteText locale={locale}>{children}</LocaleWebsiteText>}
    </>
  );
}
