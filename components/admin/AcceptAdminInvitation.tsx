"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
export function AcceptAdminInvitation() {
  const initialized = useRef(false);
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const value = new URLSearchParams(window.location.hash.slice(1)).get("token") ?? "";
    if (/^[a-f0-9]{64}$/.test(value)) setToken(value); // eslint-disable-line react-hooks/set-state-in-effect -- Hydrate the private browser fragment; it is unavailable to the server.
    else setError("This setup link is incomplete. Ask your administrator for a new one.");
    // Remove the secret from the address bar; never send it as a query string.
    window.history.replaceState(null, "", window.location.pathname);
  }, []);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (password !== repeat) { setError("The passwords do not match."); return; }
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/admin/accept-invite", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Password setup failed.");
      setToken(""); setPassword(""); setRepeat(""); setDone(true);
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Password setup failed."); }
    finally { setBusy(false); }
  }
  return <div data-theme="night" className="admin-shell min-h-screen flex items-center justify-center p-6">
    <section className="card w-full max-w-md p-8"><h1 className="admin-page-title">Your Hathor sign-in</h1>
      {done ? <><p className="my-5">Your password is ready. Sign in using your email. You will also need your authenticator, or be asked to set one up.</p><Link href="/admin/login" className="btn-primary">Continue to sign in</Link></> :
      <form className="space-y-5 mt-6" onSubmit={submit}>
        <p className="text-muted">Choose a unique password of at least 14 characters. Use a password manager to save it.</p>
        {error && <p role="alert" style={{ color: "var(--danger)" }}>{error}</p>}
        <label className="block">New password<input className="input mt-2 w-full" type="password" autoComplete="new-password" required minLength={14} maxLength={128} value={password} onChange={event => setPassword(event.target.value)} /></label>
        <label className="block">Repeat password<input className="input mt-2 w-full" type="password" autoComplete="new-password" required minLength={14} maxLength={128} value={repeat} onChange={event => setRepeat(event.target.value)} /></label>
        <button className="btn-primary w-full" type="submit" disabled={busy || !token}>{busy ? "Saving…" : "Set my password"}</button>
      </form>}
    </section>
  </div>;
}
