import type {
  TermsListItem,
  TermsSection,
} from "@/lib/terms-and-conditions-content";
import { PUBLIC_CONTACT } from "@/lib/public-contact";
import { TermsPageToc } from "@/components/pages/TermsPageToc";
import type { PublicLocale } from "@/lib/i18n/locale";
import { TERMS_COPY, type TermsCopy } from "@/lib/i18n/terms-copy";

function TermsList({ items }: { items: readonly TermsListItem[] }) {
  return (
    <ul className="tc-list">
      {items.map((item, index) => (
        <li key={`${item.emphasis ?? item.text}-${index}`} className="tc-list__item ce-meta-copy">
          {item.emphasis ? <strong>{item.emphasis}</strong> : null}
          {item.text}
        </li>
      ))}
    </ul>
  );
}

function TermsSectionBlock({ section, t }: { section: TermsSection; t: TermsCopy }) {
  return (
    <section
      id={section.id}
      className="tc-section"
      aria-labelledby={`${section.id}-heading`}
    >
      <header className="tc-section__head">
        <span className="tc-section__num ce-edit" aria-hidden>
          {String(section.number).padStart(2, "0")}
        </span>
        <h2 id={`${section.id}-heading`} className="tc-section__title ce-display">
          {section.title}
        </h2>
      </header>

      <div className="tc-section__body">
        {section.paragraphs?.map((paragraph) => (
          <p key={paragraph} className="tc-section__p ce-meta-copy">
            {paragraph}
          </p>
        ))}

        {section.list ? <TermsList items={section.list} /> : null}

        {section.variant === "vat-note" ? (
          <p className="tc-section__p ce-meta-copy">
            {t.vatNote[0]}
            <strong>{t.vatNote[1]}</strong>
            {t.vatNote[2]}
          </p>
        ) : null}

        {section.paragraphsAfterList?.map((paragraph) => (
          <p key={paragraph} className="tc-section__p ce-meta-copy">
            {paragraph}
          </p>
        ))}

        {section.variant === "contact" ? (
          <address className="tc-contact">
            <p className="tc-contact__label ce-eyebrow">{t.headOffice}</p>
            <p className="tc-contact__line ce-meta-copy">
              {t.address[0]}
              <br />
              {t.address[1]}
              <br />
              {t.address[2]}
            </p>
            <p className="tc-contact__line ce-meta-copy">
              <span className="tc-contact__key">{t.telephone}</span>{" "}
              <a href={`tel:${PUBLIC_CONTACT.phone}`}>{PUBLIC_CONTACT.phoneDisplay}</a>
            </p>
            <p className="tc-contact__line ce-meta-copy">
              <span className="tc-contact__key">{t.email}</span>{" "}
              <a href={`mailto:${PUBLIC_CONTACT.email}`}>{PUBLIC_CONTACT.email}</a>
            </p>
            <p className="tc-contact__line ce-meta-copy">
              <span className="tc-contact__key">{t.website}</span>{" "}
              <a href="https://www.hathorcruise.com/">https://www.hathorcruise.com/</a>
            </p>
          </address>
        ) : null}
      </div>
    </section>
  );
}

/**
 * Terms & Conditions — Contact typography + full-width pinned index / scrolling document.
 */
export function TermsAndConditionsPageContent({
  locale = "en",
}: {
  locale?: PublicLocale;
}) {
  const t = TERMS_COPY[locale];
  const tocLabels = { label: t.tocLabel, title: t.tocTitle };
  return (
    <article className="terms-editorial">
      <header className="tc-masthead">
        <div className="tc-masthead__grid">
          <div className="tc-masthead__title-block">
            <p className="ce-eyebrow">{t.eyebrow}</p>
            <h1 className="tc-title ce-display ce-display--l">{t.title}</h1>
          </div>
          <div className="tc-intro">
            {t.intro.map((paragraph) => (
              <p key={paragraph} className="tc-intro__p ce-meta-copy">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </header>

      <div className="tc-stage">
        <div className="tc-body__toc-mobile">
          <TermsPageToc items={t.toc} layout="inline" labels={tocLabels} />
        </div>

        <div className="tc-stage__layout">
          <aside className="tc-rail" aria-label={t.tocLabel}>
            <TermsPageToc items={t.toc} layout="sidebar" labels={tocLabels} />
          </aside>

          <div className="tc-document">
            {t.sections.map((section) => (
              <TermsSectionBlock key={section.id} section={section} t={t} />
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
