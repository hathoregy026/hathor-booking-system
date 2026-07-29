"use client";

/**
 * Phone-only staggered explore menu — React Bits StaggeredMenu adapted for Hathor.
 * Gold / cream palette; luxurious display typography.
 */

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type CSSProperties,
} from "react";
import gsap from "gsap";
import "./StaggeredMenu.css";

export type StaggeredMenuItem = {
  label: string;
  ariaLabel?: string;
  link: string;
};

export type StaggeredMenuSocialItem = {
  label: string;
  link: string;
};

type StaggeredMenuProps = {
  open: boolean;
  onClose: () => void;
  position?: "left" | "right";
  colors?: string[];
  items?: StaggeredMenuItem[];
  socialItems?: StaggeredMenuSocialItem[];
  displaySocials?: boolean;
  displayItemNumbering?: boolean;
  accentColor?: string;
  className?: string;
};

export function StaggeredMenu({
  open,
  onClose,
  position = "right",
  colors = ["#8b6914", "#c9a96e", "#ece8df"],
  items = [],
  socialItems = [],
  displaySocials = true,
  displayItemNumbering = true,
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
  const itemEntranceTweenRef = useRef<gsap.core.Tween | null>(null);

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
    itemEntranceTweenRef.current?.kill();

    const itemEls = Array.from(
      panel.querySelectorAll<HTMLElement>(".sm-panel-itemLabel"),
    );
    const numberEls = Array.from(
      panel.querySelectorAll<HTMLElement>(
        ".sm-panel-list[data-numbering] .sm-panel-item",
      ),
    );
    const socialTitle = panel.querySelector<HTMLElement>(".sm-socials-title");
    const socialLinks = Array.from(
      panel.querySelectorAll<HTMLElement>(".sm-socials-link"),
    );

    const offscreen = position === "left" ? -100 : 100;

    if (itemEls.length) {
      gsap.set(itemEls, { yPercent: 140, rotate: 8 });
    }
    if (numberEls.length) {
      gsap.set(numberEls, { "--sm-num-opacity": 0 });
    }
    if (socialTitle) gsap.set(socialTitle, { opacity: 0 });
    if (socialLinks.length) gsap.set(socialLinks, { y: 20, opacity: 0 });

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

    if (itemEls.length) {
      const itemsStart = panelInsertTime + panelDuration * 0.15;
      tl.to(
        itemEls,
        {
          yPercent: 0,
          rotate: 0,
          duration: 1,
          ease: "power4.out",
          stagger: { each: 0.08, from: "start" },
        },
        itemsStart,
      );
      if (numberEls.length) {
        tl.to(
          numberEls,
          {
            duration: 0.6,
            ease: "power2.out",
            "--sm-num-opacity": 1,
            stagger: { each: 0.07, from: "start" },
          },
          itemsStart + 0.1,
        );
      }
    }

    if (socialTitle || socialLinks.length) {
      const socialsStart = panelInsertTime + panelDuration * 0.4;
      if (socialTitle) {
        tl.to(
          socialTitle,
          { opacity: 1, duration: 0.5, ease: "power2.out" },
          socialsStart,
        );
      }
      if (socialLinks.length) {
        tl.to(
          socialLinks,
          {
            y: 0,
            opacity: 1,
            duration: 0.55,
            ease: "power3.out",
            stagger: { each: 0.08, from: "start" },
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
    itemEntranceTweenRef.current?.kill();

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
        const itemEls = Array.from(
          panel.querySelectorAll<HTMLElement>(".sm-panel-itemLabel"),
        );
        if (itemEls.length) {
          gsap.set(itemEls, { yPercent: 140, rotate: 8 });
        }
        const numberEls = Array.from(
          panel.querySelectorAll<HTMLElement>(
            ".sm-panel-list[data-numbering] .sm-panel-item",
          ),
        );
        if (numberEls.length) {
          gsap.set(numberEls, { "--sm-num-opacity": 0 });
        }
        const socialTitle = panel.querySelector<HTMLElement>(".sm-socials-title");
        const socialLinks = Array.from(
          panel.querySelectorAll<HTMLElement>(".sm-socials-link"),
        );
        if (socialTitle) gsap.set(socialTitle, { opacity: 0 });
        if (socialLinks.length) gsap.set(socialLinks, { y: 20, opacity: 0 });
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
          <p className="sm-panel-kicker">Explore</p>
          <ul
            className="sm-panel-list"
            role="list"
            data-numbering={displayItemNumbering || undefined}
          >
            {items.length ? (
              items.map((item, index) => (
                <li className="sm-panel-itemWrap" key={`${item.label}-${index}`}>
                  <Link
                    className="sm-panel-item"
                    href={item.link}
                    aria-label={item.ariaLabel ?? item.label}
                    data-index={index + 1}
                    onClick={onClose}
                    tabIndex={open ? 0 : -1}
                  >
                    <span className="sm-panel-itemLabel">{item.label}</span>
                  </Link>
                </li>
              ))
            ) : (
              <li className="sm-panel-itemWrap" aria-hidden="true">
                <span className="sm-panel-item">
                  <span className="sm-panel-itemLabel">No items</span>
                </span>
              </li>
            )}
          </ul>

          {displaySocials && socialItems.length > 0 ? (
            <div className="sm-socials" aria-label="Social links">
              <h3 className="sm-socials-title">Follow</h3>
              <ul className="sm-socials-list" role="list">
                {socialItems.map((social, index) => (
                  <li key={`${social.label}-${index}`} className="sm-socials-item">
                    <a
                      href={social.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="sm-socials-link"
                      tabIndex={open ? 0 : -1}
                    >
                      {social.label}
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
