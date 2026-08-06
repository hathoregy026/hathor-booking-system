type PageUnderConstructionProps = {
  pageLabel?: string;
};

export function PageUnderConstruction({ pageLabel }: PageUnderConstructionProps) {
  return (
    <section
      className="hathor-page-construction"
      aria-labelledby="hathor-page-construction-title"
    >
      <div className="hathor-page-construction__inner">
        {pageLabel ? (
          <p className="hathor-page-construction__eyebrow">{pageLabel}</p>
        ) : null}
        <h1
          id="hathor-page-construction-title"
          className="hathor-page-construction__title"
        >
          This page is under construction
        </h1>
      </div>
    </section>
  );
}
