/**
 * Single global body-scroll lock for overlays (menu, booking modal, etc.).
 *
 * Permanent anti-freeze rules:
 * 1. Never restore a "previous" style that itself looks like a scroll lock.
 * 2. `ensureDocumentScrollUnlocked()` always strips orphaned body/html lock
 *    styles and restarts the public scroll controller — used on every route.
 * 3. All public overlays must use this module (no ad-hoc body.style locks).
 */

import { ensurePublicScrollController } from "@/lib/public-scroll-controller";
import { requestScrollRefresh } from "@/lib/scroll-refresh-coordinator";

export type BodyLockOwner =
  | "explore-panel"
  | "phone-menu"
  | "booking-modal"
  | "booking-search";

type SavedBodyStyles = {
  overflow: string;
  overflowX: string;
  overflowY: string;
  position: string;
  top: string;
  width: string;
  left: string;
  right: string;
  paddingRight: string;
  touchAction: string;
};

type LockState = {
  owner: BodyLockOwner;
  scrollY: number;
  previous: SavedBodyStyles;
  scrollControllerStopped: boolean;
};

const CLEAN_STYLES: SavedBodyStyles = {
  overflow: "",
  overflowX: "",
  overflowY: "",
  position: "",
  top: "",
  width: "",
  left: "",
  right: "",
  paddingRight: "",
  touchAction: "",
};

const BODY_LOCK_PROPS = [
  "overflow",
  "overflow-x",
  "overflow-y",
  "position",
  "top",
  "width",
  "left",
  "right",
  "padding-right",
  "touch-action",
] as const;

let active: LockState | null = null;

function isLockLikeValue(prop: keyof SavedBodyStyles, value: string): boolean {
  const v = value.trim().toLowerCase();
  if (!v) return false;
  if (prop === "overflow" || prop === "overflowX" || prop === "overflowY") {
    return v === "hidden" || v === "clip";
  }
  if (prop === "position") return v === "fixed";
  if (prop === "top") return v.startsWith("-");
  if (prop === "touchAction") return v === "none";
  if (prop === "width" || prop === "left" || prop === "right") {
    return v === "100%" || v === "0" || v === "0px";
  }
  return false;
}

/** Never persist a prior lock as the restore baseline. */
function sanitizePrevious(styles: SavedBodyStyles): SavedBodyStyles {
  const next = { ...styles };
  (Object.keys(next) as Array<keyof SavedBodyStyles>).forEach((key) => {
    if (isLockLikeValue(key, next[key])) {
      next[key] = "";
    }
  });
  return next;
}

function readStyles(style: CSSStyleDeclaration): SavedBodyStyles {
  return {
    overflow: style.overflow,
    overflowX: style.overflowX,
    overflowY: style.overflowY,
    position: style.position,
    top: style.top,
    width: style.width,
    left: style.left,
    right: style.right,
    paddingRight: style.paddingRight,
    touchAction: style.touchAction,
  };
}

function writeStyles(style: CSSStyleDeclaration, values: SavedBodyStyles) {
  style.overflow = values.overflow;
  style.overflowX = values.overflowX;
  style.overflowY = values.overflowY;
  style.position = values.position;
  style.top = values.top;
  style.width = values.width;
  style.left = values.left;
  style.right = values.right;
  style.paddingRight = values.paddingRight;
  style.touchAction = values.touchAction;
}

function stripInlineScrollLocks(style: CSSStyleDeclaration) {
  for (const prop of BODY_LOCK_PROPS) {
    style.removeProperty(prop);
  }
}

function elementLooksScrollLocked(style: CSSStyleDeclaration): boolean {
  const position = style.position.trim().toLowerCase();
  const overflow = style.overflow.trim().toLowerCase();
  const overflowY = style.overflowY.trim().toLowerCase();
  const touchAction = style.touchAction.trim().toLowerCase();
  return (
    position === "fixed" ||
    overflow === "hidden" ||
    overflow === "clip" ||
    overflowY === "hidden" ||
    overflowY === "clip" ||
    touchAction === "none"
  );
}

function restartScrollController() {
  const scrollController = ensurePublicScrollController();
  scrollController.start();
  scrollController.syncToCurrentScroll();
}

export function getActiveBodyLockOwner(): BodyLockOwner | null {
  return active?.owner ?? null;
}

/**
 * Acquire an exclusive body lock. If another owner holds the lock, this is a no-op
 * (returns false). Re-locking the same owner is idempotent.
 */
export function lockBodyScroll(owner: BodyLockOwner): boolean {
  if (typeof document === "undefined") return false;

  if (active && active.owner !== owner) {
    return false;
  }

  if (active && active.owner === owner) {
    return true;
  }

  const scrollY = window.scrollY || window.pageYOffset || 0;
  const { style } = document.body;
  const previous = sanitizePrevious(readStyles(style));

  const scrollController = ensurePublicScrollController();
  scrollController.stop();

  const scrollbarWidth =
    window.innerWidth - document.documentElement.clientWidth;

  style.overflow = "hidden";
  style.overflowX = "hidden";
  style.overflowY = "hidden";
  style.position = "fixed";
  style.top = `-${scrollY}px`;
  style.width = "100%";
  style.left = "0";
  style.right = "0";
  style.touchAction = "none";
  if (scrollbarWidth > 0) {
    style.paddingRight = `${scrollbarWidth}px`;
  }

  active = {
    owner,
    scrollY,
    previous,
    scrollControllerStopped: true,
  };
  return true;
}

/**
 * Release the lock for `owner` only. Idempotent when that owner is inactive.
 * Always writes a clean baseline (never re-applies a prior lock).
 */
export function unlockBodyScroll(owner: BodyLockOwner): void {
  if (typeof document === "undefined") return;
  if (!active || active.owner !== owner) return;

  const { style } = document.body;
  const { scrollY, scrollControllerStopped } = active;
  active = null;

  writeStyles(style, CLEAN_STYLES);
  stripInlineScrollLocks(style);
  stripInlineScrollLocks(document.documentElement.style);
  window.scrollTo(0, scrollY);

  if (scrollControllerStopped) {
    restartScrollController();
    requestScrollRefresh("menu-close");
  }
}

/** Force-clear whatever lock is held (route change / breakpoint safety). */
export function forceUnlockBodyScroll(): void {
  if (!active) return;
  unlockBodyScroll(active.owner);
}

/**
 * Permanent safety net: clear every orphaned body/html scroll lock and restart
 * Lenis/native scrolling. No-ops while an intentional overlay lock is active
 * unless `force` is true (route changes pass force).
 */
export function ensureDocumentScrollUnlocked(options?: {
  force?: boolean;
  reason?: string;
}): void {
  if (typeof document === "undefined") return;

  const force = options?.force === true;
  if (active && !force) return;

  if (active && force) {
    forceUnlockBodyScroll();
  }

  const bodyStyle = document.body.style;
  const htmlStyle = document.documentElement.style;
  const locked =
    elementLooksScrollLocked(bodyStyle) || elementLooksScrollLocked(htmlStyle);

  let scrollY = window.scrollY || window.pageYOffset || 0;
  const topValue = bodyStyle.top.trim();
  if (topValue.startsWith("-") && topValue.endsWith("px")) {
    scrollY = Math.abs(Number.parseInt(topValue, 10) || 0);
  }

  stripInlineScrollLocks(bodyStyle);
  stripInlineScrollLocks(htmlStyle);

  /* Height locks sometimes accompany overflow locks (admin/welcome paths). */
  if (bodyStyle.height === "100%" || bodyStyle.height === "100vh") {
    bodyStyle.removeProperty("height");
  }
  if (htmlStyle.height === "100%" || htmlStyle.height === "100vh") {
    htmlStyle.removeProperty("height");
  }

  if (locked) {
    window.scrollTo(0, scrollY);
  }

  restartScrollController();
  requestScrollRefresh(options?.reason ?? "document-scroll-unlock");
}

/** @deprecated Prefer ensureDocumentScrollUnlocked — kept for call-site compatibility. */
export function clearOrphanBodyScrollFix(): void {
  ensureDocumentScrollUnlocked({ reason: "orphan-body-unlock" });
}
