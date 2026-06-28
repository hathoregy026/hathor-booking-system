import type { Metadata } from "next";
import Link from "next/link";
import { SITE_VIEW_INDEX } from "@/lib/site-view-index";
import "./site-index.css";

export const metadata: Metadata = {
  title: "Site Viewing Index | Hathor",
  description: "Local preview index for all Hathor website pages.",
  robots: { index: false, follow: false },
};

export default function SiteIndexPage() {
  return (
    <div className="site-index">
      <header className="site-index__header">
        <p className="site-index__eyebrow">Local preview</p>
        <h1 className="site-index__title">Hathor site index</h1>
        <p className="site-index__lead">
          Open any page below in Edge while running{" "}
          <code className="site-index__code">npm run dev</code> — no deploy
          needed to review changes.
        </p>
      </header>

      <main className="site-index__main">
        {SITE_VIEW_INDEX.map((section) => (
          <section key={section.id} className="site-index__section">
            <div className="site-index__section-head">
              <h2 className="site-index__section-title">{section.title}</h2>
              <p className="site-index__section-desc">{section.description}</p>
            </div>
            <ul className="site-index__list">
              {section.links.map((link) => (
                <li key={`${section.id}-${link.href}`}>
                  <Link href={link.href} className="site-index__link">
                    <span className="site-index__link-label">{link.label}</span>
                    <span className="site-index__link-path">{link.href}</span>
                  </Link>
                  {link.note ? (
                    <p className="site-index__link-note">{link.note}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>

      <footer className="site-index__footer">
        <p>
          Bookmark this page:{" "}
          <Link href="/site-index" className="site-index__footer-link">
            /site-index
          </Link>
        </p>
      </footer>
    </div>
  );
}
