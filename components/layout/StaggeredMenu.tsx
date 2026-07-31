"use client";

/**
 * Phone-only explore menu — same staggered gold/cream open as before,
 * driven by CSS transforms (GPU-friendly) instead of a heavy GSAP timeline.
 */

import Link from "next/link";
import {
  useLayoutEffect,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";
import gsap from "gsap";
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
  /** Close panel + unlock body synchronously, then navigate. */
  onNavigate?: (href: string) => void;
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
  onNavigate,
  position = "right",
  colors = ["#8b6914", "#c9a96e", "#ece8df"],
  navItems = [],
  socialItems = [],
  displaySocials = true,
  accentColor = "#b69f64",
  className,
}: StaggeredMenuProps) {
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);

  const handleNavClick = (
    event: MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (!onNavigate) {
      onClose();
      return;
    }
    event.preventDefault();
    onNavigate(href);
  };
  const [mounted, setMounted] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLElement | null>(null);
  const backdropRef = useRef<HTMLButtonElement | null>(null);
  const menuTlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setOpenGroupId(null);
      return;
    }
    const timer = window.setTimeout(() => setMounted(false), 900);
    return () => window.clearTimeout(timer);
  }, [open]);

  useLayoutEffect(() => {
    if (!mounted) return;

    const root = rootRef.current;
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (!root || !panel || !backdrop) return;

    const prelayers = Array.from(
      root.querySelectorAll<HTMLElement>(".sm-prelayer"),
    );
    const rows = Array.from(root.querySelectorAll<HTMLElement>(".sm-panel-row"));
    const close = root.querySelector<HTMLElement>(".sm-panel-close");
    const socialsTitle = root.querySelector<HTMLElement>(".sm-socials-title");
    const socials = Array.from(
      root.querySelectorAll<HTMLElement>(".sm-socials-link"),
    );

    const direction = position === "left" ? -1 : 1;
    gsap.set(backdrop, { opacity: 0, pointerEvents: "none" });
    gsap.set(prelayers, { xPercent: 100 * direction });
    gsap.set(panel, { xPercent: 100 * direction, pointerEvents: "none" });
    gsap.set(rows, { opacity: 0, y: 22 });
    if (close) gsap.set(close, { opacity: 0 });
    if (socialsTitle) gsap.set(socialsTitle, { opacity: 0 });
    gsap.set(socials, { opacity: 0, y: 12 });

    const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.inOut" } });
    tl.to(backdrop, { opacity: 1, duration: 0.24, pointerEvents: "auto" }, 0)
      .to(prelayers[0], { xPercent: 0, duration: 0.85 }, 0)
      .to(prelayers[1], { xPercent: 0, duration: 0.85 }, 0.1)
      .to(prelayers[2], { xPercent: 0, duration: 0.86 }, 0.2)
      .to(panel, { xPercent: 0, duration: 0.74, pointerEvents: "auto" }, 0.52)
      .to(close, { opacity: 1, duration: 0.28 }, 0.68)
      .to(rows, { opacity: 1, y: 0, stagger: 0.07, duration: 0.4, ease: "power2.out" }, 0.6)
      .to(socialsTitle, { opacity: 1, duration: 0.25 }, 0.88)
      .to(socials, { opacity: 1, y: 0, stagger: 0.05, duration: 0.28, ease: "power2.out" }, 0.92);

    menuTlRef.current = tl;
    if (process.env.NODE_ENV !== "production") {
      (window as Window & { __hathorMenuTimelineCount?: number }).__hathorMenuTimelineCount = 1;
    }
    if (open) {
      root.classList.add("is-open");
      tl.play();
    } else {
      root.classList.remove("is-open");
      tl.progress(0).pause(0);
    }

    return () => {
      tl.kill();
      menuTlRef.current = null;
      if (process.env.NODE_ENV !== "production") {
        (window as Window & { __hathorMenuTimelineCount?: number }).__hathorMenuTimelineCount = 0;
      }
    };
  }, [mounted, position]);

  useEffect(() => {
    const tl = menuTlRef.current;
    const root = rootRef.current;
    if (!tl || !root) return;
    if (open) {
      root.classList.add("is-open");
      tl.play();
      return;
    }
    tl.reverse();
    window.setTimeout(() => {
      if (!open) root.classList.remove("is-open");
    }, 850);
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

  const layerColors =
    colors && colors.length
      ? colors.slice(0, 3)
      : ["#8b6914", "#c9a96e", "#ece8df"];

  const style = {
    ["--sm-accent"]: accentColor,
  } as CSSProperties;

  const toggleGroup = (id: string) => {
    setOpenGroupId((current) => (current === id ? null : id));
  };

  return (
    <div
      ref={rootRef}
      className={`staggered-menu-wrapper fixed-wrapper sm-lite${className ? ` ${className}` : ""}${open ? " is-open" : ""}`}
      style={style}
      data-position={position}
      data-open={open || undefined}
      aria-hidden={!open}
    >
      <button
        ref={backdropRef}
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
        ref={panelRef}
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
                      onClick={(event) => handleNavClick(event, item.href)}
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
                          onClick={(event) => handleNavClick(event, item.href)}
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
                            onClick={(event) => handleNavClick(event, link.href)}
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
