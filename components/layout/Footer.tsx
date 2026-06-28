import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { HATHOR_BRAND_NAME } from "@/lib/branding";
import { PUBLIC_CONTACT } from "@/lib/public-contact";
import { NAV_GROUPS } from "@/lib/public-nav";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="hathor-footer">
      <div className="hathor-footer__gold-line" />

      <div className="hathor-container hathor-footer__top">
        <div className="hathor-footer__brand-col">
          <p className="hathor-footer__brand">{HATHOR_BRAND_NAME}</p>
          <p className="hathor-footer__tagline">
            Ultra luxury Dahabiya Nile cruise — timeless elegance, bespoke
            service, and unforgettable journeys on Egypt&apos;s legendary river.
          </p>
          <p className="hathor-footer__follow">Follow Us</p>
          <div className="hathor-footer__social">
            <a
              href={PUBLIC_CONTACT.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hathor-footer__social-link cursor-hover"
              aria-label="WhatsApp"
            >
              <Phone className="h-4 w-4" />
            </a>
            <a
              href={`mailto:${PUBLIC_CONTACT.email}`}
              className="hathor-footer__social-link cursor-hover"
              aria-label="Email"
            >
              <Mail className="h-4 w-4" />
            </a>
          </div>
        </div>

        {NAV_GROUPS.map((group) => (
          <div key={group.id}>
            <p className="hathor-footer__col-label">{group.label}</p>
            <ul className="hathor-footer__links">
              {group.links.map((link) => (
                <li key={`${group.id}-${link.label}`}>
                  <Link href={link.href} className="hathor-footer__link cursor-hover">
                    {link.label}
                    <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <p className="hathor-footer__col-label">Contact</p>
          <ul className="hathor-footer__contact">
            <li>
              <Mail className="h-4 w-4 shrink-0 text-[var(--hathor-gold)]" aria-hidden />
              <a href={`mailto:${PUBLIC_CONTACT.email}`} className="cursor-hover">
                {PUBLIC_CONTACT.email}
              </a>
            </li>
            <li>
              <Phone className="h-4 w-4 shrink-0 text-[var(--hathor-gold)]" aria-hidden />
              <a href={`tel:${PUBLIC_CONTACT.phone}`} className="cursor-hover">
                {PUBLIC_CONTACT.phoneDisplay}
              </a>
            </li>
            <li>
              <MapPin className="h-4 w-4 shrink-0 text-[var(--hathor-gold)]" aria-hidden />
              <span>{PUBLIC_CONTACT.address}</span>
            </li>
          </ul>
          <p className="mt-4 text-xs tracking-wide text-[var(--hathor-muted)]">
            {PUBLIC_CONTACT.workingHours}
          </p>
        </div>
      </div>

      <div className="hathor-footer__bottom">
        <div className="hathor-container hathor-footer__bottom-inner">
          <p>© {year} Hathor Dahabiya Cruise. All rights reserved.</p>
          <p>Luxury Dahabiya Nile Cruise · Egypt</p>
        </div>
      </div>
    </footer>
  );
}
