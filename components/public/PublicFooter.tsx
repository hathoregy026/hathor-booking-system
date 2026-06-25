import Link from "next/link";
import { Mail, MapPin, Phone, Share2 } from "lucide-react";
import { HATHOR_BRAND_NAME } from "@/lib/branding";
import { PUBLIC_CONTACT, PUBLIC_NAV_LINKS } from "@/lib/public-contact";

export function PublicFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="public-footer">
      <div className="public-footer__gold-line" />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="public-serif text-2xl font-medium text-[var(--lux-gold-cream)]">
              {HATHOR_BRAND_NAME}
            </p>
            <p className="mt-4 max-w-xs text-sm font-light leading-relaxed text-[var(--lux-text-grey)]">
              Ultra luxury Dahabiya Nile cruise — timeless elegance, bespoke
              service, and unforgettable journeys on Egypt&apos;s legendary river.
            </p>
            <div className="mt-5 flex gap-3">
              <a
                href={PUBLIC_CONTACT.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center border border-[rgb(201_169_110/0.4)] text-[var(--lux-gold)] transition-colors hover:border-[var(--lux-gold)] hover:bg-[rgb(201_169_110/0.1)]"
                aria-label="WhatsApp"
              >
                <Phone className="h-4 w-4" />
              </a>
              <a
                href={`mailto:${PUBLIC_CONTACT.email}`}
                className="flex h-9 w-9 items-center justify-center border border-[rgb(201_169_110/0.4)] text-[var(--lux-gold)] transition-colors hover:border-[var(--lux-gold)] hover:bg-[rgb(201_169_110/0.1)]"
                aria-label="Email"
              >
                <Mail className="h-4 w-4" />
              </a>
              <span
                className="flex h-9 w-9 items-center justify-center border border-[rgb(201_169_110/0.4)] text-[var(--lux-gold)]"
                aria-hidden
              >
                <Share2 className="h-4 w-4" />
              </span>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--lux-gold)]">
              Quick Links
            </p>
            <ul className="mt-5 space-y-2.5">
              {PUBLIC_NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-light text-[var(--lux-text-grey)] transition-colors hover:text-[var(--lux-gold-cream)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/book"
                  className="text-sm font-light text-[var(--lux-text-grey)] transition-colors hover:text-[var(--lux-gold-cream)]"
                >
                  Book a Cruise
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--lux-gold)]">
              Contact
            </p>
            <ul className="mt-5 space-y-4 text-sm font-light">
              <li className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[var(--lux-gold)]" />
                <a
                  href={`mailto:${PUBLIC_CONTACT.email}`}
                  className="text-[var(--lux-text-grey)] hover:text-white"
                >
                  {PUBLIC_CONTACT.email}
                </a>
              </li>
              <li className="flex gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[var(--lux-gold)]" />
                <a
                  href={`tel:${PUBLIC_CONTACT.phone}`}
                  className="text-[var(--lux-text-grey)] hover:text-white"
                >
                  {PUBLIC_CONTACT.phoneDisplay}
                </a>
              </li>
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--lux-gold)]" />
                <span className="leading-relaxed text-[var(--lux-text-grey)]">
                  {PUBLIC_CONTACT.address}
                </span>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--lux-gold)]">
              Newsletter
            </p>
            <p className="mt-5 text-sm font-light leading-relaxed text-[var(--lux-text-grey)]">
              Receive exclusive offers and Nile cruise inspiration.
            </p>
            <form className="mt-4 flex flex-col gap-2" action={`mailto:${PUBLIC_CONTACT.email}`} method="get">
              <input
                type="email"
                name="subject"
                placeholder="Your email"
                className="lux-input text-sm"
                aria-label="Email for newsletter"
              />
              <button type="submit" className="public-btn-gold w-full py-3 text-xs">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-[rgb(201_169_110/0.15)] pt-8 text-xs font-light text-[var(--lux-text-grey)] sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Hathor Dahabiya Cruise. All rights reserved.</p>
          <p>Luxury Dahabiya Nile Cruise · Egypt</p>
        </div>
      </div>
    </footer>
  );
}
