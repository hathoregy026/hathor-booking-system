"use client";

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
  isoToCairoLocal,
  OCCASION_FRAME_MESSAGES,
  OCCASION_FRAME_PARAM,
  OCCASION_ICON_LABELS,
  OCCASION_ICON_NAMES,
  OCCASION_LIMITS,
  occasionStatus,
  type Occasion,
  type OccasionIconName,
  type OccasionStatus,
  type OccasionStripeItem,
  type OccasionsSettings,
} from "@/lib/occasions";
import { OccasionIcon } from "@/components/occasions/OccasionIcon";

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
    navEffect: { type: "none", intensity: 0.5, palette: "gold", speed: 1, density: 0.5 },
    hanging: "none",
    heroCountdown: false,
    countdownLabel: "",
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
      base.navEffect = { ...base.navEffect, type: "fireworks", intensity: 0.75, palette: "festive", density: 0.6 };
      base.hanging = "lights";
      base.heroCountdown = true;
      base.countdownLabel = "Until New Year";
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
      base.navEffect = { ...base.navEffect, type: "dust", intensity: 0.55 };
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
      base.navEffect = { ...base.navEffect, type: "fireworks", intensity: 0.6, palette: "festive" };
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
      base.countdownLabel = "Until the sun festival";
      base.navEffect = { ...base.navEffect, type: "dust" };
      break;
    case "valentine":
      start = nextDate(2, 10);
      end = shiftLocal(start, 5);
      base.stripe.style = "paper";
      base.stripe.items = [item("heart", "Honeymoon on the Nile"), item("lotus", "Celebrate together aboard Hathor")];
      base.navEffect = { ...base.navEffect, type: "petals", intensity: 0.55 };
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
          className="grid gap-2 rounded-xl p-2.5"
          style={{ border: "1px solid var(--border)", background: "var(--bg-secondary, transparent)" }}
        >
          {/* what it says */}
          <div className="flex items-center gap-2">
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
            <input
              className="input min-w-0 flex-1"
              aria-label={`Message ${index + 1}`}
              value={entry.text}
              maxLength={OCCASION_LIMITS.text}
              disabled={disabled}
              placeholder="Message text"
              onChange={(event) => update(index, { text: event.target.value })}
            />
          </div>
          {/* its icon */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="input"
              style={{ flex: "none", width: "10rem" }}
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
          </div>
          {/* where it goes, and its place in the list */}
          <div className="flex items-center gap-2">
            <input
              className="input min-w-0 flex-1"
              aria-label={`Link for message ${index + 1}`}
              value={entry.href ?? ""}
              maxLength={OCCASION_LIMITS.url}
              disabled={disabled}
              placeholder="Optional link, e.g. /cruises"
              onChange={(event) => update(index, { href: event.target.value.trim() ? event.target.value : null })}
            />
            <span className="flex shrink-0">
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

/* ---------------------------------------------------------- live preview */

type Device = "desktop" | "phone";

/* Stacked above the editor the desktop view keeps this shape; beside it, it takes the column's. */
const PREVIEW_FRAMES: Record<Device, { width: number; height: number }> = {
  desktop: { width: 1280, height: 800 },
  phone: { width: 390, height: 760 },
};
const PREVIEW_SRC = `/?${OCCASION_FRAME_PARAM}=1`;
/* Matches the panel grid's `xl:` columns: preview beside the editor from here up. */
const WIDE_LAYOUT_QUERY = "(min-width: 1280px)";

function PillSwitch<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="inline-flex rounded-full p-0.5"
      style={{ border: "1px solid var(--border)" }}
    >
      {options.map((option) => {
        const on = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(option.value)}
            className="rounded-full px-3 py-1 text-xs font-semibold transition-colors"
            style={{
              background: on ? "color-mix(in srgb, var(--accent) 18%, transparent)" : "transparent",
              color: on ? "var(--text-primary)" : "var(--text-secondary)",
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * The real homepage in a scaled frame, dressed with the occasion being edited,
 * unsaved changes included. The frame only listens to this page, and only
 * after the admin API confirms the session (lib/occasions.ts, OCCASION_FRAME_PARAM).
 */
function LivePreview({ occasion, note }: { occasion: Occasion | null; note?: ReactNode }) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const latest = useRef<{ occasion: Occasion | null; scrolled: boolean }>({ occasion, scrolled: false });
  /* Mounts after the occasions load (client only), so the phone check never meets server HTML. */
  const [device, setDevice] = useState<Device>(() =>
    window.matchMedia("(max-width: 639px)").matches ? "phone" : "desktop",
  );
  const [scrolled, setScrolled] = useState(false);
  const [ready, setReady] = useState(false);
  const [boxWidth, setBoxWidth] = useState(0);
  const [maxHeight, setMaxHeight] = useState(360);
  const [wide, setWide] = useState(false);

  const post = useCallback((message: object) => {
    frameRef.current?.contentWindow?.postMessage(message, window.location.origin);
  }, []);

  useEffect(() => {
    latest.current.occasion = occasion;
    post({ type: OCCASION_FRAME_MESSAGES.draft, occasion });
  }, [occasion, post]);

  useEffect(() => {
    latest.current.scrolled = scrolled;
    post({ type: OCCASION_FRAME_MESSAGES.view, scrolled });
  }, [scrolled, post]);

  /* The frame announces itself on load, and again after a link is followed inside it. */
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== frameRef.current?.contentWindow) return;
      if ((event.data as { type?: unknown } | null)?.type !== OCCASION_FRAME_MESSAGES.ready) return;
      setReady(true);
      post({ type: OCCASION_FRAME_MESSAGES.draft, occasion: latest.current.occasion });
      post({ type: OCCASION_FRAME_MESSAGES.view, scrolled: latest.current.scrolled });
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [post]);

  /*
   * Beside the editor the card fills the screen below the dashboard's top bar
   * once it pins, save bar included; stacked above the editor it keeps to a band.
   */
  useEffect(() => {
    const box = boxRef.current;
    const card = box?.closest("aside");
    if (!box || !card) return;
    const measure = () => {
      setBoxWidth(box.clientWidth);
      const beside = window.matchMedia(WIDE_LAYOUT_QUERY).matches;
      setWide(beside);
      if (!beside) {
        const share = window.matchMedia("(max-width: 639px)").matches ? 0.26 : 0.34;
        setMaxHeight(Math.max(170, Math.round(window.innerHeight * share)));
        return;
      }
      const pinnedTop = parseFloat(window.getComputedStyle(card).top) || 0;
      const chrome = card.getBoundingClientRect().height - box.getBoundingClientRect().height;
      setMaxHeight(Math.max(360, Math.floor(window.innerHeight - pinnedTop - chrome - 12)));
    };
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    observer.observe(card);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  /*
   * Beside the editor the desktop view fills the column: full width, as tall as
   * the screen allows, up to 4:3 so a narrow column still shows a desktop page.
   */
  const fill = device === "desktop" && wide && boxWidth > 0;
  const base = PREVIEW_FRAMES[device];
  const frameWidth = fill ? Math.max(base.width, boxWidth) : base.width;
  const scale = !boxWidth
    ? 0
    : fill
      ? boxWidth / frameWidth
      : Math.min(boxWidth / base.width, maxHeight / base.height);
  const frame = {
    width: frameWidth,
    height: fill ? Math.min(Math.round(maxHeight / scale), Math.round(frameWidth * 0.75)) : base.height,
  };
  const shownWidth = Math.round(frame.width * scale);
  const shownHeight = Math.round(frame.height * scale);

  return (
    <div>
      <div className="px-4 pb-3 pt-3.5">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="mr-auto hidden text-base font-semibold tracking-tight sm:block">Live preview</h2>
          <PillSwitch
            label="Screen"
            value={device}
            options={[
              { value: "desktop", label: "Desktop" },
              { value: "phone", label: "Phone" },
            ]}
            onChange={setDevice}
          />
          <PillSwitch
            label="Page position"
            value={scrolled ? "scrolled" : "top"}
            options={[
              { value: "top", label: "Top" },
              { value: "scrolled", label: "Scrolled" },
            ]}
            onChange={(view) => setScrolled(view === "scrolled")}
          />
        </div>
        {note ?? (
          <p className="mt-1 hidden text-xs text-muted sm:block">
            The real homepage with your unsaved edits. Only you see it.
          </p>
        )}
      </div>
      <div className="px-4 pb-4">
        <div ref={boxRef} className="relative w-full" style={{ height: shownHeight || Math.round(maxHeight * 0.6) }}>
          {scale > 0 ? (
            <div
              className="absolute top-0 overflow-hidden"
              style={{
                left: `calc(50% - ${shownWidth / 2}px)`,
                width: shownWidth,
                height: shownHeight,
                borderRadius: device === "phone" ? 18 : 10,
                border: "1px solid var(--border)",
                background: "#14110e",
              }}
            >
              <iframe
                ref={frameRef}
                src={PREVIEW_SRC}
                title="Live preview of the homepage"
                style={{
                  display: "block",
                  width: frame.width,
                  height: frame.height,
                  border: 0,
                  transform: `scale(${scale})`,
                  transformOrigin: "0 0",
                }}
              />
              {!ready ? (
                <div
                  className="absolute inset-0 grid place-items-center text-xs"
                  style={{ background: "#14110e", color: "#d9c08a" }}
                >
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                    Loading the homepage…
                  </span>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ tabs */

type TabKey = "when" | "countdown" | "stripe" | "messages" | "effects";

const TABS: { key: TabKey; label: string }[] = [
  { key: "when", label: "When" },
  { key: "countdown", label: "Countdown" },
  { key: "stripe", label: "Stripe" },
  { key: "messages", label: "Messages" },
  { key: "effects", label: "Effects" },
];

/** One row of equal tabs; a gold dot marks the parts that are switched on. */
function EditorTabs({
  value,
  onChange,
  on: active,
}: {
  value: TabKey;
  onChange: (key: TabKey) => void;
  on: Partial<Record<TabKey, boolean>>;
}) {
  const refs = useRef<Partial<Record<TabKey, HTMLButtonElement | null>>>({});
  const focusAt = (index: number) => {
    const key = TABS[(index + TABS.length) % TABS.length].key;
    onChange(key);
    refs.current[key]?.focus();
  };
  return (
    <div
      role="tablist"
      aria-label="Occasion settings"
      className="grid grid-cols-3 @sm:grid-cols-5"
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      {TABS.map((tab, index) => {
        const on = tab.key === value;
        return (
          <button
            key={tab.key}
            ref={(node) => {
              refs.current[tab.key] = node;
            }}
            id={`occ-tab-${tab.key}`}
            type="button"
            role="tab"
            aria-selected={on}
            aria-controls={`occ-panel-${tab.key}`}
            tabIndex={on ? 0 : -1}
            onClick={() => onChange(tab.key)}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight") {
                event.preventDefault();
                focusAt(index + 1);
              } else if (event.key === "ArrowLeft") {
                event.preventDefault();
                focusAt(index - 1);
              }
            }}
            className="-mb-px inline-flex min-w-0 items-center justify-center gap-1 px-1 py-2.5 text-[13px] font-semibold transition-colors"
            style={{
              color: on ? "var(--text-primary)" : "var(--text-muted)",
              borderBottom: `2px solid ${on ? "var(--accent)" : "transparent"}`,
            }}
          >
            {tab.label}
            {active[tab.key] ? (
              <>
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: "var(--accent)" }}
                  aria-hidden
                />
                <span className="sr-only">(on)</span>
              </>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

const PALETTE_OPTIONS: { value: Occasion["navEffect"]["palette"]; label: string }[] = [
  { value: "festive", label: "Festive colours" },
  { value: "jewel", label: "Jewel tones" },
  { value: "gold", label: "Gold" },
  { value: "champagne", label: "Champagne" },
  { value: "midnight", label: "Midnight" },
];

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
  /* The template being tried on: shown in the preview, nothing saved until Add occasion. */
  const [template, setTemplate] = useState<TemplateKey | "">("");
  const [templatePreview, setTemplatePreview] = useState<Occasion | null>(null);
  const [tab, setTab] = useState<TabKey>("when");
  const [afterMoment, setAfterMoment] = useState(false);
  const [previewCard, setPreviewCard] = useState<HTMLElement | null>(null);
  const [previewCover, setPreviewCover] = useState(0);

  /* Stacked layouts pin the preview over the editor; fields scroll into view below it. */
  useEffect(() => {
    if (!previewCard) return;
    const measure = () =>
      setPreviewCover(
        window.matchMedia(WIDE_LAYOUT_QUERY).matches ? 0 : Math.round(previewCard.getBoundingClientRect().height),
      );
    const observer = new ResizeObserver(measure);
    observer.observe(previewCard);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [previewCard]);

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

  const clearTemplate = () => {
    setTemplate("");
    setTemplatePreview(null);
  };

  const pickTemplate = (key: TemplateKey | "") => {
    setTemplate(key);
    setTemplatePreview(key ? buildTemplate(key, new Set(occasions.map((occasion) => occasion.id))) : null);
  };

  const patch = (change: (occasion: Occasion) => Occasion) => {
    if (selectedIndex < 0) return;
    clearTemplate();
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

  const selectOccasion = (id: string | null) => {
    clearTemplate();
    setSelectedId(id);
    setConfirmDelete(false);
  };

  const addOccasion = () => {
    if (!templatePreview) return;
    const created = templatePreview;
    setSettings((current) => ({ occasions: [...current.occasions, created] }));
    selectOccasion(created.id);
    setTab("when");
  };

  const deleteSelected = () => {
    if (!selected) return;
    const remaining = occasions.filter((occasion) => occasion.id !== selected.id);
    setSettings({ occasions: remaining });
    selectOccasion(remaining[Math.max(0, selectedIndex - 1)]?.id ?? null);
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
  const saveStatus = !canManage
    ? "You can view occasions. Ask an administrator for website editing rights to change them."
    : dirty
      ? "Unsaved changes. Visitors see the last saved version."
      : "All changes saved.";

  const templateNote =
    template && templatePreview ? (
      <p className="mt-1 text-xs" role="status" style={{ color: "var(--accent)" }}>
        Trying the {TEMPLATE_LABELS[template]} template. Press Add occasion to keep it
        {selected ? (
          <>
            , or{" "}
            <button type="button" className="admin-inline-link" onClick={() => selectOccasion(selected.id)}>
              go back to {selected.name || "your occasion"}
            </button>
          </>
        ) : null}
        .
      </p>
    ) : undefined;

  const siteLink =
    selected && savedIds.has(selected.id) ? (
      <a
        href={`/?occasion=${encodeURIComponent(selected.id)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="admin-inline-link inline-flex items-center gap-1.5 text-xs"
        title="Opens the saved version on the site in a new tab. It works while you are signed in to the dashboard, in that tab, even before the dates or while switched off. Add ?occasion=off to a page address to stop previewing."
      >
        Open on the site
        <ExternalLink className="h-3.5 w-3.5" aria-hidden />
      </a>
    ) : selected ? (
      <span className="text-xs text-muted">Save to open it on the site.</span>
    ) : null;

  return (
    <div className="space-y-5">
      {/* occasions: pick one, or start a new one from a template */}
      <section className="card px-4 py-3.5 sm:px-5" aria-label="Occasions">
        <div className="flex flex-wrap items-center gap-2.5">
          {occasions.map((occasion) => {
            const on = occasion.id === selectedId;
            return (
              <button
                key={occasion.id}
                type="button"
                aria-current={on || undefined}
                onClick={() => selectOccasion(occasion.id)}
                className="flex max-w-full items-center gap-3 rounded-xl px-3.5 py-2 text-left transition-colors"
                style={{
                  border: `1px solid ${on ? "var(--accent)" : "var(--border)"}`,
                  background: on ? "color-mix(in srgb, var(--accent) 10%, transparent)" : "transparent",
                }}
              >
                <span className="min-w-0">
                  <span className="block max-w-[14rem] truncate text-sm font-semibold">
                    {occasion.name || "Untitled"}
                  </span>
                  <span className="block max-w-[14rem] truncate text-[11px] text-muted">
                    {formatCairoDate(occasion.startsAt)} → {formatCairoDate(occasion.endsAt)}
                  </span>
                </span>
                <StatusChip status={occasionStatus(occasion, now)} />
              </button>
            );
          })}
          {occasions.length === 0 ? (
            <span className="text-sm text-muted">No occasions yet. Start from a template.</span>
          ) : null}
          {canManage ? (
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <label htmlFor="occ-template" className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                Start from
              </label>
              <select
                id="occ-template"
                className="input"
                style={{ width: "auto", minWidth: "15rem" }}
                value={template}
                onChange={(event) => pickTemplate(event.target.value as TemplateKey | "")}
              >
                <option value="">Choose a template…</option>
                {(Object.keys(TEMPLATE_LABELS) as TemplateKey[]).map((key) => (
                  <option key={key} value={key}>
                    {TEMPLATE_LABELS[key]}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="btn-ghost inline-flex items-center gap-1.5 px-3 py-2 text-sm"
                disabled={disabled || !templatePreview || occasions.length >= OCCASION_LIMITS.occasions}
                onClick={addOccasion}
              >
                <Plus className="h-4 w-4" aria-hidden />
                Add occasion
              </button>
            </div>
          ) : null}
        </div>
        <p className="mt-2.5 text-xs text-muted">
          Times are Cairo time. When two overlap, the first one in this row shows.
          {canManage
            ? " Pick a template to try it in the preview. New occasions start switched off, so nothing shows until you turn one on and save."
            : ""}
        </p>
      </section>

      {selected ? (
        <div className="grid items-start gap-5 xl:grid-cols-[minmax(24rem,28rem)_minmax(0,1fr)] 2xl:grid-cols-[minmax(26rem,30rem)_minmax(0,1fr)]">
          {/* editor */}
          <section
            className="card @container order-2 min-w-0 p-4 sm:p-5 xl:order-1 [&_:is(input,select,textarea,button)]:scroll-mt-[calc(var(--header-h)+var(--occ-cover)+0.75rem)] max-md:[&_:is(input,select,textarea,button)]:scroll-mb-[calc(5.5rem+env(safe-area-inset-bottom))]"
            style={{ "--occ-cover": `${previewCover}px` } as CSSProperties}
            aria-label="Edit occasion"
          >
            <Field label="Name">
              <input
                className="input w-full"
                value={selected.name}
                maxLength={OCCASION_LIMITS.name}
                disabled={disabled}
                onChange={(event) => patch((o) => ({ ...o, name: event.target.value }))}
              />
            </Field>
            <div
              className="mt-3 flex items-start justify-between gap-3 rounded-xl px-3.5 py-2.5"
              style={{
                border: `1px solid ${selected.enabled ? "var(--accent)" : "var(--border)"}`,
                background: selected.enabled ? "color-mix(in srgb, var(--accent) 8%, transparent)" : "transparent",
              }}
            >
              <Toggle
                label="Show on the site during these dates"
                hint="Off keeps it hidden from visitors. The preview still shows it."
                checked={selected.enabled}
                disabled={disabled}
                onChange={(enabled) => patch((o) => ({ ...o, enabled }))}
              />
              <span className="shrink-0">
                <StatusChip status={occasionStatus(selected, now)} />
              </span>
            </div>

            <div className="mt-4">
              <EditorTabs
                value={tab}
                onChange={setTab}
                on={{
                  countdown: selected.countdownTo !== null,
                  stripe: selected.stripe.enabled,
                  effects: selected.navEffect.type !== "none" || selected.hanging !== "none",
                }}
              />
            </div>

            <div
              role="tabpanel"
              id={`occ-panel-${tab}`}
              aria-labelledby={`occ-tab-${tab}`}
              className="space-y-5 pt-5"
            >
              {tab === "when" ? (
                <>
                  <div className="grid gap-4 @md:grid-cols-2">
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
                  <div className="gold-hairline" />
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">
                        Priority {selectedIndex + 1} of {occasions.length}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">When dates overlap, the earlier one shows.</p>
                    </div>
                    <span className="flex gap-1">
                      <button
                        type="button"
                        className="btn-ghost p-2"
                        aria-label={`Move ${selected.name} earlier`}
                        disabled={disabled || selectedIndex === 0}
                        onClick={() => moveOccasion(selectedIndex, -1)}
                      >
                        <ArrowUp className="h-3.5 w-3.5" aria-hidden />
                      </button>
                      <button
                        type="button"
                        className="btn-ghost p-2"
                        aria-label={`Move ${selected.name} later`}
                        disabled={disabled || selectedIndex === occasions.length - 1}
                        onClick={() => moveOccasion(selectedIndex, 1)}
                      >
                        <ArrowDown className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    </span>
                  </div>
                  {canManage ? (
                    <>
                      <div className="gold-hairline" />
                      <div className="flex flex-wrap items-center gap-3">
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
                            <button
                              type="button"
                              className="btn-ghost px-3 py-2 text-sm"
                              onClick={() => setConfirmDelete(false)}
                            >
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
                      </div>
                    </>
                  ) : null}
                </>
              ) : null}

              {tab === "countdown" ? (
                <>
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
                    <>
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
                      <div className="gold-hairline" />
                      <Toggle
                        label="Countdown in the menu bar"
                        hint="Days and hours left of the logo, minutes and seconds right of it, on every page. Gone at the moment itself."
                        checked={selected.heroCountdown}
                        disabled={disabled}
                        onChange={(heroCountdown) => patch((o) => ({ ...o, heroCountdown }))}
                      />
                      {selected.heroCountdown ? (
                        <Field
                          label="Countdown caption"
                          hint={`Says what it counts to. Left empty it reads "Until ${selected.name}".`}
                        >
                          <input
                            className="input w-full"
                            value={selected.countdownLabel}
                            maxLength={OCCASION_LIMITS.label}
                            placeholder={`Until ${selected.name}`}
                            disabled={disabled}
                            onChange={(event) => patch((o) => ({ ...o, countdownLabel: event.target.value }))}
                          />
                        </Field>
                      ) : null}
                    </>
                  ) : null}
                </>
              ) : null}

              {tab === "stripe" ? (
                <>
                  <Toggle
                    label="Show the stripe"
                    hint="A thin band at the very top of the screen, above the menu, on every page except booking and admin."
                    checked={selected.stripe.enabled}
                    disabled={disabled}
                    onChange={(enabled) => patchStripe({ enabled })}
                  />
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
                </>
              ) : null}

              {tab === "messages" ? (
                <>
                  {selected.countdownTo !== null ? (
                    <PillSwitch
                      label="Which messages"
                      value={afterMoment ? "after" : "during"}
                      options={[
                        { value: "during", label: `Until the moment · ${selected.stripe.items.length}` },
                        { value: "after", label: `After it · ${selected.stripe.itemsAfterCountdown.length}` },
                      ]}
                      onChange={(which) => setAfterMoment(which === "after")}
                    />
                  ) : null}
                  {selected.countdownTo !== null && afterMoment ? (
                    <MessagesEditor
                      title="After the countdown"
                      hint="Replaces the other messages once the moment passes, e.g. Happy New Year."
                      items={selected.stripe.itemsAfterCountdown}
                      disabled={disabled}
                      allowEmpty
                      onChange={(itemsAfterCountdown) => patchStripe({ itemsAfterCountdown })}
                    />
                  ) : (
                    <MessagesEditor
                      title="Messages"
                      hint="Up to 8. Each can have its own icon or uploaded image, and a link."
                      items={selected.stripe.items}
                      disabled={disabled}
                      onChange={(items) => patchStripe({ items })}
                    />
                  )}
                  {selected.countdownTo === null ? (
                    <p className="text-xs text-muted">
                      Turn on a countdown to add messages for after the moment, such as Happy New Year.
                    </p>
                  ) : null}
                </>
              ) : null}

              {tab === "effects" ? (
                <>
                  <Segmented
                    label="Effect"
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
                    <div className="space-y-4 rounded-xl p-3.5" style={{ border: "1px solid var(--border)" }}>
                      {selected.navEffect.type !== "petals" ? (
                        <Segmented
                          label="Colours"
                          value={selected.navEffect.palette}
                          disabled={disabled}
                          options={PALETTE_OPTIONS}
                          onChange={(palette) => patchEffect({ palette })}
                        />
                      ) : null}
                      <Field label={`Speed · ${selected.navEffect.speed.toFixed(2).replace(/0$/, "")}×`}>
                        <input
                          type="range"
                          min={0.25}
                          max={2}
                          step={0.05}
                          className="w-full accent-[var(--accent)]"
                          value={selected.navEffect.speed}
                          disabled={disabled}
                          onChange={(event) => patchEffect({ speed: Number(event.target.value) })}
                        />
                      </Field>
                      <Field
                        label={`How many · ${Math.round(selected.navEffect.density * 100)}%`}
                        hint={
                          selected.navEffect.type === "fireworks"
                            ? "How often fireworks go up, and how full each burst is."
                            : "How much is in the air at once."
                        }
                      >
                        <input
                          type="range"
                          min={0.1}
                          max={1}
                          step={0.05}
                          className="w-full accent-[var(--accent)]"
                          value={selected.navEffect.density}
                          disabled={disabled}
                          onChange={(event) => patchEffect({ density: Number(event.target.value) })}
                        />
                      </Field>
                      <Field label={`Brightness · ${Math.round(selected.navEffect.intensity * 100)}%`}>
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
                    label="Hanging decoration"
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
                  <p className="text-xs text-muted">
                    On the homepage, fireworks rise from the top of the hero. Decorations hang from the top of the
                    screen and stay clear of the logo and buttons. Visitors who ask for less motion see no effects.
                  </p>
                </>
              ) : null}
            </div>
          </section>

          {/* preview, pinned while the editor scrolls */}
          <aside
            ref={setPreviewCard}
            className="sticky top-[var(--header-h)] z-20 order-1 min-w-0 xl:order-2 xl:top-[calc(var(--header-h)+1rem)]"
            aria-label="Live preview"
          >
            <div className="card overflow-hidden">
              <LivePreview occasion={templatePreview ?? selected} note={templateNote} />
              <div
                className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                <span className="mr-auto min-w-0 text-xs text-muted" role="status">
                  {saveStatus}
                </span>
                {siteLink}
                {dirty ? (
                  <button
                    type="button"
                    className="btn-ghost px-3 py-2 text-sm"
                    disabled={saving}
                    onClick={() => {
                      setSettings(saved);
                      setSelectedId((id) =>
                        saved.occasions.some((o) => o.id === id) ? id : saved.occasions[0]?.id ?? null,
                      );
                    }}
                  >
                    Discard changes
                  </button>
                ) : null}
                <button
                  type="button"
                  className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm disabled:opacity-60"
                  disabled={!canManage || saving || !dirty}
                  onClick={() => void save()}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <Save className="h-4 w-4" aria-hidden />
                  )}
                  Save changes
                </button>
              </div>
            </div>
          </aside>
        </div>
      ) : templatePreview ? (
        <aside aria-label="Live preview">
          <div className="card overflow-hidden">
            <LivePreview occasion={templatePreview} note={templateNote} />
          </div>
        </aside>
      ) : (
        <section className="card flex flex-wrap items-center gap-3 p-6 text-sm text-muted">
          <span className="mr-auto">Pick an occasion, or add one from a template.</span>
          {dirty ? (
            <button
              type="button"
              className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm disabled:opacity-60"
              disabled={!canManage || saving}
              onClick={() => void save()}
            >
              <Save className="h-4 w-4" aria-hidden />
              Save changes
            </button>
          ) : null}
        </section>
      )}
    </div>
  );
}
