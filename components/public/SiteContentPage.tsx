type SiteContentPageProps = {
  title: string;
  subtitle?: string | null;
  children: React.ReactNode;
};

export function SiteContentPage({
  title,
  subtitle,
  children,
}: SiteContentPageProps) {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-6 sm:px-6 sm:pt-10 lg:px-8">
      <div className="mb-6 space-y-3 text-center sm:mb-10">
        {subtitle && (
          <p
            className="text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ color: "var(--booking-muted)" }}
          >
            {subtitle}
          </p>
        )}
        <h1 className="booking-serif text-2xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
          {title}
        </h1>
      </div>
      {children}
    </div>
  );
}
