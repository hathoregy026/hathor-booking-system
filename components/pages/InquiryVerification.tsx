"use client";

import Script from "next/script";
import { useEffect, useId, useRef, useState } from "react";
import { publicTurnstileSiteKey } from "@/lib/turnstile-public";
import type { TurnstileAction } from "@/lib/turnstile-actions";

type TurnstileApi = {
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
  remove: (id: string) => void;
};
declare global { interface Window { turnstile?: TurnstileApi } }

type VerificationProps = ({ type: "contact" | "charter"; action?: never } | { action: TurnstileAction; type?: never }) & {
  onToken: (token: string) => void; resetVersion?: number;
  appearance?: "always" | "interaction-only";
};

export function InquiryVerification({ type, action, onToken, resetVersion = 0, appearance = "always" }: VerificationProps) {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useId();
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const siteKey = publicTurnstileSiteKey();
  const expectedAction = action ?? `${type}_inquiry`;
  useEffect(() => {
    if (!ready || !container.current || !window.turnstile || !siteKey) return;
    const api = window.turnstile;
    let active = true;
    const id = api.render(container.current, {
      sitekey: siteKey, action: expectedAction, theme: "light", appearance,
      size: container.current.clientWidth < 300 ? "compact" : "flexible",
      callback: (token: string) => { if (active) { setFailed(false); onToken(token); } },
      "expired-callback": () => { if (active) onToken(""); },
      "error-callback": () => { if (active) { onToken(""); setFailed(true); } },
    });
    return () => { active = false; api.remove(id); onToken(""); };
  }, [ready, expectedAction, appearance, siteKey, onToken, resetVersion]);
  return <div className="inquiry-verification" style={{ minWidth: 0, width: "100%", maxWidth: 400, marginBlock: 16 }}>
    {siteKey ? <Script id={`hathor-turnstile-${widgetId}`} src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive"
      onLoad={() => setReady(true)} onReady={() => setReady(true)} onError={() => { setFailed(true); onToken(""); }} /> : null}
    <div ref={container} />
    {!siteKey || failed ? <p role="status" className="text-sm">Security verification is unavailable. Refresh this page or contact our reservations team directly.</p> : null}
  </div>;
}
