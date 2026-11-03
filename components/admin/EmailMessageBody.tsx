"use client";

import { useState } from "react";
import { splitTechnicalEmailLinks, splitEmailDisplayText } from "@/lib/email-display";

export function EmailMessageBody({ bodyText, formattedUrl, collapseTechnicalLinks = false }: { bodyText: string; formattedUrl?: string; collapseTechnicalLinks?: boolean }) {
  const [formatted, setFormatted] = useState(false);
  const [images, setImages] = useState(false);
  const parts = splitEmailDisplayText(bodyText);
  const hasMessage = parts.some(part => part.kind === "message");
  return (
    <div className="email-message-body space-y-4 text-sm">
      {!parts.length ? <p className="text-muted">No message text.</p> : null}
      {parts.map((part, index) => part.kind === "message" ? (
        <div key={index} className="whitespace-pre-wrap leading-relaxed" style={{ overflowWrap: "anywhere" }}>{collapseTechnicalLinks ? splitTechnicalEmailLinks(part.text).map((piece, key) => piece.kind === "text" ? <span key={key}>{piece.text}</span> : <div className="mail-technical-link" key={key}><a href={piece.text} target="_blank" rel="noopener noreferrer">{piece.label}<span>{piece.hostname} ↗</span></a><details><summary>Show full link</summary><p>{piece.text}</p></details></div>) : part.text}</div>
      ) : (
        <details key={index} open={!hasMessage} className="border-l-2 pl-4" style={{ borderColor: "var(--border)" }}>
          <summary className="flex min-h-11 cursor-pointer items-center text-sm text-muted">{part.history ? "Show previous messages" : "Show quoted text"}</summary>
          <blockquote className="max-h-96 overflow-y-auto whitespace-pre-wrap py-3 text-muted" style={{ overflowWrap: "anywhere" }}>{part.text}</blockquote>
        </details>
      ))}
      <details>
        <summary className="flex min-h-11 cursor-pointer items-center text-xs text-muted">Show original stored text</summary>
        <p className="max-h-96 overflow-y-auto whitespace-pre-wrap py-3 text-xs text-muted" style={{ overflowWrap: "anywhere" }}>{bodyText}</p>
      </details>
      {formattedUrl ? <div className="space-y-3">
        <button type="button" className="btn-outline min-h-11" onClick={() => { setFormatted(current => !current); setImages(false); }}>{formatted ? "Close formatted view" : "View formatted email"}</button>
        {formatted ? <div className="space-y-3">
          <p className="text-xs text-muted">Sender formatting is not proof of identity. Scripts and forms are blocked. Loading images can reveal that you opened this email.</p>
          <button type="button" className="btn-outline min-h-11 text-xs" onClick={() => setImages(current => !current)}>{images ? "Block images again" : "Load images for this email"}</button>
          <iframe key={String(images)} src={`${formattedUrl}?images=${images ? "load" : "blocked"}`} title="Protected formatted email" sandbox="allow-popups allow-popups-to-escape-sandbox" referrerPolicy="no-referrer" className="w-full border" style={{ height: "min(65vh, 600px)", minHeight: 320, borderColor: "var(--border)", background: "#fff" }} />
          <p className="text-xs text-muted">Some styling is removed for security. Older formatted emails depend on Resend availability; your stored text remains accessible above.</p>
        </div> : null}
      </div> : null}
    </div>
  );
}
