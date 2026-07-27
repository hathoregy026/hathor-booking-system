"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { SocialBrandIcon } from "@/components/public/SocialBrandIcon";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { useWebsiteText } from "@/components/public/WebsiteTextProvider";
import { EX_GALLERY } from "@/lib/ex-page-content";
import type { SiteImageName } from "@/lib/site-image-slots";

type GalleryInstagramFollowProps = {
  title: string;
  indication?: string;
  followEyebrow?: string;
  handleStyle?: CSSProperties;
};

type FloaterKind = "image" | "emoji";

type FloaterTemplate = {
  key: string;
  kind: FloaterKind;
  imageName?: SiteImageName;
  alt?: string;
  glyph?: string;
};

type FloaterState = FloaterTemplate & {
  instanceId: string;
  size: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  rotV: number;
  phase: number;
  scale: number;
  mode: "pop" | "float" | "fade" | "dead";
  popAge: number;
  lifeAge: number;
  opacity: number;
};

type ParticleRender = FloaterTemplate & {
  instanceId: string;
  size: number;
};

const EMOJI_GLYPHS = [
  { glyph: "☺", label: "smile" },
  { glyph: "♥", label: "heart" },
  { glyph: "👍", label: "thumbs" },
  { glyph: "✈", label: "plane" },
  { glyph: "🛥", label: "ship" },
  { glyph: "✨", label: "sparkles" },
] as const;

const POP_COOLDOWN_MS = 380;
const FLOAT_LIFE_SEC = 15;
const FADE_DURATION_SEC = 1.15;
const FLOAT_SPEED_CAP_IMG = 0.78;
const FLOAT_SPEED_CAP_EMO = 0.98;
const POP_DURATION_SEC = 2.35;
/** Center of IG handle within the header band — ratio only, no layout reads */
const ORIGIN_X_RATIO = 0.5;
const ORIGIN_Y_RATIO = 0.58;
const FALLBACK_FIELD_W = 1100;
const FALLBACK_FIELD_H = 380;

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function bounceAxis(
  pos: number,
  vel: number,
  min: number,
  max: number,
): { pos: number; vel: number } {
  if (pos < min) return { pos: min, vel: Math.abs(vel) * 0.62 };
  if (pos > max) return { pos: max, vel: -Math.abs(vel) * 0.62 };
  return { pos, vel };
}

function shuffleInPlace<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = items[i]!;
    items[i] = items[j]!;
    items[j] = tmp;
  }
  return items;
}

function easeOutCubic(t: number) {
  const x = Math.min(1, Math.max(0, t));
  return 1 - Math.pow(1 - x, 3);
}

function randomPopPlan(count: number): Array<{
  angle: number;
  impulse: number;
  stagger: number;
}> {
  const n = Math.max(count, 1);
  const spin = rand(0, Math.PI * 2);
  const angles = Array.from({ length: n }, (_, i) => {
    const base = spin + (i / n) * Math.PI * 2;
    return base + rand(-0.7, 0.7);
  });
  shuffleInPlace(angles);

  const staggers = Array.from({ length: n }, () => rand(0, 0.22));
  shuffleInPlace(staggers);

  return angles.map((angle, i) => ({
    angle,
    impulse: rand(4.2, 7.8),
    stagger: staggers[i] ?? rand(0, 0.18),
  }));
}

function getRatioOrigin(width: number, height: number) {
  return {
    cx: width * ORIGIN_X_RATIO,
    cy: height * ORIGIN_Y_RATIO,
  };
}

function buildTemplates(): FloaterTemplate[] {
  const templates: FloaterTemplate[] = [];

  EX_GALLERY.followPreviews.forEach((preview, index) => {
    templates.push({
      key: `img-${preview.imageName}-${index}`,
      kind: "image",
      imageName: preview.imageName,
      alt: preview.alt,
    });
  });

  EMOJI_GLYPHS.forEach((item, index) => {
    templates.push({
      key: `emo-${item.label}-${index}`,
      kind: "emoji",
      glyph: item.glyph,
    });
  });

  return shuffleInPlace(templates);
}

let instanceSeq = 0;
function nextInstanceId(key: string) {
  instanceSeq += 1;
  return `${key}__${instanceSeq}_${Math.floor(Math.random() * 1e6)}`;
}

function createPoppedFloater(
  template: FloaterTemplate,
  origin: { cx: number; cy: number },
  plan: { angle: number; impulse: number; stagger: number },
): FloaterState {
  const size = template.kind === "image" ? rand(96, 128) : rand(48, 60);
  return {
    ...template,
    instanceId: nextInstanceId(template.key),
    size,
    x: origin.cx - size / 2,
    y: origin.cy - size / 2,
    vx: Math.cos(plan.angle) * plan.impulse,
    vy: Math.sin(plan.angle) * plan.impulse,
    rot: rand(-14, 14),
    rotV: rand(-0.022, 0.022),
    phase: rand(0, Math.PI * 2),
    scale: 0.55,
    mode: "pop",
    popAge: -plan.stagger,
    lifeAge: 0,
    opacity: 0,
  };
}

function spawnGeneration(
  templates: FloaterTemplate[],
  origin: { cx: number; cy: number },
): FloaterState[] {
  const plan = randomPopPlan(templates.length);
  const order = shuffleInPlace(templates.map((_, i) => i));
  return order.map((templateIndex, planIndex) =>
    createPoppedFloater(templates[templateIndex]!, origin, plan[planIndex]!),
  );
}

function reviveAsPop(
  f: FloaterState,
  origin: { cx: number; cy: number },
  plan: { angle: number; impulse: number; stagger: number },
) {
  const size = f.kind === "image" ? rand(96, 128) : rand(48, 60);
  f.size = size;
  f.x = origin.cx - size / 2;
  f.y = origin.cy - size / 2;
  f.vx = Math.cos(plan.angle) * plan.impulse;
  f.vy = Math.sin(plan.angle) * plan.impulse;
  f.rot = rand(-14, 14);
  f.rotV = rand(-0.022, 0.022);
  f.phase = rand(0, Math.PI * 2);
  f.scale = 0.55;
  f.mode = "pop";
  f.popAge = -plan.stagger;
  f.lifeAge = 0;
  f.opacity = 0;
}

/** Schedule work completely outside scroll / IO / Lenis call stacks */
function runOffScrollStack(fn: () => void) {
  queueMicrotask(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(fn);
    });
  });
}

export function GalleryInstagramFollow({
  title,
  indication: indicationProp,
  followEyebrow: followEyebrowProp,
  handleStyle,
}: GalleryInstagramFollowProps) {
  const websiteText = useWebsiteText();
  const indication =
    indicationProp ?? websiteText.home.gallery.indication;
  const followEyebrow =
    followEyebrowProp ?? websiteText.home.gallery.followEyebrow;
  const triggerRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const floatersRef = useRef<FloaterState[]>([]);
  const templatesRef = useRef<FloaterTemplate[]>([]);
  const nodeRefs = useRef<Map<string, HTMLSpanElement>>(new Map());
  const rafRef = useRef(0);
  const timeRef = useRef(0);
  const cooldownRef = useRef(false);
  const loopRunningRef = useRef(false);
  const idleSyncRef = useRef<number | null>(null);
  const poppedRef = useRef(false);
  const fieldSizeRef = useRef({ w: FALLBACK_FIELD_W, h: FALLBACK_FIELD_H });
  const [particles, setParticles] = useState<ParticleRender[]>([]);
  const reducedRef = useRef(false);

  const cacheFieldSize = useCallback(() => {
    const field = fieldRef.current;
    if (!field) return;
    const w = field.clientWidth;
    const h = field.clientHeight;
    if (w > 0 && h > 0) {
      fieldSizeRef.current = { w, h };
    }
  }, []);

  const getOrigin = useCallback(() => {
    const { w, h } = fieldSizeRef.current;
    return getRatioOrigin(w, h);
  }, []);

  const syncParticleList = useCallback((list: FloaterState[]) => {
    setParticles(
      list.map((f) => ({
        instanceId: f.instanceId,
        key: f.key,
        kind: f.kind,
        imageName: f.imageName,
        alt: f.alt,
        glyph: f.glyph,
        size: f.size,
      })),
    );
  }, []);

  const scheduleIdleSync = useCallback(() => {
    if (idleSyncRef.current != null) return;
    const run = () => {
      idleSyncRef.current = null;
      const kept = floatersRef.current.filter((f) => f.mode !== "dead");
      floatersRef.current = kept;
      syncParticleList(kept);
    };
    const ric = (
      window as Window & {
        requestIdleCallback?: (
          cb: () => void,
          opts?: { timeout: number },
        ) => number;
      }
    ).requestIdleCallback;
    if (typeof ric === "function") {
      idleSyncRef.current = ric(run, { timeout: 1200 });
    } else {
      idleSyncRef.current = window.setTimeout(run, 400);
    }
  }, [syncParticleList]);

  const paintFloater = (f: FloaterState) => {
    const el = nodeRefs.current.get(f.instanceId);
    if (!el) return;
    el.style.width = `${f.size}px`;
    el.style.height = `${f.size}px`;
    el.style.transform = `translate3d(${f.x}px, ${f.y}px, 0) rotate(${f.rot}deg) scale(${f.scale})`;
    el.style.opacity = String(f.opacity);
  };

  const ensureLoop = useCallback(() => {
    if (loopRunningRef.current || reducedRef.current) return;
    loopRunningRef.current = true;

    let last = performance.now();
    timeRef.current = 0;
    let needsIdleSync = false;

    const tick = (now: number) => {
      const dtMs = Math.min(32, now - last);
      last = now;
      const dt = dtMs / 16.67;
      timeRef.current += dtMs / 1000;
      const t = timeRef.current;

      const width = fieldSizeRef.current.w;
      const height = fieldSizeRef.current.h;
      const minX = 8;
      const minY = 8;
      let liveCount = 0;

      for (const f of floatersRef.current) {
        if (f.mode === "dead") continue;

        const maxX = Math.max(minX, width - f.size - 8);
        const maxY = Math.max(minY, height - f.size - 8);

        if (f.mode === "fade") {
          f.lifeAge += dtMs / 1000;
          f.opacity = Math.max(0, f.opacity - dtMs / 1000 / FADE_DURATION_SEC);
          f.scale = Math.max(0.7, f.scale - (dtMs / 1000) * 0.12);
          f.x += f.vx * dt * 0.55;
          f.y += f.vy * dt * 0.55;
          f.vx *= Math.pow(0.985, dt);
          f.vy *= Math.pow(0.985, dt);
          f.rot += f.rotV * dt * 8;
          if (f.opacity <= 0.01) {
            f.opacity = 0;
            f.mode = "dead";
            paintFloater(f);
            needsIdleSync = true;
            continue;
          }
          paintFloater(f);
          liveCount += 1;
          continue;
        }

        liveCount += 1;

        if (f.mode === "pop") {
          f.popAge += dtMs / 1000;

          if (f.popAge < 0) {
            f.opacity = 0;
            f.scale = 0.55;
            paintFloater(f);
            continue;
          }

          f.lifeAge += dtMs / 1000;
          const popT = easeOutCubic(Math.min(1, f.popAge / 0.55));
          f.opacity = popT;
          f.scale = 0.55 + popT * 0.45;

          f.vx *= Math.pow(0.982, dt);
          f.vy *= Math.pow(0.982, dt);
          f.x += f.vx * dt * 1.05;
          f.y += f.vy * dt * 1.05;
          f.rot += f.rotV * dt * 14;

          const bx = bounceAxis(f.x, f.vx, minX, maxX);
          const by = bounceAxis(f.y, f.vy, minY, maxY);
          f.x = bx.pos;
          f.vx = bx.vel;
          f.y = by.pos;
          f.vy = by.vel;

          const speed = Math.hypot(f.vx, f.vy);
          if (f.popAge > POP_DURATION_SEC || speed < 0.55) {
            f.mode = "float";
            const cap =
              f.kind === "image" ? FLOAT_SPEED_CAP_IMG : FLOAT_SPEED_CAP_EMO;
            if (speed > cap) {
              f.vx = (f.vx / speed) * cap;
              f.vy = (f.vy / speed) * cap;
            } else if (speed < 0.18) {
              const a = rand(0, Math.PI * 2);
              f.vx = Math.cos(a) * cap * 0.65;
              f.vy = Math.sin(a) * cap * 0.65;
            }
            f.opacity = 1;
            f.scale = 1;
          }

          if (f.lifeAge >= FLOAT_LIFE_SEC) {
            f.mode = "fade";
          }

          paintFloater(f);
          continue;
        }

        f.lifeAge += dtMs / 1000;
        const ax = Math.sin(t * 0.28 + f.phase) * 0.009;
        const ay = Math.cos(t * 0.22 + f.phase * 1.25) * 0.007;
        let vx = f.vx + ax * dt;
        let vy = f.vy + ay * dt;

        const speed = Math.hypot(vx, vy);
        const maxSpeed =
          f.kind === "image" ? FLOAT_SPEED_CAP_IMG : FLOAT_SPEED_CAP_EMO;
        if (speed > maxSpeed) {
          vx = (vx / speed) * maxSpeed;
          vy = (vy / speed) * maxSpeed;
        }

        f.x += vx * dt * 0.98;
        f.y += vy * dt * 0.98;
        f.rot += f.rotV * dt * 12;

        const bx = bounceAxis(f.x, vx, minX, maxX);
        const by = bounceAxis(f.y, vy, minY, maxY);
        f.x = bx.pos;
        f.vx = bx.vel;
        f.y = by.pos;
        f.vy = by.vel;
        f.opacity = 1;
        f.scale = 1;

        if (f.lifeAge >= FLOAT_LIFE_SEC) {
          f.mode = "fade";
        }

        paintFloater(f);
      }

      if (needsIdleSync) {
        needsIdleSync = false;
        scheduleIdleSync();
      }

      if (liveCount === 0) {
        loopRunningRef.current = false;
        scheduleIdleSync();
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [scheduleIdleSync]);

  const playPop = useCallback(() => {
    if (reducedRef.current) return;
    if (cooldownRef.current) return;

    if (!fieldRef.current) return;
    if (!templatesRef.current.length) {
      templatesRef.current = buildTemplates();
    }

    const origin = getOrigin();

    cooldownRef.current = true;
    window.setTimeout(() => {
      cooldownRef.current = false;
    }, POP_COOLDOWN_MS);

    const existing = floatersRef.current;
    const reusable = existing.filter(
      (f) => f.mode === "dead" || (f.opacity <= 0.01 && f.mode === "fade"),
    );
    const onlyWarmOrDead =
      existing.length > 0 &&
      existing.every(
        (f) =>
          f.mode === "dead" ||
          (f.opacity <= 0.01 && (f.mode === "fade" || f.mode === "pop")),
      );

    const kickPhysics = (targets: FloaterState[]) => {
      targets.forEach(paintFloater);
      runOffScrollStack(() => ensureLoop());
    };

    if (onlyWarmOrDead && reusable.length >= templatesRef.current.length) {
      const plan = randomPopPlan(reusable.length);
      const order = shuffleInPlace(reusable.map((_, i) => i));
      order.forEach((idx, planIndex) => {
        reviveAsPop(reusable[idx]!, origin, plan[planIndex]!);
      });
      kickPhysics(reusable);
      return;
    }

    if (onlyWarmOrDead && existing.length > 0) {
      const plan = randomPopPlan(existing.length);
      const order = shuffleInPlace(existing.map((_, i) => i));
      order.forEach((floaterIndex, planIndex) => {
        reviveAsPop(existing[floaterIndex]!, origin, plan[planIndex]!);
      });
      kickPhysics(existing);
      return;
    }

    for (const f of existing) {
      if (f.mode !== "fade" && f.mode !== "dead") f.mode = "fade";
    }

    const next = spawnGeneration(templatesRef.current, origin);
    floatersRef.current = [...existing, ...next];
    syncParticleList(floatersRef.current);

    runOffScrollStack(() => {
      next.forEach(paintFloater);
      ensureLoop();
    });
  }, [ensureLoop, getOrigin, syncParticleList]);

  useEffect(() => {
    reducedRef.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!reducedRef.current && !templatesRef.current.length) {
      templatesRef.current = buildTemplates();
      cacheFieldSize();
      const origin = getOrigin();
      const warm = templatesRef.current.map((template) => {
        const size = template.kind === "image" ? 112 : 54;
        return {
          ...template,
          instanceId: nextInstanceId(`warm-${template.key}`),
          size,
          x: origin.cx - size / 2,
          y: origin.cy - size / 2,
          vx: 0,
          vy: 0,
          rot: 0,
          rotV: 0,
          phase: 0,
          scale: 0.55,
          mode: "dead" as const,
          popAge: 0,
          lifeAge: FLOAT_LIFE_SEC,
          opacity: 0,
        };
      });
      floatersRef.current = warm;
      syncParticleList(warm);
    }

    const onResize = () => cacheFieldSize();
    window.addEventListener("resize", onResize, { passive: true });
    const t1 = window.setTimeout(cacheFieldSize, 300);
    const t2 = window.setTimeout(cacheFieldSize, 1500);

    return () => {
      window.removeEventListener("resize", onResize);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [cacheFieldSize, getOrigin, syncParticleList]);

  useEffect(() => {
    const trigger = triggerRef.current;
    if (!trigger || reducedRef.current) return;

    /*
     * Pop trigger is 100% decoupled from Lenis / GSAP / window scroll.
     * Browser IntersectionObserver only — no layout reads in the callback.
     */
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || poppedRef.current) return;
        poppedRef.current = true;
        observer.disconnect();
        runOffScrollStack(playPop);
      },
      {
        root: null,
        threshold: 0.22,
        rootMargin: "0px",
      },
    );

    observer.observe(trigger);

    return () => observer.disconnect();
  }, [playPop]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (idleSyncRef.current != null) {
        const cic = (
          window as Window & {
            cancelIdleCallback?: (id: number) => void;
          }
        ).cancelIdleCallback;
        if (typeof cic === "function") cic(idleSyncRef.current);
        else window.clearTimeout(idleSyncRef.current);
        idleSyncRef.current = null;
      }
      loopRunningRef.current = false;
    };
  }, []);

  return (
    <div className="gallery-hero-band" ref={triggerRef}>
      <div className="gallery-header">
        <div className="gallery-h2">
          <h2>{title}</h2>
          <div
            className="instagram-follow"
            aria-label="Follow Hathor on Instagram"
            onMouseEnter={playPop}
            onFocusCapture={playPop}
          >
            <p className="instagram-follow__eyebrow instagram-follow__copy">
              {followEyebrow}
            </p>

            <a
              className="gallery-ig-link typo-page-subtitle instagram-follow__copy"
              href={EX_GALLERY.indicationHref}
              target="_blank"
              rel="noopener noreferrer"
              style={handleStyle}
              aria-label="Hathor Cruise on Instagram"
            >
              <SocialBrandIcon
                platform="instagram"
                className="gallery-ig-link__icon"
              />
              <span className="gallery-ig-link__handle">{indication}</span>
            </a>

            <div
              className="instagram-follow__divider instagram-follow__copy"
              aria-hidden="true"
            >
              <span className="instagram-follow__divider-line" />
              <span className="instagram-follow__divider-mark">✦</span>
              <span className="instagram-follow__divider-line" />
            </div>
          </div>
        </div>
      </div>

      <div
        ref={fieldRef}
        className="instagram-burst-field is-ready"
        aria-hidden="true"
      >
        {particles.map((floater) => (
          <span
            key={floater.instanceId}
            ref={(el) => {
              if (el) nodeRefs.current.set(floater.instanceId, el);
              else nodeRefs.current.delete(floater.instanceId);
            }}
            className={
              floater.kind === "image"
                ? "instagram-burst-particle instagram-burst-particle--image"
                : "instagram-burst-particle instagram-burst-particle--emoji"
            }
            style={{
              width: floater.size,
              height: floater.size,
              opacity: 0,
            }}
          >
            {floater.kind === "image" && floater.imageName ? (
              <span className="instagram-circle instagram-circle--burst">
                <ManagedImage
                  name={floater.imageName}
                  alt=""
                  fill
                  sizes="128px"
                  className="object-cover"
                  previewAnchor={false}
                />
              </span>
            ) : (
              <span className="instagram-float-emoji__inner">
                {floater.glyph}
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
