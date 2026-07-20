"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, Phone, X } from "lucide-react";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { SocialBrandIcon } from "@/components/public/SocialBrandIcon";
import { PUBLIC_CONTACT } from "@/lib/public-contact";
import { HOMEPAGE_HERO } from "@/lib/homepage-content";
import { PUBLIC_SOCIAL_LINKS } from "@/lib/public-social";

const HERO_CTA_SELECTOR =
  ".home-hero-container .hero-button .hero-cta, .home-hero-container .hero-cta";

export function FloatingActions() {
  const pathname = usePathname();
  const [chatOpen, setChatOpen] = useState(false);
  const [showBook, setShowBook] = useState(false);

  useEffect(() => {
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
  }, [pathname]);

  useEffect(() => {
    if (!chatOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setChatOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [chatOpen]);

  return (
    <>
      <div className="public-fab public-fab--left">
        {chatOpen ? (
          <button
            type="button"
            className="public-fab__backdrop"
            aria-label="Close contact links"
            onClick={() => setChatOpen(false)}
          />
        ) : null}

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

      <div
        className={`public-fab public-fab--right${showBook ? " public-fab--book-visible" : ""}`}
        aria-hidden={!showBook}
      >
        <BookNowTrigger className="btn btn-light hero-cta public-fab__book">
          <span className="hero-cta-text">{HOMEPAGE_HERO.cta}</span>
        </BookNowTrigger>
      </div>
    </>
  );
}
