"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { publicTurnstileSiteKey } from "@/lib/turnstile-public";

type TurnstileApi = {
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
  remove: (id: string) => void;
};
declare global { interface Window { turnstile?: TurnstileApi } }

export function InquiryVerification({ type, onToken, resetVersion = 0 }: {
  type: "contact" | "charter"; onToken: (token: string) => void; resetVersion?: number;
}) {
  const container = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const siteKey = publicTurnstileSiteKey();
  useEffect(() => {
    if (!ready || !container.current || !window.turnstile || !siteKey) return;
    const api = window.turnstile;
    const id = api.render(container.current, {
      sitekey: siteKey, action: `${type}_inquiry`, theme: "light", size: "flexible",
      callback: (token: string) => { setFailed(false); onToken(token); },
      "expired-callback": () => onToken(""),
      "error-callback": () => { onToken(""); setFailed(true); },
    });
    return () => { api.remove(id); onToken(""); };
  }, [ready, type, siteKey, onToken, resetVersion]);
  return <div className="inquiry-verification" style={{ minWidth: 0, width: "100%", maxWidth: 400, marginBlock: 16 }}>
    {siteKey ? <Script id="hathor-turnstile" src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive"
      onReady={() => setReady(true)} onError={() => { setFailed(true); onToken(""); }} /> : null}
    <div ref={container} />
    {!siteKey || failed ? <p role="status" className="text-sm">Security verification is unavailable. Refresh this page or contact our reservations team directly.</p> : null}
  </div>;
}
