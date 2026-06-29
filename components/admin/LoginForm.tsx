"use client";

import { FormEvent, useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { HATHOR_ADMIN_LOGIN_ICON_SRC, HATHOR_BRAND_NAME } from "@/lib/branding";
import { AdminThemeProvider, useAdminTheme } from "./ThemeProvider";
import { ThemeToggle } from "./ThemeToggle";

type LoginFormProps = {
  redirectTo?: string;
};

function LoginFormInner({ redirectTo = "/admin" }: LoginFormProps) {
  const { theme } = useAdminTheme();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ password }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          (data && typeof data === "object" && "error" in data
            ? String(data.error)
            : null) ?? "Login failed",
        );
      }

      window.location.href = redirectTo;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

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
                Welcome to {HATHOR_BRAND_NAME}
              </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 flex items-center gap-2 text-sm font-medium"
                >
                  <Lock className="h-4 w-4" style={{ color: "var(--text-muted)" }} aria-hidden />
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  autoComplete="current-password"
                  className="admin-input w-full px-4 py-3 text-sm"
                  placeholder="Enter your password"
                />
              </div>

              {error && (
                <p
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

              <button
                type="submit"
                disabled={isLoading}
                className="admin-btn-primary flex w-full items-center justify-center gap-2 px-4 py-3.5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LoginForm(props: LoginFormProps) {
  return (
    <AdminThemeProvider>
      <LoginFormInner {...props} />
    </AdminThemeProvider>
  );
}
