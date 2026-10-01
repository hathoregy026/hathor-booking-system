"use client";

import { useId, useState, type ReactNode } from "react";

export type GuestReviewsSource = {
  id: string;
  label: string;
  /** Badge, score and pills for this source, set in the head under the title. */
  head: ReactNode;
  /** The reviews themselves, set in the ledger column. */
  ledger: ReactNode;
};

/**
 * The reviews grid with one view per source. With more than one source a
 * Google / Tripadvisor switch sits under the title; every view stays in the
 * page (hidden when not chosen) so all reviews remain readable without script.
 */
export function GuestReviewsSwitch({
  intro,
  sources,
}: {
  intro: ReactNode;
  sources: GuestReviewsSource[];
}) {
  const [active, setActive] = useState(sources[0]?.id ?? "");
  const base = useId();
  const multiple = sources.length > 1;

  return (
    <div className="gr__grid">
      <header className="gr__head">
        {intro}
        {multiple ? (
          <div className="gr__tabs" role="tablist" aria-label="Review source">
            {sources.map((source) => (
              <button
                key={source.id}
                type="button"
                role="tab"
                id={`${base}-tab-${source.id}`}
                aria-selected={active === source.id}
                aria-controls={`${base}-panel-${source.id}`}
                className="gr__tab"
                onClick={() => setActive(source.id)}
              >
                {source.label}
              </button>
            ))}
          </div>
        ) : null}
        {sources.map((source) => (
          <div
            key={source.id}
            className="gr__head-view"
            hidden={active !== source.id}
          >
            {source.head}
          </div>
        ))}
      </header>

      {sources.map((source) => (
        <div
          key={source.id}
          className="gr__ledger-view"
          role={multiple ? "tabpanel" : undefined}
          id={`${base}-panel-${source.id}`}
          aria-labelledby={multiple ? `${base}-tab-${source.id}` : undefined}
          hidden={active !== source.id}
        >
          {source.ledger}
        </div>
      ))}
    </div>
  );
}
