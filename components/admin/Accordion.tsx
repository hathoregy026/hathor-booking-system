"use client";

import { useId, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Cubic = [number, number, number, number];

/** Mirrors --ease-smooth in app/admin-shell.css. */
const EASE_SMOOTH: Cubic = [0.32, 0.72, 0, 1];

type AccordionSectionProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  /** Rendered in the header, right of the title. Clicks do not toggle. */
  action?: ReactNode;
  /** Small status text shown next to the chevron when collapsed. */
  summary?: string;
  defaultOpen?: boolean;
  children: ReactNode;
};

/**
 * Collapsible settings section. Height animates via Framer's `height: auto`
 * support; under prefers-reduced-motion it snaps open with no animation.
 */
export function AccordionSection({
  title,
  description,
  icon: Icon,
  action,
  summary,
  defaultOpen = false,
  children,
}: AccordionSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  const headerId = useId();
  const reduceMotion = useReducedMotion();

  return (
    <section className="card admin-accordion" data-open={open ? "true" : "false"}>
      <div className="admin-accordion__header">
        <button
          type="button"
          id={headerId}
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-controls={panelId}
          className="admin-accordion__trigger"
        >
          {Icon && (
            <span className="admin-accordion__icon" aria-hidden>
              <Icon className="h-5 w-5" strokeWidth={1.9} />
            </span>
          )}

          <span className="admin-accordion__titles">
            <span className="admin-accordion__title">{title}</span>
            {description && (
              <span className="admin-accordion__description">{description}</span>
            )}
          </span>

          {summary && !open && (
            <span className="admin-accordion__summary">{summary}</span>
          )}

          <ChevronDown className="admin-accordion__chevron h-5 w-5" aria-hidden />
        </button>

        {action && <div className="admin-accordion__action">{action}</div>}
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={headerId}
            key="panel"
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduceMotion ? { height: 0 } : { height: 0, opacity: 0 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : {
                    height: { duration: 0.32, ease: EASE_SMOOTH },
                    opacity: { duration: 0.2, ease: EASE_SMOOTH },
                  }
            }
            style={{ overflow: "hidden" }}
          >
            <div className="admin-accordion__body">
              <div className="gold-hairline mb-5" />
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/** Simple vertical stack wrapper so sections share consistent spacing. */
export function Accordion({ children }: { children: ReactNode }) {
  return <div className="space-y-3">{children}</div>;
}
