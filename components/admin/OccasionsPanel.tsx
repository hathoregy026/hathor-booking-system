"use client";

import "@/components/occasions/occasions.css";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  ArrowDown,
  ArrowUp,
  ExternalLink,
  ImagePlus,
  Loader2,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useToast } from "@/components/admin/ToastProvider";
import { adminFetch } from "@/lib/admin-fetch";
import {
  cairoLocalToIso,
  DEFAULT_OCCASIONS_SETTINGS,
  formatCairoDate,
  formatCountdown,
  isoToCairoLocal,
  msUntilCountdown,
  OCCASION_ICON_LABELS,
  OCCASION_ICON_NAMES,
  OCCASION_LIMITS,
  occasionStatus,
  stripeItemsAt,
  type Occasion,
  type OccasionIconName,
  type OccasionStatus,
  type OccasionStripeItem,
  type OccasionsSettings,
} from "@/lib/occasions";
import { OccasionIcon } from "@/components/occasions/OccasionIcon";
import {
  OccasionHanging,
  OccasionNavEffect,
  OccasionStripe,
} from "@/components/occasions/OccasionHeaderLayer";
import { HeroCountdownCells } from "@/components/occasions/OccasionHeroCountdown";
import { usePrefersReducedMotion } from "@/components/occasions/useActiveOccasion";

/* ------------------------------------------------------------ templates */

type TemplateKey = "new-year" | "christmas" | "ramadan" | "national-day" | "sun-festival" | "valentine" | "blank";

const TEMPLATE_LABELS: Record<TemplateKey, string> = {
  "new-year": "New Year's Eve",
  christmas: "Christmas",
  ramadan: "Ramadan & Eid",
  "national-day": "National day",
  "sun-festival": "Abu Simbel Sun Festival",
  valentine: "Valentine's & honeymoon",
  blank: "Blank occasion",
};

const item = (icon: OccasionIconName, text: string, href: string | null = null): OccasionStripeItem => ({
  icon,
  imageUrl: null,
  text,
  href,
});

/** Next calendar date (Cairo wall clock) on or after today, as "YYYY-MM-DDTHH:mm". */
function nextDate(month: number, day: number, time = "00:00"): string {
  const today = isoToCairoLocal(new Date().toISOString()).slice(0, 10);
  const year = Number(today.slice(0, 4));
  const mmdd = `${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const pick = `${year}-${mmdd}` >= today ? year : year + 1;
  return `${pick}-${mmdd}T${time}`;
}

function shiftLocal(local: string, days: number): string {
  const iso = cairoLocalToIso(local) ?? new Date().toISOString();
  return isoToCairoLocal(new Date(Date.parse(iso) + days * 86_400_000).toISOString());
}

function uniqueId(base: string, taken: Set<string>): string {
  const slug = base.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 56) || "occasion";
  let id = slug;
  for (let n = 2; taken.has(id); n += 1) id = `${slug}-${n}`;
  return id;
}

function buildTemplate(key: TemplateKey, taken: Set<string>): Occasion {
  const base: Occasion = {
    id: "",
    name: TEMPLATE_LABELS[key],
    enabled: false,
    startsAt: "",
    endsAt: "",
    countdownTo: null,
    stripe: {
      enabled: true,
      mode: "glide",
      style: "ink",
      speed: 48,
      dismissible: true,
      items: [],
      itemsAfterCountdown: [],
    },
    navEffect: { type: "none", intensity: 0.5, palette: "gold" },
    hanging: "none",
    heroCountdown: false,
  };
  let start = shiftLocal(isoToCairoLocal(new Date().toISOString()).slice(0, 10) + "T00:00", 7);
  let end = shiftLocal(start, 7);
  let moment: string | null = null;

  switch (key) {
    case "new-year": {
      moment = nextDate(1, 1);
      start = shiftLocal(moment, -6);
      end = shiftLocal(moment, 2);
      const year = moment.slice(0, 4);
      base.stripe.items = [
        item("hourglass", `${year} begins in {countdown}`),
        item("sparkle", "Season's greetings from everyone aboard Hathor"),
        item("boat", `Plan your ${year} Nile voyage`, "/cruises"),
      ];
      base.stripe.itemsAfterCountdown = [
        item("sparkle", `Happy New Year ${year} from everyone aboard Hathor`),
        item("boat", `Plan your ${year} Nile voyage`, "/cruises"),
      ];
      base.navEffect = { type: "fireworks", intensity: 0.6, palette: "gold" };
      base.hanging = "lights";
      base.heroCountdown = true;
      break;
    }
    case "christmas":
      start = nextDate(12, 20);
      end = shiftLocal(start, 8);
      base.stripe.mode = "rotate";
      base.stripe.style = "paper";
      base.stripe.items = [
        item("tree", "Merry Christmas from the crew of Hathor"),
        item("bauble", "Coptic Christmas, 7 January, celebrated in Luxor"),
      ];
      base.navEffect = { type: "dust", intensity: 0.55, palette: "gold" };
      base.hanging = "stars";
      break;
    case "ramadan":
      start = nextDate(2, 8);
      end = shiftLocal(start, 33);
      base.stripe.speed = 35;
      base.stripe.items = [
        item("crescent", "Ramadan Kareem · رمضان كريم"),
        item("lantern", "Eid Mubarak · عيد مبارك"),
      ];
      base.hanging = "lanterns";
      break;
    case "national-day":
      base.stripe.style = "paper";
      base.stripe.items = [item("flag", "Happy National Day")];
      base.navEffect = { type: "fireworks", intensity: 0.4, palette: "gold" };
      break;
    case "sun-festival":
      moment = nextDate(2, 22, "06:00");
      start = shiftLocal(moment, -3);
      end = shiftLocal(moment, 1);
      base.stripe.mode = "rotate";
      base.stripe.style = "gold";
      base.stripe.items = [
        item("hathor", "The sun reaches the inner sanctuary of Abu Simbel in {countdown}"),
        item("sun", "Twice a year, on 22 February and 22 October"),
      ];
      base.stripe.itemsAfterCountdown = [item("sun", "Today the sun lights the sanctuary of Abu Simbel")];
      base.navEffect = { type: "dust", intensity: 0.5, palette: "gold" };
      break;
    case "valentine":
      start = nextDate(2, 10);
      end = shiftLocal(start, 5);
      base.stripe.style = "paper";
      base.stripe.items = [item("heart", "Honeymoon on the Nile"), item("lotus", "Celebrate together aboard Hathor")];
      base.navEffect = { type: "petals", intensity: 0.55, palette: "gold" };
      break;
    case "blank":
      base.name = "New occasion";
      base.stripe.items = [item("sparkle", "Your message here")];
      break;
  }

  const startIso = cairoLocalToIso(start) ?? new Date().toISOString();
  base.id = uniqueId(`${base.name} ${start.slice(0, 4)}`, taken);
  base.startsAt = startIso;
  base.endsAt = cairoLocalToIso(end) ?? new Date(Date.parse(startIso) + 7 * 86_400_000).toISOString();
  base.countdownTo = moment ? cairoLocalToIso(moment) : null;
  return base;
}

/* ------------------------------------------------------------- helpers */

async function readError(response: Response, fallback: string): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    if (data.error) return data.error;
  } catch {
    /* fall through */
  }
  return fallback;
}

async function uploadIconImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  form.append("folder", "occasions");
  form.append("pageName", "Occasions");
  form.append("imageLabel", "Occasion icon");
  form.append("imageKind", "content");
  const response = await adminFetch("/api/admin/upload", { method: "POST", body: form }, 60_000);
  if (!response.ok) throw new Error(await readError(response, "The image could not be uploaded."));
  const data = (await response.json()) as { url?: string };
  if (!data.url) throw new Error("The upload finished without an image link.");
  return data.url;
}

function useNow(): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

const STATUS_COPY: Record<OccasionStatus, { label: string; tone: string }> = {
  live: { label: "Showing now", tone: "var(--accent)" },
  scheduled: { label: "Scheduled", tone: "#6b8f71" },
  ended: { label: "Ended", tone: "var(--text-muted)" },
  off: { label: "Off", tone: "var(--text-muted)" },
};

function StatusChip({ status }: { status: OccasionStatus }) {
  const copy = STATUS_COPY[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em]"
      style={{ border: `1px solid ${copy.tone}`, color: copy.tone }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: copy.tone }} aria-hidden />
      {copy.label}
    </span>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block min-w-0">
      <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-muted">{label}</span>
      <span className="mt-1.5 block">{children}</span>
      {hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  disabled?: boolean;
}) {
  return (
    <div className="min-w-0">
      <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-muted">{label}</span>
      <div className="mt-1.5 flex flex-wrap gap-1.5" role="radiogroup" aria-label={label}>
        {options.map((option) => {
          const on = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={on}
              disabled={disabled}
              onClick={() => onChange(option.value)}
              className="rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50"
              style={{
                border: `1px solid ${on ? "var(--accent)" : "var(--border)"}`,
                background: on ? "color-mix(in srgb, var(--accent) 16%, transparent)" : "transparent",
                color: on ? "var(--text-primary)" : "var(--text-secondary)",
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className={`flex items-start gap-3 ${disabled ? "opacity-60" : "cursor-pointer"}`}>
      <input
        type="checkbox"
        className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--accent)]"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="min-w-0">
        <span className="block text-sm font-medium">{label}</span>
        {hint ? <span className="mt-0.5 block text-xs text-muted">{hint}</span> : null}
      </span>
    </label>
  );
}

/* ------------------------------------------------------ messages editor */

function MessagesEditor({
  title,
  hint,
  items,
  onChange,
  disabled,
  allowEmpty,
}: {
  title: string;
  hint: string;
  items: OccasionStripeItem[];
  onChange: (items: OccasionStripeItem[]) => void;
  disabled: boolean;
  allowEmpty?: boolean;
}) {
  const { showToast } = useToast();
  const [uploading, setUploading] = useState<number | null>(null);
  const fileRefs = useRef<(HTMLInputElement | null)[]>([]);

  const update = (index: number, patch: Partial<OccasionStripeItem>) =>
    onChange(items.map((current, i) => (i === index ? { ...current, ...patch } : current)));
  const move = (index: number, by: -1 | 1) => {
    const next = [...items];
    const [moved] = next.splice(index, 1);
    next.splice(index + by, 0, moved);
    onChange(next);
  };

  const upload = async (index: number, file: File | undefined) => {
    if (!file) return;
    setUploading(index);
    try {
      update(index, { imageUrl: await uploadIconImage(file) });
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "The image could not be uploaded.");
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-0.5 text-xs text-muted">{hint}</p>
      </div>
      {items.length === 0 ? (
        <p className="rounded-lg px-3 py-2.5 text-xs text-muted" style={{ border: "1px dashed var(--border)" }}>
          {allowEmpty ? "No messages here: the stripe keeps showing the messages above." : "Add at least one message."}
        </p>
      ) : null}
      {items.map((entry, index) => (
        <div
          key={index}
          className="grid gap-2.5 rounded-xl p-3"
          style={{ border: "1px solid var(--border)", background: "var(--bg-secondary, transparent)" }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
              style={{ border: "1px solid var(--border)", color: "var(--accent)" }}
              aria-hidden
            >
              {entry.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- uploaded icon thumbnail
                <img src={entry.imageUrl} alt="" className="h-5 w-5 object-contain" />
              ) : (
                <span className="block h-5 w-5">
                  <OccasionIcon name={entry.icon} />
                </span>
              )}
            </span>
            <select
              className="input min-w-0 flex-1 sm:max-w-[11rem]"
              aria-label={`Icon for message ${index + 1}`}
              value={entry.imageUrl ? "__image" : entry.icon}
              disabled={disabled}
              onChange={(event) => {
                const value = event.target.value;
                if (value !== "__image") update(index, { icon: value as OccasionIconName, imageUrl: null });
              }}
            >
              {entry.imageUrl ? <option value="__image">Your image</option> : null}
              {OCCASION_ICON_NAMES.map((name) => (
                <option key={name} value={name}>
                  {OCCASION_ICON_LABELS[name]}
                </option>
              ))}
            </select>
            <input
              ref={(node) => {
                fileRefs.current[index] = node;
              }}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="sr-only"
              tabIndex={-1}
              onChange={(event) => {
                void upload(index, event.target.files?.[0]);
                event.target.value = "";
              }}
            />
            <button
              type="button"
              className="btn-ghost inline-flex items-center gap-1.5 px-3 py-2 text-xs"
              disabled={disabled || uploading !== null}
              onClick={() => fileRefs.current[index]?.click()}
            >
              {uploading === index ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              ) : (
                <ImagePlus className="h-3.5 w-3.5" aria-hidden />
              )}
              {entry.imageUrl ? "Replace image" : "Upload icon"}
            </button>
            {entry.imageUrl ? (
              <button
                type="button"
                className="btn-ghost px-3 py-2 text-xs"
                disabled={disabled}
                onClick={() => update(index, { imageUrl: null })}
              >
                Use a drawn icon
              </button>
            ) : null}
            <span className="ml-auto flex gap-1">
              <button
                type="button"
                className="btn-ghost p-2"
                aria-label={`Move message ${index + 1} up`}
                disabled={disabled || index === 0}
                onClick={() => move(index, -1)}
              >
                <ArrowUp className="h-3.5 w-3.5" aria-hidden />
              </button>
              <button
                type="button"
                className="btn-ghost p-2"
                aria-label={`Move message ${index + 1} down`}
                disabled={disabled || index === items.length - 1}
                onClick={() => move(index, 1)}
              >
                <ArrowDown className="h-3.5 w-3.5" aria-hidden />
              </button>
              <button
                type="button"
                className="btn-ghost p-2"
                aria-label={`Remove message ${index + 1}`}
                disabled={disabled}
                onClick={() => onChange(items.filter((_, i) => i !== index))}
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            </span>
          </div>
          <input
            className="input w-full"
            aria-label={`Message ${index + 1}`}
            value={entry.text}
            maxLength={OCCASION_LIMITS.text}
            disabled={disabled}
            placeholder="Message text"
            onChange={(event) => update(index, { text: event.target.value })}
          />
          <input
            className="input w-full"
            aria-label={`Link for message ${index + 1}`}
            value={entry.href ?? ""}
            maxLength={OCCASION_LIMITS.url}
            disabled={disabled}
            placeholder="Optional link, e.g. /cruises"
            onChange={(event) => update(index, { href: event.target.value.trim() ? event.target.value : null })}
          />
        </div>
      ))}
      <button
        type="button"
        className="btn-ghost inline-flex items-center gap-1.5 px-3 py-2 text-xs"
        disabled={disabled || items.length >= OCCASION_LIMITS.items}
        onClick={() => onChange([...items, item("sparkle", "")])}
      >
        <Plus className="h-3.5 w-3.5" aria-hidden />
        Add message
      </button>
    </div>
  );
}

/* --------------------------------------------------------------- preview */

/** A miniature of the site's header and home hero, drawn with the real components. */
function OccasionPreview({ occasion }: { occasion: Occasion }) {
  const now = useNow();
  const reducedMotion = usePrefersReducedMotion();
  const items = stripeItemsAt(occasion, now);
  const left = msUntilCountdown(occasion, now);
  const countdown = left !== null && left > 0 ? formatCountdown(left) : "";
  const showStripe = occasion.stripe.enabled && items.length > 0 && items.every((entry) => entry.text.trim());

  return (
    <div className="overflow-hidden rounded-xl" style={{ border: "1px solid var(--border)" }}>
      <div
        className="relative isolate z-10 flex h-14 items-center justify-center"
        style={{ background: "rgb(236 228 218 / 94%)", color: "#141210" }}
      >
        {occasion.navEffect.type !== "none" && !reducedMotion ? (
          <OccasionNavEffect effect={occasion.navEffect} />
        ) : null}
        <span style={{ fontFamily: '"Italiana", Georgia, serif', fontSize: 20, letterSpacing: "0.3em" }}>
          HATHOR
        </span>
        <div className="occasion-under">
          {showStripe ? (
            <OccasionStripe
              name={occasion.name}
              stripe={occasion.stripe}
              items={items}
              countdown={countdown}
              reducedMotion={reducedMotion}
              onDismiss={occasion.stripe.dismissible ? () => undefined : undefined}
            />
          ) : null}
          {occasion.hanging !== "none" ? <OccasionHanging kind={occasion.hanging} /> : null}
        </div>
      </div>
      <div
        className="relative flex h-56 justify-center pt-20"
        style={{ background: "linear-gradient(180deg, #2a241d, #14110e)" }}
      >
        <div
          className="relative h-fit text-center"
          style={{ color: "#f4ebdd", "--occ-cd-size": "8px" } as CSSProperties}
        >
          <span style={{ fontFamily: '"Italiana", Georgia, serif', fontSize: 30 }}>Luxury Dahabiya</span>
          {occasion.heroCountdown && left !== null && left > 0 ? <HeroCountdownCells ms={left} /> : null}
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- panel */

export function OccasionsPanel({ canManage }: { canManage: boolean }) {
  const { showToast } = useToast();
  const now = useNow();
  const [settings, setSettings] = useState<OccasionsSettings>(DEFAULT_OCCASIONS_SETTINGS);
  const [saved, setSaved] = useState<OccasionsSettings>(DEFAULT_OCCASIONS_SETTINGS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [template, setTemplate] = useState<TemplateKey>("new-year");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminFetch("/api/admin/occasions");
      if (!response.ok) throw new Error(await readError(response, "Could not load occasions."));
      const data = (await response.json()) as { settings: OccasionsSettings };
      setSettings(data.settings);
      setSaved(data.settings);
      setSelectedId(data.settings.occasions[0]?.id ?? null);
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "Could not load occasions.");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void load(); // eslint-disable-line react-hooks/set-state-in-effect -- dashboard mount fetch
  }, [load]);

  const dirty = useMemo(() => JSON.stringify(settings) !== JSON.stringify(saved), [settings, saved]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const occasions = settings.occasions;
  const selectedIndex = occasions.findIndex((occasion) => occasion.id === selectedId);
  const selected = selectedIndex >= 0 ? occasions[selectedIndex] : null;
  const savedIds = new Set(saved.occasions.map((occasion) => occasion.id));
  const disabled = !canManage || saving;

  const patch = (change: (occasion: Occasion) => Occasion) => {
    if (selectedIndex < 0) return;
    setSettings((current) => ({
      occasions: current.occasions.map((occasion, i) => (i === selectedIndex ? change(occasion) : occasion)),
    }));
  };
  const patchStripe = (change: Partial<Occasion["stripe"]>) =>
    patch((occasion) => ({ ...occasion, stripe: { ...occasion.stripe, ...change } }));
  const patchEffect = (change: Partial<Occasion["navEffect"]>) =>
    patch((occasion) => ({ ...occasion, navEffect: { ...occasion.navEffect, ...change } }));

  const moveOccasion = (index: number, by: -1 | 1) =>
    setSettings((current) => {
      const next = [...current.occasions];
      const [moved] = next.splice(index, 1);
      next.splice(index + by, 0, moved);
      return { occasions: next };
    });

  const addOccasion = () => {
    const created = buildTemplate(template, new Set(occasions.map((occasion) => occasion.id)));
    setSettings((current) => ({ occasions: [...current.occasions, created] }));
    setSelectedId(created.id);
    setConfirmDelete(false);
  };

  const deleteSelected = () => {
    if (!selected) return;
    const remaining = occasions.filter((occasion) => occasion.id !== selected.id);
    setSettings({ occasions: remaining });
    setSelectedId(remaining[Math.max(0, selectedIndex - 1)]?.id ?? null);
    setConfirmDelete(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      const response = await adminFetch("/api/admin/occasions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      if (!response.ok) throw new Error(await readError(response, "Could not save occasions."));
      const data = (await response.json()) as { settings: OccasionsSettings };
      setSettings(data.settings);
      setSaved(data.settings);
      showToast("success", "Occasions saved. The site updates within a minute.");
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "Could not save occasions.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-10 text-sm text-muted">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        Loading occasions…
      </div>
    );
  }

  const dateError =
    selected && Date.parse(selected.endsAt) <= Date.parse(selected.startsAt)
      ? "The end must be after the start."
      : null;

  return (
    <div className="space-y-6">
      {/* save bar */}
      <div
        className="sticky top-2 z-10 flex flex-wrap items-center gap-3 rounded-xl px-4 py-3"
        style={{ border: "1px solid var(--border)", background: "var(--bg-primary)" }}
      >
        <button
          type="button"
          className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm disabled:opacity-60"
          disabled={!canManage || saving || !dirty}
          onClick={() => void save()}
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}
          Save changes
        </button>
        {dirty ? (
          <button
            type="button"
            className="btn-ghost px-3 py-2 text-sm"
            disabled={saving}
            onClick={() => {
              setSettings(saved);
              setSelectedId((id) => (saved.occasions.some((o) => o.id === id) ? id : saved.occasions[0]?.id ?? null));
            }}
          >
            Discard changes
          </button>
        ) : null}
        <span className="text-sm text-muted">
          {!canManage
            ? "You can view occasions. Ask an administrator for website editing rights to change them."
            : dirty
              ? "Unsaved changes. Visitors see the last saved version."
              : "All changes saved."}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
        {/* list */}
        <section className="card space-y-4 p-4 sm:p-5" aria-label="Occasions">
          <div>
            <h2 className="text-base font-semibold tracking-tight">Occasions</h2>
            <p className="mt-0.5 text-xs text-muted">
              When two overlap, the higher one in this list shows. Times are Cairo time.
            </p>
          </div>
          <ul className="space-y-2">
            {occasions.map((occasion, index) => {
              const on = occasion.id === selectedId;
              return (
                <li key={occasion.id}>
                  <div
                    className="flex items-stretch gap-1 rounded-xl"
                    style={{
                      border: `1px solid ${on ? "var(--accent)" : "var(--border)"}`,
                      background: on ? "color-mix(in srgb, var(--accent) 10%, transparent)" : "transparent",
                    }}
                  >
                    <button
                      type="button"
                      className="min-w-0 flex-1 px-3 py-2.5 text-left"
                      aria-current={on || undefined}
                      onClick={() => {
                        setSelectedId(occasion.id);
                        setConfirmDelete(false);
                      }}
                    >
                      <span className="block truncate text-sm font-semibold">{occasion.name || "Untitled"}</span>
                      <span className="mt-0.5 block truncate text-xs text-muted">
                        {formatCairoDate(occasion.startsAt)} → {formatCairoDate(occasion.endsAt)}
                      </span>
                      <span className="mt-1.5 block">
                        <StatusChip status={occasionStatus(occasion, now)} />
                      </span>
                    </button>
                    <span className="flex flex-col justify-center gap-0.5 pr-1.5">
                      <button
                        type="button"
                        className="btn-ghost p-1.5"
                        aria-label={`Move ${occasion.name} up`}
                        disabled={disabled || index === 0}
                        onClick={() => moveOccasion(index, -1)}
                      >
                        <ArrowUp className="h-3.5 w-3.5" aria-hidden />
                      </button>
                      <button
                        type="button"
                        className="btn-ghost p-1.5"
                        aria-label={`Move ${occasion.name} down`}
                        disabled={disabled || index === occasions.length - 1}
                        onClick={() => moveOccasion(index, 1)}
                      >
                        <ArrowDown className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
          {occasions.length === 0 ? (
            <p className="text-sm text-muted">No occasions yet. Start from a template below.</p>
          ) : null}
          {canManage ? (
            <div className="space-y-2 pt-1">
              <div className="gold-hairline" />
              <Field label="Start from">
                <select
                  className="input w-full"
                  value={template}
                  onChange={(event) => setTemplate(event.target.value as TemplateKey)}
                >
                  {(Object.keys(TEMPLATE_LABELS) as TemplateKey[]).map((key) => (
                    <option key={key} value={key}>
                      {TEMPLATE_LABELS[key]}
                    </option>
                  ))}
                </select>
              </Field>
              <button
                type="button"
                className="btn-ghost inline-flex w-full items-center justify-center gap-1.5 px-3 py-2.5 text-sm"
                disabled={disabled || occasions.length >= OCCASION_LIMITS.occasions}
                onClick={addOccasion}
              >
                <Plus className="h-4 w-4" aria-hidden />
                Add occasion
              </button>
              <p className="text-xs text-muted">New occasions start switched off, so nothing shows until you turn one on and save.</p>
            </div>
          ) : null}
        </section>

        {/* editor */}
        {selected ? (
          <div className="min-w-0 space-y-6">
            <section className="card space-y-4 p-4 sm:p-6" aria-label="Preview">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold tracking-tight">Preview</h2>
                  <p className="mt-0.5 text-xs text-muted">Live as you edit. The real site uses the saved version.</p>
                </div>
                {savedIds.has(selected.id) ? (
                  <a
                    href={`/?occasion=${encodeURIComponent(selected.id)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="admin-inline-link inline-flex items-center gap-1.5 text-sm"
                  >
                    See it on the site
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  </a>
                ) : (
                  <span className="text-xs text-muted">Save to see it on the site.</span>
                )}
              </div>
              <OccasionPreview occasion={selected} />
              {savedIds.has(selected.id) ? (
                <p className="text-xs text-muted">
                  The site link works even before the dates or while switched off, only in the tab you open.
                  Add <code>?occasion=off</code> to a page address to stop previewing.
                </p>
              ) : null}
            </section>

            <section className="card space-y-5 p-4 sm:p-6" aria-label="When">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="text-base font-semibold tracking-tight">When</h2>
                <StatusChip status={occasionStatus(selected, now)} />
              </div>
              <Field label="Name">
                <input
                  className="input w-full"
                  value={selected.name}
                  maxLength={OCCASION_LIMITS.name}
                  disabled={disabled}
                  onChange={(event) => patch((o) => ({ ...o, name: event.target.value }))}
                />
              </Field>
              <Toggle
                label="Show on the site during these dates"
                hint="Off keeps the occasion saved without showing it."
                checked={selected.enabled}
                disabled={disabled}
                onChange={(enabled) => patch((o) => ({ ...o, enabled }))}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Starts (Cairo time)">
                  <input
                    type="datetime-local"
                    className="input w-full"
                    value={isoToCairoLocal(selected.startsAt)}
                    disabled={disabled}
                    onChange={(event) => {
                      const iso = cairoLocalToIso(event.target.value);
                      if (iso) patch((o) => ({ ...o, startsAt: iso }));
                    }}
                  />
                </Field>
                <Field label="Ends (Cairo time)">
                  <input
                    type="datetime-local"
                    className="input w-full"
                    value={isoToCairoLocal(selected.endsAt)}
                    disabled={disabled}
                    onChange={(event) => {
                      const iso = cairoLocalToIso(event.target.value);
                      if (iso) patch((o) => ({ ...o, endsAt: iso }));
                    }}
                  />
                </Field>
              </div>
              {dateError ? (
                <p className="text-sm" style={{ color: "var(--danger)" }} role="alert">
                  {dateError}
                </p>
              ) : null}
              <Toggle
                label="Count down to a moment"
                hint="Type {countdown} in a message to show the time left, e.g. midnight on New Year's Eve."
                checked={selected.countdownTo !== null}
                disabled={disabled}
                onChange={(on) =>
                  patch((o) => ({
                    ...o,
                    countdownTo: on ? o.countdownTo ?? o.startsAt : null,
                    heroCountdown: on ? o.heroCountdown : false,
                  }))
                }
              />
              {selected.countdownTo !== null ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Counting down to (Cairo time)">
                    <input
                      type="datetime-local"
                      className="input w-full"
                      value={isoToCairoLocal(selected.countdownTo)}
                      disabled={disabled}
                      onChange={(event) => {
                        const iso = cairoLocalToIso(event.target.value);
                        if (iso) patch((o) => ({ ...o, countdownTo: iso }));
                      }}
                    />
                  </Field>
                  <div className="self-end pb-1">
                    <Toggle
                      label="Countdown under the home page title"
                      hint="Days, hours, minutes and seconds. Gone at the moment itself."
                      checked={selected.heroCountdown}
                      disabled={disabled}
                      onChange={(heroCountdown) => patch((o) => ({ ...o, heroCountdown }))}
                    />
                  </div>
                </div>
              ) : null}
            </section>

            <section className="card space-y-5 p-4 sm:p-6" aria-label="Stripe">
              <div>
                <h2 className="text-base font-semibold tracking-tight">Stripe under the menu</h2>
                <p className="mt-0.5 text-xs text-muted">A thin band on every page except booking and admin.</p>
              </div>
              <Toggle
                label="Show the stripe"
                checked={selected.stripe.enabled}
                disabled={disabled}
                onChange={(enabled) => patchStripe({ enabled })}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Segmented
                  label="Look"
                  value={selected.stripe.style}
                  disabled={disabled}
                  options={[
                    { value: "ink", label: "Ink" },
                    { value: "paper", label: "Paper" },
                    { value: "gold", label: "Gold" },
                  ]}
                  onChange={(style) => patchStripe({ style })}
                />
                <Segmented
                  label="Movement"
                  value={selected.stripe.mode}
                  disabled={disabled}
                  options={[
                    { value: "glide", label: "Glide" },
                    { value: "rotate", label: "One at a time" },
                    { value: "still", label: "Still" },
                  ]}
                  onChange={(mode) => patchStripe({ mode })}
                />
              </div>
              {selected.stripe.mode !== "still" ? (
                <Field label={`Speed · ${selected.stripe.speed}`}>
                  <input
                    type="range"
                    min={20}
                    max={120}
                    step={5}
                    className="w-full accent-[var(--accent)]"
                    value={selected.stripe.speed}
                    disabled={disabled}
                    onChange={(event) => patchStripe({ speed: Number(event.target.value) })}
                  />
                </Field>
              ) : null}
              <Toggle
                label="Visitors can hide it"
                hint="A small × on the stripe. Their choice is remembered for this occasion."
                checked={selected.stripe.dismissible}
                disabled={disabled}
                onChange={(dismissible) => patchStripe({ dismissible })}
              />
              <div className="gold-hairline" />
              <MessagesEditor
                title="Messages"
                hint="Up to 8. Each can have its own icon or uploaded image, and a link."
                items={selected.stripe.items}
                disabled={disabled}
                onChange={(items) => patchStripe({ items })}
              />
              {selected.countdownTo !== null ? (
                <>
                  <div className="gold-hairline" />
                  <MessagesEditor
                    title="After the countdown"
                    hint="Replaces the messages above once the moment passes, e.g. Happy New Year."
                    items={selected.stripe.itemsAfterCountdown}
                    disabled={disabled}
                    allowEmpty
                    onChange={(itemsAfterCountdown) => patchStripe({ itemsAfterCountdown })}
                  />
                </>
              ) : null}
            </section>

            <section className="card space-y-5 p-4 sm:p-6" aria-label="Decoration">
              <div>
                <h2 className="text-base font-semibold tracking-tight">Decoration</h2>
                <p className="mt-0.5 text-xs text-muted">
                  Kept faint and away from the logo and buttons. Visitors who ask for less motion see no effects.
                </p>
              </div>
              <Segmented
                label="Inside the menu bar"
                value={selected.navEffect.type}
                disabled={disabled}
                options={[
                  { value: "none", label: "None" },
                  { value: "fireworks", label: "Fireworks" },
                  { value: "dust", label: "Gold dust" },
                  { value: "confetti", label: "Confetti" },
                  { value: "petals", label: "Petals" },
                ]}
                onChange={(type) => patchEffect({ type })}
              />
              {selected.navEffect.type !== "none" ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {selected.navEffect.type !== "petals" ? (
                    <Segmented
                      label="Colors"
                      value={selected.navEffect.palette}
                      disabled={disabled}
                      options={[
                        { value: "gold", label: "Gold" },
                        { value: "champagne", label: "Champagne" },
                        { value: "midnight", label: "Midnight" },
                      ]}
                      onChange={(palette) => patchEffect({ palette })}
                    />
                  ) : null}
                  <Field label={`Intensity · ${Math.round(selected.navEffect.intensity * 100)}%`}>
                    <input
                      type="range"
                      min={0.1}
                      max={1}
                      step={0.05}
                      className="w-full accent-[var(--accent)]"
                      value={selected.navEffect.intensity}
                      disabled={disabled}
                      onChange={(event) => patchEffect({ intensity: Number(event.target.value) })}
                    />
                  </Field>
                </div>
              ) : null}
              <Segmented
                label="Hanging under the menu"
                value={selected.hanging}
                disabled={disabled}
                options={[
                  { value: "none", label: "None" },
                  { value: "lights", label: "String lights" },
                  { value: "lanterns", label: "Lanterns" },
                  { value: "stars", label: "Star garland" },
                ]}
                onChange={(hanging) => patch((o) => ({ ...o, hanging }))}
              />
            </section>

            {canManage ? (
              <section className="card flex flex-wrap items-center gap-3 p-4 sm:p-6" aria-label="Delete">
                {confirmDelete ? (
                  <>
                    <span className="text-sm">Delete “{selected.name}”? This takes effect when you save.</span>
                    <button
                      type="button"
                      className="btn-ghost inline-flex items-center gap-1.5 px-3 py-2 text-sm"
                      style={{ color: "var(--danger)" }}
                      onClick={deleteSelected}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                      Delete
                    </button>
                    <button type="button" className="btn-ghost px-3 py-2 text-sm" onClick={() => setConfirmDelete(false)}>
                      Keep it
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="btn-ghost inline-flex items-center gap-1.5 px-3 py-2 text-sm"
                    disabled={disabled}
                    onClick={() => setConfirmDelete(true)}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                    Delete this occasion
                  </button>
                )}
              </section>
            ) : null}
          </div>
        ) : (
          <section className="card p-6 text-sm text-muted">Pick an occasion, or add one from a template.</section>
        )}
      </div>
    </div>
  );
}
