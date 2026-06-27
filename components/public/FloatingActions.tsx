"use client";

import Link from "next/link";
import { useState } from "react";
import {
  CalendarCheck,
  MessageCircle,
  Phone,
  Plus,
  X,
} from "lucide-react";
import { useBookNowModal } from "@/components/booking/BookingModalProvider";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { PUBLIC_CONTACT } from "@/lib/public-contact";

const ACTIONS = [
  {
    key: "whatsapp",
    href: PUBLIC_CONTACT.whatsappUrl,
    external: true,
    label: "Whatsapp",
    icon: MessageCircle,
    className: "public-fab--whatsapp",
  },
  {
    key: "call",
    href: `tel:${PUBLIC_CONTACT.phone}`,
    external: false,
    label: "Call",
    icon: Phone,
    className: "",
  },
  {
    key: "contact",
    href: "/contact",
    external: false,
    label: "Contact Us",
    icon: null,
    className: "",
  },
  {
    key: "book",
    label: "Book Now",
    icon: CalendarCheck,
    className: "public-fab--book",
  },
] as const;

export function FloatingActions() {
  const isMobile = useIsMobile();
  const [expanded, setExpanded] = useState(false);
  const { openBooking } = useBookNowModal();

  const renderAction = (
    action: (typeof ACTIONS)[number],
    className: string,
    onActivate?: () => void,
  ) => {
    const Icon = action.icon;

    if (action.key === "book") {
      return (
        <button
          key={action.key}
          type="button"
          className={className}
          onClick={() => {
            onActivate?.();
            openBooking();
          }}
        >
          {Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden />}
          <span>{action.label}</span>
        </button>
      );
    }

    if ("href" in action && action.external) {
      return (
        <a
          key={action.key}
          href={action.href}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
          onClick={onActivate}
        >
          {Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden />}
          <span>{action.label}</span>
        </a>
      );
    }

    if ("href" in action) {
      return (
        <Link
          key={action.key}
          href={action.href}
          className={className}
          onClick={onActivate}
        >
          {Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden />}
          <span>{action.label}</span>
        </Link>
      );
    }

    return null;
  };

  if (!isMobile) {
    return (
      <aside className="public-floating-actions" aria-label="Quick actions">
        {ACTIONS.map((action) =>
          renderAction(action, `public-fab ${action.className}`.trim()),
        )}
      </aside>
    );
  }

  return (
    <aside
      className={`public-floating-actions public-floating-actions--mobile ${
        expanded ? "public-floating-actions--expanded" : ""
      }`}
      aria-label="Quick actions"
    >
      {expanded && (
        <>
          <button
            type="button"
            className="public-fab-backdrop"
            aria-label="Close quick actions"
            onClick={() => setExpanded(false)}
          />
          <div className="public-fab-menu">
            {ACTIONS.map((action) =>
              renderAction(
                action,
                `public-fab public-fab--menu ${action.className}`.trim(),
                () => setExpanded(false),
              ),
            )}
          </div>
        </>
      )}

      <button
        type="button"
        className="public-fab public-fab--main"
        aria-expanded={expanded}
        aria-label={expanded ? "Close quick actions" : "Open quick actions"}
        onClick={() => setExpanded((open) => !open)}
      >
        {expanded ? (
          <X className="h-5 w-5 shrink-0" aria-hidden />
        ) : (
          <Plus className="h-5 w-5 shrink-0" aria-hidden />
        )}
        <span>{expanded ? "Close" : "Contact"}</span>
      </button>
    </aside>
  );
}
