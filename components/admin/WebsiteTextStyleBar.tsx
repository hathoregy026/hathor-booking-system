"use client";

import { useEffect, useRef, useState } from "react";
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

function FontMenu({
  value,
  onChange,
}: {
  value: HathorLuxuryFont;
  onChange: (font: HathorLuxuryFont) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div className="wt-style__font" ref={ref}>
      <button
        type="button"
        className={`wt-style__font-btn${open ? " is-open" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span style={{ fontFamily: hathorFontStackForAdmin(value) }}>
          {value}
        </span>
        <span aria-hidden>{open ? "▴" : "▾"}</span>
      </button>
      {open ? (
        <div className="wt-style__font-menu" role="listbox" aria-label="Fonts">
          {HATHOR_FONT_GROUPS.flatMap((group) =>
            group.variants.map((variant) => {
              const selected = value === variant.id;
              const label =
                group.variants.length > 1
                  ? `${group.family} · ${variant.label}`
                  : group.family;
              return (
                <button
                  key={variant.id}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={`wt-style__font-option${selected ? " is-on" : ""}`}
                  style={{ fontFamily: hathorFontStackForAdmin(variant.id) }}
                  onClick={() => {
                    onChange(variant.id);
                    setOpen(false);
                  }}
                >
                  {label}
                </button>
              );
            }),
          )}
        </div>
      ) : null}
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
          Each row shows the font this page uses on the live site. Changing a
          font updates this page only.
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
