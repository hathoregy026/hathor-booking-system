import Link from "next/link";
import { ChevronLeft, type LucideIcon } from "lucide-react";

type CmsPageHeaderProps = {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  /** Back link only — use when the panel already has its own page title. */
  compact?: boolean;
};

export function CmsPageHeader({
  title,
  description,
  icon: Icon,
  action,
  compact = false,
}: CmsPageHeaderProps) {
  return (
    <div className="space-y-4">
      <Link
        href="/admin/cms"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted transition-colors hover:text-[var(--accent)]"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
        CMS
      </Link>

      {compact ? null : (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              {Icon ? (
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{
                    background:
                      "color-mix(in srgb, var(--accent) 16%, transparent)",
                    color: "var(--accent)",
                  }}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.9} aria-hidden />
                </span>
              ) : null}
              <h1 className="admin-page-title">{title}</h1>
            </div>
            <p className="admin-page-subtitle max-w-2xl">{description}</p>
          </div>
          {action}
        </div>
      )}
    </div>
  );
}
