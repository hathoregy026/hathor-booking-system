"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { SocialBrandIcon } from "@/components/public/SocialBrandIcon";
import { HOMEPAGE_HERO } from "@/lib/homepage-content";
import { PUBLIC_SOCIAL_LINKS } from "@/lib/public-social";
import { isHeroRoute } from "@/lib/public-theme";

export function FloatingActions() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const showHeroBookNow = isHeroRoute(pathname);

  return (
    <div className="public-bottom-dock">
      {expanded && (
        <button
          type="button"
          className="public-social-hub__backdrop"
          aria-label="Close social links"
          onClick={() => setExpanded(false)}
        />
      )}

      <div className="public-bottom-dock__row">
        <aside
          className={`public-social-hub ${expanded ? "public-social-hub--expanded" : ""}`}
          aria-label="Social links"
        >
          {expanded && (
            <div className="public-social-hub__menu" role="menu">
              {PUBLIC_SOCIAL_LINKS.map((link) => (
                <a
                  key={link.key}
                  href={link.href}
                  className="public-social-hub__icon-btn cursor-hover"
                  role="menuitem"
                  aria-label={link.label}
                  onClick={(event) => {
                    if (link.href === "#") {
                      event.preventDefault();
                    }
                  }}
                >
                  <SocialBrandIcon
                    platform={link.key}
                    className="public-social-hub__brand-icon"
                  />
                </a>
              ))}
            </div>
          )}

          <button
            type="button"
            className="public-social-hub__main cursor-hover"
            aria-expanded={expanded}
            aria-label={expanded ? "Close social links" : "Open social links"}
            onClick={() => setExpanded((open) => !open)}
          >
            <MessageCircle className="public-social-hub__chat-icon" aria-hidden />
          </button>
        </aside>

        {showHeroBookNow && (
          <BookNowTrigger className="public-bottom-dock__book owo-hero__cta--outline cursor-hover">
            {HOMEPAGE_HERO.cta}
          </BookNowTrigger>
        )}
      </div>
    </div>
  );
}
