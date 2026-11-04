"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { ExternalLink, Loader2 } from "lucide-react";
import { useToast } from "@/components/admin/ToastProvider";
import { useAdminPermission } from "@/components/admin/AdminAccessProvider";
import { adminFetch } from "@/lib/admin-fetch";
import { Dialog, Field, Footer } from "./BookingActions";

/*
 * Availability → a cabin closed by a website booking. Shows who is in it and
 * lets the team correct the guest's details without leaving the board.
 */

type Guest = {
  id: string; code: string; status: string; firstName: string; lastName: string; name: string;
  email: string; phone: string; country: string; specialRequests: string;
  adults: number | null; children: number | null; departure: string; arrival: string; cruiseName: string;
};

const day = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { timeZone: "UTC", day: "numeric", month: "short", year: "numeric" });
const input = "input h-10 px-3 text-sm";

export function GuestDetailsDialog({ bookingId, cabinLabel, onClose, onSaved }: { bookingId: string; cabinLabel: string; onClose: () => void; onSaved: () => void }) {
  const { showToast } = useToast();
  const canEdit = useAdminPermission("bookings.manage");
  const [guest, setGuest] = useState<Guest | null>(null);
  const [form, setForm] = useState<Guest | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    adminFetch(`/api/admin/bookings/${encodeURIComponent(bookingId)}`, { cache: "no-store", signal: controller.signal })
      .then(async response => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? "Could not load this booking.");
        return body.guest as Guest;
      })
      .then(loaded => { if (!controller.signal.aborted) { setGuest(loaded); setForm(loaded); } })
      .catch(err => { if (!controller.signal.aborted) setLoadError(err instanceof Error ? err.message : "Could not load this booking."); });
    return () => controller.abort();
  }, [bookingId]);

  const set = (key: keyof Guest) => (value: string) => setForm(current => (current ? { ...current, [key]: value } : current));
  const editable = canEdit && guest && (guest.status === "REQUESTED" || guest.status === "CONFIRMED");

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!form || !editable) return onClose();
    setBusy(true);
    setError(null);
    try {
      const response = await adminFetch(`/api/admin/bookings/${encodeURIComponent(bookingId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "update-guest",
          firstName: form.firstName, lastName: form.lastName, email: form.email.trim(),
          phone: form.phone, country: form.country, specialRequests: form.specialRequests.trim() || null,
        }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error ?? "Could not save the guest details.");
      showToast("success", "Guest details saved.");
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the guest details.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog title={guest ? `${guest.name || "Guest"} · ${guest.code}` : "Booked cabin"} kicker={`${cabinLabel} · website booking`} onClose={onClose}>
      {loadError ? (
        <p role="alert" className="rounded-lg px-3 py-2 text-sm" style={{ background: "var(--danger-bg)", color: "var(--danger)" }}>{loadError}</p>
      ) : !form || !guest ? (
        <p className="flex items-center gap-2 text-sm text-muted"><Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Loading the guest…</p>
      ) : (
        <form onSubmit={submit}>
          <p className="text-sm text-muted">
            {guest.cruiseName} · {day(guest.departure)} – {day(guest.arrival)}
            {guest.adults != null ? ` · ${guest.adults} adult${guest.adults === 1 ? "" : "s"}, ${guest.children ?? 0} child${guest.children === 1 ? "" : "ren"}` : ""}
          </p>
          <fieldset disabled={!editable || busy} className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="First name"><input className={input} value={form.firstName} onChange={event => set("firstName")(event.target.value)} autoComplete="off" /></Field>
            <Field label="Last name"><input className={input} value={form.lastName} onChange={event => set("lastName")(event.target.value)} autoComplete="off" /></Field>
            <Field label="Email"><input className={input} type="email" value={form.email} onChange={event => set("email")(event.target.value)} autoComplete="off" /></Field>
            <Field label="Phone" hint="With the country code, for example +20 100 123 4567"><input className={input} type="tel" value={form.phone} onChange={event => set("phone")(event.target.value)} autoComplete="off" /></Field>
            <Field label="Country"><input className={input} value={form.country} onChange={event => set("country")(event.target.value)} autoComplete="off" /></Field>
            <div className="sm:col-span-2">
              <Field label="Special requests and notes">
                <textarea className="input min-h-24 px-3 py-2 text-sm" value={form.specialRequests} onChange={event => set("specialRequests")(event.target.value)} />
              </Field>
            </div>
          </fieldset>
          {!editable ? <p className="mt-4 text-sm text-muted">{canEdit ? "Only an active booking's details can be edited." : "You can view this guest but not edit bookings."}</p> : null}
          {error ? <p role="alert" className="mt-4 rounded-lg px-3 py-2 text-sm" style={{ background: "var(--danger-bg)", color: "var(--danger)" }}>{error}</p> : null}
          <div className="mt-4">
            <Link href={`/admin/bookings/${guest.id}`} className="inline-flex items-center gap-1.5 text-sm" style={{ color: "var(--accent)" }}>
              <ExternalLink className="h-4 w-4" aria-hidden /> Open the full booking
            </Link>
          </div>
          <Footer busy={busy} submitLabel={editable ? "Save guest details" : "Close"} onCancel={onClose} />
        </form>
      )}
    </Dialog>
  );
}
