import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { SiteContentPage } from "@/components/public/SiteContentPage";
import { ScrollReveal } from "@/components/public/ScrollReveal";
import { ContentSection } from "@/app/generated/prisma/enums";
import { PUBLIC_CONTACT } from "@/lib/public-contact";
import { getSiteContentSection } from "@/lib/site-content";

export const revalidate = 3600;

const CONTACT_ITEMS = [
  {
    label: "Email",
    value: PUBLIC_CONTACT.email,
    href: `mailto:${PUBLIC_CONTACT.email}`,
    icon: Mail,
  },
  {
    label: "Phone",
    value: PUBLIC_CONTACT.phoneDisplay,
    href: `tel:${PUBLIC_CONTACT.phone}`,
    icon: Phone,
  },
  {
    label: "WhatsApp",
    value: "Message us on WhatsApp",
    href: PUBLIC_CONTACT.whatsappUrl,
    icon: MessageCircle,
    external: true,
  },
  {
    label: "Address",
    value: PUBLIC_CONTACT.address,
    href: null,
    icon: MapPin,
  },
] as const;

export default async function ContactPage() {
  const content = await getSiteContentSection(ContentSection.CONTACT);

  return (
    <SiteContentPage
      title={content.title}
      subtitle={content.subtitle}
      breadcrumb="Contact"
      darkHero
    >
      <div className="mx-auto max-w-5xl">
        {content.bodyText && (
          <p className="mx-auto max-w-2xl text-center text-sm font-light leading-relaxed text-[var(--public-muted)] sm:text-base">
            {content.bodyText}
          </p>
        )}

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <ScrollReveal>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {CONTACT_ITEMS.map((item) => {
                const Icon = item.icon;
                const inner = (
                  <>
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center border border-[rgb(201_169_110/0.4)] text-[var(--lux-gold)]">
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--public-muted)]">
                      {item.label}
                    </p>
                    <p className="mt-2 text-sm font-medium leading-relaxed">
                      {item.value}
                    </p>
                  </>
                );

                if (!item.href) {
                  return (
                    <div key={item.label} className="lux-card lux-card--light p-6">
                      {inner}
                    </div>
                  );
                }

                return (
                  <a
                    key={item.label}
                    href={item.href}
                    target={"external" in item && item.external ? "_blank" : undefined}
                    rel={
                      "external" in item && item.external
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="lux-card lux-card--light block p-6 transition-shadow"
                  >
                    {inner}
                  </a>
                );
              })}
            </div>
          </ScrollReveal>

          <ScrollReveal delay={150}>
            <form
              className="lux-card lux-card--light p-6 sm:p-8"
              action={`mailto:${PUBLIC_CONTACT.email}`}
              method="get"
            >
              <h2 className="public-serif text-2xl font-medium">Send a Message</h2>
              <p className="mt-2 text-sm font-light text-[var(--public-muted)]">
                Our reservations team will respond within 24 hours.
              </p>
              <div className="mt-6 space-y-4">
                <div>
                  <label className="lux-label" htmlFor="contact-name">
                    Full Name
                  </label>
                  <input
                    id="contact-name"
                    name="body"
                    type="text"
                    className="lux-input"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <label className="lux-label" htmlFor="contact-email">
                    Email
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    className="lux-input"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="lux-label" htmlFor="contact-message">
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    className="lux-input resize-none"
                    placeholder="Tell us about your dream Nile cruise..."
                  />
                </div>
                <button type="submit" className="public-btn-gold w-full py-3.5">
                  Send Message
                </button>
              </div>
            </form>
          </ScrollReveal>
        </div>

        <div className="lux-card lux-card--light mt-8 p-6 text-center text-sm">
          <p className="font-medium">{PUBLIC_CONTACT.workingHours}</p>
          <p className="mt-1 font-light text-[var(--public-muted)]">
            {PUBLIC_CONTACT.dayOff}
          </p>
        </div>

        <div className="mt-10 flex justify-center">
          <Link href="/book" className="public-btn-gold px-10 py-3.5">
            Book Your Cruise
          </Link>
        </div>
      </div>
    </SiteContentPage>
  );
}
