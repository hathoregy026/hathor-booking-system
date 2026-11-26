/*
 * Meta (Facebook and Instagram) pixel for hathorcruise.com, dataset
 * "Hathor Cruise website". It lets Meta Ads see which visits turn into booking
 * requests, enquiries and WhatsApp, phone or email taps.
 *
 * The browser never sends a name, email or phone number. Staff pages and any
 * address that carries a guest's booking access token (?token=) never send
 * anything, so the token can never reach Meta. Every call is guarded: tracking
 * must never break a page, a form or a booking.
 */

export const META_PIXEL_ID = "3626073210905305";

type FbqFn = (...args: unknown[]) => void;

function getFbq(): FbqFn | null {
  if (typeof window === "undefined") return null;
  const fbq = (window as Window & { fbq?: FbqFn }).fbq;
  return typeof fbq === "function" ? fbq : null;
}

/** Pages whose address must never be sent to Meta. */
export function isPrivateMetaPage(): boolean {
  try {
    if (window.location.pathname.startsWith("/admin")) return true;
    return new URLSearchParams(window.location.search).has("token");
  } catch {
    return true;
  }
}

export type MetaEventName =
  | "PageView"
  | "Purchase"
  | "Lead"
  | "Contact"
  | "InitiateCheckout"
  | "AddToCart"
  | "AddToWishlist";

type MetaParams = Record<string, string | number>;

/** Fire a Meta standard event if the pixel is on this page. Never throws. */
export function trackMetaEvent(name: MetaEventName, params?: MetaParams, eventId?: string): void {
  if (typeof window === "undefined") return;
  try {
    if (isPrivateMetaPage()) return;
    const fbq = getFbq();
    if (!fbq) return;
    if (eventId) fbq("track", name, params ?? {}, { eventID: eventId });
    else fbq("track", name, params ?? {});
  } catch {
    /* tracking must never break the page */
  }
}

/** A random id shared by the browser and server copies of one event, so Meta counts it once. */
export function newMetaEventId(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  } catch {
    /* fall through */
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

/*
 * Site events (named for GA4) that also mean something to Meta Ads. Booking
 * requests and enquiry forms are sent separately, with an event id the server
 * copy shares, so they are not listed here.
 */
export function forwardEventToMeta(name: string): void {
  switch (name) {
    case "whatsapp_click":
      trackMetaEvent("Contact", { content_name: "whatsapp" });
      return;
    case "phone_click":
      trackMetaEvent("Contact", { content_name: "phone" });
      return;
    case "email_click":
      trackMetaEvent("Contact", { content_name: "email" });
      return;
    case "voyage_request_start":
      trackMetaEvent("InitiateCheckout");
      return;
    case "voyage_add":
      trackMetaEvent("AddToCart", { content_name: "voyage" });
      return;
    case "accommodation_add":
      trackMetaEvent("AddToCart", { content_name: "accommodation" });
      return;
    case "favorite_add":
      trackMetaEvent("AddToWishlist");
      return;
    default:
      return;
  }
}

/*
 * Pixel boot script for the document head. It skips staff pages and token
 * links entirely, and turns off Meta's own page-view-on-navigation so every
 * page view goes through trackMetaEvent (which applies the same rule).
 */
export function getMetaPixelBootScript(): string {
  return `(function(){try{
if(location.pathname.indexOf('/admin')===0)return;
if(new URLSearchParams(location.search).has('token'))return;
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
window.fbq.disablePushState=true;
window.fbq('init','${META_PIXEL_ID}');
}catch(e){}})();`;
}
