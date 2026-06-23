import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { HATHOR_BRAND_NAME } from "@/lib/branding";
import { PUBLIC_CONTACT, PUBLIC_NAV_LINKS } from "@/lib/public-contact";

export function PublicFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="public-footer">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 md:gap-10 lg:grid-cols-3">
          <div>
            <p className="public-serif text-xl font-semibold text-white sm:text-2xl">
              {HATHOR_BRAND_NAME}
            </p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/70">
              Ultra luxury Dahabiya Nile cruise — elegance, serenity, and
              timeless Egyptian hospitality on the legendary river.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--public-gold)]">
              Explore
            </p>
            <ul className="mt-4 space-y-2.5">
              {PUBLIC_NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/75 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--public-gold)]">
              Contact
            </p>
            <ul className="mt-4 space-y-4 text-sm">
              <li className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[var(--public-gold)]" aria-hidden />
                <a
                  href={`mailto:${PUBLIC_CONTACT.email}`}
                  className="text-white/80 transition-colors hover:text-white"
                >
                  {PUBLIC_CONTACT.email}
                </a>
              </li>
              <li className="flex gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[var(--public-gold)]" aria-hidden />
                <a
                  href={`tel:${PUBLIC_CONTACT.phone}`}
                  className="text-white/80 transition-colors hover:text-white"
                >
                  {PUBLIC_CONTACT.phoneDisplay}
                </a>
              </li>
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--public-gold)]" aria-hidden />
                <span className="text-white/75 leading-relaxed">
                  {PUBLIC_CONTACT.address}
                </span>
              </li>
            </ul>
            <p className="mt-4 text-xs text-white/55">
              {PUBLIC_CONTACT.workingHours}
              <br />
              {PUBLIC_CONTACT.dayOff}
            </p>
          </div>
        </div>

        <div
          className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/50 sm:mt-12 sm:flex-row sm:items-center sm:justify-between sm:pt-8"
        >
          <p>© {year} Hathor Dahabiya Cruise. All rights reserved.</p>
          <p>Luxury Dahabiya Nile Cruise, Egypt</p>
        </div>
      </div>
    </footer>
  );
}
