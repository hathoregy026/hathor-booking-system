"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, Phone, X } from "lucide-react";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { SocialBrandIcon } from "@/components/public/SocialBrandIcon";
import { PUBLIC_CONTACT } from "@/lib/public-contact";
import { HOMEPAGE_HERO } from "@/lib/homepage-content";
import { PUBLIC_SOCIAL_LINKS } from "@/lib/public-social";
import { shouldShowFloatingActions } from "@/lib/floating-actions-visibility";
import { useSelectionPanelOpen } from "@/components/selection/SelectionProvider";

const HERO_CTA_SELECTOR =
  ".home-hero-container .hero-button .hero-cta, .home-hero-container .hero-cta";

export function FloatingActions() {
  const pathname = usePathname();
  const [chatOpen, setChatOpen] = useState(false);
  const [showBook, setShowBook] = useState(false);
  const [nearFooter, setNearFooter] = useState(false);
  /*
   * A selection sheet is a modal surface. Park the dock while one is open so no
   * fixed chrome competes with it — the existing --hidden state is reused, and
   * normal behaviour resumes the moment the sheet closes. Nothing permanent.
   */
  const selectionOpen = useSelectionPanelOpen();
  const visible = shouldShowFloatingActions(pathname);

  useEffect(() => {
    if (!visible) return;

    setChatOpen(false);
    setShowBook(false);

    let observer: IntersectionObserver | null = null;
    let cancelled = false;

    const attach = () => {
      if (cancelled) return;
      observer?.disconnect();
      observer = null;

      const source = document.querySelector(HERO_CTA_SELECTOR);
      if (!source) {
        setShowBook(true);
        return;
      }

      observer = new IntersectionObserver(
        ([entry]) => {
          setShowBook(!entry?.isIntersecting);
        },
        { threshold: 0.15, rootMargin: "0px" },
      );
      observer.observe(source);
    };

    /* Hero mounts after route paint — retry briefly */
    attach();
    const t1 = window.setTimeout(attach, 120);
    const t2 = window.setTimeout(attach, 400);

    return () => {
      cancelled = true;
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      observer?.disconnect();
    };
  }, [pathname, visible]);

  /*
   * The dock is `position: fixed`, so once a page scrolls past its hero it
   * sits over whatever is at the bottom of the viewport for the rest of the
   * page — including the shared footer, where it visually covers the
   * "Crafted with precision in Egypt" line (confirmed live on /partners and
   * every other page that mounts <Footer/>). Fade the dock out once the
   * footer is actually on screen so it never overlaps footer content.
   */
  useEffect(() => {
    if (!visible) return;

    setNearFooter(false);

    let observer: IntersectionObserver | null = null;
    let cancelled = false;

    const attach = () => {
      if (cancelled) return;
      observer?.disconnect();
      observer = null;

      const footer = document.querySelector(".lux-footer");
      if (!footer) return;

      observer = new IntersectionObserver(
        ([entry]) => {
          const isNearFooter = Boolean(entry?.isIntersecting);
          setNearFooter(isNearFooter);
          if (isNearFooter) setChatOpen(false);
        },
        { threshold: 0, rootMargin: "0px" },
      );
      observer.observe(footer);
    };

    attach();
    const t1 = window.setTimeout(attach, 120);
    const t2 = window.setTimeout(attach, 400);

    return () => {
      cancelled = true;
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      observer?.disconnect();
    };
  }, [pathname, visible]);

  useEffect(() => {
    if (!chatOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setChatOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [chatOpen]);

  if (!visible) return null;

  const parked = nearFooter || selectionOpen;

  return (
    <div
      className={`public-fab public-fab--right${parked ? " public-fab--hidden" : ""}`}
      aria-hidden={parked}
      inert={parked || undefined}
    >
      {chatOpen ? (
        <button
          type="button"
          className="public-fab__backdrop"
          aria-label="Close contact links"
          onClick={() => setChatOpen(false)}
        />
      ) : null}

      <div className="public-fab__cluster">
        <div
          className={`public-fab__book-slot${showBook ? " public-fab__book-slot--visible" : ""}`}
          aria-hidden={!showBook}
        >
          <BookNowTrigger className="public-fab__book">
            <span className="public-fab__book-text">{HOMEPAGE_HERO.cta}</span>
          </BookNowTrigger>
        </div>

        <div
          className={`public-fab__chat${chatOpen ? " public-fab__chat--open" : ""}`}
        >
          <div
            className="public-fab__chat-menu"
            role="menu"
            aria-hidden={!chatOpen}
          >
            {PUBLIC_SOCIAL_LINKS.map((link, i) => (
              <a
                key={link.key}
                href={link.href}
                className="public-fab__icon-btn"
                role="menuitem"
                aria-label={link.label}
                target="_blank"
                rel="noopener noreferrer"
                style={{ transitionDelay: chatOpen ? `${40 + i * 35}ms` : "0ms" }}
              >
                <SocialBrandIcon
                  platform={link.key}
                  className="public-fab__brand-icon"
                />
              </a>
            ))}

            <a
              href={PUBLIC_CONTACT.whatsappUrl}
              className="public-fab__icon-btn"
              role="menuitem"
              aria-label="WhatsApp"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                transitionDelay: chatOpen
                  ? `${40 + PUBLIC_SOCIAL_LINKS.length * 35}ms`
                  : "0ms",
              }}
            >
              <MessageCircle className="public-fab__lucide" aria-hidden />
            </a>

            <a
              href={`tel:${PUBLIC_CONTACT.phone}`}
              className="public-fab__icon-btn"
              role="menuitem"
              aria-label={`Call ${PUBLIC_CONTACT.phoneDisplay}`}
              style={{
                transitionDelay: chatOpen
                  ? `${40 + (PUBLIC_SOCIAL_LINKS.length + 1) * 35}ms`
                  : "0ms",
              }}
            >
              <Phone className="public-fab__lucide" aria-hidden />
            </a>
          </div>

          <button
            type="button"
            className="public-fab__chat-main"
            aria-expanded={chatOpen}
            aria-label={chatOpen ? "Close contact links" : "Open contact links"}
            onClick={() => setChatOpen((open) => !open)}
          >
            {chatOpen ? (
              <X className="public-fab__chat-icon" aria-hidden />
            ) : (
              <MessageCircle className="public-fab__chat-icon" aria-hidden />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
