/**
 * Reference-safe body scroll lock for a single global overlay owner at a time.
 * Unlocking one owner never clears another owner's lock; repeated unlocks are no-ops.
 */

import { ensurePublicScrollController } from "@/lib/public-scroll-controller";
import { requestScrollRefresh } from "@/lib/scroll-refresh-coordinator";

export type BodyLockOwner = "explore-panel" | "phone-menu" | "booking-modal";

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

let active: LockState | null = null;

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
  const previous = readStyles(style);

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
 */
export function unlockBodyScroll(owner: BodyLockOwner): void {
  if (typeof document === "undefined") return;
  if (!active || active.owner !== owner) return;

  const { style } = document.body;
  const { previous, scrollY, scrollControllerStopped } = active;
  active = null;

  writeStyles(style, previous);
  window.scrollTo(0, scrollY);

  if (scrollControllerStopped) {
    const scrollController = ensurePublicScrollController();
    scrollController.start();
    scrollController.syncToCurrentScroll();
    requestScrollRefresh("menu-close");
  }
}

/** Force-clear whatever lock is held (route change / breakpoint safety). */
export function forceUnlockBodyScroll(): void {
  if (!active) return;
  unlockBodyScroll(active.owner);
}
