"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Check, Copy, Download, Loader2, LogOut, MonitorSmartphone } from "lucide-react";

type SecuritySession = {
  id: string;
  current: boolean;
  createdAt: string;
  lastSeenAt: string;
  ip: string | null;
  userAgent: string | null;
};

type SecurityEvent = { id: string; type: string; ip: string | null; createdAt: string };

type SecurityState = {
  user: { email: string; displayName: string; mfaEnrolledAt: string | null; passwordChangedAt: string };
  recoveryCodesLeft: number;
  sessions: SecuritySession[];
  events: SecurityEvent[];
};

const EVENT_LABELS: Record<string, string> = {
  LOGIN_PASSWORD_OK: "Password accepted",
  LOGIN_PASSWORD_FAILED: "Wrong password",
  LOGIN_DISABLED_ACCOUNT: "Sign-in to disabled account",
  MFA_OK: "Signed in",
  MFA_FAILED: "Wrong code",
  MFA_ATTEMPTS_EXHAUSTED: "Too many wrong codes",
  RECOVERY_CODE_USED: "Recovery code used",
  MFA_ENROLLED: "Authenticator set up",
  LOGOUT: "Signed out",
  SESSION_REVOKED: "Session ended remotely",
  PASSWORD_CHANGED: "Password changed",
  RECOVERY_CODES_REGENERATED: "New recovery codes",
};

function describeDevice(userAgent: string | null): string {
  if (!userAgent) return "Unknown device";
  const browser = /Edg\//.test(userAgent)
    ? "Edge"
    : /Firefox\//.test(userAgent)
      ? "Firefox"
      : /Chrome\//.test(userAgent)
        ? "Chrome"
        : /Safari\//.test(userAgent)
          ? "Safari"
          : "Browser";
  const os = /iPhone|iPad/.test(userAgent)
    ? "iPhone / iPad"
    : /Android/.test(userAgent)
      ? "Android"
      : /Mac OS X/.test(userAgent)
        ? "macOS"
        : /Windows/.test(userAgent)
          ? "Windows"
          : /Linux/.test(userAgent)
            ? "Linux"
            : "";
  return os ? `${browser} on ${os}` : browser;
}

function formatWhen(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

async function securityRequest(body: unknown) {
  const response = await fetch("/api/admin/security", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    cache: "no-store",
    body: JSON.stringify(body),
  });
  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  return { ok: response.ok, status: response.status, data };
}

async function fetchSecurityState(): Promise<SecurityState | "unauthorized" | null> {
  try {
    const response = await fetch("/api/admin/security", { credentials: "same-origin", cache: "no-store" });
    if (response.status === 401) return "unauthorized";
    if (!response.ok) return null;
    return (await response.json()) as SecurityState;
  } catch {
    return null;
  }
}

function goToLogin() {
  window.location.replace("/admin/login");
}

function Feedback({ message, tone }: { message: string | null; tone: "error" | "ok" }) {
  if (!message) return null;
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className="rounded-lg border px-3 py-2 text-sm"
      style={
        tone === "error"
          ? { borderColor: "var(--danger)", background: "var(--danger-bg)", color: "var(--danger)" }
          : { borderColor: "var(--success)", background: "var(--success-bg)", color: "var(--success)" }
      }
    >
      {message}
    </p>
  );
}

export function AdminSecurityPanel() {
  const [state, setState] = useState<SecurityState | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordCode, setPasswordCode] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

  const [recoveryCode, setRecoveryCode] = useState("");
  const [recoveryMessage, setRecoveryMessage] = useState<string | null>(null);
  const [newCodes, setNewCodes] = useState<string[] | null>(null);
  const [copied, setCopied] = useState(false);

  const [sessionMessage, setSessionMessage] = useState<string | null>(null);

  const apply = useCallback((result: SecurityState | "unauthorized" | null) => {
    if (result === "unauthorized") return goToLogin();
    if (!result) {
      setLoadError("Security settings could not be loaded. Refresh to try again.");
      return;
    }
    setState(result);
    setLoadError(null);
  }, []);

  const load = useCallback(async () => apply(await fetchSecurityState()), [apply]);

  useEffect(() => {
    let cancelled = false;
    void fetchSecurityState().then((result) => {
      if (!cancelled) apply(result);
    });
    return () => {
      cancelled = true;
    };
  }, [apply]);

  const revokeSession = async (sessionId: string) => {
    setBusy(`session:${sessionId}`);
    setSessionMessage(null);
    const { ok, status, data } = await securityRequest({ action: "revoke-session", sessionId });
    setBusy(null);
    if (status === 401 || data.signedOut) return goToLogin();
    if (!ok) return setSessionMessage("That session could not be ended.");
    await load();
  };

  const revokeOthers = async () => {
    setBusy("others");
    setSessionMessage(null);
    const { ok, status, data } = await securityRequest({ action: "revoke-others" });
    setBusy(null);
    if (status === 401) return goToLogin();
    if (!ok) return setSessionMessage("Other sessions could not be ended.");
    setSessionMessage(`Signed out ${String(data.revoked ?? 0)} other session(s).`);
    await load();
  };

  const changePassword = async (event: FormEvent) => {
    event.preventDefault();
    setPasswordMessage(null);
    if (newPassword !== confirmPassword) {
      setPasswordMessage("The new passwords do not match.");
      return;
    }
    setBusy("password");
    const { ok, status, data } = await securityRequest({
      action: "change-password",
      currentPassword,
      newPassword,
      code: passwordCode,
    });
    setBusy(null);
    setPasswordCode("");
    if (ok && data.signedOut) return goToLogin();
    if (status === 401) return goToLogin();
    setPasswordMessage(typeof data.error === "string" ? data.error : "The password could not be changed.");
  };

  const regenerateCodes = async (event: FormEvent) => {
    event.preventDefault();
    setRecoveryMessage(null);
    setBusy("recovery");
    const { ok, status, data } = await securityRequest({
      action: "regenerate-recovery-codes",
      code: recoveryCode,
    });
    setBusy(null);
    setRecoveryCode("");
    if (status === 401) return goToLogin();
    if (!ok) {
      setRecoveryMessage(typeof data.error === "string" ? data.error : "New codes could not be created.");
      return;
    }
    setNewCodes((data.recoveryCodes as string[]) ?? []);
    await load();
  };

  const codesText = (codes: string[]) =>
    ["HATHOR dashboard recovery codes", `Account: ${state?.user.email ?? ""}`, "Each code works once.", "", ...codes].join("\n");

  if (loadError) return <Feedback message={loadError} tone="error" />;
  if (!state) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Loading security settings…
      </p>
    );
  }

  return (
    <div className="space-y-8 text-sm">
      <section className="space-y-1">
        <p>
          Signed in as <strong>{state.user.email}</strong>
        </p>
        <p className="text-muted">
          Two-step verification is on
          {state.user.mfaEnrolledAt ? ` since ${formatWhen(state.user.mfaEnrolledAt)}` : ""}. Sessions end
          after 30 minutes of inactivity and always after 12 hours.
        </p>
      </section>

      <section className="space-y-3" aria-labelledby="security-sessions">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 id="security-sessions" className="font-semibold">Where you&apos;re signed in</h3>
          {state.sessions.length > 1 && (
            <button
              type="button"
              onClick={revokeOthers}
              disabled={busy !== null}
              className="btn-outline h-9 px-3 text-sm"
            >
              Sign out everywhere else
            </button>
          )}
        </div>
        <ul className="divide-y rounded-lg border" style={{ borderColor: "var(--border)" }}>
          {state.sessions.map((session) => (
            <li
              key={session.id}
              className="flex flex-wrap items-center justify-between gap-3 px-3 py-3"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="flex min-w-0 items-start gap-3">
                <MonitorSmartphone className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--accent)" }} aria-hidden />
                <div className="min-w-0">
                  <p className="font-medium">
                    {describeDevice(session.userAgent)}
                    {session.current && (
                      <span className="ml-2 rounded px-1.5 py-0.5 text-xs" style={{ background: "var(--success-bg)", color: "var(--success)" }}>
                        This device
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted">
                    {session.ip ?? "IP unknown"} · active {formatWhen(session.lastSeenAt)} · signed in {formatWhen(session.createdAt)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => revokeSession(session.id)}
                disabled={busy !== null}
                className="btn-outline h-9 px-3 text-sm"
              >
                <LogOut className="h-4 w-4" aria-hidden />
                {session.current ? "Sign out" : "End session"}
              </button>
            </li>
          ))}
        </ul>
        <Feedback message={sessionMessage} tone="ok" />
      </section>

      <section className="space-y-3" aria-labelledby="security-password">
        <h3 id="security-password" className="font-semibold">Change password</h3>
        <p className="text-muted">
          At least 14 characters; a short sentence works well. Every device, this one included, is
          signed out afterwards.
        </p>
        <form onSubmit={changePassword} className="grid gap-3 sm:grid-cols-2">
          <input type="email" value={state.user.email} autoComplete="username" readOnly hidden />
          <label className="space-y-1 sm:col-span-2">
            <span className="block font-medium">Current password</span>
            <input
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              autoComplete="current-password"
              required
              maxLength={128}
              className="admin-input w-full px-3 py-2"
            />
          </label>
          <label className="space-y-1">
            <span className="block font-medium">New password</span>
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              autoComplete="new-password"
              required
              minLength={14}
              maxLength={128}
              className="admin-input w-full px-3 py-2"
            />
          </label>
          <label className="space-y-1">
            <span className="block font-medium">Repeat new password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              required
              minLength={14}
              maxLength={128}
              className="admin-input w-full px-3 py-2"
            />
          </label>
          <label className="space-y-1 sm:col-span-2">
            <span className="block font-medium">Authenticator code (or a recovery code)</span>
            <input
              type="text"
              value={passwordCode}
              onChange={(event) => setPasswordCode(event.target.value.slice(0, 16))}
              autoComplete="one-time-code"
              inputMode="text"
              required
              className="admin-input w-full px-3 py-2 font-mono tracking-widest"
            />
          </label>
          <div className="space-y-3 sm:col-span-2">
            <Feedback message={passwordMessage} tone="error" />
            <button type="submit" disabled={busy !== null} className="btn-primary px-4">
              {busy === "password" && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              Change password
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-3" aria-labelledby="security-recovery">
        <h3 id="security-recovery" className="font-semibold">Recovery codes</h3>
        <p className="text-muted">
          {state.recoveryCodesLeft} of 10 unused. Creating new codes cancels all the old ones.
        </p>
        {newCodes ? (
          <div className="space-y-3">
            <ul className="grid grid-cols-2 gap-2 rounded-lg border p-3 font-mono" style={{ borderColor: "var(--border)" }}>
              {newCodes.map((code) => (
                <li key={code} className="text-center tracking-wider">{code}</li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-outline h-9 px-3 text-sm"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(codesText(newCodes));
                    setCopied(true);
                    window.setTimeout(() => setCopied(false), 2000);
                  } catch {
                    setRecoveryMessage("Copy failed. Download or write the codes down.");
                  }
                }}
              >
                {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
                {copied ? "Copied" : "Copy"}
              </button>
              <button
                type="button"
                className="btn-outline h-9 px-3 text-sm"
                onClick={() => {
                  const url = URL.createObjectURL(new Blob([codesText(newCodes)], { type: "text/plain" }));
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = "hathor-dashboard-recovery-codes.txt";
                  link.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <Download className="h-4 w-4" aria-hidden /> Download
              </button>
              <button type="button" className="btn-outline h-9 px-3 text-sm" onClick={() => setNewCodes(null)}>
                I&apos;ve saved them
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={regenerateCodes} className="flex flex-wrap items-end gap-3">
            <label className="space-y-1">
              <span className="block font-medium">Authenticator code</span>
              <input
                type="text"
                value={recoveryCode}
                onChange={(event) => setRecoveryCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="\d{6}"
                required
                className="admin-input w-40 px-3 py-2 font-mono tracking-widest"
              />
            </label>
            <button type="submit" disabled={busy !== null} className="btn-outline px-4">
              {busy === "recovery" && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              Create new codes
            </button>
          </form>
        )}
        <Feedback message={recoveryMessage} tone="error" />
      </section>

      <section className="space-y-3" aria-labelledby="security-activity">
        <h3 id="security-activity" className="font-semibold">Recent activity</h3>
        <ul className="space-y-1">
          {state.events.map((event) => (
            <li key={event.id} className="flex flex-col gap-0.5 text-xs sm:flex-row sm:justify-between sm:gap-2">
              <span>{EVENT_LABELS[event.type] ?? event.type}</span>
              <span className="text-muted">
                {event.ip ?? "IP unknown"} · {formatWhen(event.createdAt)}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
