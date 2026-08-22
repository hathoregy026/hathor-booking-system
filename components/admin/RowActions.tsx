"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MoreHorizontal } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Cubic = [number, number, number, number];

/** Mirrors --ease-out-quart in app/admin-shell.css. */
const EASE_OUT_QUART: Cubic = [0.25, 1, 0.5, 1];

export type RowAction = {
  label: string;
  onSelect: () => void;
  icon?: LucideIcon;
  tone?: "default" | "success" | "danger";
  disabled?: boolean;
  /** Renders a divider above this item. */
  separated?: boolean;
};

type RowActionsProps = {
  actions: RowAction[];
  /** Accessible name for the trigger, e.g. `Actions for Jane Doe`. */
  label: string;
  disabled?: boolean;
  /** Drop the menu upward when the row is near the bottom of the viewport. */
  align?: "start" | "end";
};

const TONE_STYLE: Record<
  NonNullable<RowAction["tone"]>,
  React.CSSProperties | undefined
> = {
  default: undefined,
  success: { color: "var(--success)" },
  danger: { color: "var(--danger)" },
};

export function RowActions({
  actions,
  label,
  disabled = false,
  align = "end",
}: RowActionsProps) {
  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const reduceMotion = useReducedMotion();

  // Close on Escape and restore focus to the trigger.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Close when the page scrolls out from under an absolutely-placed menu.
  useEffect(() => {
    if (!open) return;
    const onScroll = () => setOpen(false);
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    return () => window.removeEventListener("scroll", onScroll, { capture: true });
  }, [open]);

  const handleToggle = () => {
    if (!open && triggerRef.current) {
      // Flip upward when there is not enough room below.
      const rect = triggerRef.current.getBoundingClientRect();
      const estimatedHeight = actions.length * 40 + 16;
      setDropUp(window.innerHeight - rect.bottom < estimatedHeight + 16);
    }
    setOpen((current) => !current);
  };

  return (
    <div className="admin-row-actions">
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        className="admin-row-actions__trigger"
      >
        <MoreHorizontal className="h-4 w-4" aria-hidden />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Click-away catcher. */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <motion.div
              ref={menuRef}
              id={menuId}
              role="menu"
              aria-label={label}
              className={`admin-row-actions__menu admin-row-actions__menu--${align} ${
                dropUp ? "admin-row-actions__menu--up" : ""
              }`}
              initial={{ opacity: 0, scale: 0.96, y: dropUp ? 6 : -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: dropUp ? 6 : -6 }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { duration: 0.16, ease: EASE_OUT_QUART }
              }
            >
              {actions.map((action) => {
                const Icon = action.icon;
                return (
                  <div key={action.label}>
                    {action.separated && <div className="divider my-1" />}
                    <button
                      type="button"
                      role="menuitem"
                      disabled={action.disabled}
                      onClick={() => {
                        setOpen(false);
                        action.onSelect();
                      }}
                      className="admin-row-actions__item"
                      style={TONE_STYLE[action.tone ?? "default"]}
                    >
                      {Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden />}
                      <span className="truncate">{action.label}</span>
                    </button>
                  </div>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
