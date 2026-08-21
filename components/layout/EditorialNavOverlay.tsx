"use client";

/**
 * Desktop/tablet left overlay for Suites, Cruises, Voyages, About, Contact
 * (and their dropdown destinations). Homepage does not mount this.
 *
 * Choreography (signature three-layer open, from the left):
 * 0.00–0.18  dark gold sheet (#8b6914) enters
 * 0.16–0.36  light gold sheet (#c9a96e) enters
 * 0.32–0.52  cream sheet (#ece8df) enters under the panel
 * 0.48–0.78  cream content panel settles; photo fades
 * 0.62–1.00  rows stagger in
 */

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import gsap from "gsap";
import { ChevronDown } from "lucide-react";
import { HATHOR_ICON_GOLD_SRC } from "@/lib/branding";
import { HATHOR_MEDIA } from "@/lib/hathor-media";
import type { HeaderNavItem } from "@/lib/public-nav";
import "./EditorialNavOverlay.css";

const LAYER_COLORS = ["#8b6914", "#c9a96e", "#ece8df"] as const;
const NILE_PORTS = [
  { num: "01", name: "LUXOR" },
  { num: "02", name: "ESNA" },
  { num: "03", name: "EDFU" },
  { num: "04", name: "KOM OMBO" },
  { num: "05", name: "ASWAN" },
] as const;
const OVERLAY_IMAGE_SRC = HATHOR_MEDIA.royalSuite;
const CLOSE_MS = 1100;

type EditorialNavOverlayProps = {
  open: boolean;
  onClose: () => void;
  onNavigate: (href: string) => void;
  navItems: HeaderNavItem[];
};

function padIndex(index: number): string {
  return String(index + 1).padStart(2, "0");
}

export function EditorialNavOverlay({
  open,
  onClose,
  onNavigate,
  navItems,
}: EditorialNavOverlayProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLElement | null>(null);
  const backdropRef = useRef<HTMLButtonElement | null>(null);
  const photoRef = useRef<HTMLDivElement | null>(null);
  const menuTlRef = useRef<gsap.core.Timeline | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  const closeMenu = useCallback(() => {
    setOpenGroupId(null);
    onClose();
  }, [onClose]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    const photo = photoRef.current;
    if (!root || !panel || !backdrop) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const prelayers = Array.from(
      root.querySelectorAll<HTMLElement>(".eno-prelayer"),
    );
    const rows = Array.from(root.querySelectorAll<HTMLElement>(".eno-row"));
    const chrome = Array.from(
      root.querySelectorAll<HTMLElement>("[data-eno-chrome]"),
    );

    const layerDuration = reduced ? 0.42 : 1.18;
    const panelDuration = reduced ? 0.38 : 1.08;
    const layerGap = reduced ? 0.06 : 0.16;

    gsap.set(backdrop, { opacity: 0, pointerEvents: "none" });
    gsap.set(prelayers, { xPercent: -100 });
    gsap.set(panel, { xPercent: -100, pointerEvents: "none" });
    if (photo) gsap.set(photo, { opacity: 0 });
    gsap.set(rows, { opacity: 0, y: 28 });
    gsap.set(chrome, { opacity: 0, y: 12 });

    const tl = gsap.timeline({
      paused: true,
      defaults: { ease: "power3.inOut" },
    });

    tl.to(
      backdrop,
      { opacity: 1, duration: reduced ? 0.18 : 0.42, pointerEvents: "auto" },
      0,
    )
      .to(prelayers[0], { xPercent: 0, duration: layerDuration }, 0)
      .to(prelayers[1], { xPercent: 0, duration: layerDuration }, layerGap)
      .to(
        prelayers[2],
        { xPercent: 0, duration: layerDuration + 0.04 },
        layerGap * 2,
      )
      .to(
        panel,
        { xPercent: 0, duration: panelDuration, pointerEvents: "auto" },
        reduced ? 0.18 : 0.48,
      );

    if (photo) {
      tl.to(
        photo,
        { opacity: 1, duration: reduced ? 0.28 : 0.9, ease: "power2.out" },
        reduced ? 0.2 : 0.55,
      );
    }

    tl.to(
      chrome,
      {
        opacity: 1,
        y: 0,
        duration: reduced ? 0.2 : 0.45,
        stagger: reduced ? 0.03 : 0.06,
        ease: "power2.out",
      },
      reduced ? 0.22 : 0.62,
    ).to(
      rows,
      {
        opacity: 1,
        y: 0,
        stagger: reduced ? 0.03 : 0.08,
        duration: reduced ? 0.22 : 0.5,
        ease: "power2.out",
      },
      reduced ? 0.24 : 0.68,
    );

    menuTlRef.current = tl;
    tl.progress(0).pause(0);

    return () => {
      tl.kill();
      menuTlRef.current = null;
    };
  }, [navItems]);

  useEffect(() => {
    const tl = menuTlRef.current;
    const root = rootRef.current;
    if (!tl || !root) return;
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (open) {
      root.classList.add("is-open");
      tl.play();
      return;
    }
    if (tl.progress() === 0) {
      root.classList.remove("is-open");
      return;
    }
    tl.reverse();
    closeTimerRef.current = window.setTimeout(() => {
      if (!open) root.classList.remove("is-open");
    }, CLOSE_MS);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, closeMenu]);

  const handleNavClick = (
    event: MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    event.preventDefault();
    onNavigate(href);
  };

  const handleBookNow = () => {
    closeMenu();
    const safePath =
      pathname.startsWith("/") && !pathname.startsWith("//") ? pathname : "/";
    router.push(`${safePath}?book=1`);
  };

  const toggleGroup = (id: string) => {
    setOpenGroupId((current) => (current === id ? null : id));
  };

  return (
    <div
      ref={rootRef}
      className={`eno${open ? " is-open" : ""}`}
      data-open={open || undefined}
      aria-hidden={!open}
    >
      <button
        ref={backdropRef}
        type="button"
        className="eno-backdrop"
        aria-label="Close menu"
        tabIndex={open ? 0 : -1}
        onClick={closeMenu}
      />

      <div className="eno-prelayers" aria-hidden="true">
        {LAYER_COLORS.map((color, index) => (
          <div
            key={`${color}-${index}`}
            className={`eno-prelayer eno-prelayer--${index + 1}`}
            style={{ background: color }}
          />
        ))}
      </div>

      <div ref={photoRef} className="eno-photo" aria-hidden="true">
        <Image
          src={OVERLAY_IMAGE_SRC}
          alt=""
          fill
          sizes="(min-width: 1025px) 34vw, 40vw"
          className="eno-photo__img"
          quality={90}
          priority={false}
        />
        <span className="eno-photo__veil" />
      </div>

      <aside
        ref={panelRef}
        className="eno-panel"
        aria-hidden={!open}
        aria-label="Site menu"
        role="dialog"
        aria-modal={open}
      >
        <div className="eno-rail" aria-hidden="true">
          <span className="eno-rail__line" />
          <Image
            src={HATHOR_ICON_GOLD_SRC}
            alt=""
            width={28}
            height={28}
            className="eno-rail__mark"
          />
          <span className="eno-rail__line" />
        </div>

        <header className="eno-top" data-eno-chrome>
          <button
            type="button"
            className="eno-close"
            onClick={closeMenu}
            aria-label="Close menu"
            tabIndex={open ? 0 : -1}
          >
            <span aria-hidden="true">×</span>
          </button>
          <p className="eno-kicker">Luxury voyages on the Nile</p>
          <button
            type="button"
            className="eno-book"
            onClick={handleBookNow}
            tabIndex={open ? 0 : -1}
          >
            <span>Book now</span>
            <span className="eno-book__arrow" aria-hidden="true">
              →
            </span>
          </button>
        </header>

        <nav className="eno-nav" aria-label="Primary">
          {navItems.map((item, index) => {
            const num = padIndex(index);
            if (item.type === "link") {
              return (
                <div className="eno-row" key={item.href}>
                  <Link
                    href={item.href}
                    className="eno-link"
                    onClick={(event) => handleNavClick(event, item.href)}
                    tabIndex={open ? 0 : -1}
                  >
                    <span className="eno-num">{num}</span>
                    <span className="eno-label">{item.label}</span>
                  </Link>
                </div>
              );
            }

            const expanded = openGroupId === item.id;
            return (
              <div
                className={`eno-row eno-row--group${expanded ? " is-open" : ""}`}
                key={item.id}
              >
                <button
                  type="button"
                  className="eno-link eno-link--group"
                  aria-expanded={expanded}
                  aria-controls={`eno-group-${item.id}`}
                  onClick={() => toggleGroup(item.id)}
                  tabIndex={open ? 0 : -1}
                >
                  <span className="eno-num">{num}</span>
                  <span className="eno-label">{item.label}</span>
                  <ChevronDown className="eno-chevron" aria-hidden />
                </button>
                <div
                  id={`eno-group-${item.id}`}
                  className="eno-sub"
                  hidden={!expanded}
                >
                  <Link
                    href={item.href}
                    className="eno-sublink"
                    onClick={(event) => handleNavClick(event, item.href)}
                    tabIndex={open && expanded ? 0 : -1}
                  >
                    Overview
                  </Link>
                  {item.links.map((link) => (
                    <Link
                      key={`${item.id}-${link.href}-${link.label}`}
                      href={link.href}
                      className="eno-sublink"
                      onClick={(event) => handleNavClick(event, link.href)}
                      tabIndex={open && expanded ? 0 : -1}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        <ol className="eno-ports" aria-label="Nile ports of call">
          {NILE_PORTS.map((port) => (
            <li key={port.name}>
              <span>{port.num}</span>
              <span>{port.name}</span>
            </li>
          ))}
        </ol>

        <footer className="eno-foot" data-eno-chrome>
          <p className="eno-copy">Hathor Dahabiya © 2026</p>
          <p className="eno-legal">
            <Link href="/contact" tabIndex={open ? 0 : -1} onClick={onClose}>
              Privacy Policy
            </Link>
            <span aria-hidden="true">·</span>
            <Link href="/contact" tabIndex={open ? 0 : -1} onClick={onClose}>
              Terms &amp; Conditions
            </Link>
          </p>
        </footer>
      </aside>
    </div>
  );
}
