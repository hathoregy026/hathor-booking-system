import Link from "next/link";
import { Loader2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type ActionButtonProps = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  icon?: LucideIcon;
  variant?: "primary" | "outline";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  /** Swaps the icon for a spinner and blocks interaction. Ignored when `href` is set. */
  loading?: boolean;
  /** Replaces the label while loading, e.g. "Saving…". */
  loadingLabel?: string;
};

export function ActionButton({
  children,
  href,
  onClick,
  icon: Icon,
  variant = "primary",
  className = "",
  type = "button",
  disabled = false,
  loading = false,
  loadingLabel,
}: ActionButtonProps) {
  const baseClass = variant === "primary" ? "btn-primary" : "btn-outline";
  const classes = `admin-action-btn inline-flex items-center justify-center gap-2 text-sm ${baseClass} ${className} disabled:cursor-not-allowed disabled:opacity-60`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden />}
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      data-loading={loading ? "true" : undefined}
      className={classes}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
      ) : (
        Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden />
      )}
      {loading && loadingLabel ? loadingLabel : children}
    </button>
  );
}
