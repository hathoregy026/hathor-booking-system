"use client";

import { useSyncExternalStore } from "react";
import { FloatingActions } from "@/components/public/FloatingActions";

function subscribeNoop() {
  return () => {};
}

/**
 * Hydration-gated floating BOOK NOW / chat.
 * Must render inside a single BookingModalProvider — never wrap its own.
 */
export function SiteFloatingActions() {
  const ready = useSyncExternalStore(subscribeNoop, () => true, () => false);
  if (!ready) return null;
  return <FloatingActions />;
}
