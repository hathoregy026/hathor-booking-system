"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { Anchor, ChevronDown, ExternalLink, Loader2, LockOpen, Mail, PencilLine } from "lucide-react";
import { BookingsColumns, BookingsGroup } from "@/components/admin/BookingsListView";
import { useAdminPermission } from "@/components/admin/AdminAccessProvider";
import { useToast } from "@/components/admin/ToastProvider";
import { CLOSURE_SALE_SOURCES, type AdminClosureBooking, type ClosureSale } from "@/lib/admin-bookings";
import { adminFetch } from "@/lib/admin-fetch";
import { charterRequestHref, type CharterRequestDto } from "@/lib/admin-charters";
import { formatPrice } from "@/lib/client-dates";
import { Dialog, Field, Footer } from "./BookingActions";
import { voyageDates, voyageTiming } from "./BookingCard";
import { parseUsd } from "./PaymentPlanEditor";

const DEFAULT_NOTES = new Set(["Closed from the dashboard", "Private charter"]);
const usd = (cents: number) => (cents / 100).toFixed(2);

export function cabinsLabel(closure: AdminClosureBooking) {
  if (closure.wholeShip) return "Whole ship";
  return closure.roomNames.join(", ");
}

export function guestsLabel(sale: Pick<ClosureSale, "adults" | "children">) {
  const adults = sale.adults ?? 0;
  const children = sale.children ?? 0;
  return `${adults} adult${adults === 1 ? "" : "s"}, ${children} child${children === 1 ? "" : "ren"}`;
}

/** The note the team typed on Availability, when they typed one. */
function ownNote(closure: AdminClosureBooking) {
  return closure.note && !DEFAULT_NOTES.has(closure.note) ? closure.note : null;
}

function ClosureRow({
  closure,
  expanded,
  onToggle,
  onEdit,
  onReopen,
}: {
  closure: AdminClosureBooking;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onReopen: () => void;
}) {
  const canEdit = useAdminPermission("bookings.manage");
  const canReopen = useAdminPermission("availability.manage");
  const sale = closure.sale;
  const note = ownNote(closure);
  const name = sale?.guestName ?? note ?? (closure.state === "CHARTER_BLOCK" ? "Private charter" : "No guest details yet");
  const balance = sale ? sale.totalPriceCents - sale.receivedCents : 0;
  const money = !sale
    ? { text: "Add the price to track it here" }
    : balance === 0
      ? { text: "Paid in full", tone: "good" as const }
      : { text: `${formatPrice(balance)} to collect · ${formatPrice(sale.receivedCents)} received` };
  const editLabel = !sale ? "Add guest details" : balance > 0 ? "Update payment" : "Edit details";
  const charter = closure.state === "CHARTER_BLOCK";

  return (
    <article className="bk-entry" data-stage={sale ? "confirmed" : "hold"} data-charter={charter ? "true" : undefined} data-open={expanded ? "true" : undefined}>
      <div className="bk-row">
        <span />
        <div className="bk-row__guest">
          <span className="bk-avatar" aria-hidden>{charter ? <Anchor className="h-4 w-4" /> : closure.wholeShip ? "PC" : closure.roomIds.length}</span>
          <div className="min-w-0">
            <p className="flex min-w-0 items-center gap-2 font-semibold"><span className="truncate">{name}</span>{charter ? <span className="bk-charter-badge">Charter</span> : null}</p>
            <p className="truncate text-xs text-muted">{charter ? "Private charter" : "Via Availability"}{sale ? ` · ${sale.source}` : ""}</p>
          </div>
        </div>
        <div className="bk-row__cell">
          <p className="truncate font-medium tabular">{voyageDates(closure.startsAt, closure.endsAt)}</p>
          <p className="truncate text-xs text-muted" title={closure.voyage ?? undefined}>{voyageTiming(closure.startsAt, closure.endsAt)}</p>
        </div>
        <div className="bk-row__cell">
          <p className="truncate font-medium">{closure.wholeShip ? "Whole ship" : `${closure.roomIds.length} cabin${closure.roomIds.length === 1 ? "" : "s"}`}</p>
          <p className="truncate text-xs text-muted" title={cabinsLabel(closure)}>
            {closure.wholeShip ? `${closure.roomIds.length} cabins` : sale && sale.adults != null ? `${cabinsLabel(closure)} · ${guestsLabel(sale)}` : cabinsLabel(closure)}
          </p>
        </div>
        <div className="bk-row__cell">
          <span className="font-semibold tabular">{sale ? formatPrice(sale.totalPriceCents) : "Not recorded"}</span>
          <p className="bk-row__money mt-0.5 truncate text-xs tabular" data-tone={money.tone}>{money.text}</p>
        </div>
        <div className="bk-row__actions">
          {canEdit ? (
            <button type="button" className={`${sale && balance === 0 ? "btn-outline" : "btn-primary"} h-9 px-3 text-[13px]`} onClick={onEdit}>
              <PencilLine className="h-4 w-4" aria-hidden />
              {editLabel}
            </button>
          ) : <span />}
          <button type="button" className="bk-row__toggle" aria-expanded={expanded} aria-label={`${expanded ? "Hide" : "Show"} details for ${name}`} onClick={onToggle}>
            <ChevronDown className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
      {expanded ? (
        <div className="bk-more">
          <div className="bk-more__grid">
            <div>
              <p className="bk-more__label">Sold outside the website</p>
              <div className="bk-more__info">
                <span>{sale ? `Sold through ${sale.source}` : closure.state === "CHARTER_BLOCK" ? "Private charter" : "Guest not recorded yet"}</span>
                {sale?.customerEmail ? <a href={`mailto:${sale.customerEmail}`} className="hover:text-[var(--accent)]">{sale.customerEmail}</a> : null}
                {sale?.customerPhone ? <a href={`tel:${sale.customerPhone.replace(/\s/g, "")}`} className="tabular hover:text-[var(--accent)]">{sale.customerPhone}</a> : null}
                {sale?.country ? <span>{sale.country}</span> : null}
                {sale && sale.adults != null ? <span>{guestsLabel(sale)}</span> : null}
                <span title={format(parseISO(closure.createdAt), "d MMM yyyy, HH:mm")}>Closed {formatDistanceToNow(parseISO(closure.createdAt), { addSuffix: true })}</span>
              </div>
              {sale?.notes ? <p className="bk-more__note"><strong>Notes:</strong> {sale.notes}</p> : null}
              {note ? <p className="bk-more__note"><strong>Availability note:</strong> {note}</p> : null}
            </div>
            <div>
              <p className="bk-more__label">Voyage</p>
              <div className="bk-more__info">
                {closure.voyage ? <strong>{closure.voyage}</strong> : null}
                <span>{voyageDates(closure.startsAt, closure.endsAt)}</span>
                <span>{cabinsLabel(closure)}</span>
              </div>
            </div>
            <div>
              <p className="bk-more__label">Payment</p>
              {sale ? (
                <div className="bk-more__info tabular">
                  <span>Agreed price {formatPrice(sale.totalPriceCents)}</span>
                  <span>Received {formatPrice(sale.receivedCents)}</span>
                  <span>Balance {formatPrice(balance)}</span>
                </div>
              ) : (
                <p className="text-sm text-muted">Add the agreed price to track what is still owed.</p>
              )}
            </div>
          </div>
          <footer className="bk-more__actions">
            <Link href="/admin/availability" className="btn-outline h-9 px-3 text-[13px]">
              <ExternalLink className="h-4 w-4" aria-hidden />
              Open Availability
            </Link>
            {canReopen ? (
              <button type="button" className="btn-outline h-9 px-3 text-[13px]" style={{ color: "var(--danger)", borderColor: "color-mix(in srgb, var(--danger) 45%, var(--border))" }} onClick={onReopen}>
                <LockOpen className="h-4 w-4" aria-hidden />
                Reopen cabins
              </button>
            ) : null}
          </footer>
        </div>
      ) : null}
    </article>
  );
}

/** A request from the website's charter form; the reply happens in Emails. */
function CharterRequestRow({ request }: { request: CharterRequestDto }) {
  return (
    <article className="bk-entry" data-stage="new" data-charter="true">
      <div className="bk-row">
        <span />
        <div className="bk-row__guest">
          <span className="bk-avatar" aria-hidden><Anchor className="h-4 w-4" /></span>
          <div className="min-w-0">
            <p className="flex min-w-0 items-center gap-2 font-semibold"><span className="truncate">{request.name}</span><span className="bk-charter-badge">Charter</span></p>
            <p className="truncate text-xs text-muted">Website charter request</p>
          </div>
        </div>
        <div className="bk-row__cell">
          <p className="truncate font-medium" title={request.subject}>{request.subject}</p>
          <p className="truncate text-xs text-muted" title={request.preview}>{request.preview || "Open the request to read it."}</p>
        </div>
        <div className="bk-row__cell">
          <p className="truncate font-medium">{request.email}</p>
          <p className="truncate text-xs text-muted">{request.read ? "Read" : "Unread"}</p>
        </div>
        <div className="bk-row__cell">
          <span className="font-semibold tabular" title={format(parseISO(request.createdAt), "d MMM yyyy, HH:mm")}>{format(parseISO(request.createdAt), "d MMM yyyy")}</span>
          <p className="mt-0.5 truncate text-xs text-muted">Received {formatDistanceToNow(parseISO(request.createdAt), { addSuffix: true })}</p>
        </div>
        <div className="bk-row__actions">
          <Link href={charterRequestHref(request.id)} className="btn-primary h-9 px-3 text-[13px]">
            <Mail className="h-4 w-4" aria-hidden />
            Open request
          </Link>
          <span />
        </div>
      </div>
    </article>
  );
}

/* ---------- the guest behind a closure: one form for Bookings and Availability ---------- */

export type SaleFormState = {
  guestName: string;
  source: string;
  customerEmail: string;
  customerPhone: string;
  country: string;
  adults: string;
  children: string;
  notes: string;
  total: string;
  received: string;
};

export function saleFormFrom(sale: ClosureSale | null, fallbackSource = "Phone"): SaleFormState {
  return {
    guestName: sale?.guestName ?? "",
    source: sale?.source ?? fallbackSource,
    customerEmail: sale?.customerEmail ?? "",
    customerPhone: sale?.customerPhone ?? "",
    country: sale?.country ?? "",
    adults: sale?.adults != null ? String(sale.adults) : "2",
    children: sale?.children != null ? String(sale.children) : "0",
    notes: sale?.notes ?? "",
    total: sale ? usd(sale.totalPriceCents) : "",
    received: sale ? usd(sale.receivedCents) : "0.00",
  };
}

/** The form as the API takes it, or the first thing to fix. */
export function salePayload(form: SaleFormState): { error: string } | { sale: ClosureSale } {
  const totalPriceCents = parseUsd(form.total);
  const receivedCents = parseUsd(form.received);
  const count = (text: string) => (/^\d{1,2}$/.test(text.trim()) ? Number(text.trim()) : null);
  if (!form.guestName.trim()) return { error: "Enter the guest's name." };
  if (!form.customerEmail.trim() && !form.customerPhone.trim()) return { error: "Enter an email or a phone number for the guest." };
  const adults = count(form.adults);
  const children = count(form.children);
  if (adults === null || adults < 1) return { error: "Enter how many adults are sailing (at least one)." };
  if (children === null) return { error: "Enter how many children are sailing (0 for none)." };
  if (!totalPriceCents) return { error: "Enter the agreed price in USD, with at most two decimals." };
  if (receivedCents === null) return { error: "Enter the amount received in USD, with at most two decimals." };
  if (receivedCents > totalPriceCents) return { error: "The amount received cannot be more than the agreed price." };
  return {
    sale: {
      guestName: form.guestName.trim(),
      source: form.source,
      customerEmail: form.customerEmail.trim() || null,
      customerPhone: form.customerPhone.trim() || null,
      country: form.country.trim() || null,
      adults,
      children,
      notes: form.notes.trim() || null,
      totalPriceCents,
      receivedCents,
    },
  };
}

export function SaleFields({ form, onChange }: { form: SaleFormState; onChange: (next: SaleFormState) => void }) {
  const input = (key: keyof SaleFormState) => ({
    className: "input h-10 px-3 text-sm",
    value: form[key],
    onChange: (event: { target: { value: string } }) => onChange({ ...form, [key]: event.target.value }),
  });
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Guest or company"><input {...input("guestName")} required maxLength={160} autoComplete="off" /></Field>
      <Field label="Booked through">
        <select className="input h-10 px-3 text-sm" value={form.source} onChange={event => onChange({ ...form, source: event.target.value })}>
          {CLOSURE_SALE_SOURCES.map(source => <option key={source} value={source}>{source}</option>)}
        </select>
      </Field>
      <Field label="Email"><input {...input("customerEmail")} type="email" maxLength={200} autoComplete="off" /></Field>
      <Field label="Phone or WhatsApp"><input {...input("customerPhone")} type="tel" maxLength={40} autoComplete="off" /></Field>
      <Field label="Country"><input {...input("country")} maxLength={80} autoComplete="off" /></Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Adults"><input {...input("adults")} inputMode="numeric" required /></Field>
        <Field label="Children"><input {...input("children")} inputMode="numeric" required /></Field>
      </div>
      <Field label="Agreed price (USD)"><input {...input("total")} inputMode="decimal" required /></Field>
      <Field label="Received so far (USD)"><input {...input("received")} inputMode="decimal" required /></Field>
      <div className="sm:col-span-2">
        <Field label="Notes" hint="Requests, how they paid, anything the team should know.">
          <textarea className="input min-h-[76px] px-3 py-2 text-sm" value={form.notes} maxLength={1000} onChange={event => onChange({ ...form, notes: event.target.value })} />
        </Field>
      </div>
    </div>
  );
}

export function SaleDialog({
  closure,
  onClose,
  onSaved,
  onReopen,
  title = "Guest details",
}: {
  closure: AdminClosureBooking;
  onClose: () => void;
  onSaved: () => void;
  /** Availability: reopen the cabins from the same dialog. */
  onReopen?: () => void;
  title?: string;
}) {
  const { showToast } = useToast();
  const noted = ownNote(closure);
  const [form, setForm] = useState<SaleFormState>(() => {
    const initial = saleFormFrom(closure.sale, closure.state === "CHARTER_BLOCK" ? "Private charter" : "Phone");
    // No guest yet: the note on Availability usually names them ("Booked for Mr. Stephan").
    if (!closure.sale && noted) initial.guestName = noted.replace(/^booked\s+for\s+/i, "").split(/\s+-\s+/)[0]!.trim().slice(0, 160);
    return initial;
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const payload = salePayload(form);
    if ("error" in payload) return setError(payload.error);
    setBusy(true);
    setError(null);
    try {
      const response = await adminFetch("/api/admin/closure-bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockKey: closure.blockKey, ...payload.sale }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not save these details.");
      showToast("success", "Guest details saved.");
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save these details.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog title={title} kicker={`${cabinsLabel(closure)} · ${voyageDates(closure.startsAt, closure.endsAt)}`} onClose={onClose}>
      <form onSubmit={submit}>
        {closure.voyage ? <p className="text-sm font-medium">{closure.voyage}</p> : null}
        {noted ? <p className="mt-1 text-sm text-muted">Availability note: {noted}</p> : null}
        <div className="mt-4">
          <SaleFields form={form} onChange={setForm} />
        </div>
        <p className="mt-4 text-xs text-muted">The cabins stay closed on Availability until you reopen them.</p>
        {error ? <p role="alert" className="mt-4 rounded-lg px-3 py-2 text-sm" style={{ background: "var(--danger-bg)", color: "var(--danger)" }}>{error}</p> : null}
        {onReopen ? (
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
            <button
              type="button"
              className="btn-outline h-10 px-4 text-sm"
              style={{ color: "var(--danger)", borderColor: "color-mix(in srgb, var(--danger) 45%, var(--border))" }}
              onClick={onReopen}
            >
              <LockOpen className="h-4 w-4" aria-hidden />
              Reopen cabins
            </button>
            <span className="hidden flex-1 sm:block" />
            <button type="button" onClick={onClose} className="btn-outline h-10 px-4 text-sm">Back</button>
            <button type="submit" disabled={busy} className="btn-primary h-10 px-5 text-sm disabled:opacity-60">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
              Save details
            </button>
          </div>
        ) : (
          <Footer busy={busy} submitLabel="Save details" onCancel={onClose} />
        )}
      </form>
    </Dialog>
  );
}

export function ClosureBookingsList({
  closures,
  loadFailed,
  onChanged,
  mode = "availability",
  requests = [],
}: {
  closures: AdminClosureBooking[];
  loadFailed: boolean;
  onChanged: () => void;
  /** "charter": whole-ship charters plus the website's charter requests. */
  mode?: "availability" | "charter";
  requests?: CharterRequestDto[];
}) {
  const { showToast } = useToast();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editing, setEditing] = useState<AdminClosureBooking | null>(null);

  async function reopen(closure: AdminClosureBooking) {
    const money = closure.sale ? " The guest and payment details stay on record but leave this list." : "";
    if (!window.confirm(`Reopen ${cabinsLabel(closure)} on ${voyageDates(closure.startsAt, closure.endsAt)}? Guests can book these cabins again straight away.${money}`)) return;
    try {
      const response = await adminFetch("/api/admin/cabin-closures", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockKey: closure.blockKey }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not reopen these cabins.");
      showToast("success", "Cabins reopened. Guests can book them now.");
      onChanged();
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Could not reopen these cabins.");
    }
  }

  if (loadFailed) {
    return (
      <div className="card px-4 py-12 text-center">
        <p className="text-sm text-muted">Could not load the Availability bookings. Your other bookings are not affected.</p>
      </div>
    );
  }
  if (closures.length === 0 && requests.length === 0) {
    return (
      <div className="card flex flex-col items-center justify-center gap-2 px-4 py-16 text-center">
        <p className="text-sm font-medium">Nothing here</p>
        <p className="text-sm text-muted">{mode === "charter"
          ? "No charters yet. Charter requests from the website and charters closed on Availability appear here."
          : "No cabins are closed for sales made outside the website."}</p>
      </div>
    );
  }

  const groups = mode === "charter" ? [
    { id: "charters", title: "Charters on the calendar", hint: "The whole ship, closed on Availability", closures },
  ].filter(group => group.closures.length > 0) : [
    { id: "missing", title: "Needs guest details", hint: "Closed on Availability, no guest or price yet", closures: closures.filter(closure => !closure.sale) },
    { id: "complete", title: "Details complete", hint: "Tracked with your other bookings", closures: closures.filter(closure => closure.sale) },
  ].filter(group => group.closures.length > 0);

  return (
    <div className="space-y-3">
      <BookingsColumns />
      {mode === "charter" && requests.length ? (
        <BookingsGroup title="Website charter requests" hint="Sent through the charter form, newest first" count={requests.length}>
          {requests.map(request => <CharterRequestRow key={request.id} request={request} />)}
        </BookingsGroup>
      ) : null}
      {groups.map(group => (
        <BookingsGroup key={group.id} title={group.title} hint={group.hint} count={group.closures.length}>
          {group.closures.map(closure => (
            <ClosureRow
              key={closure.blockKey}
              closure={closure}
              expanded={expanded === closure.blockKey}
              onToggle={() => setExpanded(current => (current === closure.blockKey ? null : closure.blockKey))}
              onEdit={() => setEditing(closure)}
              onReopen={() => void reopen(closure)}
            />
          ))}
        </BookingsGroup>
      ))}
      <p className="px-0.5 text-xs text-muted">{mode === "charter"
        ? "To hold the ship for a charter, close it as Charter on Availability. Requests stay in Emails, where you reply to them."
        : "Maintenance closures stay on the Availability page, and charters have their own list. They do not appear here."}</p>
      {editing ? (
        <SaleDialog
          key={editing.blockKey}
          closure={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            onChanged();
          }}
        />
      ) : null}
    </div>
  );
}
