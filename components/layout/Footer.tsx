"use client";

import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  HATHOR_BRAND_NAME,
  HATHOR_FOOTER_BG_WORDMARK_SRC,
} from "@/lib/branding";
import { PUBLIC_CONTACT } from "@/lib/public-contact";
import { PUBLIC_SOCIAL_LINKS } from "@/lib/public-social";
import { FooterSubscribe } from "@/components/layout/FooterSubscribe";

/** Resolve live theme tokens so hover motion stays on-brand. */
function footerTheme(el: Element) {
  const styles = getComputedStyle(el);
  return {
    gold: styles.getPropertyValue("--lux-gold").trim() || "#b69f64",
    text: styles.getPropertyValue("--lux-ink-soft").trim() || "#4a3f32",
    muted: styles.getPropertyValue("--lux-muted").trim() || "#6b6560",
  };
}

const EXPLORE_LINKS = [
  { href: "/about", label: "The Ship" },
  { href: "/Luxury-Royal-Suites-Nile-Dahabiya-Cruise", label: "Royal Suites" },
  { href: "/cruises", label: "Journeys" },
  { href: "/gastronomy", label: "Dining" },
] as const;

const INFO_LINKS = [
  { href: "/contact", label: "Contact Concierge" },
  { href: "/contact", label: "FAQ" },
  {
    href: `mailto:${PUBLIC_CONTACT.email}?subject=${encodeURIComponent("Privacy Policy Inquiry")}`,
    label: "Privacy Policy",
    external: true,
  },
  {
    href: `mailto:${PUBLIC_CONTACT.email}?subject=${encodeURIComponent("Terms of Voyage Inquiry")}`,
    label: "Terms of Voyage",
    external: true,
  },
] as const;

type SocialKey = "instagram" | "linkedin" | "facebook";

const SOCIAL_ORDER: SocialKey[] = ["instagram", "linkedin", "facebook"];

function AnkhIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden fill="none">
      <path
        d="M12 8.2c-1.7 0-3-1.2-3-2.7S10.3 2.8 12 2.8s3 1.2 3 2.7-1.3 2.7-3 2.7Zm0 0V21M7.5 13.5h9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SocialGlyph({ platform }: { platform: SocialKey }) {
  const icons: Record<SocialKey, ReactNode> = {
    instagram: (
      <svg viewBox="0 0 24 24" aria-hidden>
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
    linkedin: (
      <svg viewBox="0 0 24 24" aria-hidden>
        <rect x="3.5" y="3.5" width="17" height="17" rx="2" />
        <path d="M8 11v6M8 8.2v.1M12 17v-3.8c0-1.2.8-2 2-2s2 .8 2 2V17" />
      </svg>
    ),
    facebook: (
      <svg viewBox="0 0 24 24" aria-hidden>
        <path d="M14 8h2.5V5.5H14c-2.2 0-4 1.8-4 4V12H7.5v2.5H10V21h3v-6.5h2.5V12H13v-2c0-.55.45-1 1-1Z" />
      </svg>
    ),
  };

  return icons[platform];
}

const FOOTER_SOCIAL = SOCIAL_ORDER.map((key) =>
  PUBLIC_SOCIAL_LINKS.find((link) => link.key === key),
).filter((link): link is NonNullable<typeof link> => Boolean(link));

function FooterNavLink({
  href,
  label,
  external,
}: {
  href: string;
  label: string;
  external?: boolean;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const line = lineRef.current;
    if (!el || !line) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    gsap.set(line, { scaleX: 0, transformOrigin: "left center" });
    const theme = footerTheme(el);

    const handleEnter = () => {
      gsap.to(el, {
        color: theme.gold,
        duration: 0.35,
        ease: "power2.out",
        overwrite: "auto",
      });
      gsap.to(line, {
        scaleX: 1,
        duration: 0.45,
        ease: "power3.out",
        overwrite: "auto",
      });
    };

    const handleLeave = () => {
      gsap.to(el, {
        color: theme.text,
        duration: 0.4,
        ease: "power2.out",
        overwrite: "auto",
      });
      gsap.to(line, {
        scaleX: 0,
        duration: 0.35,
        ease: "power2.inOut",
        overwrite: "auto",
      });
    };

    el.addEventListener("mouseenter", handleEnter);
    el.addEventListener("mouseleave", handleLeave);

    return () => {
      el.removeEventListener("mouseenter", handleEnter);
      el.removeEventListener("mouseleave", handleLeave);
      gsap.killTweensOf([el, line]);
    };
  }, []);

  const className = "lux-footer__link cursor-hover";
  const content = (
    <>
      {label}
      <span ref={lineRef} className="lux-footer__link-line" aria-hidden />
    </>
  );

  if (external) {
    return (
      <a ref={ref} href={href} className={className}>
        {content}
      </a>
    );
  }

  return (
    <Link ref={ref} href={href} className={className}>
      {content}
    </Link>
  );
}

export function Footer() {
  const rootRef = useRef<HTMLElement>(null);
  const year = new Date().getFullYear();

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    gsap.registerPlugin(ScrollTrigger);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const ctx = gsap.context(() => {
      const headline = root.querySelector(".lux-footer__headline");
      const subhead = root.querySelector(".lux-footer__subhead");
      const subscribe = root.querySelector(".lux-footer__subscribe");
      const columns = root.querySelectorAll(".lux-footer__col");

      gsap.set([headline, subhead, subscribe], { y: 50, opacity: 0 });
      gsap.set(columns, { y: 30, opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top 85%",
          once: true,
          onEnter: () => root.classList.add("is-copy-ready"),
        },
      });

      tl.to(headline, {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out",
      })
        .to(
          subhead,
          { y: 0, opacity: 1, duration: 0.9, ease: "power3.out" },
          "-=0.7",
        )
        .to(
          subscribe,
          { y: 0, opacity: 1, duration: 0.85, ease: "power3.out" },
          "-=0.65",
        )
        .to(
          columns,
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: "power3.out",
          },
          "-=0.45",
        );

      /* Refresh mid-page: if footer already intersects, show invitation copy */
      requestAnimationFrame(() => {
        const top = root.getBoundingClientRect().top;
        if (top < window.innerHeight * 0.95) {
          gsap.set([headline, subhead, subscribe, ...columns], {
            y: 0,
            opacity: 1,
          });
          root.classList.add("is-copy-ready");
        }
      });
    }, root);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const icons = root.querySelectorAll<HTMLElement>(".lux-footer__social-link");
    const cleanups: Array<() => void> = [];
    const theme = footerTheme(root);

    icons.forEach((icon) => {
      const onEnter = () => {
        gsap.to(icon, {
          color: theme.gold,
          scale: 1.1,
          rotation: 5,
          duration: 0.4,
          ease: "elastic.out(1, 0.45)",
          overwrite: "auto",
        });
      };
      const onLeave = () => {
        gsap.to(icon, {
          color: theme.muted,
          scale: 1,
          rotation: 0,
          duration: 0.45,
          ease: "power3.out",
          overwrite: "auto",
        });
      };
      icon.addEventListener("mouseenter", onEnter);
      icon.addEventListener("mouseleave", onLeave);
      cleanups.push(() => {
        icon.removeEventListener("mouseenter", onEnter);
        icon.removeEventListener("mouseleave", onLeave);
        gsap.killTweensOf(icon);
      });
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return (
    <footer ref={rootRef} className="lux-footer">
      <div className="lux-footer__noise" aria-hidden />
      <div className="lux-footer__glow" aria-hidden />

      <div className="lux-footer__inner">
        <div className="lux-footer__top">
          <h2 className="lux-footer__headline typo-page-title">
            BEGIN YOUR JOURNEY
          </h2>
          <p className="lux-footer__subhead typo-body-text">
            Join our exclusive circle for private itineraries and early access to rare
            voyages.
          </p>
          <div className="lux-footer__subscribe">
            <FooterSubscribe />
          </div>
        </div>

        <div className="lux-footer__main">
          <div className="lux-footer__bg-logo" aria-hidden>
            <img
              src={HATHOR_FOOTER_BG_WORDMARK_SRC}
              alt=""
              className="lux-footer__bg-logo-img"
              decoding="async"
              draggable={false}
            />
          </div>
          <div className="lux-footer__grid">
            <div className="lux-footer__col lux-footer__col--brand">
              <Link href="/" className="lux-footer__brand-mark cursor-hover">
                <AnkhIcon className="lux-footer__ankh" />
                <p className="lux-footer__wordmark">{HATHOR_BRAND_NAME}</p>
              </Link>
              <p className="lux-footer__tagline">
                Navigating the eternal Nile with unparalleled elegance since 2024.
              </p>
            </div>

            <div className="lux-footer__col">
              <p className="lux-footer__col-title">Explore</p>
              <ul className="lux-footer__links">
                {EXPLORE_LINKS.map((link) => (
                  <li key={link.label}>
                    <FooterNavLink href={link.href} label={link.label} />
                  </li>
                ))}
              </ul>
            </div>

            <div className="lux-footer__col">
              <p className="lux-footer__col-title">Information</p>
              <ul className="lux-footer__links">
                {INFO_LINKS.map((link) => (
                  <li key={link.label}>
                    <FooterNavLink
                      href={link.href}
                      label={link.label}
                      external={"external" in link && link.external}
                    />
                  </li>
                ))}
              </ul>
            </div>

            <div className="lux-footer__col">
              <p className="lux-footer__col-title">Follow the Voyage</p>
              <ul className="lux-footer__social">
                {FOOTER_SOCIAL.map((link) => (
                  <li key={link.key}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="lux-footer__social-link cursor-hover"
                      aria-label={link.label}
                    >
                      <SocialGlyph platform={link.key as SocialKey} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="lux-footer__bottom">
          <div className="lux-footer__bottom-row">
            <p className="lux-footer__legal">
              © {year} Hathor Cruise. All rights reserved.
            </p>
            <p className="lux-footer__crafted">
              Crafted with precision in Egypt.
              <AnkhIcon className="lux-footer__crafted-icon" />
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
