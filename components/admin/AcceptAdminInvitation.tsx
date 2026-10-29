"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export function AcceptAdminInvitation() {
  const initialized = useRef(false);
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const value = new URLSearchParams(window.location.hash.slice(1)).get("token") ?? "";
    window.history.replaceState(null, "", window.location.pathname);
    if (!/^[a-f0-9]{64}$/.test(value)) {
      queueMicrotask(() => setError("This setup link is incomplete. Ask your administrator for a new one."));
      return;
    }
    queueMicrotask(() => setToken(value));
    void fetch("/api/admin/accept-invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: value, intent: "lookup" }),
    })
      .then(async response => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "This setup link could not be opened.");
        if (typeof result.email !== "string" || typeof result.displayName !== "string") {
          throw new Error("This setup link could not be opened.");
        }
        setEmail(result.email);
        setDisplayName(result.displayName);
        setReady(true);
      })
      .catch(failure => {
        setToken("");
        setError(failure instanceof Error ? failure.message : "This setup link could not be opened.");
      });
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (password !== repeat) {
      setError("The passwords do not match.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/accept-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, displayName, password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Password setup failed.");
      setToken("");
      setPassword("");
      setRepeat("");
      setDone(true);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Password setup failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div data-theme="night" className="admin-shell min-h-screen flex items-center justify-center p-6">
      <section className="card w-full max-w-md p-8">
        <h1 className="admin-page-title">Your Hathor sign-in</h1>
        {done ? (
          <>
            <p className="my-5">Your password is ready. Sign in using {email}. You will also need your authenticator, or be asked to set one up.</p>
            <Link href="/admin/login" className="btn-primary">Continue to sign in</Link>
          </>
        ) : (
          <form className="mt-6 space-y-5" onSubmit={submit}>
            <p className="text-muted">This invitation is only for the email below. Choose the name the dashboard should show, then a unique password of at least 14 characters.</p>
            {error && <p role="alert" style={{ color: "var(--danger)" }}>{error}</p>}
            {ready ? (
              <>
                <p className="text-sm"><span className="text-muted">Invited email</span><br /><strong>{email}</strong></p>
                <label className="block">
                  Your name
                  <input className="input mt-2 w-full" type="text" autoComplete="name" required minLength={1} maxLength={80} value={displayName} onChange={event => setDisplayName(event.target.value)} />
                </label>
                <label className="block">
                  New password
                  <input className="input mt-2 w-full" type="password" autoComplete="new-password" required minLength={14} maxLength={128} value={password} onChange={event => setPassword(event.target.value)} />
                </label>
                <label className="block">
                  Repeat password
                  <input className="input mt-2 w-full" type="password" autoComplete="new-password" required minLength={14} maxLength={128} value={repeat} onChange={event => setRepeat(event.target.value)} />
                </label>
                <button className="btn-primary w-full" type="submit" disabled={busy || !token}>{busy ? "Saving…" : "Save my sign-in"}</button>
              </>
            ) : !error && <p className="text-muted">Checking this invitation…</p>}
          </form>
        )}
      </section>
    </div>
  );
}
