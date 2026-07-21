import Link from "next/link";
import { HATHOR_BRAND_NAME } from "@/lib/branding";
import { PUBLIC_CONTACT } from "@/lib/public-contact";

const FOOTER_EXPLORE = [
  { href: "/luxury-cabins-Nile-Cruise", label: "Luxury Rooms" },
  { href: "/rooms", label: "Luxury Suites" },
  { href: "/Luxury-Royal-Suites-Nile-Dahabiya-Cruise", label: "Royal Suites" },
  { href: "/cruises", label: "Cruises" },
  { href: "/about", label: "About" },
  { href: "/blogs", label: "Blog" },
] as const;

const FOOTER_EXPERIENCES = [
  { href: "/highlights", label: "Highlights" },
  { href: "/wellness", label: "Wellness" },
  { href: "/gastronomy", label: "Gastronomy" },
  { href: "/charter", label: "Charter" },
] as const;

const FOOTER_LEGAL = [
  { id: "press", href: `mailto:${PUBLIC_CONTACT.email}`, label: "Press" },
  { id: "privacy", href: "/contact", label: "Privacy" },
  { id: "contact", href: "/contact", label: "Contact" },
  { id: "sitemap", href: "/cruises", label: "Sitemap" },
] as const;

/** Route-local footer cap so the giant logo can rise behind it. */
export function CruisesFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="owo-footer cruises-footer homepage-2-footer !mt-0 !pt-20">
      <div className="owo-footer__inner hathor-container">
        <div className="owo-footer__grid">
          <div className="owo-footer__brand">
            <p className="owo-footer__wordmark">{HATHOR_BRAND_NAME}</p>
            <p className="owo-footer__tag">Luxury Dahabiya Nile Cruise</p>
            <p className="owo-footer__address">{PUBLIC_CONTACT.address}</p>
          </div>

          <div className="owo-footer__col">
            <p className="owo-footer__col-label">Explore</p>
            <ul className="owo-footer__links">
              {FOOTER_EXPLORE.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="owo-footer__link cursor-hover">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="owo-footer__col">
            <p className="owo-footer__col-label">Experiences</p>
            <ul className="owo-footer__links">
              {FOOTER_EXPERIENCES.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="owo-footer__link cursor-hover">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="owo-footer__col">
            <p className="owo-footer__col-label">Contact</p>
            <ul className="owo-footer__contact">
              <li>
                <a
                  href={`mailto:${PUBLIC_CONTACT.email}`}
                  className="owo-footer__link cursor-hover"
                >
                  {PUBLIC_CONTACT.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${PUBLIC_CONTACT.phone}`}
                  className="owo-footer__link cursor-hover"
                >
                  {PUBLIC_CONTACT.phoneDisplay}
                </a>
              </li>
              <li className="owo-footer__hours">{PUBLIC_CONTACT.workingHours}</li>
            </ul>
          </div>
        </div>

        <div className="owo-footer__legal">
          <div className="owo-footer__legal-row">
            <div className="owo-footer__legal-links">
              {FOOTER_LEGAL.map((link) => (
                <a
                  key={link.id}
                  href={link.href}
                  className="owo-footer__legal-link cursor-hover"
                >
                  {link.label}
                </a>
              ))}
            </div>
            <p className="owo-footer__copy">
              © {HATHOR_BRAND_NAME} {year}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
