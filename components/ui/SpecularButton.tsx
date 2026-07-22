"use client";

import {
  useEffect,
  useRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { mountSpecularButtonFx } from "@/lib/specular-button-fx";

type SpecularButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  size?: "sm" | "md" | "lg";
};

/** Explicit specular CTA — gold rim FX + Hathor chrome. */
export function SpecularButton({
  children,
  className = "",
  size = "md",
  type = "button",
  ...props
}: SpecularButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const handle = mountSpecularButtonFx(el);
    return () => handle.destroy();
  }, []);

  return (
    <button
      ref={ref}
      type={type}
      className={`specular-button specular-button--${size} ${className}`.trim()}
      {...props}
    >
      <span className="specular-button__label">{children}</span>
    </button>
  );
}
