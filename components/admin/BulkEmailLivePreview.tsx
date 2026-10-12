"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Monitor, RefreshCw, Smartphone } from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";
import type { BulkEmailTemplate } from "@/lib/bulk-email-types";

export type BulkPreviewFocus = "message" | "heading" | "eyebrow" | "signature" | "footer" | "branding" | "none";
export function BulkEmailLivePreview({ subject, message, template, focus, onPreview }: {
  subject: string; message: string; template: BulkEmailTemplate | null; focus: BulkPreviewFocus;
  onPreview: (html: string, signature: string) => void;
}) {
  const [result, setResult] = useState<{ html: string; input: string } | null>(null);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [width, setWidth] = useState<"desktop" | "phone">("desktop");
  const frame = useRef<HTMLIFrameElement>(null);
  const position = useRef(0);
  const input = JSON.stringify([subject, message, template]);
  const current = result?.input === input;
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      const [draftSubject, draftMessage, draftTemplate] = JSON.parse(input) as [string, string, BulkEmailTemplate | null];
      try {
        const response = await adminFetch("/api/admin/bulk-emails/preview", {
          method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store", signal: controller.signal,
          body: JSON.stringify({ subject: draftSubject.trim() || "A note from Hathor", message: draftMessage.trim() || "Your message will appear here.", ...(draftTemplate ? { template: draftTemplate } : {}) }),
        });
        const body = await response.json();
        if (!response.ok || typeof body.html !== "string") throw new Error("Preview unavailable");
        if (!controller.signal.aborted) { setResult({ html: body.html, input }); setError(false); onPreview(body.html, input); }
      } catch { if (!controller.signal.aborted) setError(true); }
    }, 450);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [input, onPreview, retry]);

  const scrollToEdit = useCallback(() => {
    const doc = frame.current?.contentDocument;
    if (!doc?.scrollingElement) return;
    const text = focus === "signature" ? template?.signature : focus === "eyebrow" ? template?.eyebrow : focus === "heading" ? subject : message;
    const needle = text?.split(/\r?\n/).map(line => line.trim()).sort((a, b) => b.length - a.length)[0];
    const edited = ["message", "heading", "eyebrow", "signature"].includes(focus) && needle
      ? Array.from(doc.querySelectorAll("p,h1,h2,h3")).find(element => element.textContent?.includes(needle)) : undefined;
    const top = focus === "footer" ? doc.scrollingElement.scrollHeight : focus === "branding" ? 0 : edited
      ? edited.getBoundingClientRect().top + doc.scrollingElement.scrollTop - 24 : position.current;
    doc.scrollingElement.scrollTo({ top });
  }, [focus, message, subject, template?.eyebrow, template?.signature]);
  useEffect(() => { scrollToEdit(); }, [scrollToEdit]);
  function loaded() {
    const doc = frame.current?.contentDocument;
    if (!doc) return;
    // Same-origin access lets the parent show the edited section. Server CSP
    // and the iframe sandbox forbid scripts/forms; links cannot navigate.
    doc.addEventListener("click", event => event.preventDefault());
    doc.addEventListener("scroll", () => { position.current = doc.scrollingElement?.scrollTop || 0; });
    doc.querySelectorAll("a").forEach(link => link.setAttribute("tabindex", "-1"));
    scrollToEdit();
  }
  return <section className="bulk-emails__panel bulk-emails__preview-panel bulk-emails__live-preview" aria-labelledby="bulk-live-preview-title">
    <div className="bulk-emails__panel-heading"><div><p className="bulk-emails__eyebrow">The recipient’s view</p><h2 id="bulk-live-preview-title">Live email preview</h2></div><div className="bulk-emails__preview-tools">
      <button className="btn-outline" type="button" aria-label="Desktop bulk email preview" aria-pressed={width === "desktop"} onClick={() => setWidth("desktop")}><Monitor size={16} /></button>
      <button className="btn-outline" type="button" aria-label="Phone bulk email preview" aria-pressed={width === "phone"} onClick={() => setWidth("phone")}><Smartphone size={16} /></button>
      <button className="btn-outline" type="button" aria-label="Refresh bulk email preview" onClick={() => setRetry(value => value + 1)}><RefreshCw size={16} /></button>
    </div></div>
    <p className="bulk-emails__hint">Updates as you edit. This design belongs to this bulk message only.</p>
    <div className="bulk-emails__live-subject"><span>Email subject</span><p>{subject.trim() || "A note from Hathor"}</p></div>
    <p className="bulk-emails__preview-status" role="status" aria-live="polite">{error ? "Could not update the preview. Check your fields and retry; the previous preview may be out of date." : current ? "Bulk preview up to date" : <><Loader2 size={14} className="animate-spin" /> Updating bulk preview…</>}</p>
    <div className="bulk-emails__preview-canvas" aria-busy={!current && !error}>{result ? <iframe ref={frame} title="Branded bulk email preview" srcDoc={result.html} sandbox="allow-same-origin" referrerPolicy="no-referrer" data-width={width} onLoad={loaded} /> : <div className="bulk-emails__empty"><p>Preparing your email…</p></div>}</div>
  </section>;
}
