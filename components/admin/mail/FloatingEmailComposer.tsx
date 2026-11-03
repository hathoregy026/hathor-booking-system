"use client";
import { useLayoutEffect, useRef, useState } from "react";
import { Maximize2, Minimize2, Minus, ChevronUp } from "lucide-react";
import type { MailboxId, MailboxSummary } from "@/lib/email-mailboxes";
import { EmailComposer, type EmailDraft } from "../EmailComposer";

export function FloatingEmailComposer(props: { initial: EmailDraft; handlerName?: string; onClose: () => void; onSent: (id: string, mailboxId?: MailboxId) => void; mailboxes?: MailboxSummary[] }) {
  const [mode, setMode] = useState<"dock" | "expanded" | "minimized">("dock");
  const dialog = useRef<HTMLDialogElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    previousFocus.current = document.activeElement as HTMLElement | null;
    return () => previousFocus.current?.focus();
  }, []);
  useLayoutEffect(() => {
    const element = dialog.current;
    if (!element) return;
    element.close();
    if (mode === "expanded" || (mode !== "minimized" && window.matchMedia("(max-width: 1023px)").matches)) element.showModal(); else element.show();
    if (mode === "minimized") element.querySelector<HTMLButtonElement>('[aria-label="Restore draft"]')?.focus();
  }, [mode]);
  return <dialog ref={dialog} className="mail-compose-window" data-mode={mode} aria-label="Compose email" onKeyDown={event => { if (event.key === "Escape") { event.preventDefault(); dialog.current?.querySelector<HTMLButtonElement>('[aria-label="Close new email"]')?.click(); } }} onCancel={event => { event.preventDefault(); dialog.current?.querySelector<HTMLButtonElement>('[aria-label="Close new email"]')?.click(); }}>
    <EmailComposer {...props} windowControls={<div className="mail-compose-window__controls"><button type="button" className="email-icon-button" aria-label={mode === "minimized" ? "Restore draft" : "Minimize draft"} onClick={() => setMode(mode === "minimized" ? "dock" : "minimized")}>{mode === "minimized" ? <ChevronUp size={16} /> : <Minus size={16} />}</button><button type="button" className="email-icon-button" aria-label={mode === "expanded" ? "Restore composer size" : "Expand composer"} onClick={() => setMode(mode === "expanded" ? "dock" : "expanded")}>{mode === "expanded" ? <Minimize2 size={16} /> : <Maximize2 size={16} />}</button></div>} />
  </dialog>;
}
