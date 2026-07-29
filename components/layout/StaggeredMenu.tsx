"use client";

/**
 * Phone-only explore menu — CSS-driven open/close (no GSAP layers).
 * Real phones lag on multi-layer GSAP stagger; transform/opacity CSS is enough.
 */

import Link from "next/link";
import {
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { ChevronDown, X } from "lucide-react";
import type { HeaderNavItem } from "@/lib/public-nav";
import type { SocialLink } from "@/lib/public-social";
import "./StaggeredMenu.css";

export type StaggeredMenuSocialItem = SocialLink & {
  icon?: ReactNode;
};

type StaggeredMenuProps = {
  open: boolean;
  onClose: () => void;
  position?: "left" | "right";
  colors?: string[];
  navItems?: HeaderNavItem[];
  socialItems?: StaggeredMenuSocialItem[];
  displaySocials?: boolean;
  accentColor?: string;
  className?: string;
};

export function StaggeredMenu({
  open,
  onClose,
  position = "right",
  colors = ["#8b6914", "#c9a96e", "#ece8df"],
  navItems = [],
  socialItems = [],
  displaySocials = true,
  accentColor = "#b69f64",
  className,
}: StaggeredMenuProps) {
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setOpenGroupId(null);
      return;
    }
    const timer = window.setTimeout(() => setMounted(false), 320);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted && !open) return null;

  const layerColors = (() => {
    const raw =
      colors && colors.length ? colors.slice(0, 4) : ["#8b6914", "#c9a96e"];
    const arr = [...raw];
    if (arr.length >= 3) {
      const mid = Math.floor(arr.length / 2);
      arr.splice(mid, 1);
    }
    return arr.slice(0, 2);
  })();

  const style = {
    ["--sm-accent"]: accentColor,
  } as CSSProperties;

  const toggleGroup = (id: string) => {
    setOpenGroupId((current) => (current === id ? null : id));
  };

  return (
    <div
      className={`staggered-menu-wrapper fixed-wrapper sm-lite${className ? ` ${className}` : ""}${open ? " is-open" : ""}`}
      style={style}
      data-position={position}
      data-open={open || undefined}
      aria-hidden={!open}
    >
      <button
        type="button"
        className="sm-backdrop"
        aria-label="Close menu"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
      />

      <div className="sm-prelayers" aria-hidden="true">
        {layerColors.map((color, index) => (
          <div
            key={`${color}-${index}`}
            className="sm-prelayer"
            style={{ background: color }}
          />
        ))}
      </div>

      <aside
        id="staggered-menu-panel"
        className="staggered-menu-panel"
        aria-hidden={!open}
        aria-label="Explore"
      >
        <div className="sm-panel-inner">
          <div className="sm-panel-top">
            <p className="sm-panel-kicker">Explore</p>
            <button
              type="button"
              className="sm-panel-close"
              onClick={onClose}
              aria-label="Close menu"
              tabIndex={open ? 0 : -1}
            >
              <X className="sm-panel-close-icon" aria-hidden />
            </button>
          </div>

          <nav className="sm-panel-nav" aria-label="Primary">
            {navItems.map((item) => {
              if (item.type === "link") {
                return (
                  <div className="sm-panel-row" key={item.href}>
                    <Link
                      className="sm-panel-link sm-panel-link--top"
                      href={item.href}
                      onClick={onClose}
                      tabIndex={open ? 0 : -1}
                    >
                      {item.label}
                    </Link>
                  </div>
                );
              }

              const expanded = openGroupId === item.id;

              return (
                <div
                  className={`sm-panel-row sm-panel-group${expanded ? " is-open" : ""}`}
                  key={item.id}
                >
                  <button
                    type="button"
                    className="sm-panel-group-trigger"
                    aria-expanded={expanded}
                    aria-controls={`sm-group-${item.id}`}
                    onClick={() => toggleGroup(item.id)}
                    tabIndex={open ? 0 : -1}
                  >
                    <span>{item.label}</span>
                    <ChevronDown
                      className="sm-panel-group-chevron"
                      aria-hidden
                    />
                  </button>
                  <div
                    id={`sm-group-${item.id}`}
                    className="sm-panel-group-panel"
                    hidden={!expanded}
                  >
                    <ul className="sm-panel-group-links" role="list">
                      <li>
                        <Link
                          href={item.href}
                          className="sm-panel-link sm-panel-link--child sm-panel-link--overview"
                          onClick={onClose}
                          tabIndex={open && expanded ? 0 : -1}
                        >
                          Overview
                        </Link>
                      </li>
                      {item.links.map((link) => (
                        <li key={`${item.id}-${link.href}-${link.label}`}>
                          <Link
                            href={link.href}
                            className="sm-panel-link sm-panel-link--child"
                            onClick={onClose}
                            tabIndex={open && expanded ? 0 : -1}
                          >
                            <span className="sm-panel-link-label">
                              {link.label}
                            </span>
                            {link.description ? (
                              <span className="sm-panel-link-desc">
                                {link.description}
                              </span>
                            ) : null}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </nav>

          {displaySocials && socialItems.length > 0 ? (
            <div className="sm-socials" aria-label="Social links">
              <h3 className="sm-socials-title">Follow the Voyage</h3>
              <ul className="sm-socials-list" role="list">
                {socialItems.map((social) => (
                  <li key={social.key} className="sm-socials-item">
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="sm-socials-link"
                      aria-label={social.label}
                      tabIndex={open ? 0 : -1}
                    >
                      {social.icon}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
