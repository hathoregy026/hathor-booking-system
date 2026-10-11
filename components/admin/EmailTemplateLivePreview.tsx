"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Monitor, RefreshCw, Smartphone } from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";
import type { EmailTemplateName } from "@/lib/email-templates";
import type { EmailPreviewDraft } from "./EmailTemplatePreviewModal";

type Preview = { name: EmailTemplateName; subject: string; html: string };
export type EmailPreviewFocus = "none" | "message" | "heading" | "footer" | "branding";

/** Renders the same React Email component as outgoing mail, with unsaved edits. */
export function EmailTemplateLivePreview({ draft, name, label, focus }: {
  draft: EmailPreviewDraft;
  name: EmailTemplateName;
  label: string;
  focus: EmailPreviewFocus;
}) {
  const [result, setResult] = useState<{ preview: Preview; input: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const frame = useRef<HTMLIFrameElement>(null);
  const scrollPosition = useRef(0);
  const copy = draft.templates.find(template => template.name === name);
  const input = JSON.stringify({ name, shared: draft.shared, templates: copy ? [copy] : [], footer: draft.footer });
  const current = result?.input === input;

  useEffect(() => {
    const controller = new AbortController();
    // Wait until typing pauses; cancel both obsolete requests and their results.
    const timer = setTimeout(async () => {
      try {
        const response = await adminFetch("/api/admin/email-templates/preview", {
          method: "POST", headers: { "Content-Type": "application/json" },
          cache: "no-store", body: input, signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok) throw new Error("Could not update the email preview. Please retry.");
        const preview = (data.previews as Preview[] | undefined)?.find(item => item.name === name);
        if (!preview || typeof preview.html !== "string") throw new Error("Could not update the email preview. Please retry.");
        if (!controller.signal.aborted) { setResult({ preview, input }); setError(null); }
      } catch {
        if (!controller.signal.aborted) setError("Could not update the email preview. Please retry.");
      }
    }, 350);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [input, name, retry]);

  const bodyText = copy?.bodyText;
  const headingText = copy?.heroHeading;
  const scrollToEditedPart = useCallback(() => {
    const doc = frame.current?.contentDocument;
    if (!doc?.scrollingElement) return;
    const text = focus === "heading" ? headingText : bodyText;
    const needle = text?.split(/\{\w+\}|\n/).map(part => part.trim()).sort((a, b) => b.length - a.length)[0];
    const editedElement = ["message", "heading"].includes(focus) && needle
      ? Array.from(doc.querySelectorAll("p,h1,h2,h3")).find(element => element.textContent?.includes(needle)) : undefined;
    const top = focus === "footer" ? doc.scrollingElement.scrollHeight : focus === "branding" ? 0 : editedElement
      ? editedElement.getBoundingClientRect().top + doc.scrollingElement.scrollTop - 32 : scrollPosition.current;
    doc.scrollingElement.scrollTo({ top });
  }, [bodyText, headingText, focus]);
  const scrollPreview = () => {
    const doc = frame.current?.contentDocument;
    if (!doc) return;
    // The frame allows same-origin access solely for scrolling; scripts and
    // forms remain blocked. Preview links must never navigate or send anything.
    doc.addEventListener("click", event => event.preventDefault());
    doc.addEventListener("scroll", () => { scrollPosition.current = doc.scrollingElement?.scrollTop ?? 0; });
    doc.querySelectorAll("a").forEach(link => link.setAttribute("tabindex", "-1"));
    scrollToEditedPart();
  };
  useEffect(() => {
    scrollToEditedPart();
  }, [scrollToEditedPart]);

  const html = result?.preview.html.replace(/<head([^>]*)>/i,
    '<head$1><meta http-equiv="Content-Security-Policy" content="script-src \'none\'; form-action \'none\'" />');

  return (
    <aside className="email-editor-preview" aria-labelledby="live-email-preview-title">
      <div className="email-editor-preview-heading">
        <div>
          <span className="email-editor-eyebrow">Live preview</span>
          <h2 id="live-email-preview-title" className="admin-heading">{label}</h2>
        </div>
        <div className="email-editor-preview-tools" aria-label="Preview width">
          <button type="button" className="btn-outline" aria-label="Desktop email preview" aria-pressed={viewport === "desktop"} onClick={() => setViewport("desktop")}><Monitor size={16} /></button>
          <button type="button" className="btn-outline" aria-label="Phone email preview" aria-pressed={viewport === "mobile"} onClick={() => setViewport("mobile")}><Smartphone size={16} /></button>
          <button type="button" className="btn-outline" aria-label="Retry email preview" onClick={() => setRetry(value => value + 1)}><RefreshCw size={16} /></button>
        </div>
      </div>
      <p className="email-editor-preview-note">Your current edits, before saving. Sample guest details.</p>
      <div className="email-editor-preview-subject"><span>Subject</span><p>{current ? result.preview.subject : "Updating your draft…"}</p></div>
      <div className="email-editor-preview-status" role="status" aria-live="polite">
        {error ? <span role="alert">{error} The previous preview may be out of date.</span> : current ? "Preview up to date" : <><Loader2 size={14} className="animate-spin" /> Updating preview…</>}
      </div>
      <div className="email-editor-preview-canvas" aria-busy={!current && !error}>
        {html ? <iframe ref={frame} title="Live email template preview" srcDoc={html} sandbox="allow-same-origin" referrerPolicy="no-referrer" className={`email-editor-preview-frame email-editor-preview-frame--${viewport}`} onLoad={scrollPreview} /> : <p className="email-editor-preview-empty">Rendering your email…</p>}
      </div>
    </aside>
  );
}
