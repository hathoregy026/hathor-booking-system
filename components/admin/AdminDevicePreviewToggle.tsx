"use client";

import { Monitor, Smartphone } from "lucide-react";
import type { AdminDevicePreview } from "@/lib/admin-device-preview";

type AdminDevicePreviewToggleProps = {
  value: AdminDevicePreview;
  onChange: (next: AdminDevicePreview) => void;
  desktopDirty?: boolean;
  phoneDirty?: boolean;
  disabled?: boolean;
  className?: string;
};

export function AdminDevicePreviewToggle({
  value,
  onChange,
  desktopDirty = false,
  phoneDirty = false,
  disabled = false,
  className = "",
}: AdminDevicePreviewToggleProps) {
  return (
    <div
      className={`admin-device-toggle ${className}`.trim()}
      role="group"
      aria-label="Edit desktop or phone version"
    >
      <button
        type="button"
        className={`admin-device-toggle__btn${value === "desktop" ? " is-active" : ""}`}
        aria-pressed={value === "desktop"}
        disabled={disabled}
        onClick={() => onChange("desktop")}
      >
        <Monitor className="h-4 w-4" aria-hidden />
        Desktop
        {desktopDirty ? <span className="admin-device-toggle__dot" aria-label="Unsaved" /> : null}
      </button>
      <button
        type="button"
        className={`admin-device-toggle__btn${value === "phone" ? " is-active" : ""}`}
        aria-pressed={value === "phone"}
        disabled={disabled}
        onClick={() => onChange("phone")}
      >
        <Smartphone className="h-4 w-4" aria-hidden />
        Phone
        {phoneDirty ? <span className="admin-device-toggle__dot" aria-label="Unsaved" /> : null}
      </button>
      <p className="admin-device-toggle__hint">
        {value === "phone"
          ? "Editing the phone site — Save updates phones only (≤767px)."
          : "Editing the desktop site — Save updates desktops / tablets."}
      </p>
    </div>
  );
}
