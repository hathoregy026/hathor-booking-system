"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, Loader2, Move, RotateCcw, Save } from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";
import {
  DEFAULT_EMAIL_HERO_FRAME,
  emailHeroCropRect,
  EMAIL_HERO_MAX_ZOOM,
  EMAIL_HERO_MIN_ZOOM,
  EMAIL_HERO_RATIO,
  frameFromCropRect,
  type CropRect,
  type EmailHeroFrame,
} from "@/lib/email-hero-frame";

type Natural = { width: number; height: number };

/** Keep a frame inside the photo: clamp through the crop rectangle. */
function settle(natural: Natural, frame: EmailHeroFrame): EmailHeroFrame {
  const rect = emailHeroCropRect(natural.width, natural.height, frame);
  return frameFromCropRect(natural.width, natural.height, rect, frame.zoom);
}

const same = (a: EmailHeroFrame, b: EmailHeroFrame) =>
  Math.abs(a.x - b.x) < 1e-4 && Math.abs(a.y - b.y) < 1e-4 && Math.abs(a.zoom - b.zoom) < 1e-3;

type EmailHeroFramerProps = {
  sourceUrl: string;
  savedFrame: EmailHeroFrame;
  onSave: (frame: EmailHeroFrame) => Promise<void>;
};

/**
 * The banner frame: the photo inside a 2:1 window the emails use. Drag to
 * position, slide to zoom. The window is drawn with the same crop math the
 * server renders with, so this is exactly what every email shows.
 */
export function EmailHeroFramer({ sourceUrl, savedFrame, onSave }: EmailHeroFramerProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const dragRef = useRef<{ x: number; y: number; rect: CropRect } | null>(null);
  const [natural, setNatural] = useState<Natural | null>(null);
  const [boxWidth, setBoxWidth] = useState(0);
  const [frame, setFrame] = useState<EmailHeroFrame>(savedFrame);
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setFrame(savedFrame), [savedFrame, sourceUrl]);

  /* A cached image can finish loading before hydration attaches onLoad; read
     its size directly so the frame never stays blank. */
  useEffect(() => {
    setNatural(null);
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) {
      setNatural({ width: img.naturalWidth, height: img.naturalHeight });
    }
  }, [sourceUrl]);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const observer = new ResizeObserver(([entry]) => setBoxWidth(entry.contentRect.width));
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  const rect = natural ? emailHeroCropRect(natural.width, natural.height, frame) : null;
  const scale = rect && boxWidth ? boxWidth / rect.width : 0;
  const dirty = !same(frame, savedFrame);

  const moveBy = useCallback(
    (dxSource: number, dySource: number, from: CropRect) => {
      if (!natural) return;
      const moved = { ...from, left: from.left + dxSource, top: from.top + dySource };
      setFrame((current) =>
        settle(natural, frameFromCropRect(natural.width, natural.height, moved, current.zoom)),
      );
    },
    [natural],
  );

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!rect || saving) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { x: event.clientX, y: event.clientY, rect };
    setDragging(true);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || !scale) return;
    /* dragging the photo right shows more of its left side */
    moveBy(-(event.clientX - drag.x) / scale, -(event.clientY - drag.y) / scale, drag.rect);
  };

  const endDrag = () => {
    dragRef.current = null;
    setDragging(false);
  };

  const setZoom = (zoom: number) => {
    if (!natural) return;
    setFrame((current) => settle(natural, { ...current, zoom }));
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!rect || !natural) return;
    const step = rect.width * 0.02;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const move = moves[event.key];
    if (move) {
      event.preventDefault();
      moveBy(move[0], move[1], rect);
    } else if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      setZoom(Math.min(EMAIL_HERO_MAX_ZOOM, frame.zoom + 0.1));
    } else if (event.key === "-") {
      event.preventDefault();
      setZoom(Math.max(EMAIL_HERO_MIN_ZOOM, frame.zoom - 0.1));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave(frame);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="block text-sm font-medium" style={{ color: "var(--text-primary)" }}>
          Banner framing
        </span>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          Exactly what every email shows · 640 × 320
        </span>
      </div>

      <div
        ref={boxRef}
        role="application"
        aria-label="Email banner framing. Drag or use the arrow keys to position the photo; plus and minus zoom."
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
        className="relative w-full select-none overflow-hidden rounded-2xl border outline-none focus-visible:ring-2"
        style={{
          aspectRatio: `${EMAIL_HERO_RATIO} / 1`,
          borderColor: "var(--border)",
          background: "var(--input-bg)",
          cursor: saving ? "progress" : dragging ? "grabbing" : "grab",
          touchAction: "none",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={sourceUrl}
          alt="Email banner original"
          draggable={false}
          onLoad={(event) =>
            setNatural({
              width: event.currentTarget.naturalWidth,
              height: event.currentTarget.naturalHeight,
            })
          }
          style={
            rect && natural && scale
              ? {
                  position: "absolute",
                  left: -rect.left * scale,
                  top: -rect.top * scale,
                  width: natural.width * scale,
                  height: natural.height * scale,
                  maxWidth: "none",
                  pointerEvents: "none",
                }
              : { position: "absolute", opacity: 0, pointerEvents: "none" }
          }
        />
        {!natural ? (
          <div className="absolute inset-0 flex items-center justify-center" style={{ color: "var(--text-muted)" }}>
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          </div>
        ) : null}
        {saving ? (
          <div
            className="absolute inset-0 flex items-center justify-center gap-2 text-sm"
            style={{ background: "rgb(0 0 0 / 35%)", color: "#fff" }}
          >
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Saving banner…
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex min-w-[12rem] flex-1 items-center gap-3 text-sm" style={{ color: "var(--text-secondary)" }}>
          <span>Zoom</span>
          <input
            type="range"
            min={EMAIL_HERO_MIN_ZOOM}
            max={EMAIL_HERO_MAX_ZOOM}
            step={0.01}
            value={frame.zoom}
            disabled={!natural || saving}
            onChange={(event) => setZoom(Number(event.target.value))}
            className="flex-1"
            aria-label="Zoom"
          />
          <span className="w-12 text-right tabular-nums">{Math.round(frame.zoom * 100)}%</span>
        </label>
        <button
          type="button"
          onClick={() => natural && setFrame(settle(natural, DEFAULT_EMAIL_HERO_FRAME))}
          disabled={!natural || saving}
          className="btn-outline inline-flex items-center gap-2 px-3 py-2 text-sm disabled:opacity-60"
        >
          <RotateCcw className="h-4 w-4" aria-hidden />
          Reset
        </button>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={!natural || saving || !dirty}
          className="btn-primary inline-flex items-center gap-2 px-3 py-2 text-sm disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}
          {saving ? "Saving…" : "Save framing"}
        </button>
      </div>

      <p className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
        <Move className="h-3.5 w-3.5 shrink-0" aria-hidden />
        Drag the photo to position it, use the slider to zoom. Saving applies it to every email; the full original is kept so you can re-frame any time.
      </p>

      {error ? (
        <p className="flex items-center gap-1.5 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
          {error}
        </p>
      ) : null}
    </div>
  );
}

type EmailHeroFramerPanelProps = {
  /** changes when a new banner is uploaded, so the framer reloads its original */
  heroImageUrl: string | null;
  onSaved: (heroUrl: string) => void;
};

/** Loads the original and saved frame, and saves through the admin API. */
export function EmailHeroFramerPanel({ heroImageUrl, onSaved }: EmailHeroFramerPanelProps) {
  const [state, setState] = useState<{ sourceUrl: string; frame: EmailHeroFrame } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const response = await adminFetch("/api/admin/email-templates/hero-frame", { cache: "no-store" });
      const data = (await response.json()) as { sourceUrl?: string; frame?: EmailHeroFrame; error?: string };
      if (!response.ok || !data.sourceUrl || !data.frame) throw new Error(data.error ?? "Could not load the banner");
      setState({ sourceUrl: data.sourceUrl, frame: data.frame });
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Could not load the banner");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load, heroImageUrl]);

  if (loadError) {
    return (
      <p className="flex items-center gap-1.5 text-sm text-red-600">
        <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
        {loadError}
      </p>
    );
  }
  if (!state) {
    return (
      <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        Loading banner framing…
      </div>
    );
  }

  return (
    <EmailHeroFramer
      sourceUrl={state.sourceUrl}
      savedFrame={state.frame}
      onSave={async (frame) => {
        const response = await adminFetch("/api/admin/email-templates/hero-frame", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ frame }),
        });
        const data = (await response.json()) as { heroUrl?: string; error?: string };
        if (!response.ok || !data.heroUrl) throw new Error(data.error ?? "Save failed");
        setState((current) => (current ? { ...current, frame } : current));
        onSaved(data.heroUrl);
      }}
    />
  );
}
