import Link from "next/link";
import {
  HATHOR_BRAND_NAME,
  HATHOR_FOOTER_LOGO_DAY_SRC,
  HATHOR_FOOTER_LOGO_SRC,
} from "@/lib/branding";
import { PUBLIC_CONTACT } from "@/lib/public-contact";

const FOOTER_COLUMNS = [
  {
    links: [
      { href: "/rooms", label: "Accommodations" },
      { href: "/highlights", label: "Experiences" },
    ],
  },
  {
    links: [
      { href: "/cruises", label: "Cruises" },
      { href: "/about", label: "About" },
    ],
  },
  {
    links: [
      { href: "/wellness", label: "Wellness" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    links: [
      { href: "/gastronomy", label: "Dining" },
      { href: "/blogs", label: "Blog" },
    ],
  },
] as const;

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="owo-footer">
      <div className="owo-footer__brand-block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HATHOR_FOOTER_LOGO_SRC}
          alt={HATHOR_BRAND_NAME}
          className="owo-footer__logo hathor-brand-logo hathor-brand-logo--night"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HATHOR_FOOTER_LOGO_DAY_SRC}
          alt=""
          aria-hidden
          className="owo-footer__logo hathor-brand-logo hathor-brand-logo--day"
        />
        <p className="owo-footer__wordmark">{HATHOR_BRAND_NAME}</p>
        <p className="owo-footer__tag">Luxury Dahabiya Nile Cruise</p>
      </div>

      <div className="owo-footer__nav">
        {FOOTER_COLUMNS.map((column, colIndex) => (
          <ul key={colIndex} className="owo-footer__col">
            {column.links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="owo-footer__link cursor-hover">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        ))}
      </div>

      <div className="owo-footer__legal">
        <div className="owo-footer__legal-row">
          <a href={`mailto:${PUBLIC_CONTACT.email}`} className="owo-footer__legal-link cursor-hover">
            Press
          </a>
          <div className="owo-footer__legal-right">
            <Link href="/contact" className="owo-footer__legal-link cursor-hover">
              Privacy
            </Link>
            <Link href="/contact" className="owo-footer__legal-link cursor-hover">
              Contact
            </Link>
            <Link href="/cruises" className="owo-footer__legal-link cursor-hover">
              Sitemap
            </Link>
          </div>
        </div>
        <p className="owo-footer__copy">© {HATHOR_BRAND_NAME} {year}</p>
      </div>
    </footer>
  );
}
