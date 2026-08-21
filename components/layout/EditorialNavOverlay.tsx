"use client";

/**
 * Desktop/tablet left overlay for Suites, Cruises, Voyages, About, Contact
 * (and their dropdown destinations). Homepage does not mount this.
 *
 * Open is CSS-driven so the cream menu cannot get stuck off-screen:
 * 0.00–0.18  dark gold sheet (#8b6914)
 * 0.16–0.36  light gold sheet (#c9a96e)
 * 0.32–0.52  cream sheet (#ece8df)
 * 0.45–0.78  cream content panel
 * 0.62–1.00  rows rise in
 */

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type MouseEvent } from "react";
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

  const closeMenu = useCallback(() => {
    setOpenGroupId(null);
    onClose();
  }, [onClose]);

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
      className={`eno${open ? " is-open" : ""}`}
      data-open={open || undefined}
      aria-hidden={!open}
    >
      <button
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

      <div className="eno-photo" aria-hidden="true">
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
