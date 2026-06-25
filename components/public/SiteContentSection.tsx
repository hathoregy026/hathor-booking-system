type SiteContentSectionProps = {
  title: string;
  subtitle?: string | null;
  bodyText?: string | null;
  imageUrl?: string | null;
  imagePosition?: "left" | "right";
  showHeading?: boolean;
};

const IMAGE_PLACEHOLDER =
  "linear-gradient(135deg, #e8e2d9 0%, #d4c4a8 50%, #c9a96e 100%)";

export function SiteContentSection({
  title,
  subtitle,
  bodyText,
  imageUrl,
  imagePosition = "right",
  showHeading = true,
}: SiteContentSectionProps) {
  if (!bodyText && !imageUrl) return null;

  const imageStyle = imageUrl
    ? { backgroundImage: `url(${imageUrl})` }
    : { background: IMAGE_PLACEHOLDER };

  return (
    <section className="lux-content-block">
      <div
        className={`grid md:grid-cols-2 md:items-stretch ${
          imagePosition === "left" ? "md:[&>*:first-child]:order-2" : ""
        }`}
      >
        {imageUrl !== null && (
          <div className="lux-content-block__image-wrap">
            <div
              className="lux-content-block__image min-h-[260px] md:min-h-full md:h-full"
              style={imageStyle}
              role="img"
              aria-label={title}
            />
          </div>
        )}
        <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-12">
          {showHeading && subtitle && (
            <p className="lux-section-eyebrow">{subtitle}</p>
          )}
          {showHeading && (
            <h2 className="public-serif mt-2 text-2xl font-medium sm:text-3xl">
              {title}
            </h2>
          )}
          {showHeading && <div className="mt-4 h-px w-12 bg-[var(--lux-gold)]" />}
          {bodyText && (
            <div
              className={`space-y-4 text-sm font-light leading-relaxed whitespace-pre-line text-[var(--public-muted)] sm:text-base ${
                showHeading ? "mt-6" : ""
              }`}
            >
              {bodyText}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
