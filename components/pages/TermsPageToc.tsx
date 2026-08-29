"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { TermsTocItem } from "@/lib/terms-and-conditions-content";

type TermsPageTocProps = {
  items: readonly TermsTocItem[];
  layout?: "sidebar" | "inline";
};

/**
 * Accessible anchor index with optional active-section indicator (desktop).
 * Anchor links work without JS; observer only enhances focus styling.
 */
export function TermsPageToc({ items, layout = "sidebar" }: TermsPageTocProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((node): node is HTMLElement => Boolean(node));

    if (!sections.length) return;

    const navOffset =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--site-nav-bar-height",
        ),
      ) || 80;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        root: null,
        rootMargin: `-${navOffset + 24}px 0px -55% 0px`,
        threshold: [0, 0.12, 0.35],
      },
    );

    sections.forEach((section) => observer.observe(section));

    const syncFromHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash && items.some((item) => item.id === hash)) {
        setActiveId(hash);
      }
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);

    if (!reduceMotion) {
      document.documentElement.style.scrollBehavior = "smooth";
    }

    return () => {
      observer.disconnect();
      window.removeEventListener("hashchange", syncFromHash);
      if (!reduceMotion) {
        document.documentElement.style.scrollBehavior = "";
      }
    };
  }, [items]);

  const navClass =
    layout === "sidebar" ? "tc-toc tc-toc--sidebar" : "tc-toc tc-toc--inline";

  const list = (
    <ul className="tc-toc__list">
      {items.map((item) => {
        const isActive = activeId === item.id;
        return (
          <li key={item.id} className="tc-toc__item">
            <Link
              href={`#${item.id}`}
              className={`tc-toc__link${isActive ? " is-active" : ""}`}
              aria-current={isActive ? "location" : undefined}
              onClick={() => {
                setActiveId(item.id);
                if (layout === "inline") setMobileOpen(false);
              }}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  if (layout === "inline") {
    return (
      <nav className={navClass} aria-label="On this page">
        <button
          type="button"
          className="tc-toc__toggle"
          aria-expanded={mobileOpen}
          aria-controls="terms-toc-panel"
          onClick={() => setMobileOpen((open) => !open)}
        >
          On This Page
        </button>
        <div
          id="terms-toc-panel"
          className={`tc-toc__panel${mobileOpen ? " is-open" : ""}`}
          hidden={!mobileOpen}
        >
          {list}
        </div>
      </nav>
    );
  }

  return (
    <nav className={navClass} aria-label="On this page">
      <p className="tc-toc__label">On This Page</p>
      {list}
    </nav>
  );
}
