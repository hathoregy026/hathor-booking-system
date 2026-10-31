"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Eye, FileUp, Mail, Pencil, Plus, RefreshCw, Send, Trash2, Users, X } from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";
import { BULK_RECIPIENT_LIMIT, BULK_UPLOAD_LIMIT, type BulkCampaignView, type BulkEmailTemplate, type BulkSettings, type RecipientImport } from "@/lib/bulk-email-types";
import { bulkBannerPreviewSrc } from "@/lib/bulk-email-images";
import { combineBulkRecipientSources, type BulkRecipientSource } from "@/lib/bulk-email-recipient-sources";
import { BulkEmailLivePreview, type BulkPreviewFocus } from "./BulkEmailLivePreview";
import { BULK_JOURNAL_MESSAGE } from "@/lib/bulk-email-journal";
import { bulkDraftIssues, type BulkFieldIssue } from "@/lib/bulk-email-validation";
import { BulkFieldMessage, BulkGrowingTextarea, BulkJournalEditor, bulkInvalidProps, type BulkFieldIssues, type BulkJournalImageSlot } from "./BulkJournalEditor";

const STATUS: Record<BulkCampaignView["status"], string> = { queued: "Ready to send", sending: "Sending", accepted: "Accepted by Resend", simulated: "Preview completed", failed: "Needs attention", uncertain: "Result not confirmed", cancelled: "Cancelled" };
const date = (value: string) => new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
const canRecover = (campaign: BulkCampaignView) => ["queued", "failed", "uncertain", "sending"].includes(campaign.status);
const canDelete = (campaign: BulkCampaignView) => !["sending", "uncertain"].includes(campaign.status);

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await adminFetch(url, init, 45000);
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || "Unable to complete this action.");
  return body as T;
}
const jsonRequest = (body: unknown): RequestInit => ({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
type BulkBlocker = BulkFieldIssue & { stage: number };
type BulkOverview = { settings: BulkSettings; campaigns: BulkCampaignView[]; template: BulkEmailTemplate; standardBannerUrl?: string };

export function BulkEmails() {
  const [settings, setSettings] = useState<BulkSettings | null>(null);
  const [campaigns, setCampaigns] = useState<BulkCampaignView[]>([]);
  const [sources, setSources] = useState<BulkRecipientSource[]>([]);
  const [removed, setRemoved] = useState<string[]>([]);
  const { emails, invalid: excluded, duplicates, warnings } = combineBulkRecipientSources(sources, removed);
  const [paste, setPaste] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [template, setTemplate] = useState<BulkEmailTemplate | null>(null);
  const [templateDefaults, setTemplateDefaults] = useState<BulkEmailTemplate | null>(null);
  const [standardBannerUrl, setStandardBannerUrl] = useState("");
  const [previewFocus, setPreviewFocus] = useState<BulkPreviewFocus>("none");
  const [stage, setStage] = useState(0);
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewSignature, setPreviewSignature] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [warned, setWarned] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<BulkCampaignView | null>(null);
  const [search, setSearch] = useState("");
  const [dragging, setDragging] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [modalHtml, setModalHtml] = useState("");
  const [samplePreview, setSamplePreview] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<"all" | "send" | "preview">("all");
  const [deleteTarget, setDeleteTarget] = useState<BulkCampaignView | null>(null);
  const previewDialog = useRef<HTMLDialogElement>(null);
  const deleteDialog = useRef<HTMLDialogElement>(null);
  const sending = useRef(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const warningRef = useRef<HTMLDivElement>(null);
  const importBusy = useRef(false);
  const acceptLivePreview = useCallback((html: string, signature: string) => { setPreviewHtml(html); setPreviewSignature(signature); }, []);

  const previewIsCurrent = previewSignature === JSON.stringify([subject, message, template]);
  const recipientBlockers: BulkBlocker[] = !emails.length
    ? [{ id: "bulk-paste", label: "Recipients", stage: 0, message: paste.trim() ? "Select Add to include the addresses you pasted." : "Upload a list or add at least one email address." }]
    : emails.length > BULK_RECIPIENT_LIMIT ? [{ id: "bulk-search", label: "Recipients", stage: 0, message: `Remove ${emails.length - BULK_RECIPIENT_LIMIT} of ${emails.length} addresses. One email can go to no more than ${BULK_RECIPIENT_LIMIT} recipients.` }] : [];
  const messageBlockers: BulkBlocker[] = bulkDraftIssues(subject, message, template).map(issue => ({ ...issue, stage: 1 }));
  const reviewBlockers: BulkBlocker[] = [
    ...(confirmed ? [] : [{ id: "bulk-confirm", label: "Permission", stage: 2, message: "Tick the box to confirm you reviewed this list and may email these recipients." }]),
    ...(previewIsCurrent || messageBlockers.length ? [] : [{ id: "bulk-subject", label: "Email preview", stage: 1, message: "This email changed after its preview. Select Review email to refresh it." }]),
  ];
  const blockers = [...recipientBlockers, ...(stage > 0 ? messageBlockers : []), ...(stage > 1 ? reviewBlockers : [])];
  const fieldIssues: BulkFieldIssues = warned ? Object.fromEntries(blockers.map(blocker => [blocker.id, blocker.message])) : {};
  function goToStage(next: number) { setStage(next); setWarned(false); }
  function showBlockers() { setWarned(true); requestAnimationFrame(() => warningRef.current?.focus()); }
  function goToField(blocker: BulkBlocker) {
    setStage(blocker.stage);
    requestAnimationFrame(() => {
      const field = document.getElementById(blocker.id);
      if (!field) return;
      const section = field.closest("details"); if (section) section.open = true;
      field.scrollIntoView({ block: "center" }); field.focus({ preventScroll: true });
    });
  }
  function continueFlow() {
    if (stage === 0) { if (blockers.length) showBlockers(); else goToStage(1); return; }
    if (messageBlockers.length || emails.length > BULK_RECIPIENT_LIMIT) { showBlockers(); return; }
    if (!emails.length) { setStage(0); setWarned(true); return; }
    if (previewIsCurrent) goToStage(2); else void preview(2);
  }

  async function load() {
    const result = await request<BulkOverview>("/api/admin/bulk-emails");
    if (!template && result.template.journal) setMessage(BULK_JOURNAL_MESSAGE);
    setSettings(result.settings); setCampaigns(result.campaigns); setTemplateDefaults(result.template); setStandardBannerUrl(result.standardBannerUrl || ""); setTemplate(current => current || result.template); setLoaded(true);
  }
  useEffect(() => {
    let active = true;
    void request<BulkOverview>("/api/admin/bulk-emails").then(result => {
      if (active) { setSettings(result.settings); setCampaigns(result.campaigns); setTemplateDefaults(result.template); setStandardBannerUrl(result.standardBannerUrl || ""); setTemplate(result.template); setMessage(result.template.journal ? BULK_JOURNAL_MESSAGE : ""); setLoaded(true); }
    }).catch(err => { if (active) { setError(err.message); setLoaded(true); } });
    return () => { active = false; };
  }, []);
  useEffect(() => { if (error) errorRef.current?.focus(); }, [error]);
  useEffect(() => {
    if (!selected || selected.status !== "sending" || busy) return;
    const timer = setTimeout(() => {
      void request<{ campaign: BulkCampaignView }>(`/api/admin/bulk-emails/${selected.id}`).then(result => setSelected(result.campaign)).catch(err => setError(err.message));
    }, 2500);
    return () => clearTimeout(timer);
  }, [selected, busy]);

  function mergeImport(result: RecipientImport, kind: BulkRecipientSource["kind"], name: string) {
    setSources(current => [...current, { ...result, id: crypto.randomUUID(), kind, name }]);
    setRemoved(current => current.filter(email => !result.emails.includes(email)));
    setConfirmed(false); setDraftId(null);
  }
  function clearRecipients() {
    setSources([]); setRemoved([]); setSearch(""); setConfirmed(false); setDraftId(null);
  }
  async function importFile(file: File) {
    if (importBusy.current || busy) return;
    if (file.size > BULK_UPLOAD_LIMIT) { setError("Choose a file smaller than 2 MB."); return; }
    importBusy.current = true; setBusy("Reading your file…"); setError(null);
    try { const form = new FormData(); form.set("file", file); mergeImport(await request<RecipientImport>("/api/admin/bulk-emails/import", { method: "POST", body: form }), "file", file.name); }
    catch (err) { setError((err as Error).message); }
    finally { setBusy(null); importBusy.current = false; if (fileInput.current) fileInput.current.value = ""; }
  }
  async function importPaste() {
    const text = paste;
    if (importBusy.current || busy || !text.trim()) return;
    importBusy.current = true;
    setBusy("Checking addresses…"); setError(null);
    try { const result = await request<RecipientImport>("/api/admin/bulk-emails/import", jsonRequest({ text })); mergeImport(result, "manual", "Pasted addresses"); setPaste(""); }
    catch (err) { setError((err as Error).message); } finally { setBusy(null); importBusy.current = false; }
  }
  async function preview(nextStage = stage) {
    if (busy || !subject.trim() || !message.trim()) return;
    setBusy("Preparing your branded email…"); setError(null);
    try { const result = await request<{ html: string }>("/api/admin/bulk-emails/preview", jsonRequest({ subject, message, ...(template ? { template } : {}) })); setPreviewHtml(result.html); setPreviewSignature(JSON.stringify([subject, message, template])); goToStage(nextStage); }
    catch (err) { setError((err as Error).message); } finally { setBusy(null); }
  }
  async function openTemplatePreview() {
    if (busy) return;
    setBusy("Opening email template…"); setError(null);
    try {
      const sample = !selected && (!subject.trim() || !message.trim());
      const result = selected
        ? await request<{ html: string }>(`/api/admin/bulk-emails/${selected.id}/preview`, { method: "POST" })
        : await request<{ html: string }>("/api/admin/bulk-emails/preview", jsonRequest({ subject: subject.trim() || "A note from Hathor", message: message.trim() || "Dear guest,\n\nYour message will appear here, with the Hathor logo, banner and footer.\n\nWarm regards,\nThe Hathor team", ...(template ? { template } : {}) }));
      setModalHtml(result.html); setSamplePreview(sample); previewDialog.current?.showModal();
    } catch (err) { setError((err as Error).message); } finally { setBusy(null); }
  }
  function showCampaign(campaign: BulkCampaignView) {
    setSelected(campaign); setError(null);
  }
  function updateCampaign(campaign: BulkCampaignView) {
    setSelected(campaign); setCampaigns(current => [campaign, ...current.filter(row => row.id !== campaign.id)]);
  }
  async function processCampaign(campaign: BulkCampaignView) {
    updateCampaign({ ...campaign, status: "sending" });
    const result = await request<{ campaign: BulkCampaignView }>(`/api/admin/bulk-emails/${campaign.id}`, jsonRequest({ action: "send" }));
    updateCampaign(result.campaign);
  }
  async function send() {
    if (sending.current || busy || !settings) return;
    if (blockers.length) { showBlockers(); return; }
    sending.current = true; setBusy(settings.mode === "preview" ? "Running preview…" : "Sending your email…"); setError(null);
    const id = draftId || crypto.randomUUID(); setDraftId(id);
    try {
      const result = await request<{ campaign: BulkCampaignView }>("/api/admin/bulk-emails", jsonRequest({ id, subject, message, emails, confirmed: true, ...(template ? { template } : {}) }));
      updateCampaign(result.campaign); await processCampaign(result.campaign);
    } catch (err) {
      setError((err as Error).message);
      // Creation might have succeeded before the browser lost its response. Keep the same UUID.
      try { const result = await request<{ campaign: BulkCampaignView }>(`/api/admin/bulk-emails/${id}`); updateCampaign(result.campaign); } catch { /* same UUID is retained for safe retry */ }
    } finally { setBusy(null); sending.current = false; }
  }
  async function recover(campaign: BulkCampaignView) {
    if (sending.current || busy) return;
    sending.current = true; setBusy("Recovering this batch…"); setError(null);
    try { await processCampaign(campaign); } catch (err) { setError((err as Error).message); } finally { sending.current = false; setBusy(null); }
  }
  async function cancel(campaign: BulkCampaignView) {
    setBusy("Cancelling…"); setError(null);
    try { updateCampaign((await request<{ campaign: BulkCampaignView }>(`/api/admin/bulk-emails/${campaign.id}`, jsonRequest({ action: "cancel" }))).campaign); }
    catch (err) { setError((err as Error).message); } finally { setBusy(null); }
  }
  function confirmDelete(campaign: BulkCampaignView) {
    setDeleteTarget(campaign); deleteDialog.current?.showModal();
  }
  async function deleteHistory() {
    if (!deleteTarget || busy) return;
    setBusy("Deleting email history…"); setError(null);
    try {
      await request(`/api/admin/bulk-emails/${deleteTarget.id}`, { method: "DELETE" });
      setCampaigns(current => current.filter(row => row.id !== deleteTarget.id));
      if (selected?.id === deleteTarget.id) newEmail();
      deleteDialog.current?.close(); setDeleteTarget(null);
      await load();
    } catch (err) { setError((err as Error).message); deleteDialog.current?.close(); }
    finally { setBusy(null); }
  }
  function newEmail() {
    setSelected(null); clearRecipients(); setPaste(""); setSubject(""); setMessage(templateDefaults?.journal ? BULK_JOURNAL_MESSAGE : ""); setTemplate(templateDefaults); setPreviewHtml(""); setPreviewSignature(""); goToStage(0); setError(null);
  }
  function editEmail() {
    previewDialog.current?.close();
    if (selected) {
      setSubject(selected.subject); setMessage(selected.message);
      setTemplate(selected.template || templateDefaults);
      setSources([{ id: crypto.randomUUID(), kind: "manual", name: "Copied campaign recipients", emails: selected.recipients.map(row => row.email), duplicates: 0, invalid: [], warnings: [] }]);
      setRemoved([]); setSelected(null); setPreviewHtml(""); setPreviewSignature(""); setDraftId(null);
    }
    setConfirmed(false); setError(null); goToStage(1);
  }
  function changeTemplate(changes: Partial<BulkEmailTemplate>) {
    setTemplate(current => current ? { ...current, ...changes } : current); setConfirmed(false); setDraftId(null);
  }
  async function uploadBanner(file: File, slot: BulkJournalImageSlot = "hero") {
    if (busy || !template) return;
    if (file.size > BULK_UPLOAD_LIMIT) { setError("Choose an image smaller than 2 MB."); return; }
    setBusy("Uploading this email’s image…"); setError(null); setPreviewFocus(slot === "hero" ? "hero" : slot === "introImage" ? "intro" : "gallery");
    try {
      const form = new FormData(); form.set("file", file);
      const result = await request<{ url: string }>("/api/admin/bulk-emails/images", { method: "POST", body: form });
      if (slot === "hero") changeTemplate({ heroImageUrl: result.url, showBanner: true });
      else if (template.journal) changeTemplate({ journal: { ...template.journal, [slot]: { ...template.journal[slot], url: result.url, show: true } } });
    } catch (err) { setError((err as Error).message); } finally { setBusy(null); }
  }
  function sampleFile() {
    const blob = new Blob(["Name,Email\r\nExample Guest,guest@example.com\r\nExample Partner,partner@example.com\r\n"], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = "hathor-recipient-template.csv"; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const visibleEmails = emails.filter(email => email.includes(search.toLowerCase()));
  const complete = selected?.recipients.filter(row => row.status === "accepted" || row.status === "simulated").length || 0;
  const skipped = selected?.recipients.filter(row => row.status === "skipped").length || 0;
  const visibleCampaigns = campaigns.filter(campaign => historyFilter === "all" || campaign.mode === historyFilter);

  const blockerList = warned && blockers.length > 0 && <div className="bulk-emails__blockers" role="alert" tabIndex={-1} ref={warningRef}>
    <strong>{blockers.length === 1 ? "One thing is needed before you can continue." : `${blockers.length} things are needed before you can continue.`}</strong>
    <ul>{blockers.map(blocker => <li key={`${blocker.id}-${blocker.label}`}><button type="button" onClick={() => goToField(blocker)}><b>{blocker.label}</b><span>{blocker.message}</span></button></li>)}</ul>
  </div>;

  return <div className="bulk-emails">
    <header className="bulk-emails__heading">
      <div><p className="bulk-emails__eyebrow">Hathor correspondence</p><h1>Bulk emails</h1><p>One thoughtful message. A personal copy for every recipient.</p></div>
      <div className="bulk-emails__heading-actions"><button className="btn-outline" disabled={!!busy || !settings} onClick={editEmail}><Pencil size={16} />{selected ? "Use as new email" : "Edit email"}</button><button className="btn-outline" disabled={!!busy || !settings} onClick={() => void openTemplatePreview()}><Eye size={16} />Preview email template</button>{selected && <button className="btn-gold" onClick={newEmail} disabled={!!busy}><Plus size={16} />New email</button>}</div>
    </header>
    <div className="bulk-emails__notice" role="status"><Mail size={20} /><p>{settings?.mode === "send" ? "Delivery enabled · Each recipient receives a separate email. Their address is never shared with the other recipients." : "Preview mode · Upload lists and try the complete flow. No real emails will be sent."}</p></div>
    {error && <div className="bulk-emails__error" role="alert" tabIndex={-1} ref={errorRef}>{error}<button aria-label="Dismiss error" onClick={() => setError(null)}><X size={18} /></button></div>}
    {!loaded ? <p role="status">Opening Bulk emails…</p> : !settings ? <button className="btn-outline" onClick={() => { void load().catch(err => setError(err.message)); }}>Try again</button> : <>
      {!selected ? <>
        <nav className="bulk-emails__steps" aria-label="Email preparation">
          {["Recipients", "Message", "Review and send"].map((label, index) => <button key={label} aria-current={stage === index ? "step" : undefined} disabled={!!busy || index > stage} onClick={() => { goToStage(index); setError(null); }}><span>{index < stage ? <Check size={16} /> : `0${index + 1}`}</span>{label}</button>)}
        </nav>
        {stage === 0 && <div className="bulk-emails__workspace">
          <section className="bulk-emails__panel">
            <p className="bulk-emails__eyebrow">01 / Your guest list</p><h2>Bring your addresses.</h2><p className="bulk-emails__muted">Upload a file, enter addresses manually, or combine both. Duplicate addresses receive only one copy.</p>
            <label className="bulk-emails__drop" data-dragging={dragging} onDragOver={event => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={event => { event.preventDefault(); setDragging(false); const file = event.dataTransfer.files[0]; if (event.dataTransfer.files.length > 1) setError("Upload one file at a time."); else if (file) void importFile(file); }}>
              <FileUp size={30} /><strong>{busy || "Choose a file or drop it here"}</strong><span>Excel .xlsx · PDF · CSV / Up to 2 MB</span>
              <input aria-label="Upload recipient list" ref={fileInput} type="file" accept=".xlsx,.pdf,.csv" disabled={!!busy} onChange={event => { const file = event.target.files?.[0]; if (file) void importFile(file); }} />
            </label>
            {sources.some(source => source.kind === "file") && <ul className="bulk-emails__files" aria-label="Uploaded recipient files">{sources.filter(source => source.kind === "file").map(source => <li key={source.id}><FileUp size={18} /><div><strong>{source.name}</strong><span>{source.emails.length} valid addresses</span></div><button aria-label={`Remove file ${source.name}`} disabled={!!busy} onClick={() => { setSources(current => current.filter(row => row.id !== source.id)); setConfirmed(false); setDraftId(null); }}><X size={18} /></button></li>)}</ul>}
            <p className="bulk-emails__hint">PDFs must contain selectable text. For scanned lists, use Excel or CSV. Older Excel .xls files should be saved as .xlsx.</p>
            <button className="bulk-emails__text-button" onClick={sampleFile}>Download an example list for Excel</button>
            <form onSubmit={event => { event.preventDefault(); void importPaste(); }}>
              <label className="bulk-emails__label" htmlFor="bulk-paste">Paste email addresses</label>
              <textarea id="bulk-paste" className="input" rows={4} maxLength={20000} value={paste} onChange={event => setPaste(event.target.value)} disabled={!!busy} placeholder={"guest@example.com\npartner@example.com"} aria-invalid={Boolean(fieldIssues["bulk-paste"])} aria-describedby={fieldIssues["bulk-paste"] ? "bulk-paste-issue bulk-paste-hint" : "bulk-paste-hint"} />
              <BulkFieldMessage issues={fieldIssues} id="bulk-paste" />
              <p id="bulk-paste-hint" className="bulk-emails__hint">Add one or more addresses, separated by commas, spaces or new lines.</p>
              <button type="submit" className="btn-outline" disabled={!!busy || !paste.trim()}><Plus size={16} />Add</button>
            </form>
          </section>
          <section className="bulk-emails__panel">
            <div className="bulk-emails__panel-heading"><div><p className="bulk-emails__eyebrow">Ready for review</p><h2>{emails.length} recipients</h2></div><Users size={24} /></div>
            <p className="bulk-emails__muted">{duplicates} duplicates removed · {excluded.length} invalid addresses excluded</p>
            {warnings.map(warning => <p className="bulk-emails__warning" key={warning}>{warning}</p>)}
            {emails.length > BULK_RECIPIENT_LIMIT && <p className="bulk-emails__warning">Select no more than 100 recipients for this email. Remove extra addresses below.</p>}
            {emails.length ? <>
              <label className="bulk-emails__label" htmlFor="bulk-search">Find an address</label><input id="bulk-search" className="input" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search recipients" />
              <ul className="bulk-emails__recipients">{visibleEmails.map(email => <li key={email}><span>{email}</span><button aria-label={`Remove ${email}`} disabled={!!busy} onClick={() => { setRemoved(current => [...current, email]); setConfirmed(false); setDraftId(null); }}><X size={16} /></button></li>)}</ul>
              <button className="bulk-emails__text-button" disabled={!!busy} onClick={clearRecipients}><Trash2 size={14} />Clear list</button>
            </> : <div className="bulk-emails__empty"><Users size={32} /><p>Your recipient list will appear here.</p><span>We check the address format. Delivery still depends on whether the mailbox exists.</span></div>}
            {excluded.length > 0 && <details className="bulk-emails__details"><summary>View excluded addresses ({excluded.length})</summary><ul>{excluded.map(value => <li key={value}>{value}</li>)}</ul></details>}
          </section>
        </div>}
        {stage === 1 && <div className="bulk-emails__workspace bulk-emails__compose">
          <section className="bulk-emails__panel" onFocusCapture={event => {
            const target = event.target as HTMLElement;
            const section = target.closest<HTMLElement>("[data-bulk-focus]")?.dataset.bulkFocus;
            setPreviewFocus(target.id === "bulk-signature" ? "signature" : section ? section as BulkPreviewFocus : target.id === "bulk-message" ? "message" : target.id.startsWith("bulk-footer-") ? "footer" : target.id === "bulk-eyebrow" ? "eyebrow" : target.id === "bulk-subject" ? (template?.journal ? "none" : "heading") : "branding");
          }}>
            <p className="bulk-emails__eyebrow">02 / Your message</p><h2>Write from Hathor.</h2>
            <div className="bulk-emails__sender"><span>From</span><strong>{settings.from}</strong>{settings.replyTo && <><span>Replies to</span><strong>{settings.replyTo}</strong></>}</div>
            <p className="bulk-emails__hint">{template?.journal ? "Only the email subject and introduction message are required." : "Only the email subject and message are required."} Other fields can stay empty, and their lines are hidden from the email.</p>
            <label className="bulk-emails__label bulk-emails__label--required" htmlFor="bulk-subject">Email subject</label><input id="bulk-subject" className="input" maxLength={180} required value={subject} {...bulkInvalidProps(fieldIssues, "bulk-subject")} onChange={event => { setSubject(event.target.value); setConfirmed(false); setDraftId(null); }} disabled={!!busy} placeholder="A note from Hathor" /><BulkFieldMessage issues={fieldIssues} id="bulk-subject" />
            {!template?.journal && <><label className="bulk-emails__label bulk-emails__label--required" htmlFor="bulk-message">Message</label><BulkGrowingTextarea id="bulk-message" rows={12} maxLength={12000} required value={message} {...bulkInvalidProps(fieldIssues, "bulk-message")} onChange={event => { setMessage(event.target.value); setConfirmed(false); setDraftId(null); }} disabled={!!busy} placeholder="Write your message here. Your Hathor logo, banner and footer are added automatically." /><BulkFieldMessage issues={fieldIssues} id="bulk-message" />
            <p className="bulk-emails__hint">{message.length.toLocaleString()} / 12,000 characters · Plain text with your original line breaks. The uploaded list is not attached to your email.</p>
            </>}
            {template?.journal ? <BulkJournalEditor template={{ ...template, journal: template.journal }} message={message} disabled={!!busy} issues={fieldIssues} onTemplate={changeTemplate} onMessage={value => { setMessage(value); setConfirmed(false); setDraftId(null); }} onUpload={(file, slot) => void uploadBanner(file, slot)} onReset={() => { setTemplate(templateDefaults); setConfirmed(false); setDraftId(null); }} /> : template && <details className="bulk-emails__template-editor" open><summary>Customize this email template</summary><p className="bulk-emails__hint">These changes apply to this bulk email. Your booking and contact templates keep their existing settings.</p>
              <label className="bulk-emails__label" htmlFor="bulk-eyebrow">Small line above the subject</label><input id="bulk-eyebrow" className="input" maxLength={120} value={template.eyebrow} {...bulkInvalidProps(fieldIssues, "bulk-eyebrow")} onChange={event => changeTemplate({ eyebrow: event.target.value })} disabled={!!busy} /><BulkFieldMessage issues={fieldIssues} id="bulk-eyebrow" />
              <label className="bulk-emails__confirmation"><input type="checkbox" checked={template.showBanner} onChange={event => changeTemplate({ showBanner: event.target.checked })} disabled={!!busy} /><span>Show Hathor banner</span></label>
              <div className="bulk-emails__banner">{template.showBanner && bulkBannerPreviewSrc(template.heroImageUrl || standardBannerUrl) ? <img src={bulkBannerPreviewSrc(template.heroImageUrl || standardBannerUrl)} alt="" /> : <p className="bulk-emails__hint">This email will be sent without a banner.</p>}<div className="bulk-emails__banner-change"><label className="btn-outline" htmlFor="bulk-banner">Change banner</label><input id="bulk-banner" aria-label="Banner image for this email" type="file" accept="image/jpeg,image/png,image/webp" disabled={!!busy} onChange={event => { const file = event.target.files?.[0]; if (file) void uploadBanner(file); event.target.value = ""; }} /></div></div>
              <p className="bulk-emails__hint">JPG, PNG or WebP, up to 2 MB. Changing the banner updates only this email.</p>
              {template.heroImageUrl && <button className="bulk-emails__text-button" disabled={!!busy} onClick={() => { const { heroImageUrl: _image, ...rest } = template; void _image; setTemplate({ ...rest, showBanner: true }); setConfirmed(false); setDraftId(null); }}>Use the standard Hathor banner</button>}
              <div className="bulk-emails__colour-fields"><label htmlFor="bulk-accent">Accent colour<input id="bulk-accent" type="color" value={template.primaryColor} onChange={event => changeTemplate({ primaryColor: event.target.value })} disabled={!!busy} /></label><label htmlFor="bulk-background">Background colour<input id="bulk-background" type="color" value={template.backgroundColor} onChange={event => changeTemplate({ backgroundColor: event.target.value })} disabled={!!busy} /></label></div>
              <label className="bulk-emails__label" htmlFor="bulk-signature">Signature</label><BulkGrowingTextarea id="bulk-signature" rows={4} maxLength={2000} value={template.signature || ""} onChange={event => changeTemplate({ signature: event.target.value })} disabled={!!busy} placeholder={"Warm regards,\nYour name\nThe Hathor team"} {...bulkInvalidProps(fieldIssues, "bulk-signature")} /><BulkFieldMessage issues={fieldIssues} id="bulk-signature" /><p className="bulk-emails__hint">Optional. Your line breaks appear exactly as typed.</p>
              <p className="bulk-emails__eyebrow bulk-emails__footer-label">Footer wording</p>
              {([ ["tagline", "Footer tagline", 120], ["email", "Footer email address", 120], ["phone", "Footer phone", 60], ["replyNote", "Footer reply note", 300], ["copyright", "Footer copyright", 120] ] as const).map(([key, label, maximum]) => <div key={key}><label className="bulk-emails__label" htmlFor={`bulk-footer-${key}`}>{label}</label><input id={`bulk-footer-${key}`} className="input" type={key === "email" ? "email" : "text"} maxLength={maximum} value={template.footer[key]} disabled={!!busy} {...bulkInvalidProps(fieldIssues, `bulk-footer-${key}`)} onChange={event => changeTemplate({ footer: { ...template.footer, [key]: event.target.value } })} /><BulkFieldMessage issues={fieldIssues} id={`bulk-footer-${key}`} /></div>)}
              <p className="bulk-emails__hint">An empty footer field hides its line. Use {"{year}"} for the current year.</p><button className="bulk-emails__text-button" disabled={!!busy} onClick={() => { setTemplate(templateDefaults); setConfirmed(false); setDraftId(null); }}>Reset template to Hathor defaults</button>
            </details>}
          </section>
          <BulkEmailLivePreview subject={subject} message={message} template={template} focus={previewFocus} onPreview={acceptLivePreview} />
        </div>}
        {stage === 2 && <div className="bulk-emails__workspace">
          <section className="bulk-emails__panel">
            <p className="bulk-emails__eyebrow">03 / One final look</p><h2>{settings.mode === "preview" ? "Try your send." : "Ready to send."}</h2>
            <dl className="bulk-emails__summary"><div><dt>Recipients</dt><dd>{emails.length} separate emails</dd></div><div><dt>Subject</dt><dd>{subject}</dd></div><div><dt>From</dt><dd>{settings.from}</dd></div></dl>
            <details className="bulk-emails__details"><summary>Review all {emails.length} recipients</summary><ul>{emails.map(email => <li key={email}>{email}</li>)}</ul></details>
            <p className="bulk-emails__muted">Each address receives its own copy. Unsubscribed recipients are skipped automatically. Your normal booking and inbox emails stay separate.</p>
            <label className="bulk-emails__confirmation" data-invalid={Boolean(fieldIssues["bulk-confirm"])}><input id="bulk-confirm" type="checkbox" checked={confirmed} onChange={event => setConfirmed(event.target.checked)} disabled={!!busy} /><span>I have reviewed this list and have permission to email these recipients.</span></label>
            {blockerList}
            <button className="btn-gold bulk-emails__send" disabled={!!busy} onClick={() => void send()}><Send size={18} />{settings.mode === "preview" ? `Run preview for ${emails.length} recipients` : `Send to ${emails.length} recipients`}</button>
            {settings.mode === "preview" && <p className="bulk-emails__hint">This records a simulated campaign. Nobody receives an email.</p>}
          </section>
          <section className="bulk-emails__panel bulk-emails__preview-panel"><p className="bulk-emails__eyebrow">Your branded email</p><iframe title="Final branded email preview" srcDoc={previewHtml} sandbox="" referrerPolicy="no-referrer" /></section>
        </div>}
        {stage < 2 && blockerList}
        <div className="bulk-emails__footer">
          {stage > 0 ? <button className="btn-outline" disabled={!!busy} onClick={() => goToStage(stage - 1)}><ArrowLeft size={16} />Back</button> : <span />}
          {stage < 2 && <button className="btn-gold" disabled={!!busy} onClick={continueFlow}>{stage === 0 ? "Write your message" : !emails.length ? "Add recipients" : "Review email"}<ArrowRight size={16} /></button>}
        </div>
      </> : <section className="bulk-emails__panel bulk-emails__result" aria-live="polite">
        <p className="bulk-emails__eyebrow">{selected.mode === "preview" ? "Simulated campaign" : "Campaign history"}</p><h2>{STATUS[selected.status]}</h2><h3>{selected.subject}</h3>
        <p className="bulk-emails__muted">{date(selected.createdAt)}</p>
        <details className="bulk-emails__details"><summary>View message</summary><p className="bulk-emails__saved-message">{selected.message}</p></details>
        <div className="bulk-emails__counts"><div><strong>{selected.recipients.length}</strong><span>Recipients</span></div><div><strong>{complete}</strong><span>{selected.mode === "preview" ? "Simulated" : "Accepted"}</span></div><div><strong>{skipped}</strong><span>Unsubscribed / skipped</span></div></div>
        <progress max={selected.recipients.length} value={complete + skipped} aria-label="Campaign progress" />
        {selected.status === "simulated" && <p className="bulk-emails__notice"><CheckCircle2 size={20} />Preview completed. No real emails were sent.</p>}
        {selected.status === "accepted" && <p className="bulk-emails__notice"><CheckCircle2 size={20} />Resend accepted the batch. Acceptance does not guarantee inbox delivery; delivery and bounce details are available in Resend.</p>}
        {selected.status === "sending" && <p role="status">The batch is being processed. If interrupted, return here to recover the same campaign.</p>}
        {selected.error && <p className="bulk-emails__warning">{selected.error}</p>}
        <div className="bulk-emails__actions">{canRecover(selected) && <button className="btn-gold" disabled={!!busy} onClick={() => void recover(selected)}><RefreshCw size={16} />{selected.firstAttemptAt ? "Retry safely" : selected.mode === "preview" ? "Run preview" : "Send this campaign"}</button>}{selected.status === "queued" && !selected.firstAttemptAt && <button className="btn-outline" disabled={!!busy} onClick={() => void cancel(selected)}>Cancel campaign</button>}<button className="btn-outline" disabled={!!busy} onClick={() => { void request<{ campaign: BulkCampaignView }>(`/api/admin/bulk-emails/${selected.id}`).then(result => updateCampaign(result.campaign)).catch(err => setError(err.message)); }}>Refresh status</button></div>
        <details className="bulk-emails__details" open><summary>Recipient results</summary><ul className="bulk-emails__recipients">{selected.recipients.map(row => <li key={row.email}><span>{row.email}</span><span className="bulk-emails__muted">{row.status === "accepted" ? "Accepted" : row.status === "simulated" ? "Simulated" : row.status === "skipped" ? "Skipped" : "Not confirmed"}</span></li>)}</ul></details>
      </section>}
      <section className="bulk-emails__history"><div className="bulk-emails__panel-heading"><div><p className="bulk-emails__eyebrow">Your correspondence</p><h2>Email history</h2></div><button className="bulk-emails__text-button" disabled={!!busy} onClick={() => { void load().catch(err => setError(err.message)); }}><RefreshCw size={16} />Refresh</button></div>
        <div className="bulk-emails__history-filters" role="group" aria-label="Filter email history">{([ ["all", "All"], ["send", "Real sends"], ["preview", "Previews"] ] as const).map(([value, label]) => <button key={value} aria-pressed={historyFilter === value} onClick={() => setHistoryFilter(value)}>{label}</button>)}</div>
        {visibleCampaigns.length ? <ul>{visibleCampaigns.map(campaign => <li key={campaign.id} className="bulk-emails__history-row"><button className="bulk-emails__history-open" onClick={() => showCampaign(campaign)} disabled={!!busy}><div><strong>{campaign.subject}</strong><span>{date(campaign.createdAt)} · {campaign.recipients.length} recipients · {campaign.mode === "preview" ? "Preview · no email sent" : "Real send"}</span></div><span className="bulk-emails__history-status">{STATUS[campaign.status]}<ArrowRight size={16} /></span></button><button className="btn-outline bulk-emails__history-delete" aria-label={`Delete history for ${campaign.subject}`} title={canDelete(campaign) ? "Delete from history" : "Resolve the sending result before deleting"} disabled={!!busy || !canDelete(campaign)} onClick={() => confirmDelete(campaign)}><Trash2 size={16} /><span>Delete</span></button></li>)}</ul> : <p className="bulk-emails__muted">{historyFilter === "send" ? "No real sending campaigns yet." : historyFilter === "preview" ? "No simulated campaigns yet." : "Your previews and sending history will appear here."}</p>}
      </section>
    </>}
    {busy && <p className="bulk-emails__busy" role="status">{busy}</p>}
    <dialog ref={deleteDialog} className="bulk-emails__preview-dialog bulk-emails__delete-dialog" aria-labelledby="bulk-delete-title" onCancel={event => { if (busy) event.preventDefault(); }}>
      <h2 id="bulk-delete-title">Delete from email history?</h2>
      <p className="bulk-emails__hint">“{deleteTarget?.subject}” and its saved message and recipient list will be removed. This cannot recall emails already sent. Unsubscribe preferences are preserved.</p>
      <div className="bulk-emails__actions"><button className="btn-outline" disabled={!!busy} onClick={() => { deleteDialog.current?.close(); setDeleteTarget(null); }}>Keep history</button><button className="btn-gold" disabled={!!busy} onClick={() => void deleteHistory()}><Trash2 size={16} />Delete history</button></div>
    </dialog>
    <dialog ref={previewDialog} className="bulk-emails__preview-dialog" aria-labelledby="bulk-preview-title"><div className="bulk-emails__panel-heading"><h2 id="bulk-preview-title">Email template preview</h2><button aria-label="Close email preview" onClick={() => previewDialog.current?.close()}><X size={22} /></button></div>{samplePreview && <p className="bulk-emails__hint">This is sample text. Add your subject and message to preview the email you will send.</p>}<div className="bulk-emails__actions"><button className="btn-outline" onClick={editEmail}><Pencil size={16} />{selected ? "Use as new email" : "Edit this email"}</button></div><iframe title="Email template modal preview" srcDoc={modalHtml} sandbox="" referrerPolicy="no-referrer" /></dialog>
  </div>;
}
