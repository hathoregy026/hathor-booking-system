"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { COUNTRIES, findCountry, type Country } from "@/lib/countries";

/** Room the list wants below the field; the phone and tablet dock covers the bottom 5.5rem. */
const LIST_SPACE = 300;
const MIN_LIST = 120;
const DOCK_BREAKPOINT = 1024;

function bottomObstruction() {
  return window.innerWidth <= DOCK_BREAKPOINT ? 96 : 12;
}

function search(query: string): Country[] {
  const text = query.trim().toLowerCase().replace(/^\+/, "");
  if (!text) return [...COUNTRIES];
  const starts = COUNTRIES.filter(country => country.name.toLowerCase().startsWith(text) || country.dial.startsWith(text));
  const contains = COUNTRIES.filter(country => !starts.includes(country) && country.name.toLowerCase().includes(text));
  return [...starts, ...contains];
}

/**
 * Searchable country menu. A native <select> lets the browser open its list
 * upwards or past the screen edge; this one always opens below the field,
 * first scrolling the page if there is not enough room, and keeps the list
 * inside the window.
 */
export function CountryPicker({
  value,
  onChange,
  labelledBy,
  invalid,
}: {
  value: string;
  onChange: (country: Country | null) => void;
  labelledBy: string;
  invalid?: boolean;
}) {
  const listId = useId();
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [maxHeight, setMaxHeight] = useState(LIST_SPACE);

  const selected = findCountry(value);
  const matches = useMemo(() => search(query), [query]);

  /** Space below the field, inside the window and above the phone dock. */
  const spaceBelow = useCallback(() => {
    const input = inputRef.current;
    if (!input) return 0;
    return window.innerHeight - bottomObstruction() - 8 - input.getBoundingClientRect().bottom;
  }, []);

  /** Makes room below the field by scrolling the page down, never by opening upwards. */
  const fitBelow = useCallback(() => {
    const short = LIST_SPACE - spaceBelow();
    const canScroll = document.documentElement.scrollHeight - (window.scrollY + window.innerHeight);
    if (short > 1 && canScroll > 1) window.scrollBy({ top: Math.min(short, canScroll), behavior: "instant" as ScrollBehavior });
    setMaxHeight(Math.max(MIN_LIST, Math.min(LIST_SPACE, spaceBelow())));
  }, [spaceBelow]);

  function openList() {
    // Stop any smooth page scroll still under way (a step change, say) so the
    // field stays where the guest tapped it, then make room below it.
    window.scrollTo({ top: window.scrollY, behavior: "instant" as ScrollBehavior });
    setQuery("");
    const index = selected ? COUNTRIES.indexOf(selected) : 0;
    setActive(Math.max(0, index));
    setOpen(true);
    fitBelow();
  }

  function choose(country: Country) {
    onChange(country);
    setOpen(false);
    setQuery("");
  }

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    // While the guest scrolls, the list only shrinks to fit; if the field goes too
    // low for any list at all, it closes rather than hang past the screen edge.
    const follow = () => {
      const space = spaceBelow();
      if (space < MIN_LIST) setOpen(false);
      else setMaxHeight(Math.min(LIST_SPACE, space));
    };
    document.addEventListener("mousedown", close);
    window.addEventListener("resize", follow);
    window.addEventListener("scroll", follow, { passive: true });
    return () => {
      document.removeEventListener("mousedown", close);
      window.removeEventListener("resize", follow);
      window.removeEventListener("scroll", follow);
    };
  }, [open, spaceBelow]);

  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!open && (event.key === "ArrowDown" || event.key === "Enter")) {
      event.preventDefault();
      openList();
      return;
    }
    if (!open) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive(index => Math.min(matches.length - 1, index + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive(index => Math.max(0, index - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (matches[active]) choose(matches[active]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  }

  return (
    <div className={`hj-country${open ? " hj-country--open" : ""}${invalid ? " hj-country--invalid" : ""}`} ref={wrapRef}>
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-labelledby={labelledBy}
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && matches[active] ? `${listId}-${matches[active].code}` : undefined}
        autoComplete="off"
        spellCheck={false}
        placeholder={selected ? selected.name : "Search your country"}
        value={open ? query : selected?.name ?? ""}
        onFocus={() => { if (!open) openList(); }}
        onClick={() => { if (!open) openList(); }}
        onChange={event => {
          setQuery(event.target.value);
          setActive(0);
          if (!open) setOpen(true);
        }}
        onKeyDown={onKeyDown}
      />
      <span className="hj-country__chevron" aria-hidden />
      {open ? (
        <ul className="hj-country__list" id={listId} role="listbox" ref={listRef} style={{ maxHeight }}>
          {matches.length === 0 ? (
            <li className="hj-country__empty" role="presentation">No country matches “{query}”.</li>
          ) : (
            matches.map((country, index) => (
              <li
                key={country.code}
                id={`${listId}-${country.code}`}
                role="option"
                aria-selected={country.code === value}
                data-index={index}
                className={`hj-country__option${index === active ? " hj-country__option--active" : ""}${country.code === value ? " hj-country__option--chosen" : ""}`}
                onMouseDown={event => event.preventDefault()}
                onMouseEnter={() => setActive(index)}
                onClick={() => choose(country)}
              >
                <span>{country.name}</span>
                <span className="hj-country__dial">+{country.dial}</span>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
