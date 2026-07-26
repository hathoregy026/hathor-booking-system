import Link from "next/link";
import type { ReactNode } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { HATHOR_BRAND_NAME } from "@/lib/branding";
import { PUBLIC_CONTACT } from "@/lib/public-contact";
import { PUBLIC_SOCIAL_LINKS, type SocialPlatform } from "@/lib/public-social";
import { FooterSubscribe } from "@/components/layout/FooterSubscribe";

const MAPS_HREF = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(PUBLIC_CONTACT.address)}`;

const FOOTER_USEFUL_LINKS_LEFT = [
  { href: "/", label: "Home" },
  { href: "/luxury-cabins-Nile-Cruise", label: "Luxury Rooms" },
  { href: "/rooms", label: "Luxury Suites" },
  { href: "/Luxury-Royal-Suites-Nile-Dahabiya-Cruise", label: "Royal Suites" },
  { href: "/cruises", label: "Cruises" },
] as const;

const FOOTER_USEFUL_LINKS_RIGHT = [
  { href: "/about", label: "About" },
  { href: "/highlights", label: "Highlights" },
  { href: "/wellness", label: "Wellness" },
  { href: "/gastronomy", label: "Gastronomy" },
  { href: "/contact", label: "Contact" },
] as const;

const FOOTER_LEGAL = [
  { href: "/", label: "Home" },
  {
    href: `mailto:${PUBLIC_CONTACT.email}?subject=${encodeURIComponent("Terms of Service Inquiry")}`,
    label: "Terms",
    external: true,
  },
  {
    href: `mailto:${PUBLIC_CONTACT.email}?subject=${encodeURIComponent("Privacy Policy Inquiry")}`,
    label: "Privacy",
    external: true,
  },
  {
    href: `mailto:${PUBLIC_CONTACT.email}?subject=${encodeURIComponent("Policy Inquiry")}`,
    label: "Policy",
    external: true,
  },
  { href: "/contact", label: "Contact" },
] as const;

const SOCIAL_KEYS = ["facebook", "instagram", "linkedin"] as const satisfies readonly SocialPlatform[];

function SocialGlyph({ platform }: { platform: (typeof SOCIAL_KEYS)[number] }) {
  const icons: Record<(typeof SOCIAL_KEYS)[number], ReactNode> = {
    facebook: (
      <svg viewBox="0 0 24 24" aria-hidden fill="currentColor">
        <path d="M14 8.5h2.25V6H14c-1.93 0-3.5 1.57-3.5 3.5V12H8.25v2.5H10.5V21h3V14.5h2.25L16.25 12H13.5v-2c0-.55.45-1 1-1Z" />
      </svg>
    ),
    instagram: (
      <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.7">
        <rect x="4" y="4" width="16" height="16" rx="4" />
        <circle cx="12" cy="12" r="3.5" />
        <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
      </svg>
    ),
    linkedin: (
      <svg viewBox="0 0 24 24" aria-hidden fill="currentColor">
        <path d="M7.2 9.2H4.6V19h2.6V9.2ZM5.9 5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM19.4 19h-2.6v-4.7c0-1.12-.02-2.56-1.56-2.56-1.56 0-1.8 1.22-1.8 2.48V19h-2.6V9.2h2.5v1.34h.04c.35-.66 1.2-1.36 2.47-1.36 2.64 0 3.13 1.74 3.13 4V19Z" />
      </svg>
    ),
  };

  return icons[platform];
}

const FOOTER_SOCIAL = PUBLIC_SOCIAL_LINKS.filter((link) =>
  SOCIAL_KEYS.includes(link.key as (typeof SOCIAL_KEYS)[number]),
).slice(0, 3);

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="owo-footer">
      <div className="owo-footer__contact-bar">
        <div className="owo-footer__inner hathor-container">
          <div className="owo-footer__contact-grid">
            <a
              href={MAPS_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="owo-footer__contact-item cursor-hover"
            >
              <span className="owo-footer__contact-icon" aria-hidden>
                <MapPin />
              </span>
              <span className="owo-footer__contact-copy">
                <span className="owo-footer__contact-title">Find us</span>
                <span className="owo-footer__contact-text">{PUBLIC_CONTACT.address}</span>
              </span>
            </a>

            <a
              href={`tel:${PUBLIC_CONTACT.phone}`}
              className="owo-footer__contact-item cursor-hover"
            >
              <span className="owo-footer__contact-icon" aria-hidden>
                <Phone />
              </span>
              <span className="owo-footer__contact-copy">
                <span className="owo-footer__contact-title">Call us</span>
                <span className="owo-footer__contact-text">{PUBLIC_CONTACT.phoneDisplay}</span>
              </span>
            </a>

            <a
              href={`mailto:${PUBLIC_CONTACT.email}`}
              className="owo-footer__contact-item cursor-hover"
            >
              <span className="owo-footer__contact-icon" aria-hidden>
                <Mail />
              </span>
              <span className="owo-footer__contact-copy">
                <span className="owo-footer__contact-title">Mail us</span>
                <span className="owo-footer__contact-text">{PUBLIC_CONTACT.email}</span>
              </span>
            </a>
          </div>
        </div>
      </div>

      <div className="owo-footer__main">
        <div className="owo-footer__inner hathor-container">
          <div className="owo-footer__grid">
            <div className="owo-footer__brand">
              <p className="owo-footer__wordmark">
                <span className="owo-footer__wordmark-gold">{HATHOR_BRAND_NAME}</span>
              </p>
              <p className="owo-footer__tag">Luxury Dahabiya Nile Cruise</p>
              <p className="owo-footer__blurb">
                Sail the Nile aboard Hathor — an intimate dahabiya voyage of quiet luxury,
                timeless temples, and unhurried Egyptian evenings.
              </p>
              <div className="owo-footer__follow">
                <p className="owo-footer__follow-label">Follow us</p>
                <ul className="owo-footer__social">
                  {FOOTER_SOCIAL.map((link) => (
                    <li key={link.key}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="owo-footer__social-link cursor-hover"
                        aria-label={link.label}
                      >
                        <SocialGlyph platform={link.key as (typeof SOCIAL_KEYS)[number]} />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="owo-footer__col">
              <p className="owo-footer__col-label">Useful Links</p>
              <div className="owo-footer__links-split">
                <ul className="owo-footer__links">
                  {FOOTER_USEFUL_LINKS_LEFT.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="owo-footer__link cursor-hover">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <ul className="owo-footer__links">
                  {FOOTER_USEFUL_LINKS_RIGHT.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="owo-footer__link cursor-hover">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="owo-footer__col owo-footer__col--subscribe">
              <p className="owo-footer__col-label">Subscribe</p>
              <p className="owo-footer__subscribe-copy">
                Don&apos;t miss our Nile stories and sailing updates — kindly fill the form
                below.
              </p>
              <FooterSubscribe />
            </div>
          </div>
        </div>
      </div>

      <div className="owo-footer__legal">
        <div className="owo-footer__inner hathor-container">
          <div className="owo-footer__legal-row">
            <p className="owo-footer__copy">
              Copyright © {year}, All Right Reserved{" "}
              <Link href="/" className="owo-footer__copy-brand cursor-hover">
                {HATHOR_BRAND_NAME}
              </Link>
            </p>
            <div className="owo-footer__legal-links">
              {FOOTER_LEGAL.map((link) =>
                "external" in link && link.external ? (
                  <a
                    key={link.label}
                    href={link.href}
                    className="owo-footer__legal-link cursor-hover"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="owo-footer__legal-link cursor-hover"
                  >
                    {link.label}
                  </Link>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
