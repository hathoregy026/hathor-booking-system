"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Loader2, X } from "lucide-react";
import { useToast } from "@/components/admin/ToastProvider";
import { paymentMethodLabel, type AdminBookingDto } from "@/lib/admin-bookings";
import { ADMIN_BOOKINGS_TIMEOUT_MS, adminFetch } from "@/lib/admin-fetch";
import { formatPrice } from "@/lib/client-dates";
import { paymentPlan, stageTitle } from "@/lib/booking-code";

export type BookingActionKind =
  | "confirm"
  | "decline"
  | "reply"
  | "payment"
  | "cancel"
  | "delete"
  | "send-confirmation";

type MailResult = { sent: boolean; to: string | null; error?: string } | null;

/** The optional note under the pay button. Card payments need only the link, so their note starts empty. */
const INSTRUCTION_DEFAULTS: Record<string, string> = {
  BANK_TRANSFER:
    "Please transfer {amount} to:\n\nBank: \nAccount name: Hathor Cruise\nIBAN: \nSWIFT / BIC: \n\nUse your booking code {code} as the transfer reference, and reply to this email with the transfer receipt.",
  VISA: "",
};

const storageKey = (method: string | null) => `hathor-invoice-instructions:${method ?? "ANY"}`;

function readInstructions(method: string | null): string {
  const fallback = INSTRUCTION_DEFAULTS[method ?? ""] ?? INSTRUCTION_DEFAULTS.BANK_TRANSFER!;
  try {
    const saved = localStorage.getItem(storageKey(method));
    // Older notes carried a "[paste …link]" placeholder; the link has its own field now.
    return saved && !/\[paste/i.test(saved) ? saved : fallback;
  } catch {
    return fallback;
  }
}

function isSecureLink(value: string) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

/** Remember the team's wording per method, with this booking's amount and code turned back into placeholders. */
function rememberInstructions(method: string | null, text: string, amount: string, code: string) {
  try {
    localStorage.setItem(storageKey(method), text.split(amount).join("{amount}").split(code).join("{code}"));
  } catch {
    /* private window: nothing to remember */
  }
}

function dueNowCents(booking: AdminBookingDto) {
  const deposit = booking.depositCents ?? booking.totalPriceCents;
  return booking.paidCents < deposit ? deposit - booking.paidCents : booking.totalPriceCents - booking.paidCents;
}

function Dialog({ title, kicker, onClose, children }: { title: string; kicker?: string; onClose: () => void; children: ReactNode }) {
  // At the top of the dashboard (inside its theme), above the phone's bottom menu, whatever card opened it.
  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4">
      <button type="button" className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" aria-label="Close" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-t-2xl shadow-2xl sm:rounded-2xl"
        style={{ background: "var(--bg-primary)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-start justify-between gap-3 border-b px-5 py-4" style={{ borderColor: "var(--border)" }}>
          <div className="min-w-0">
            {kicker ? (
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--accent)" }}>{kicker}</p>
            ) : null}
            <h2 className="mt-0.5 text-lg font-semibold tracking-tight">{title}</h2>
          </div>
          <button type="button" onClick={onClose} className="admin-header-icon-btn shrink-0" aria-label="Close">
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </div>,
    document.querySelector(".admin-shell") ?? document.body,
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</span>
      <span className="mt-1.5 block">{children}</span>
      {hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl px-3 py-2.5" style={{ background: "var(--bg-secondary)" }}>
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-0.5 text-sm font-semibold tabular">{value}</p>
    </div>
  );
}

function Footer({ busy, submitLabel, danger, onCancel }: { busy: boolean; submitLabel: string; danger?: boolean; onCancel: () => void }) {
  return (
    <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <button type="button" onClick={onCancel} className="btn-outline h-10 px-4 text-sm">Back</button>
      <button
        type="submit"
        disabled={busy}
        className="btn-primary h-10 px-5 text-sm disabled:opacity-60"
        style={danger ? { background: "var(--danger)", borderColor: "var(--danger)", color: "#fff" } : undefined}
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
        {submitLabel}
      </button>
    </div>
  );
}

/**
 * One booking action at a time, in its own dialog. Every action goes through
 * the booking engine; emails are sent by the server and their outcome is shown.
 */
export function BookingActionDialog({
  booking,
  kind,
  onClose,
  onDone,
}: {
  booking: AdminBookingDto;
  kind: BookingActionKind;
  onClose: () => void;
  onDone: (updated: AdminBookingDto | null, removed?: boolean) => void;
}) {
  const { showToast } = useToast();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dueNow = dueNowCents(booking);
  const amountText = formatPrice(dueNow);
  /** Each payment with its own amount, worked out from the booking's schedule. */
  const plan = paymentPlan(booking.paymentSchedule, booking.paidCents);
  const duePercent = booking.totalPriceCents > 0 && dueNow > 0 ? Math.round((dueNow / booking.totalPriceCents) * 100) : null;
  const [instructions, setInstructions] = useState(() =>
    readInstructions(booking.paymentMethod).split("{amount}").join(amountText).split("{code}").join(booking.code),
  );
  const [paymentLink, setPaymentLink] = useState("");
  const [declineMessage, setDeclineMessage] = useState("");
  const [notify, setNotify] = useState(true);
  const [replySubject, setReplySubject] = useState("");
  const [replyMessage, setReplyMessage] = useState(`Dear ${booking.guestName},\n\n`);
  const [cancelReason, setCancelReason] = useState("CANCELLATION");
  const refund = booking.status === "CANCELLED";
  const [payment, setPayment] = useState(() => ({
    amount: ((refund ? booking.paidCents : dueNow) / 100).toFixed(2),
    reference: "",
    method: booking.paymentMethod === "VISA" ? "VISA" : "BANK_TRANSFER",
    receivedAt: new Date(Date.now() - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 16),
  }));

  async function patch(body: unknown): Promise<{ booking: AdminBookingDto | null; email: MailResult }> {
    const response = await adminFetch(
      `/api/admin/bookings/${encodeURIComponent(booking.id)}`,
      { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) },
      ADMIN_BOOKINGS_TIMEOUT_MS,
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? "The action failed.");
    return data;
  }

  /** `done` says what changed; the email outcome is reported separately so a failed send is never hidden. */
  function report(done: string, email: MailResult, retryHint = "") {
    const lead = done ? `${done} ` : "";
    if (!email) showToast("success", done);
    else if (email.sent) showToast("success", `${lead}Email sent to ${email.to}.`);
    else {
      const reason = (email.error ?? "unknown error").replace(/[.\s]+$/, "");
      showToast("warning", `${lead}The email was NOT sent (${reason}).${retryHint}`);
    }
  }

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await action();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "The action failed.");
    } finally {
      setBusy(false);
    }
  }

  const submit = (event: FormEvent) => {
    event.preventDefault();
    void run(async () => {
      if (kind === "confirm") {
        const link = paymentLink.trim();
        const note = instructions.trim();
        if (link && !isSecureLink(link)) throw new Error("Paste the full secure payment link — it starts with https://.");
        if (!link && note.length < 10) throw new Error("Paste the payment link, or write how to pay in the note.");
        if (/\[paste/i.test(note)) throw new Error("Replace the [paste …] placeholder in the note first.");
        const blank = note ? /^\s*(Bank|IBAN|SWIFT[^:\n]*|Account[^:\n]*):[ \t]*$/im.exec(note) : null;
        if (blank) throw new Error(`Fill in “${blank[1]}” in the note before sending the invoice.`);
        const result = await patch({ type: "accept", paymentLink: link || undefined, instructions: note.length >= 10 ? note : undefined });
        if (note) rememberInstructions(booking.paymentMethod, note, amountText, booking.code);
        report(
          booking.acceptedAt ? "" : "Request confirmed.",
          result.email,
          " Use “Resend invoice” to try again.",
        );
        onDone(result.booking);
      } else if (kind === "decline") {
        const result = await patch({ type: "decline", message: declineMessage.trim() || undefined, notify });
        report("Request declined and cabins released.", result.email);
        onDone(result.booking);
      } else if (kind === "reply") {
        const result = await patch({ type: "message", subject: replySubject.trim() || undefined, message: replyMessage.trim() });
        // A reply is only an email: keep the dialog (and the text) open if it did not go.
        if (!result.email?.sent) throw new Error(`The reply was not sent (${(result.email?.error ?? "unknown error").replace(/[.\s]+$/, "")}). Try again.`);
        report("", result.email);
        onDone(result.booking);
      } else if (kind === "send-confirmation") {
        const result = await patch({ type: "send-confirmation" });
        report("", result.email);
        onDone(result.booking);
      } else if (kind === "cancel") {
        const result = await patch({ type: "cancel", reason: cancelReason });
        report("Booking cancelled and cabins released.", null);
        onDone(result.booking);
      } else if (kind === "payment") {
        if (!/^\d+(\.\d{1,2})?$/.test(payment.amount.trim())) throw new Error("Enter the amount in USD, with at most two decimals.");
        const [whole, fraction = ""] = payment.amount.trim().split(".");
        const result = await patch({
          type: "record-payment",
          payment: {
            reference: payment.reference.trim(),
            method: payment.method,
            kind: refund ? "REFUND" : "RECEIPT",
            amountCents: Number(whole) * 100 + Number(fraction.padEnd(2, "0")),
            receivedAt: new Date(payment.receivedAt).toISOString(),
          },
        });
        const nowConfirmed = booking.status !== "CONFIRMED" && result.booking?.status === "CONFIRMED";
        report(
          refund ? "Refund recorded." : nowConfirmed ? "Payment recorded — booking is now confirmed." : "Payment recorded.",
          result.email,
          " Use “Resend confirmation” to try again.",
        );
        onDone(result.booking);
      } else if (kind === "delete") {
        const response = await adminFetch(
          "/api/admin/bookings",
          { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "soft-delete", ids: [booking.id] }) },
          ADMIN_BOOKINGS_TIMEOUT_MS,
        );
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Could not delete the booking.");
        showToast("success", "Booking moved to the recycle bin.");
        onDone(null, true);
      }
    });
  };

  const errorLine = error ? (
    <p role="alert" className="mt-4 rounded-lg px-3 py-2 text-sm" style={{ background: "var(--danger-bg)", color: "var(--danger)" }}>{error}</p>
  ) : null;
  const who = `${booking.guestName} · ${booking.code}`;

  if (kind === "confirm") {
    return (
      <Dialog title={booking.acceptedAt ? "Send the invoice again" : "Confirm & send invoice"} kicker={who} onClose={onClose}>
        <form onSubmit={submit}>
          <p className="text-sm text-muted">
            The amounts are already worked out from the voyage total. Paste your secure payment link: the guest&rsquo;s
            invoice shows the amount due now as a &ldquo;Pay&rdquo; button, with the full payment schedule. The booking turns{" "}
            <strong>Confirmed</strong> automatically when you record a payment that covers the deposit.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Fact label="Pays by" value={paymentMethodLabel(booking.paymentMethod)} />
            <Fact label={duePercent ? `Due now · ${duePercent}%` : "Due now"} value={amountText} />
            <Fact label="Total" value={formatPrice(booking.totalPriceCents)} />
          </div>
          {plan.length > 0 ? (
            <ol className="mt-3 overflow-hidden rounded-xl border text-sm" style={{ borderColor: "var(--border)" }}>
              {plan.map(stage => (
                <li
                  key={stage.milestone}
                  className="flex items-center justify-between gap-3 border-b px-3 py-2 last:border-b-0"
                  style={{ borderColor: "var(--border)", background: stage.state === "due" ? "var(--bg-secondary)" : undefined }}
                >
                  <span className="min-w-0">
                    <span className="block font-medium">
                      {stageTitle(stage.milestone, plan.length)}
                      {booking.totalPriceCents > 0 ? ` · ${Math.round((stage.amountCents / booking.totalPriceCents) * 100)}%` : ""}
                    </span>
                    <span className="block text-xs text-muted">
                      {stage.state === "paid"
                        ? "Paid"
                        : stage.milestone === "INITIAL"
                          ? "With this invoice"
                          : stage.dueAt
                            ? `By ${new Date(stage.dueAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}`
                            : "Before departure"}
                    </span>
                  </span>
                  <span className="shrink-0 font-semibold tabular">{formatPrice(stage.amountCents)}</span>
                </li>
              ))}
            </ol>
          ) : null}
          <div className="mt-5">
            <Field label="Secure payment link" hint={`Paste the link from your payment provider for ${amountText}. The email turns it into a “Pay ${amountText} securely” button.`}>
              <input
                type="url"
                inputMode="url"
                className="input h-11 w-full px-3 text-sm"
                placeholder="https://"
                value={paymentLink}
                onChange={(e) => setPaymentLink(e.target.value)}
                maxLength={2000}
                autoFocus
              />
            </Field>
          </div>
          <div className="mt-4">
            <Field
              label={`Note to the guest (optional)`}
              hint={`Bank details or anything else about paying by ${paymentMethodLabel(booking.paymentMethod)}. Remembered for the next invoice with this payment method.`}
            >
              <textarea
                className="input min-h-[7rem] px-3 py-2.5 text-sm leading-relaxed"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                maxLength={4000}
              />
            </Field>
          </div>
          <p className="mt-3 text-xs text-muted">Sent to {booking.customerEmail}</p>
          {errorLine}
          <Footer busy={busy} submitLabel={booking.acceptedAt ? "Send invoice again" : "Confirm & send invoice"} onCancel={onClose} />
        </form>
      </Dialog>
    );
  }

  if (kind === "decline") {
    return (
      <Dialog title="Decline this request" kicker={who} onClose={onClose}>
        <form onSubmit={submit}>
          <p className="text-sm text-muted">
            The cabins are released for other guests straight away. Declining charges no cancellation fee.
          </p>
          <div className="mt-5">
            <Field label="Note to the guest (optional)" hint="Added to the branded decline email, e.g. suggest other dates.">
              <textarea className="input min-h-[7rem] px-3 py-2.5 text-sm" value={declineMessage} onChange={(e) => setDeclineMessage(e.target.value)} maxLength={4000} />
            </Field>
          </div>
          <label className="mt-4 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} className="h-4 w-4" style={{ accentColor: "var(--accent)" }} />
            Email the guest that the request was declined
          </label>
          {errorLine}
          <Footer busy={busy} submitLabel="Decline request" danger onCancel={onClose} />
        </form>
      </Dialog>
    );
  }

  if (kind === "reply") {
    return (
      <Dialog title={`Reply to ${booking.guestName}`} kicker={booking.code} onClose={onClose}>
        <form onSubmit={submit}>
          <p className="text-sm text-muted">Sent as a branded Hathor email to {booking.customerEmail}. The guest can answer by replying to it.</p>
          <div className="mt-5 space-y-4">
            <Field label="Subject" hint="Leave empty to use “A message about your Hathor booking …”.">
              <input className="input h-10 px-3 text-sm" value={replySubject} onChange={(e) => setReplySubject(e.target.value)} maxLength={200} placeholder={`A message about your Hathor booking ${booking.code}`} />
            </Field>
            <Field label="Message">
              <textarea className="input min-h-[12rem] px-3 py-2.5 text-sm leading-relaxed" value={replyMessage} onChange={(e) => setReplyMessage(e.target.value)} required minLength={2} maxLength={4000} />
            </Field>
          </div>
          {errorLine}
          <Footer busy={busy} submitLabel="Send reply" onCancel={onClose} />
        </form>
      </Dialog>
    );
  }

  if (kind === "payment") {
    return (
      <Dialog title={refund ? "Record a refund" : "Record a payment"} kicker={who} onClose={onClose}>
        <form onSubmit={submit}>
          <p className="text-sm text-muted">
            {refund
              ? "Records money already refunded to the guest. Nothing is charged or moved."
              : booking.status === "REQUESTED" && !booking.acceptedAt
                ? "Records money already received. Confirm the request as well — the booking is confirmed once it is accepted and the deposit is covered."
                : "Records money already received. When the payments cover the deposit, the booking is confirmed and the guest gets the confirmation email with the remaining schedule."}
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Fact label="Received" value={formatPrice(booking.paidCents)} />
            <Fact label="Deposit" value={formatPrice(booking.depositCents ?? booking.totalPriceCents)} />
            <Fact label="Total" value={formatPrice(booking.totalPriceCents)} />
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Amount (USD)">
              <input className="input h-10 px-3 text-sm tabular" inputMode="decimal" value={payment.amount} onChange={(e) => setPayment({ ...payment, amount: e.target.value })} required />
            </Field>
            <Field label="Method">
              <select className="input h-10 px-3 text-sm" value={payment.method} onChange={(e) => setPayment({ ...payment, method: e.target.value })}>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="VISA">Visa</option>
              </select>
            </Field>
            <Field label="Bank / processor reference" hint="Unique; at least 6 characters.">
              <input className="input h-10 px-3 text-sm" value={payment.reference} onChange={(e) => setPayment({ ...payment, reference: e.target.value })} required minLength={6} maxLength={128} />
            </Field>
            <Field label={refund ? "Refunded on" : "Received on"}>
              <input className="input h-10 px-3 text-sm" type="datetime-local" value={payment.receivedAt} onChange={(e) => setPayment({ ...payment, receivedAt: e.target.value })} required />
            </Field>
          </div>
          {errorLine}
          <Footer busy={busy} submitLabel={refund ? "Record refund" : "Record payment"} onCancel={onClose} />
        </form>
      </Dialog>
    );
  }

  if (kind === "cancel") {
    return (
      <Dialog title="Cancel this booking" kicker={who} onClose={onClose}>
        <form onSubmit={submit}>
          <p className="text-sm text-muted">
            The cabins are released. The cancellation fee follows your policy for the reason and how close departure is; refunds are recorded separately.
          </p>
          <div className="mt-5">
            <Field label="Reason">
              <select className="input h-10 px-3 text-sm" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}>
                <option value="CANCELLATION">Guest cancelled</option>
                <option value="NO_SHOW">No-show</option>
                <option value="EARLY_DEPARTURE">Early departure</option>
              </select>
            </Field>
          </div>
          {errorLine}
          <Footer busy={busy} submitLabel="Cancel booking" danger onCancel={onClose} />
        </form>
      </Dialog>
    );
  }

  if (kind === "send-confirmation") {
    return (
      <Dialog title="Send the confirmation again" kicker={who} onClose={onClose}>
        <form onSubmit={submit}>
          <p className="text-sm text-muted">
            Emails {booking.customerEmail} the confirmation with the amount received ({formatPrice(booking.paidCents)}) and the remaining payment schedule.
          </p>
          {errorLine}
          <Footer busy={busy} submitLabel="Send confirmation" onCancel={onClose} />
        </form>
      </Dialog>
    );
  }

  return (
    <Dialog title="Delete this booking" kicker={who} onClose={onClose}>
      <form onSubmit={submit}>
        <p className="text-sm text-muted">
          {booking.status === "CONFIRMED"
            ? "The booking is cancelled under your cancellation policy, its cabins are released, and it moves to the recycle bin."
            : booking.status === "REQUESTED" || booking.status === "PENDING_HOLD"
              ? "The request is declined without a fee, its cabins are released, and it moves to the recycle bin. No email is sent."
              : "The booking moves to the recycle bin."}{" "}
          You can restore it from the bin, or delete it for good there.
        </p>
        {errorLine}
        <Footer busy={busy} submitLabel="Move to recycle bin" danger onCancel={onClose} />
      </form>
    </Dialog>
  );
}

/** Which actions make sense for a booking at its current stage, in priority order. */
export function bookingActionsFor(booking: AdminBookingDto): { primary: BookingActionKind[]; secondary: BookingActionKind[] } {
  const canEmail = booking.customerEmail !== "—";
  const reply: BookingActionKind[] = canEmail ? ["reply"] : [];
  switch (booking.stage) {
    case "new":
      return { primary: ["confirm", "decline"], secondary: [...reply, "payment", "delete"] };
    case "invoiced":
      return { primary: ["payment", "decline"], secondary: [...reply, "confirm", "delete"] };
    case "confirmed":
      return { primary: ["payment", ...reply], secondary: ["send-confirmation", "cancel", "delete"] };
    case "paid":
      return { primary: reply, secondary: ["send-confirmation", "cancel", "delete"] };
    case "cancelled":
    case "declined":
      return { primary: reply, secondary: [...(booking.paidCents > 0 ? ["payment" as const] : []), "delete"] };
    default:
      return { primary: [], secondary: ["delete"] };
  }
}

export function actionLabel(kind: BookingActionKind, booking: AdminBookingDto): string {
  switch (kind) {
    case "confirm":
      return booking.acceptedAt ? "Resend invoice" : "Confirm & send invoice";
    case "decline":
      return "Decline";
    case "reply":
      return "Reply";
    case "payment":
      return booking.status === "CANCELLED" ? "Record refund" : "Record payment";
    case "cancel":
      return "Cancel booking";
    case "delete":
      return "Delete";
    case "send-confirmation":
      return "Resend confirmation";
  }
}
