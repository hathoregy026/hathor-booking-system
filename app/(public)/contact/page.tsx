import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { SiteContentPage } from "@/components/public/SiteContentPage";
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
    <SiteContentPage title={content.title} subtitle={content.subtitle}>
      <div className="mx-auto max-w-3xl space-y-6">
        {content.bodyText && (
          <p
            className="text-center text-sm leading-relaxed sm:text-base"
            style={{ color: "var(--booking-muted)" }}
          >
            {content.bodyText}
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {CONTACT_ITEMS.map((item) => {
            const Icon = item.icon;
            const inner = (
              <>
                <div
                  className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full"
                  style={{ background: "var(--booking-cream)" }}
                >
                  <Icon
                    className="h-5 w-5"
                    style={{ color: "var(--booking-navy)" }}
                    aria-hidden
                  />
                </div>
                <p
                  className="text-xs font-semibold uppercase tracking-[0.14em]"
                  style={{ color: "var(--booking-muted)" }}
                >
                  {item.label}
                </p>
                <p className="mt-1 text-sm font-medium leading-relaxed break-words">
                  {item.value}
                </p>
              </>
            );

            if (!item.href) {
              return (
                <div key={item.label} className="booking-card p-4 sm:p-6">
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
                className="booking-card block p-4 transition-shadow hover:shadow-md sm:p-6"
              >
                {inner}
              </a>
            );
          })}
        </div>

        <div
          className="booking-card p-4 text-center text-sm sm:p-6"
          style={{ color: "var(--booking-muted)" }}
        >
          <p className="font-medium" style={{ color: "var(--booking-navy)" }}>
            {PUBLIC_CONTACT.workingHours}
          </p>
          <p className="mt-1">{PUBLIC_CONTACT.dayOff}</p>
        </div>

        <div className="flex justify-center pt-2">
          <Link href="/book" className="public-btn-gold w-full max-w-sm py-3.5 text-center sm:w-auto">
            Book Now
          </Link>
        </div>
      </div>
    </SiteContentPage>
  );
}
