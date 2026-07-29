"use client";

import type { ReactNode } from "react";

export function AdminPhoneDeviceFrame({
  children,
  width = 390,
  height = 844,
  label = "Phone preview",
}: {
  children: ReactNode;
  width?: number;
  height?: number;
  label?: string;
}) {
  return (
    <div
      className="admin-phone-device-frame"
      style={{ width, height }}
      role="img"
      aria-label={label}
    >
      <div className="admin-phone-device-frame__screen">{children}</div>
    </div>
  );
}

