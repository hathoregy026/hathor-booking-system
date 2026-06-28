"use client";

import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { CtaBand } from "@/components/pages/CtaBand";
import { InquiryForm } from "@/components/pages/InquiryForm";
import { PageHero } from "@/components/pages/PageHero";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { CONTACT_PAGE } from "@/lib/page-content";
import { PUBLIC_CONTACT } from "@/lib/public-contact";
import { UNSPLASH_IMAGES } from "@/lib/unsplash-images";

const CONTACT_ITEMS = [
  {
    label: "Company Address",
    value: PUBLIC_CONTACT.address,
    href: null,
    icon: MapPin,
  },
  {
    label: "Call Us Hotline",
    value: PUBLIC_CONTACT.phoneDisplay,
    href: `tel:${PUBLIC_CONTACT.phone}`,
    icon: Phone,
  },
  {
    label: "Email",
    value: PUBLIC_CONTACT.email,
    href: `mailto:${PUBLIC_CONTACT.email}`,
    icon: Mail,
  },
  {
    label: "WhatsApp",
    value: "Message us on WhatsApp",
    href: PUBLIC_CONTACT.whatsappUrl,
    icon: MessageCircle,
    external: true,
  },
] as const;

export function ContactPageContent() {
  return (
    <>
      <PageHero
        title={CONTACT_PAGE.hero.title}
        subtitle={CONTACT_PAGE.hero.subtitle}
        breadcrumb="Contact"
        imageSrc={UNSPLASH_IMAGES.heroContact}
        imageAlt="Contact Hathor Dahabiya reservations team"
      />

      <section className="hathor-section hathor-section--cream">
        <div className="hathor-container">
          <div className="grid gap-10 lg:grid-cols-2">
            <ScrollReveal>
              <div className="grid gap-4 sm:grid-cols-2">
                {CONTACT_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const inner = (
                    <>
                      <div className="hathor-contact-card__icon">
                        <Icon className="h-5 w-5" aria-hidden />
                      </div>
                      <p className="hathor-section-eyebrow mt-4">{item.label}</p>
                      <p className="mt-2 text-sm font-medium leading-relaxed">
                        {item.value}
                      </p>
                    </>
                  );

                  if (!item.href) {
                    return (
                      <div key={item.label} className="hathor-contact-card">
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
                      className="hathor-contact-card cursor-hover"
                    >
                      {inner}
                    </a>
                  );
                })}
              </div>

              <div className="hathor-contact-card mt-6 text-center">
                <h3 className="hathor-section-title text-xl">Working Hours</h3>
                <p className="hathor-body-text mt-3">{PUBLIC_CONTACT.workingHours}</p>
                <p className="hathor-body-text">{PUBLIC_CONTACT.dayOff}</p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={120}>
              <InquiryForm
                type="contact"
                title={CONTACT_PAGE.form.title}
                intro={CONTACT_PAGE.form.intro}
                submitLabel="Send Request"
              />
            </ScrollReveal>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
