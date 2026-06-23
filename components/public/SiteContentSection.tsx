type SiteContentSectionProps = {
  title: string;
  subtitle?: string | null;
  bodyText?: string | null;
  imageUrl?: string | null;
  imagePosition?: "left" | "right";
  showHeading?: boolean;
};

export function SiteContentSection({
  title,
  subtitle,
  bodyText,
  imageUrl,
  imagePosition = "right",
  showHeading = true,
}: SiteContentSectionProps) {
  if (!bodyText && !imageUrl) return null;

  return (
    <section className="booking-card overflow-hidden">
      <div
        className={`grid md:grid-cols-2 md:items-center ${
          imagePosition === "left" ? "md:[&>*:first-child]:order-2" : ""
        }`}
      >
        {imageUrl && (
          <div
            className="aspect-[4/3] bg-cover bg-center md:aspect-auto md:min-h-[280px] lg:min-h-[320px]"
            style={{ backgroundImage: `url(${imageUrl})` }}
            role="img"
            aria-label={title}
          />
        )}
        <div className="p-4 sm:p-8 md:p-10">
          {showHeading && subtitle && (
            <p
              className="mb-2 text-xs font-semibold uppercase tracking-[0.16em]"
              style={{ color: "var(--booking-muted)" }}
            >
              {subtitle}
            </p>
          )}
          {showHeading && (
            <h2 className="booking-serif text-xl font-semibold sm:text-3xl">
              {title}
            </h2>
          )}
          {bodyText && (
            <div
              className={`space-y-3 text-sm leading-relaxed whitespace-pre-line sm:text-base ${
                showHeading ? "mt-4" : ""
              }`}
              style={{ color: "var(--booking-muted)" }}
            >
              {bodyText}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
