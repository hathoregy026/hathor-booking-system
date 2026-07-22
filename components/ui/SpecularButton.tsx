"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type SpecularButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  size?: "sm" | "md" | "lg";
};

/** Explicit specular CTA — uses site-wide gold rim CSS via .btn classes. */
export function SpecularButton({
  children,
  className = "",
  size = "md",
  type = "button",
  ...props
}: SpecularButtonProps) {
  const sizeClass =
    size === "sm"
      ? "specular-button--sm"
      : size === "lg"
        ? "specular-button--lg"
        : "specular-button--md";

  return (
    <button
      type={type}
      className={`btn btn-filled specular-button ${sizeClass} ${className}`.trim()}
      {...props}
    >
      <span className="specular-button__label">{children}</span>
    </button>
  );
}
