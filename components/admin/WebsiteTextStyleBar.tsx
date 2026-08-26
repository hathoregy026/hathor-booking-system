"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Search } from "lucide-react";
import {
  HATHOR_FONT_GROUPS,
  PAGE_STYLE_ROLE_LABELS,
  PAGE_STYLE_ROLES,
  hathorFontStackForAdmin,
  livePageFontFamily,
  resolvePageStyle,
  type HathorLuxuryFont,
  type HeroPageKey,
  type PageStyleRole,
  type TypographySettings,
  type TypographyTextStyle,
} from "@/lib/typography-settings-shared";

function SizeInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const commit = (raw: string) => {
    const n = Number(raw);
    if (!Number.isFinite(n)) {
      setDraft(String(value));
      return;
    }
    const next = Math.min(200, Math.max(8, Math.round(n)));
    setDraft(String(next));
    if (next !== value) onChange(next);
  };

  return (
    <label className="wt-style__size">
      <input
        type="number"
        min={8}
        max={200}
        step={1}
        className="input wt-style__size-input"
        value={draft}
        aria-label="Font size"
        onChange={(e) => {
          setDraft(e.target.value);
          const n = Number(e.target.value);
          if (Number.isFinite(n)) {
            onChange(Math.min(200, Math.max(8, Math.round(n))));
          }
        }}
        onBlur={() => commit(draft)}
      />
      <span>px</span>
    </label>
  );
}

type MenuPos = {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
};

function placeMenu(button: HTMLElement): MenuPos {
  const rect = button.getBoundingClientRect();
  const gutter = 8;
  const width = Math.min(Math.max(rect.width, 280), window.innerWidth - gutter * 2);
  let left = rect.left;
  if (left + width > window.innerWidth - gutter) {
    left = window.innerWidth - width - gutter;
  }
  if (left < gutter) left = gutter;

  const spaceBelow = window.innerHeight - rect.bottom - gutter;
  const spaceAbove = rect.top - gutter;
  const desired = 340;
  const openUp = spaceBelow < 240 && spaceAbove > spaceBelow;
  const maxHeight = Math.min(desired, Math.max(160, openUp ? spaceAbove : spaceBelow));
  const top = openUp ? rect.top - maxHeight - 6 : rect.bottom + 6;

  return { top, left, width, maxHeight };
}

function FontMenu({
  value,
  onChange,
}: {
  value: HathorLuxuryFont;
  onChange: (font: HathorLuxuryFont) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [pos, setPos] = useState<MenuPos | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return HATHOR_FONT_GROUPS.map((group) => ({
      ...group,
      variants: group.variants.filter((variant) => {
        if (!q) return true;
        const label =
          group.variants.length > 1
            ? `${group.family} ${variant.label}`
            : group.family;
        return `${label} ${variant.id}`.toLowerCase().includes(q);
      }),
    })).filter((group) => group.variants.length > 0);
  }, [query]);

  useLayoutEffect(() => {
    if (!open || !btnRef.current) return;
    const update = () => {
      if (!btnRef.current) return;
      setPos(placeMenu(btnRef.current));
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (event: MouseEvent) => {
      const target = event.target as Node;
      if (wrapRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }
    const id = window.setTimeout(() => searchRef.current?.focus(), 20);
    return () => window.clearTimeout(id);
  }, [open]);

  return (
    <div className="wt-style__font" ref={wrapRef}>
      <button
        ref={btnRef}
        type="button"
        className={`wt-style__font-btn${open ? " is-open" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => {
          if (!open && btnRef.current) {
            setPos(placeMenu(btnRef.current));
            setOpen(true);
            return;
          }
          setOpen(false);
        }}
      >
        <span style={{ fontFamily: hathorFontStackForAdmin(value) }}>
          {value}
        </span>
        <ChevronDown className="wt-style__font-chevron" size={14} aria-hidden />
      </button>
      {open && pos
        ? createPortal(
            <div
              ref={menuRef}
              id={listId}
              className="wt-style__font-menu wt-style__font-menu--portal"
              role="listbox"
              aria-label="Fonts"
              style={{
                top: pos.top,
                left: pos.left,
                width: pos.width,
                maxHeight: pos.maxHeight,
              }}
            >
              <label className="wt-style__font-search">
                <Search size={14} aria-hidden />
                <input
                  ref={searchRef}
                  type="search"
                  value={query}
                  placeholder="Search fonts"
                  autoComplete="off"
                  spellCheck={false}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <div className="wt-style__font-list">
                {filtered.length === 0 ? (
                  <p className="wt-style__font-empty">No fonts match</p>
                ) : (
                  filtered.map((group) => (
                    <div key={group.family} className="wt-style__font-group">
                      {group.variants.length > 1 ? (
                        <p className="wt-style__font-group-label">{group.family}</p>
                      ) : null}
                      {group.variants.map((variant) => {
                        const selected = value === variant.id;
                        const label =
                          group.variants.length > 1
                            ? variant.label
                            : group.family;
                        return (
                          <button
                            key={variant.id}
                            type="button"
                            role="option"
                            aria-selected={selected}
                            className={`wt-style__font-option${selected ? " is-on" : ""}`}
                            style={{
                              fontFamily: hathorFontStackForAdmin(variant.id),
                            }}
                            onClick={() => {
                              onChange(variant.id);
                              setOpen(false);
                            }}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

export function WebsiteTextStyleBar({
  page,
  typo,
  onPatch,
  onClearRole,
}: {
  page: HeroPageKey;
  typo: TypographySettings;
  onPatch: (role: PageStyleRole, patch: Partial<TypographyTextStyle>) => void;
  onClearRole: (role: PageStyleRole) => void;
}) {
  return (
    <section className="wt-style" aria-label="Fonts and sizes for this page">
      <header className="wt-style__head">
        <div>
          <p className="wt-style__eyebrow">This page only</p>
          <h3 className="wt-style__title">Fonts &amp; text sizes</h3>
        </div>
        <p className="wt-style__hint">
          Controls apply to this page only. Search the list to pick a face.
        </p>
      </header>
      <div className="wt-style__grid">
        {PAGE_STYLE_ROLES.map((role) => {
          const custom = Boolean(typo.page_styles?.[page]?.[role]);
          const style = resolvePageStyle(typo, page, role);
          const liveFont = livePageFontFamily(
            page,
            role,
            typo[role].fontFamily,
          );
          const showsLiveFace = !custom && liveFont !== typo[role].fontFamily;
          return (
            <div
              key={role}
              className={`wt-style__row${custom ? " is-custom" : ""}`}
            >
              <div className="wt-style__meta">
                <p className="wt-style__label">{PAGE_STYLE_ROLE_LABELS[role]}</p>
                {custom ? (
                  <button
                    type="button"
                    className="wt-style__reset"
                    onClick={() => onClearRole(role)}
                  >
                    Use live font
                  </button>
                ) : showsLiveFace ? (
                  <span className="wt-style__inherited">Live page font</span>
                ) : (
                  <span className="wt-style__inherited">Site default</span>
                )}
              </div>
              <FontMenu
                value={style.fontFamily}
                onChange={(fontFamily) => onPatch(role, { fontFamily })}
              />
              <SizeInput
                value={style.fontSize}
                onChange={(fontSize) => onPatch(role, { fontSize })}
              />
              <span
                className="wt-style__sample"
                style={{
                  fontFamily: hathorFontStackForAdmin(style.fontFamily),
                  fontSize: Math.min(28, Math.max(13, style.fontSize * 0.42)),
                }}
              >
                Hathor
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
