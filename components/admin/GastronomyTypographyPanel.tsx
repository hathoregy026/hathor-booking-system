"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { AdminDevicePreviewToggle } from "@/components/admin/AdminDevicePreviewToggle";
import { useToast } from "@/components/admin/ToastProvider";
import { adminFetch } from "@/lib/admin-fetch";
import {
  DEFAULT_GASTRONOMY_TYPOGRAPHY,
  type GastronomyTypography,
} from "@/lib/gastronomy-typography-shared";
import {
  HATHOR_LUXURY_FONTS,
  HATHOR_FONT_STACKS,
  type TypographyTextStyle,
} from "@/lib/typography-settings-shared";
import type { AdminDevicePreview } from "@/lib/admin-device-preview";

const ROLES: Array<{ key: keyof GastronomyTypography; label: string; sample: string }> = [
  { key: "display", label: "Titles & photo overlays", sample: "Private Dining" },
  { key: "indication", label: "Eyebrows & meta text", sample: "A PRIVATE TABLE ON THE NILE" },
  { key: "body", label: "Supporting text", sample: "Courses, wine and service composed around your party." },
];

function same(a: GastronomyTypography, b: GastronomyTypography) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function GastronomyTypographyPanel() {
  const { showToast } = useToast();
  const [device, setDevice] = useState<AdminDevicePreview>("desktop");
  const [desktop, setDesktop] = useState(DEFAULT_GASTRONOMY_TYPOGRAPHY);
  const [phone, setPhone] = useState(DEFAULT_GASTRONOMY_TYPOGRAPHY);
  const [savedDesktop, setSavedDesktop] = useState(DEFAULT_GASTRONOMY_TYPOGRAPHY);
  const [savedPhone, setSavedPhone] = useState(DEFAULT_GASTRONOMY_TYPOGRAPHY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const settings = device === "phone" ? phone : desktop;
  const saved = device === "phone" ? savedPhone : savedDesktop;

  useEffect(() => {
    void adminFetch("/api/admin/gastronomy-typography")
      .then((r) => r.json())
      .then((data: { settings?: GastronomyTypography; settingsMobile?: GastronomyTypography }) => {
        const next = data.settings ?? DEFAULT_GASTRONOMY_TYPOGRAPHY;
        const nextPhone = data.settingsMobile ?? next;
        setDesktop(next); setSavedDesktop(next); setPhone(nextPhone); setSavedPhone(nextPhone);
      })
      .catch(() => showToast("error", "Could not load gastronomy typography."))
      .finally(() => setLoading(false));
  }, [showToast]);

  const patch = (role: keyof GastronomyTypography, changes: Partial<TypographyTextStyle>) => {
    const next = { ...settings, [role]: { ...settings[role], ...changes } };
    if (device === "phone") setPhone(next); else setDesktop(next);
  };

  const save = async () => {
    if (saving || same(settings, saved)) return;
    setSaving(true);
    try {
      const response = await adminFetch("/api/admin/gastronomy-typography", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings, device }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Save failed");
      if (device === "phone") setSavedPhone(data.settings); else setSavedDesktop(data.settings);
      showToast("success", `Gastronomy ${device} typography saved.`);
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "Could not save gastronomy typography.");
    } finally { setSaving(false); }
  };

  if (loading) return <div className="typo-easy typo-easy--loading"><Loader2 className="h-5 w-5 animate-spin" />Loading private dining typography…</div>;

  return (
    <section className="typo-easy" aria-labelledby="gastronomy-typography-title">
      <header className="typo-easy__header">
        <div>
          <h2 id="gastronomy-typography-title" className="admin-page-title">Gastronomy / Private Dining</h2>
          <p className="admin-page-subtitle">These fonts apply only inside the isolated Private Dining page. They do not change any other route.</p>
        </div>
        <AdminDevicePreviewToggle value={device} onChange={setDevice} />
      </header>
      <div className="typo-easy__groups">
        {ROLES.map(({ key, label, sample }) => {
          const style = settings[key];
          return <article className="typo-easy__panel" key={key}>
            <h3>{label}</h3>
            <p style={{ fontFamily: HATHOR_FONT_STACKS[style.fontFamily], fontSize: Math.min(style.fontSize, 42), color: style.color, lineHeight: style.lineHeight, letterSpacing: style.letterSpacing }}>{sample}</p>
            <label className="typo-easy__field"><span>Font</span>
              <select className="admin-input" value={style.fontFamily} onChange={(e) => patch(key, { fontFamily: e.target.value as TypographyTextStyle["fontFamily"] })}>
                {HATHOR_LUXURY_FONTS.map((font) => <option key={font} value={font}>{font}</option>)}
              </select>
            </label>
            <label className="typo-easy__field"><span>Size</span><input className="admin-input" type="number" min="8" max="200" value={style.fontSize} onChange={(e) => patch(key, { fontSize: Number(e.target.value) })} /></label>
            <label className="typo-easy__field"><span>Colour</span><input className="admin-input" type="color" value={style.color} onChange={(e) => patch(key, { color: e.target.value })} /></label>
          </article>;
        })}
      </div>
      <div className="typo-easy__savebar">
        <span>{same(settings, saved) ? "All changes saved." : "Unsaved gastronomy typography changes."}</span>
        <button className="admin-btn admin-btn--primary" type="button" disabled={saving || same(settings, saved)} onClick={() => void save()}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save gastronomy typography
        </button>
      </div>
    </section>
  );
}
