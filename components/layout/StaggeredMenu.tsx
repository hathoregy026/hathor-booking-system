"use client";

/**
 * Phone-only staggered explore menu — React Bits StaggeredMenu adapted for Hathor.
 * Desktop-matching dropdown groups; gold / cream palette.
 */

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { ChevronDown, X } from "lucide-react";
import gsap from "gsap";
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
  const openRef = useRef(false);
  const panelRef = useRef<HTMLElement>(null);
  const preLayersRef = useRef<HTMLDivElement>(null);
  const preLayerElsRef = useRef<HTMLElement[]>([]);
  const openTlRef = useRef<gsap.core.Timeline | null>(null);
  const closeTweenRef = useRef<gsap.core.Tween | null>(null);
  const busyRef = useRef(false);
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panel = panelRef.current;
      const preContainer = preLayersRef.current;
      if (!panel) return;

      const preLayers = preContainer
        ? Array.from(preContainer.querySelectorAll<HTMLElement>(".sm-prelayer"))
        : [];
      preLayerElsRef.current = preLayers;

      const offscreen = position === "left" ? -100 : 100;
      gsap.set([panel, ...preLayers], { xPercent: offscreen, opacity: 1 });
      if (preContainer) {
        gsap.set(preContainer, { xPercent: 0, opacity: 1 });
      }
    });
    return () => ctx.revert();
  }, [position]);

  const buildOpenTimeline = useCallback(() => {
    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return null;

    openTlRef.current?.kill();
    if (closeTweenRef.current) {
      closeTweenRef.current.kill();
      closeTweenRef.current = null;
    }

    const rowEls = Array.from(
      panel.querySelectorAll<HTMLElement>(".sm-panel-row"),
    );
    const socialTitle = panel.querySelector<HTMLElement>(".sm-socials-title");
    const socialLinks = Array.from(
      panel.querySelectorAll<HTMLElement>(".sm-socials-link"),
    );
    const closeBtn = panel.querySelector<HTMLElement>(".sm-panel-close");

    const offscreen = position === "left" ? -100 : 100;

    if (rowEls.length) {
      gsap.set(rowEls, { y: 28, opacity: 0 });
    }
    if (socialTitle) gsap.set(socialTitle, { opacity: 0 });
    if (socialLinks.length) gsap.set(socialLinks, { y: 16, opacity: 0 });
    if (closeBtn) gsap.set(closeBtn, { opacity: 0 });

    const tl = gsap.timeline({ paused: true });

    layers.forEach((el, i) => {
      tl.fromTo(
        el,
        { xPercent: offscreen },
        { xPercent: 0, duration: 0.5, ease: "power4.out" },
        i * 0.07,
      );
    });

    const lastTime = layers.length ? (layers.length - 1) * 0.07 : 0;
    const panelInsertTime = lastTime + (layers.length ? 0.08 : 0);
    const panelDuration = 0.65;

    tl.fromTo(
      panel,
      { xPercent: offscreen },
      { xPercent: 0, duration: panelDuration, ease: "power4.out" },
      panelInsertTime,
    );

    if (closeBtn) {
      tl.to(
        closeBtn,
        { opacity: 1, duration: 0.35, ease: "power2.out" },
        panelInsertTime + 0.2,
      );
    }

    if (rowEls.length) {
      const itemsStart = panelInsertTime + panelDuration * 0.12;
      tl.to(
        rowEls,
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: "power3.out",
          stagger: { each: 0.06, from: "start" },
        },
        itemsStart,
      );
    }

    if (socialTitle || socialLinks.length) {
      const socialsStart = panelInsertTime + panelDuration * 0.45;
      if (socialTitle) {
        tl.to(
          socialTitle,
          { opacity: 1, duration: 0.45, ease: "power2.out" },
          socialsStart,
        );
      }
      if (socialLinks.length) {
        tl.to(
          socialLinks,
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            ease: "power3.out",
            stagger: { each: 0.06, from: "start" },
            onComplete: () => {
              gsap.set(socialLinks, { clearProps: "opacity" });
            },
          },
          socialsStart + 0.04,
        );
      }
    }

    openTlRef.current = tl;
    return tl;
  }, [position]);

  const playOpen = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;
    setOpenGroupId(null);
    const tl = buildOpenTimeline();
    if (tl) {
      tl.eventCallback("onComplete", () => {
        busyRef.current = false;
      });
      tl.play(0);
    } else {
      busyRef.current = false;
    }
  }, [buildOpenTimeline]);

  const playClose = useCallback(() => {
    openTlRef.current?.kill();
    openTlRef.current = null;

    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return;

    const all = [...layers, panel];
    closeTweenRef.current?.kill();
    const offscreen = position === "left" ? -100 : 100;
    closeTweenRef.current = gsap.to(all, {
      xPercent: offscreen,
      duration: 0.32,
      ease: "power3.in",
      overwrite: "auto",
      onComplete: () => {
        const rowEls = Array.from(
          panel.querySelectorAll<HTMLElement>(".sm-panel-row"),
        );
        if (rowEls.length) gsap.set(rowEls, { y: 28, opacity: 0 });
        const socialTitle = panel.querySelector<HTMLElement>(".sm-socials-title");
        const socialLinks = Array.from(
          panel.querySelectorAll<HTMLElement>(".sm-socials-link"),
        );
        if (socialTitle) gsap.set(socialTitle, { opacity: 0 });
        if (socialLinks.length) gsap.set(socialLinks, { y: 16, opacity: 0 });
        setOpenGroupId(null);
        busyRef.current = false;
      },
    });
  }, [position]);

  useEffect(() => {
    if (open === openRef.current) return;
    openRef.current = open;
    if (open) {
      playOpen();
    } else {
      playClose();
    }
  }, [open, playOpen, playClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const layerColors = (() => {
    const raw =
      colors && colors.length ? colors.slice(0, 4) : ["#8b6914", "#c9a96e"];
    const arr = [...raw];
    if (arr.length >= 3) {
      const mid = Math.floor(arr.length / 2);
      arr.splice(mid, 1);
    }
    return arr;
  })();

  const style = {
    ["--sm-accent"]: accentColor,
  } as CSSProperties;

  const toggleGroup = (id: string) => {
    setOpenGroupId((current) => (current === id ? null : id));
  };

  return (
    <div
      className={`staggered-menu-wrapper fixed-wrapper${className ? ` ${className}` : ""}${open ? " is-open" : ""}`}
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

      <div ref={preLayersRef} className="sm-prelayers" aria-hidden="true">
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
        ref={panelRef}
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

export default StaggeredMenu;
