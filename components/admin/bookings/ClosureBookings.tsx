"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { ChevronDown, ExternalLink, LockOpen, PencilLine } from "lucide-react";
import { BookingsColumns, BookingsGroup } from "@/components/admin/BookingsListView";
import { useAdminPermission } from "@/components/admin/AdminAccessProvider";
import { useToast } from "@/components/admin/ToastProvider";
import { CLOSURE_SALE_SOURCES, type AdminClosureBooking } from "@/lib/admin-bookings";
import { adminFetch } from "@/lib/admin-fetch";
import { formatPrice } from "@/lib/client-dates";
import { Dialog, Field, Footer } from "./BookingActions";
import { voyageDates, voyageTiming } from "./BookingCard";
import { parseUsd } from "./PaymentPlanEditor";

const DEFAULT_NOTES = new Set(["Closed from the dashboard", "Private charter"]);
const usd = (cents: number) => (cents / 100).toFixed(2);

function cabinsLabel(closure: AdminClosureBooking) {
  if (closure.wholeShip) return "Whole ship";
  return closure.roomNames.join(", ");
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

  return (
    <article className="bk-entry" data-stage={sale ? "confirmed" : "hold"} data-open={expanded ? "true" : undefined}>
      <div className="bk-row">
        <span />
        <div className="bk-row__guest">
          <span className="bk-avatar" aria-hidden>{closure.wholeShip ? "PC" : closure.roomIds.length}</span>
          <div className="min-w-0">
            <p className="truncate font-semibold">{name}</p>
            <p className="truncate text-xs text-muted">Via Availability{sale ? ` · ${sale.source}` : ""}</p>
          </div>
        </div>
        <div className="bk-row__cell">
          <p className="truncate font-medium tabular">{voyageDates(closure.startsAt, closure.endsAt)}</p>
          <p className="truncate text-xs text-muted" title={closure.voyage ?? undefined}>{voyageTiming(closure.startsAt, closure.endsAt)}</p>
        </div>
        <div className="bk-row__cell">
          <p className="truncate font-medium">{closure.wholeShip ? "Whole ship" : `${closure.roomIds.length} cabin${closure.roomIds.length === 1 ? "" : "s"}`}</p>
          <p className="truncate text-xs text-muted" title={cabinsLabel(closure)}>{closure.wholeShip ? `${closure.roomIds.length} cabins` : cabinsLabel(closure)}</p>
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
                <span title={format(parseISO(closure.createdAt), "d MMM yyyy, HH:mm")}>Closed {formatDistanceToNow(parseISO(closure.createdAt), { addSuffix: true })}</span>
              </div>
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

function SaleDialog({ closure, onClose, onSaved }: { closure: AdminClosureBooking; onClose: () => void; onSaved: () => void }) {
  const { showToast } = useToast();
  const sale = closure.sale;
  const noted = ownNote(closure);
  const [form, setForm] = useState({
    guestName: sale?.guestName ?? "",
    source: sale?.source ?? (closure.state === "CHARTER_BLOCK" ? "Private charter" : "Phone"),
    customerEmail: sale?.customerEmail ?? "",
    customerPhone: sale?.customerPhone ?? "",
    total: sale ? usd(sale.totalPriceCents) : "",
    received: sale ? usd(sale.receivedCents) : "0.00",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const totalPriceCents = parseUsd(form.total);
    const receivedCents = parseUsd(form.received);
    if (!totalPriceCents) return setError("Enter the agreed price in USD, with at most two decimals.");
    if (receivedCents === null) return setError("Enter the amount received in USD, with at most two decimals.");
    if (receivedCents > totalPriceCents) return setError("The amount received cannot be more than the agreed price.");
    setBusy(true);
    setError(null);
    try {
      const response = await adminFetch("/api/admin/closure-bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blockKey: closure.blockKey,
          guestName: form.guestName.trim(),
          source: form.source,
          customerEmail: form.customerEmail.trim() || null,
          customerPhone: form.customerPhone.trim() || null,
          totalPriceCents,
          receivedCents,
        }),
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

  const input = (key: "guestName" | "customerEmail" | "customerPhone" | "total" | "received") => ({
    className: "input h-10 px-3 text-sm",
    value: form[key],
    onChange: (event: { target: { value: string } }) => setForm(current => ({ ...current, [key]: event.target.value })),
  });

  return (
    <Dialog title="Guest details" kicker={`${cabinsLabel(closure)} · ${voyageDates(closure.startsAt, closure.endsAt)}`} onClose={onClose}>
      <form onSubmit={submit}>
        {noted ? <p className="text-sm text-muted">Availability note: {noted}</p> : null}
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <Field label="Guest or company"><input {...input("guestName")} required maxLength={160} /></Field>
          <Field label="Sold through">
            <select className="input h-10 px-3 text-sm" value={form.source} onChange={event => setForm(current => ({ ...current, source: event.target.value }))}>
              {CLOSURE_SALE_SOURCES.map(source => <option key={source} value={source}>{source}</option>)}
            </select>
          </Field>
          <Field label="Email"><input {...input("customerEmail")} type="email" maxLength={200} /></Field>
          <Field label="Phone"><input {...input("customerPhone")} type="tel" maxLength={40} /></Field>
          <Field label="Agreed price (USD)"><input {...input("total")} inputMode="decimal" required /></Field>
          <Field label="Received so far (USD)"><input {...input("received")} inputMode="decimal" required /></Field>
        </div>
        <p className="mt-4 text-xs text-muted">The cabins stay closed on Availability. Reopening them is a separate action.</p>
        {error ? <p role="alert" className="mt-4 rounded-lg px-3 py-2 text-sm" style={{ background: "var(--danger-bg)", color: "var(--danger)" }}>{error}</p> : null}
        <Footer busy={busy} submitLabel="Save details" onCancel={onClose} />
      </form>
    </Dialog>
  );
}

export function ClosureBookingsList({ closures, loadFailed, onChanged }: { closures: AdminClosureBooking[]; loadFailed: boolean; onChanged: () => void }) {
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
  if (closures.length === 0) {
    return (
      <div className="card flex flex-col items-center justify-center gap-2 px-4 py-16 text-center">
        <p className="text-sm font-medium">Nothing here</p>
        <p className="text-sm text-muted">No cabins are closed for sales made outside the website.</p>
      </div>
    );
  }

  const groups = [
    { id: "missing", title: "Needs guest details", hint: "Closed on Availability, no guest or price yet", closures: closures.filter(closure => !closure.sale) },
    { id: "complete", title: "Details complete", hint: "Tracked with your other bookings", closures: closures.filter(closure => closure.sale) },
  ].filter(group => group.closures.length > 0);

  return (
    <div className="space-y-3">
      <BookingsColumns />
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
      <p className="px-0.5 text-xs text-muted">Maintenance closures stay on the Availability page. They are not sales, so they do not appear here.</p>
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
