"use client";

import Link from "next/link";

type LuxuryTextLinkProps = {
  href: string;
  children: React.ReactNode;
  inverse?: boolean;
  className?: string;
};

export function LuxuryTextLink({
  href,
  children,
  inverse = false,
  className = "",
}: LuxuryTextLinkProps) {
  const classes = `luxTextLink${inverse ? " luxTextLink--inverse" : ""}${className ? ` ${className}` : ""}`;

  if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return (
      <a href={href} className={classes}>
        <span>{children}</span>
        <span aria-hidden="true" className="luxTextLink__arrow">
          ↗
        </span>
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      <span>{children}</span>
      <span aria-hidden="true" className="luxTextLink__arrow">
        ↗
      </span>
    </Link>
  );
}
