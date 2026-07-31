"use client";

import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HATHOR_BRAND_NAME } from "@/lib/branding";
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

function FooterBgWordmark({ className }: { className?: string }) {
  /* Cropped HATHOR only — subtitle paths omitted; viewBox trims lower band */
  return (
    <svg
      className={className}
      viewBox="0 4 250 56"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M158.42,56.79l-6.04-.02c-.27-.49-.23-1.06-.12-1.62.38-.06.66-.07.99-.28v-17.75s-21.23.02-21.23.02l-.08,16.68,1.47,3.05-7.45-.08,1.74-2.99V21.52s4.29,1.19,4.29,1.19l.02,12.99,21.21.04.05-10.26c0-1.19,1.68-.19,4.05-1.15l.05,30.62,1.17.18c.1.53.13.99-.11,1.65Z"
      />
      <path
        fill="currentColor"
        d="M105.6,56.84l-7.74.03,1.9-2.89v-31.12s-10.56-.01-10.56-.01c-.49.62-.74,1.18-1.5,1.69v-4.56s29.47-.01,29.47-.01v4.68s-1.62-1.81-1.62-1.81l-11.45.03-.02,31.14,1.51,2.83Z"
      />
      <path
        fill="currentColor"
        d="M201.86,28.83c-2.42-4.17-6.25-6.86-10.69-8.08-.11-.46.32-.76.76-.73,3.33.2,6.35,1.48,8.99,3.44,5.45,4.03,8.22,10.38,7.57,17.12-.7,7.32-5.44,13.35-12.42,15.82-7.75,2.74-16.61.64-22.25-5.39-2.43-2.6-3.81-5.7-4.44-9.13-1.84-10.03,4.23-19.57,14.13-22.04.35-.09.62.12.64.37.02.18-.03.59-.32.71-5.63,2.27-9.72,7.08-10.91,13.12-1.12,5.72.39,11.67,4.25,16.04,2.82,3.19,6.65,4.78,10.84,4.97,5.6.26,10.67-2.36,13.63-7.14,3.58-5.77,3.69-13.11.22-19.08Z"
      />
      <path
        fill="currentColor"
        d="M193.87,14.12c-1.91.92-3.82.77-5.49-.32l-2.51-1.63-2.25-.38c-.17-.03-.37-.17-.44-.29-.3-.5,1.86-1.82,3.92-.34,2.64,1.89,5.87,1.82,8.36-.28.3-.25.87-.25,1.19-.15.3.09.78.58.47,1.04-.72,1.11-2.02,1.75-3.26,2.35Z"
      />
      <circle fill="currentColor" cx="190.3" cy="8.8" r="1.92" />
      <path
        fill="currentColor"
        d="M228.68,40.59c4.67.07,8.49-3.01,9.48-7.58.83-3.82-.57-7.44-3.87-9.62-2.64-1.74-5.89-2.2-8.97-1.45v31.84s1.58,3.07,1.58,3.07h-7.73s2.03-3.01,2.03-3.01v-31.22s-1.8-2.37-1.8-2.37l7.09-.11c6.6-.1,13.44,1.03,15.58,7.88,1.8,5.74-1.52,11.75-7.27,13.59.76,1.53,1.74,2.52,2.67,3.74,3.35,4.37,7.2,7.97,11.85,11.46-2.9.72-5.71-.41-8-2.2-3.82-2.97-6.94-6.58-9.94-10.37l-2.7-3.67Z"
      />
      <path
        fill="currentColor"
        d="M34.02,56.81l-7.53.1,1.91-2.88.02-16.9H6.81s-.06,5.44-.06,5.44c-.04,3.85-.2,7.62.09,11.44l1.4,2.85-7.57.03,1.82-2.88.03-31.55-1.71-2.24h6.91c.18-.01.22.68.08.8-.17.14-.55.2-1,.27-.26,4.8-.06,9.59-.01,14.44h21.62s-.05-13.14-.05-13.14c0-.92-1.24-1.36-1.61-2.36l6.69-.02c.27,0,.34.46.27.64-.19.49-1.14.27-1.14,1.14v31.94s1.44,2.88,1.44,2.88Z"
      />
      <path
        fill="currentColor"
        d="M60.48,42.7c-1.66,1.17-3.14,2.4-4.45,3.86-2.22,2.49-4.31,4.96-5.83,7.97-.25.49.25,1.46-.39,1.95l-7.33.03c4.46-5.23,9.12-9.95,14.17-14.45,3.13-2.85,6.59-5.08,10.69-6.25l-4.81-11.14-7.62,16.23c-.48,1.12-1.34,1.91-2.54,2.29l11.78-27.51,12.11,26.46,4.05,8.94c.95,2.1,1.98,4,3.5,5.83-1.4.5-2.6.04-3.77-.63-4.1-2.36-6.15-8-7.93-12.44l3.54-.14c.63-.8-.24-2.15-1.26-2.32-4.69-.78-9.96-1.45-13.91,1.33Z"
      />
    </svg>
  );
}

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
            <FooterBgWordmark className="lux-footer__bg-logo-img" />
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
