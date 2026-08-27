import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type StatCardProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  isLoading?: boolean;
  /** Secondary line under the value — say what the number actually measures. */
  hint?: string;
  /** Renders the large double-height bento tile. */
  feature?: boolean;
  /** Turns the whole tile into a link. */
  href?: string;
  /** Extra grid-span classes from the parent bento. */
  className?: string;
  /** Real content rendered at the bottom of a feature tile (e.g. a breakdown bar). */
  children?: ReactNode;
};

function StatSkeleton({
  feature,
  className,
}: {
  feature: boolean;
  className: string;
}) {
  return (
    <div className={`card admin-tile ${className}`} aria-hidden>
      <div className="flex h-full flex-col">
        <div className="admin-skeleton h-11 w-11 rounded-2xl" />
        <div className="admin-skeleton mt-5 h-3.5 w-24 rounded" />
        <div
          className={`admin-skeleton mt-2 rounded ${
            feature ? "h-10 w-40" : "h-7 w-20"
          }`}
        />
        {feature && <div className="admin-skeleton mt-auto h-16 w-full rounded-xl" />}
      </div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  change,
  changeType = "neutral",
  isLoading = false,
  hint,
  feature = false,
  href,
  className = "",
  children,
}: StatCardProps) {
  if (isLoading) {
    return <StatSkeleton feature={feature} className={className} />;
  }

  const pillClass =
    changeType === "positive"
      ? "admin-change-pill admin-change-pill--positive"
      : changeType === "negative"
        ? "admin-change-pill admin-change-pill--negative"
        : "admin-change-pill admin-change-pill--neutral";

  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div
          className="admin-tile__icon flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
          style={{
            background: "color-mix(in srgb, var(--accent) 15%, transparent)",
            color: "var(--accent)",
          }}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </div>
        {change && <span className={pillClass}>{change}</span>}
      </div>

      <p className="admin-tile__label" style={{ color: "var(--text-secondary)" }}>
        {label}
      </p>
      {/*
        Sizing moved out of fixed Tailwind step-classes into
        `.admin-tile__value` (admin-shell.css), which clamps against viewport
        width. Fixed text-2xl/3xl steps cannot know how narrow a half-width
        tile gets on a phone: a six-figure currency value needs ~162px, while a
        2-up tile at 360px offers ~122px of inner width — so it spilled out of
        its box. clamp() shrinks the number instead. Short counts (the usual
        case) never reach the lower bound and render exactly as before.
      */}
      <p
        className={`admin-tile__value ${
          feature ? "admin-tile__value--feature" : ""
        }`}
      >
        {value}
      </p>
      {hint && (
        <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
          {hint}
        </p>
      )}

      {children && <div className="mt-auto pt-6">{children}</div>}
    </>
  );

  const tileClass = `card card-hover admin-tile ${
    href ? "admin-tile--link" : ""
  } ${className}`;

  if (href) {
    return (
      <Link href={href} className={tileClass}>
        {body}
      </Link>
    );
  }

  return <div className={tileClass}>{body}</div>;
}
