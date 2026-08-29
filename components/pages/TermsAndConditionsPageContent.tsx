import {
  TERMS_INTRO,
  TERMS_SECTIONS,
  TERMS_TOC,
  type TermsListItem,
  type TermsSection,
} from "@/lib/terms-and-conditions-content";
import { PUBLIC_CONTACT } from "@/lib/public-contact";
import { TermsPageToc } from "@/components/pages/TermsPageToc";

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

function TermsSectionBlock({ section }: { section: TermsSection }) {
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
            The client-supplied Terms &amp; Conditions state that this includes{" "}
            <strong>14% VAT and service charge</strong>.
          </p>
        ) : null}

        {section.paragraphsAfterList?.map((paragraph) => (
          <p key={paragraph} className="tc-section__p ce-meta-copy">
            {paragraph}
          </p>
        ))}

        {section.variant === "contact" ? (
          <address className="tc-contact">
            <p className="tc-contact__label ce-eyebrow">Head Office</p>
            <p className="tc-contact__line ce-meta-copy">
              One Kattameya, Tower No. 211, Floor No. 11
              <br />
              Ring Road, Nasr City
              <br />
              Cairo, Egypt
            </p>
            <p className="tc-contact__line ce-meta-copy">
              <span className="tc-contact__key">Telephone:</span>{" "}
              <a href={`tel:${PUBLIC_CONTACT.phone}`}>{PUBLIC_CONTACT.phoneDisplay}</a>
            </p>
            <p className="tc-contact__line ce-meta-copy">
              <span className="tc-contact__key">Email:</span>{" "}
              <a href={`mailto:${PUBLIC_CONTACT.email}`}>{PUBLIC_CONTACT.email}</a>
            </p>
            <p className="tc-contact__line ce-meta-copy">
              <span className="tc-contact__key">Website:</span>{" "}
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
export function TermsAndConditionsPageContent() {
  return (
    <article className="terms-editorial">
      <header className="tc-masthead">
        <div className="tc-masthead__grid">
          <div className="tc-masthead__title-block">
            <p className="ce-eyebrow">Guest Information</p>
            <h1 className="tc-title ce-display ce-display--l">Terms &amp; Conditions</h1>
          </div>
          <div className="tc-intro">
            {TERMS_INTRO.map((paragraph) => (
              <p key={paragraph} className="tc-intro__p ce-meta-copy">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </header>

      <div className="tc-stage">
        <div className="tc-body__toc-mobile">
          <TermsPageToc items={TERMS_TOC} layout="inline" />
        </div>

        <div className="tc-stage__layout">
          <aside className="tc-rail" aria-label="On this page">
            <TermsPageToc items={TERMS_TOC} layout="sidebar" />
          </aside>

          <div className="tc-document">
            {TERMS_SECTIONS.map((section) => (
              <TermsSectionBlock key={section.id} section={section} />
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
