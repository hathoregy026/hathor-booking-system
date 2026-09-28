"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/react";

/* The booking-status link carries the guest's access token as a query param. */
function withoutAccessToken(event: BeforeSendEvent): BeforeSendEvent {
  try {
    const url = new URL(event.url);
    url.searchParams.delete("token");
    return { ...event, url: url.toString() };
  } catch {
    return event;
  }
}

export function SiteAnalytics() {
  return <Analytics beforeSend={withoutAccessToken} />;
}
