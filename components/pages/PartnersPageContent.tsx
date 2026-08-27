"use client";

import Link from "next/link";
import "@/app/hathor-editorial-pages.css";
import { PageScrollTransition } from "@/components/pages/PageScrollTransition";
import { useWebsiteText } from "@/components/public/WebsiteTextProvider";
import { HOMEPAGE_PARTNERS } from "@/lib/homepage-content";
import { normalizeOptionalText } from "@/lib/website-text-shared";

export function PartnersPageContent() {
  const { pages } = useWebsiteText();
  const partners = pages.partners;
  const title = normalizeOptionalText(partners.title) ?? HOMEPAGE_PARTNERS.title;
  const lead =
    normalizeOptionalText(partners.lead) ??
    "We sail with trusted names in travel and hospitality, partners who share our care for the Nile and our guests.";

  return (
    <PageScrollTransition
      title={title}
      secondTitle="Trusted Worldwide"
      breadcrumb="Partners"
      imageName="about-hero"
      heroPage="partners"
      editorial
    >
      <main className="hathor-editorial-page hep-partners">
        <section className="hep-intro" aria-labelledby="partners-intro-title">
          <p className="hep-kicker">Our circle · Egypt and beyond</p>
          <h2 id="partners-intro-title" className="hep-title">
            Shared standards.<br />Singular journeys.
          </h2>
          <p className="hep-intro__copy">{lead}</p>
          <p className="hep-folio" aria-hidden="true">Hathor Cruise ® 2026</p>
        </section>

        <section className="hep-partners__ledger" aria-labelledby="partner-ledger-title">
          <header>
            <p className="hep-kicker">Trusted names</p>
            <h2 id="partner-ledger-title" className="hep-title">Our partners</h2>
          </header>
          <ol>
            {HOMEPAGE_PARTNERS.partners.map((partner, index) => (
              <li key={partner}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{partner}</p>
                <i aria-hidden="true">Hathor circle</i>
              </li>
            ))}
          </ol>
        </section>

        <section className="hep-closing" aria-labelledby="partner-closing-title">
          <p className="hep-kicker">Begin a conversation</p>
          <h2 id="partner-closing-title" className="hep-title">
            Travel, thoughtfully<br />connected.
          </h2>
          <p>
            For collaborations, representation and considered travel partnerships,
            speak with the Hathor team in Cairo.
          </p>
          <Link className="hep-button" href="/contact">Contact Hathor</Link>
        </section>
      </main>
    </PageScrollTransition>
  );
}
