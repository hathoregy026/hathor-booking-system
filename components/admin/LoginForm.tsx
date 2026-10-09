"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import {
  Check,
  Copy,
  Download,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { HATHOR_ADMIN_LOGIN_ICON_SRC, HATHOR_BRAND_NAME } from "@/lib/branding";
import { AdminThemeProvider, useAdminTheme } from "./ThemeProvider";
import { ThemeToggle } from "./ThemeToggle";

type LoginFormProps = {
  redirectTo?: string;
};

type Step =
  | { name: "credentials" }
  | { name: "code"; useRecovery: boolean }
  | { name: "enroll" }
  | { name: "recovery-codes"; codes: string[] }
  | { name: "low-recovery"; left: number };

type Enrollment = { account: string; qrCode: string; manualKey: string };

/**
 * `redirectTo` comes from the `?from=` query param, which is attacker-
 * controlled (anyone can send a victim a crafted login link). Only ever
 * navigate to a same-origin relative path — a `javascript:` URI or an
 * absolute `https://evil.example/...` value would otherwise run script or
 * phish in the context of a session that just authenticated successfully.
 */
function safeRedirectPath(candidate: string): string {
  if (
    candidate.startsWith("/") &&
    !candidate.startsWith("//") &&
    !candidate.includes("\\") &&
    !/[\u0000-\u001f]/.test(candidate)
  ) {
    return candidate;
  }
  return "/admin";
}

async function postJson(url: string, body: unknown) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    cache: "no-store",
    body: JSON.stringify(body),
  });
  const data = (await response.json().catch(() => null)) as Record<string, unknown> | null;
  return { ok: response.ok, data: data ?? {} };
}

function errorText(data: Record<string, unknown>, fallback: string): string {
  return typeof data.error === "string" ? data.error : fallback;
}

function LoginFormInner({ redirectTo = "/admin" }: LoginFormProps) {
  const { theme } = useAdminTheme();
  const [step, setStep] = useState<Step>({ name: "credentials" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [savedCodes, setSavedCodes] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const focusRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    focusRef.current?.focus();
  }, [step]);

  const goToDashboard = () => {
    // Full navigation so the new session cookie drives a fresh server render.
    window.location.replace(safeRedirectPath(redirectTo));
  };

  const restart = (message: string) => {
    setPassword("");
    setCode("");
    setEnrollment(null);
    setNotice(message);
    setError(null);
    setStep({ name: "credentials" });
  };

  const loadEnrollment = async () => {
    const response = await fetch("/api/admin/login/enroll", {
      credentials: "same-origin",
      cache: "no-store",
    });
    const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    if (!response.ok) {
      restart(errorText(data, "Your sign-in timed out. Please enter your password again."));
      return;
    }
    setEnrollment(data as unknown as Enrollment);
    setStep({ name: "enroll" });
  };

  const submitCredentials = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setNotice(null);
    try {
      const { ok, data } = await postJson("/api/admin/login", { email, password });
      if (!ok) {
        setError(errorText(data, "Sign-in failed."));
        return;
      }
      // The password has done its job; do not keep it in memory.
      setPassword("");
      setCode("");
      if (data.next === "enroll") {
        await loadEnrollment();
      } else {
        setStep({ name: "code", useRecovery: false });
      }
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const submitCode = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const { ok, data } = await postJson("/api/admin/login/mfa", { code });
      if (!ok) {
        if (data.restart) {
          restart(errorText(data, "Please sign in again."));
        } else {
          setCode("");
          setError(errorText(data, "That code didn't work."));
        }
        return;
      }
      if (typeof data.recoveryCodesLeft === "number") {
        setStep({ name: "low-recovery", left: data.recoveryCodesLeft });
        return;
      }
      goToDashboard();
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const submitEnrollment = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const { ok, data } = await postJson("/api/admin/login/enroll", { code });
      if (!ok) {
        if (data.restart) {
          restart(errorText(data, "Please sign in again."));
        } else {
          setCode("");
          setError(errorText(data, "That code didn't match."));
        }
        return;
      }
      setEnrollment(null);
      setStep({ name: "recovery-codes", codes: (data.recoveryCodes as string[]) ?? [] });
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const recoveryText = (codes: string[]) =>
    [
      `${HATHOR_BRAND_NAME} dashboard recovery codes`,
      `Account: ${email}`,
      "Each code works once. Keep them somewhere safe and offline.",
      "",
      ...codes,
    ].join("\n");

  const copyCodes = async (codes: string[]) => {
    try {
      await navigator.clipboard.writeText(recoveryText(codes));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Copy failed. Download the codes or write them down instead.");
    }
  };

  const downloadCodes = (codes: string[]) => {
    const url = URL.createObjectURL(new Blob([recoveryText(codes)], { type: "text/plain" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "hathor-dashboard-recovery-codes.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  const heading: Record<Step["name"], string> = {
    credentials: `Welcome to ${HATHOR_BRAND_NAME}`,
    code: "Two-step verification",
    enroll: "Set up your authenticator",
    "recovery-codes": "Save your recovery codes",
    "low-recovery": "Recovery code accepted",
  };

  const codeIsRecovery = step.name === "code" && step.useRecovery;

  return (
    <div className="admin-login-shell relative" data-theme={theme}>
      <div className="admin-shell__glow" aria-hidden />

      <div className="relative z-10 flex min-h-screen flex-col">
        <div className="flex justify-end p-4 sm:p-6">
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center px-4 pb-12">
          <div className="admin-login-card w-full max-w-md p-6 sm:p-10">
            <div className="mb-6 text-center sm:mb-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={HATHOR_ADMIN_LOGIN_ICON_SRC}
                alt=""
                aria-hidden
                className="mx-auto mb-4 h-16 w-auto object-contain sm:mb-5"
              />
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                {heading[step.name]}
              </h1>
            </div>

            {notice && (
              <p
                role="status"
                className="mb-5 rounded-xl border px-4 py-3 text-sm"
                style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
              >
                {notice}
              </p>
            )}

            {step.name === "credentials" && (
              <form onSubmit={submitCredentials} className="space-y-5">
                <div>
                  <label htmlFor="admin-email" className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <Mail className="h-4 w-4" style={{ color: "var(--text-muted)" }} aria-hidden />
                    Email
                  </label>
                  <input
                    ref={focusRef}
                    id="admin-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    maxLength={254}
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    className="admin-input w-full px-4 py-3 text-sm"
                    placeholder="you@hathorcruise.com"
                  />
                </div>
                <div>
                  <label htmlFor="admin-password" className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <Lock className="h-4 w-4" style={{ color: "var(--text-muted)" }} aria-hidden />
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="admin-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                      maxLength={128}
                      autoComplete="current-password"
                      className="admin-input w-full py-3 pl-4 pr-12 text-sm"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute inset-y-0 right-0 flex w-12 items-center justify-center"
                      style={{ color: "var(--text-muted)" }}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      aria-pressed={showPassword}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
                    </button>
                  </div>
                </div>
                <ErrorMessage error={error} />
                <SubmitButton isLoading={isLoading} label="Continue" busyLabel="Checking..." />
              </form>
            )}

            {step.name === "code" && (
              <form onSubmit={submitCode} className="space-y-5">
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {codeIsRecovery
                    ? "Enter one of the recovery codes you saved when you set up your account. Each code works once."
                    : "Open your authenticator app and enter the 6-digit code for Hathor Dashboard."}
                </p>
                <div>
                  <label htmlFor="admin-code" className="mb-2 flex items-center gap-2 text-sm font-medium">
                    {codeIsRecovery ? (
                      <KeyRound className="h-4 w-4" style={{ color: "var(--text-muted)" }} aria-hidden />
                    ) : (
                      <Smartphone className="h-4 w-4" style={{ color: "var(--text-muted)" }} aria-hidden />
                    )}
                    {codeIsRecovery ? "Recovery code" : "Authentication code"}
                  </label>
                  <input
                    ref={focusRef}
                    key={codeIsRecovery ? "recovery" : "totp"}
                    id="admin-code"
                    type="text"
                    value={code}
                    onChange={(event) =>
                      setCode(
                        codeIsRecovery
                          ? event.target.value.slice(0, 16)
                          : event.target.value.replace(/\D/g, "").slice(0, 6),
                      )
                    }
                    required
                    inputMode={codeIsRecovery ? "text" : "numeric"}
                    autoComplete={codeIsRecovery ? "off" : "one-time-code"}
                    autoCapitalize="none"
                    spellCheck={false}
                    pattern={codeIsRecovery ? undefined : "\\d{6}"}
                    className="admin-input w-full px-4 py-3 text-center font-mono text-lg tracking-[0.35em]"
                    placeholder={codeIsRecovery ? "xxxxx-xxxxx" : "000000"}
                  />
                </div>
                <ErrorMessage error={error} />
                <SubmitButton isLoading={isLoading} label="Verify and sign in" busyLabel="Verifying..." />
                <button
                  type="button"
                  className="admin-inline-link block w-full text-center text-sm"
                  onClick={() => {
                    setCode("");
                    setError(null);
                    setStep({ name: "code", useRecovery: !codeIsRecovery });
                  }}
                >
                  {codeIsRecovery ? "Use my authenticator app instead" : "Lost your phone? Use a recovery code"}
                </button>
              </form>
            )}

            {step.name === "enroll" && enrollment && (
              <form onSubmit={submitEnrollment} className="space-y-5">
                <ol className="list-decimal space-y-1 pl-5 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  <li>Install an authenticator app (Google Authenticator, Microsoft Authenticator, 1Password…).</li>
                  <li>Scan this QR code with it.</li>
                  <li>Enter the 6-digit code it shows.</li>
                </ol>
                <div className="flex justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={enrollment.qrCode}
                    alt={`QR code to add ${enrollment.account} to your authenticator app`}
                    width={200}
                    height={200}
                    className="rounded-xl bg-white p-2"
                  />
                </div>
                <details className="text-sm">
                  <summary className="cursor-pointer" style={{ color: "var(--text-secondary)" }}>
                    Can&apos;t scan? Enter this key instead
                  </summary>
                  <p className="mt-2 break-all rounded-lg border px-3 py-2 font-mono text-sm" style={{ borderColor: "var(--border)" }}>
                    {enrollment.manualKey}
                  </p>
                  <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                    Account: {enrollment.account} · Time-based · 6 digits
                  </p>
                </details>
                <div>
                  <label htmlFor="admin-enroll-code" className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <Smartphone className="h-4 w-4" style={{ color: "var(--text-muted)" }} aria-hidden />
                    Code from your app
                  </label>
                  <input
                    ref={focusRef}
                    id="admin-enroll-code"
                    type="text"
                    value={code}
                    onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                    required
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="\d{6}"
                    className="admin-input w-full px-4 py-3 text-center font-mono text-lg tracking-[0.35em]"
                    placeholder="000000"
                  />
                </div>
                <ErrorMessage error={error} />
                <SubmitButton isLoading={isLoading} label="Confirm and continue" busyLabel="Confirming..." />
              </form>
            )}

            {step.name === "recovery-codes" && (
              <div className="space-y-5">
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  If you lose your phone, these codes are the only way back in. Each one works
                  once. Store them offline (a password manager or printed copy). They will not be
                  shown again.
                </p>
                <ul
                  className="grid grid-cols-2 gap-2 rounded-xl border p-4 font-mono text-sm"
                  style={{ borderColor: "var(--border)" }}
                  aria-label="Recovery codes"
                >
                  {step.codes.map((recoveryCode) => (
                    <li key={recoveryCode} className="text-center tracking-wider">
                      {recoveryCode}
                    </li>
                  ))}
                </ul>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => copyCodes(step.codes)}
                    className="admin-btn-outline flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm"
                  >
                    {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadCodes(step.codes)}
                    className="admin-btn-outline flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm"
                  >
                    <Download className="h-4 w-4" aria-hidden />
                    Download
                  </button>
                </div>
                <label className="flex items-start gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={savedCodes}
                    onChange={(event) => setSavedCodes(event.target.checked)}
                    className="mt-0.5 h-4 w-4"
                    style={{ accentColor: "var(--accent)" }}
                  />
                  I have saved these codes somewhere safe.
                </label>
                <ErrorMessage error={error} />
                <button
                  type="button"
                  disabled={!savedCodes}
                  onClick={goToDashboard}
                  className="admin-btn-primary flex w-full items-center justify-center gap-2 px-4 py-3.5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <ShieldCheck className="h-4 w-4" aria-hidden />
                  Go to the dashboard
                </button>
              </div>
            )}

            {step.name === "low-recovery" && (
              <div className="space-y-5">
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  You have <strong>{step.left}</strong> recovery {step.left === 1 ? "code" : "codes"} left.
                  If your phone is lost, sign out of it everywhere and create new recovery codes
                  under Settings → Security.
                </p>
                <button
                  type="button"
                  onClick={goToDashboard}
                  className="admin-btn-primary flex w-full items-center justify-center gap-2 px-4 py-3.5 text-sm"
                >
                  Continue to the dashboard
                </button>
              </div>
            )}

            {(step.name === "code" || step.name === "enroll") && (
              <button
                type="button"
                className="mt-4 block w-full text-center text-xs"
                style={{ color: "var(--text-muted)" }}
                onClick={() => restart("Enter your email and password to start again.")}
              >
                Start over
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorMessage({ error }: { error: string | null }) {
  return (
    <div aria-live="assertive">
      {error && (
        <p
          role="alert"
          className="rounded-xl border px-4 py-3 text-sm"
          style={{
            borderColor: "var(--danger)",
            background: "var(--danger-bg)",
            color: "var(--danger)",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

function SubmitButton({
  isLoading,
  label,
  busyLabel,
}: {
  isLoading: boolean;
  label: string;
  busyLabel: string;
}) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className="admin-btn-primary flex w-full items-center justify-center gap-2 px-4 py-3.5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          {busyLabel}
        </>
      ) : (
        label
      )}
    </button>
  );
}

export function LoginForm(props: LoginFormProps) {
  return (
    <AdminThemeProvider>
      <LoginFormInner {...props} />
    </AdminThemeProvider>
  );
}
