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
        <li key={`${item.emphasis ?? item.text}-${index}`} className="tc-list__item">
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
        <span className="tc-section__num" aria-hidden>
          {String(section.number).padStart(2, "0")}
        </span>
        <h2 id={`${section.id}-heading`} className="tc-section__title">
          {section.title}
        </h2>
        <span className="tc-section__rule" aria-hidden />
      </header>

      <div className="tc-section__body">
        {section.paragraphs?.map((paragraph) => (
          <p key={paragraph} className="tc-section__p">
            {paragraph}
          </p>
        ))}

        {section.list ? <TermsList items={section.list} /> : null}

        {section.variant === "vat-note" ? (
          <p className="tc-section__p">
            The client-supplied Terms &amp; Conditions state that this includes{" "}
            <strong>14% VAT and service charge</strong>.
          </p>
        ) : null}

        {section.paragraphsAfterList?.map((paragraph) => (
          <p key={paragraph} className="tc-section__p">
            {paragraph}
          </p>
        ))}

        {section.variant === "contact" ? (
          <address className="tc-contact">
            <p className="tc-contact__label">Head Office</p>
            <p className="tc-contact__line">
              One Kattameya, Tower No. 211, Floor No. 11
              <br />
              Ring Road, Nasr City
              <br />
              Cairo, Egypt
            </p>
            <p className="tc-contact__line">
              <span className="tc-contact__key">Telephone:</span>{" "}
              <a href={`tel:${PUBLIC_CONTACT.phone}`}>{PUBLIC_CONTACT.phoneDisplay}</a>
            </p>
            <p className="tc-contact__line">
              <span className="tc-contact__key">Email:</span>{" "}
              <a href={`mailto:${PUBLIC_CONTACT.email}`}>{PUBLIC_CONTACT.email}</a>
            </p>
            <p className="tc-contact__line">
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
 * Terms & Conditions — bright symmetric policy ledger (LuxuryHathor DNA).
 */
export function TermsAndConditionsPageContent() {
  return (
    <article className="terms-editorial">
      <div className="tc-shell">
        <header className="tc-masthead tc-masthead__reveal">
          <div className="tc-masthead__frame">
            <p className="tc-eyebrow">Guest Information</p>
            <h1 className="tc-title">Terms &amp; Conditions</h1>
            <span className="tc-masthead__ornament" aria-hidden />
          </div>
          <div className="tc-intro">
            {TERMS_INTRO.map((paragraph) => (
              <p key={paragraph} className="tc-intro__p">
                {paragraph}
              </p>
            ))}
          </div>
        </header>

        <div className="tc-body">
          <div className="tc-body__toc-mobile">
            <TermsPageToc items={TERMS_TOC} layout="inline" />
          </div>

          <div className="tc-body__layout">
            <aside className="tc-body__aside" aria-label="Section index">
              <div className="tc-index-card">
                <TermsPageToc items={TERMS_TOC} layout="sidebar" />
              </div>
            </aside>

            <div className="tc-document">
              <div className="tc-document__inner">
                {TERMS_SECTIONS.map((section) => (
                  <TermsSectionBlock key={section.id} section={section} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
