"use client";

import { useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { CURRENCIES } from "@/lib/currency";
import { CURRENCY_COPY } from "@/lib/i18n/currency-copy";
import { useCurrency } from "./CurrencyProvider";
import "./currency-selector.css";

export function CurrencySelector() {
  const { currency, preferred, status, rates, locale, selectCurrency, retry } = useCurrency();
  const t = CURRENCY_COPY[locale];
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, fontFamily: "inherit" });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useLayoutEffect(() => {
    if (!open) return;
    const positionMenu = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (rect && buttonRef.current) setPosition({
        top: rect.bottom + 12,
        left: Math.max(12, Math.min(rect.right - 300, window.innerWidth - 312)),
        // The menu portals to body, outside the public layout's font variables.
        fontFamily: window.getComputedStyle(buttonRef.current).fontFamily,
      });
    };
    positionMenu();
    const active = menuRef.current?.querySelector<HTMLButtonElement>('[aria-checked="true"]');
    active?.focus();
    const onOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !menuRef.current?.contains(event.target) && !buttonRef.current?.contains(event.target)) setOpen(false);
    };
    const onFocus = (event: FocusEvent) => {
      if (event.target instanceof Node && !menuRef.current?.contains(event.target) && !buttonRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", onOutside);
    document.addEventListener("focusin", onFocus);
    window.addEventListener("resize", positionMenu);
    window.addEventListener("scroll", positionMenu, { passive: true });
    return () => {
      document.removeEventListener("pointerdown", onOutside);
      document.removeEventListener("focusin", onFocus);
      window.removeEventListener("resize", positionMenu);
      window.removeEventListener("scroll", positionMenu);
    };
  }, [open]);

  const close = () => { setOpen(false); buttonRef.current?.focus(); };
  const handleKeys = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") { event.preventDefault(); close(); return; }
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const buttons = Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]:not(:disabled)') ?? []);
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    const next = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : (index + (event.key === "ArrowUp" ? -1 : 1) + buttons.length) % buttons.length;
    buttons[next]?.focus();
  };
  const rateDates = rates ? Object.values(rates.dates).sort() : [];

  return (
    <div className="hathor-currency">
      <button ref={buttonRef} type="button" className="hathor-currency__trigger" aria-label={t.trigger(currency)} aria-haspopup="menu" aria-expanded={open} aria-controls={open ? menuId : undefined}
        onClick={() => setOpen(value => !value)}
        onKeyDown={event => { if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); setOpen(true); } }}>
        <span>{currency}</span><svg width="9" height="6" viewBox="0 0 9 6" aria-hidden="true"><path d="m1 1 3.5 3.5L8 1" fill="none" stroke="currentColor" /></svg>
      </button>
      {open && createPortal(
        <div ref={menuRef} className="hathor-currency-menu" style={position} onKeyDown={handleKeys}>
          <p className="hathor-currency-menu__eyebrow">{t.eyebrow}</p>
          <div id={menuId} role="menu" aria-label={t.menuLabel}>
            {CURRENCIES.map(item => (
              <button key={item.code} type="button" role="menuitemradio" aria-checked={currency === item.code} disabled={item.code !== "USD" && !rates}
                className="hathor-currency-menu__option" onClick={() => { selectCurrency(item.code); close(); }}>
                <span className="hathor-currency-menu__symbol" aria-hidden="true">{item.symbol}</span>
                <span className="hathor-currency-menu__name">{t.names[item.code]}</span>
                <span className="hathor-currency-menu__code">{item.code}</span>
                <span className="hathor-currency-menu__check" aria-hidden="true">{currency === item.code ? "✓" : ""}</span>
              </button>
            ))}
          </div>
          <div className="hathor-currency-menu__note" role="status">
            {status === "loading" && !rates ? <p>{t.loading}</p> : null}
            {status === "error" ? <p>{t.unavailable(preferred !== "USD" ? preferred : null)} <button type="button" onClick={() => void retry()}>{t.retry}</button></p> : null}
            <p>{t.estimates}</p>
            {rates ? <p>{t.dailyRates} · {rateDates[0]}{rateDates[0] !== rateDates[rateDates.length - 1] ? ` – ${rateDates[rateDates.length - 1]}` : ""} · <a href="https://frankfurter.dev/" target="_blank" rel="noopener noreferrer">Frankfurter</a></p> : null}
          </div>
        </div>, document.body,
      )}
    </div>
  );
}
