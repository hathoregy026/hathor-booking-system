"use client";

import { useEffect, useState } from "react";
import { Loader2, RotateCcw, Save } from "lucide-react";
import { AdminDevicePreviewToggle } from "@/components/admin/AdminDevicePreviewToggle";
import { useToast } from "@/components/admin/ToastProvider";
import { adminFetch } from "@/lib/admin-fetch";
import {
  DEFAULT_SUITES_TYPOGRAPHY,
  DEFAULT_SUITES_TYPOGRAPHY_PHONE,
  type SuitesTypography,
} from "@/lib/suites-typography-shared";
import {
  HATHOR_LUXURY_FONTS,
  hathorFontStackForAdmin,
  type TypographyTextStyle,
} from "@/lib/typography-settings-shared";
import type { AdminDevicePreview } from "@/lib/admin-device-preview";

const ROLES: Array<{
  key: keyof SuitesTypography;
  label: string;
  description: string;
  sample: string;
}> = [
  {
    key: "display",
    label: "Big titles",
    description: "Hero lines, chapter headlines, and the largest editorial titles on Suites.",
    sample: "Suites of serenity",
  },
  {
    key: "secondary",
    label: "Smaller titles",
    description: "Suite cards, value titles, and mid-size headings across the page.",
    sample: "Luxury Cabins",
  },
  {
    key: "body",
    label: "Smallest text",
    description: "Supporting paragraphs, captions, links, and quiet descriptive copy.",
    sample:
      "Aboard Hathor, every cabin and suite is shaped around the timeless Nile—private comfort and panoramic river light.",
  },
];

function same(a: SuitesTypography, b: SuitesTypography) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function SuitesTypographyPanel() {
  const { showToast } = useToast();
  const [device, setDevice] = useState<AdminDevicePreview>("desktop");
  const [desktop, setDesktop] = useState(DEFAULT_SUITES_TYPOGRAPHY);
  const [phone, setPhone] = useState(DEFAULT_SUITES_TYPOGRAPHY_PHONE);
  const [savedDesktop, setSavedDesktop] = useState(DEFAULT_SUITES_TYPOGRAPHY);
  const [savedPhone, setSavedPhone] = useState(DEFAULT_SUITES_TYPOGRAPHY_PHONE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeRole, setActiveRole] =
    useState<keyof SuitesTypography>("display");
  const settings = device === "phone" ? phone : desktop;
  const saved = device === "phone" ? savedPhone : savedDesktop;
  const active = ROLES.find((role) => role.key === activeRole) ?? ROLES[0];
  const style = settings[active.key];
  const defaults =
    device === "phone" ? DEFAULT_SUITES_TYPOGRAPHY_PHONE : DEFAULT_SUITES_TYPOGRAPHY;

  useEffect(() => {
    void adminFetch("/api/admin/suites-typography")
      .then((r) => r.json())
      .then((data: { settings?: SuitesTypography; settingsMobile?: SuitesTypography }) => {
        const next = data.settings ?? DEFAULT_SUITES_TYPOGRAPHY;
        const nextPhone = data.settingsMobile ?? DEFAULT_SUITES_TYPOGRAPHY_PHONE;
        setDesktop(next);
        setSavedDesktop(next);
        setPhone(nextPhone);
        setSavedPhone(nextPhone);
      })
      .catch(() => showToast("error", "Could not load Suites typography."))
      .finally(() => setLoading(false));
  }, [showToast]);

  const patch = (role: keyof SuitesTypography, changes: Partial<TypographyTextStyle>) => {
    const next = { ...settings, [role]: { ...settings[role], ...changes } };
    if (device === "phone") setPhone(next);
    else setDesktop(next);
  };

  const save = async () => {
    if (saving || same(settings, saved)) return;
    setSaving(true);
    try {
      const response = await adminFetch("/api/admin/suites-typography", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings, device }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Save failed");
      if (device === "phone") setSavedPhone(data.settings);
      else setSavedDesktop(data.settings);
      showToast("success", `Suites ${device} typography saved.`);
    } catch (error) {
      showToast(
        "error",
        error instanceof Error ? error.message : "Could not save Suites typography.",
      );
    } finally {
      setSaving(false);
    }
  };

  const resetActive = () => patch(active.key, defaults[active.key]);

  if (loading) {
    return (
      <div className="typo-easy typo-easy--loading">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading Suites typography…
      </div>
    );
  }

  return (
    <section className="typo-easy" aria-labelledby="suites-typography-title">
      <header className="typo-easy__header">
        <div>
          <h2 id="suites-typography-title" className="admin-page-title">
            Suites Typography
          </h2>
          <p className="admin-page-subtitle">
            Filter by size, then choose font, colour, and size. These settings apply only to the Suites page.
          </p>
        </div>
        <AdminDevicePreviewToggle value={device} onChange={setDevice} />
      </header>
      <div className="typo-easy__workspace">
        <aside className="typo-easy__rail" aria-label="Suites text groups">
          <div className="typo-rolebar typo-rolebar--rail" role="tablist">
            {ROLES.map((role) => {
              const selected = role.key === active.key;
              return (
                <div
                  key={role.key}
                  className={`typo-rolebar__item${selected ? " typo-rolebar__item--on" : ""}`}
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    className={`typo-rolebar__btn${selected ? " typo-rolebar__btn--on" : ""}`}
                    onClick={() => setActiveRole(role.key)}
                  >
                    <span>{role.label}</span>
                    <span className="typo-rolebar__chevron" aria-hidden>
                      {selected ? "▾" : "▸"}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </aside>
        <div className="typo-easy__stage typo-easy__stage--light">
          <span className="typo-easy__stage-kicker">You are editing ({device})</span>
          <h3>{active.label}</h3>
          <p className="typo-easy__stage-copy">{active.description}</p>
          <p
            className="typo-easy__sample"
            style={{
              fontFamily: hathorFontStackForAdmin(style.fontFamily),
              fontSize: Math.min(style.fontSize, device === "phone" ? 34 : 64),
              color: style.color,
              lineHeight: style.lineHeight,
              letterSpacing: style.letterSpacing,
              textShadow: style.innerShadow
                ? "1px 1px 0 rgba(0,0,0,.35), -.5px -.5px 0 rgba(255,255,255,.25)"
                : "none",
            }}
          >
            {active.sample}
          </p>
          <p className="typo-easy__stage-meta">
            Font: {style.fontFamily} · Size: {style.fontSize}px · Colour: {style.color}
          </p>
        </div>
        <div className="typo-easy__controls card">
          <label className="typo-easy__field">
            <span>Font</span>
            <select
              className="input"
              value={style.fontFamily}
              onChange={(e) =>
                patch(active.key, {
                  fontFamily: e.target.value as TypographyTextStyle["fontFamily"],
                })
              }
            >
              {HATHOR_LUXURY_FONTS.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </label>
          <div className="typo-easy__fields-row">
            <label className="typo-easy__field">
              <span>Size</span>
              <input
                className="input"
                type="number"
                min="8"
                max="200"
                value={style.fontSize}
                onChange={(e) => patch(active.key, { fontSize: Number(e.target.value) })}
              />
            </label>
            <label className="typo-easy__field">
              <span>Colour</span>
              <input
                className="input"
                type="color"
                value={style.color}
                onChange={(e) => patch(active.key, { color: e.target.value })}
              />
            </label>
          </div>
          <div className="typo-easy__fields-row">
            <label className="typo-easy__field">
              <span>Line height</span>
              <input
                className="input"
                type="number"
                min="0.8"
                max="3"
                step="0.05"
                value={style.lineHeight}
                onChange={(e) => patch(active.key, { lineHeight: Number(e.target.value) })}
              />
            </label>
            <label className="typo-easy__field">
              <span>Letter spacing</span>
              <input
                className="input"
                type="number"
                min="-5"
                max="20"
                step="0.1"
                value={style.letterSpacing}
                onChange={(e) => patch(active.key, { letterSpacing: Number(e.target.value) })}
              />
            </label>
          </div>
          <label className="typo-easy__checkbox">
            <input
              type="checkbox"
              checked={style.innerShadow}
              onChange={(e) => patch(active.key, { innerShadow: e.target.checked })}
            />{" "}
            Inner shadow
          </label>
          <button className="typo-easy__reset" type="button" onClick={resetActive}>
            <RotateCcw className="h-3.5 w-3.5" /> Reset this style
          </button>
        </div>
      </div>
      <div className="typo-easy__savebar">
        <span>{same(settings, saved) ? "All changes saved." : "Unsaved Suites typography changes."}</span>
        <button
          className="btn-primary"
          type="button"
          disabled={saving || same(settings, saved)}
          onClick={() => void save()}
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
          Suites typography
        </button>
      </div>
    </section>
  );
}
