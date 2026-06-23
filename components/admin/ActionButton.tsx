import Link from "next/link";
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
}: ActionButtonProps) {
  const baseClass =
    variant === "primary" ? "admin-btn-primary" : "admin-btn-outline";
  const classes = `inline-flex items-center justify-center gap-2 text-sm ${baseClass} ${className} disabled:cursor-not-allowed disabled:opacity-60`;

  const content = (
    <>
      {Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden />}
      {children}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
    >
      {content}
    </button>
  );
}
