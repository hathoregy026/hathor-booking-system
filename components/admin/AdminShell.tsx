"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AdminThemeProvider, useAdminTheme } from "./ThemeProvider";
import { AdminBottomNav } from "./AdminBottomNav";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { ToastProvider } from "./ToastProvider";

const ADMIN_APP_CLASS = "admin-app";

function AdminShellInner({ children }: { children: React.ReactNode }) {
  const { theme } = useAdminTheme();
  const pathname = usePathname();
  /* Menu is open only for the path it was opened on — soft nav closes it automatically. */
  const [menuOpenForPath, setMenuOpenForPath] = useState<string | null>(null);
  const mobileMenuOpen = menuOpenForPath === pathname;

  /* Lock document scroll so only .admin-main scrolls (avoids body stealing wheel). */
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prev = {
      htmlOverflow: html.style.overflow,
      htmlHeight: html.style.height,
      bodyOverflow: body.style.overflow,
      bodyHeight: body.style.height,
      bodyOverscroll: body.style.overscrollBehavior,
    };

    html.classList.add(ADMIN_APP_CLASS);
    html.style.height = "100%";
    html.style.overflow = "hidden";
    body.style.height = "100%";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";

    return () => {
      html.classList.remove(ADMIN_APP_CLASS);
      html.style.overflow = prev.htmlOverflow;
      html.style.height = prev.htmlHeight;
      body.style.overflow = prev.bodyOverflow;
      body.style.height = prev.bodyHeight;
      body.style.overscrollBehavior = prev.bodyOverscroll;
    };
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous || "hidden";
    };
  }, [mobileMenuOpen]);

  return (
    <div
      className="admin-shell flex h-dvh max-h-dvh flex-col overflow-hidden"
      data-theme={theme}
    >
      <div className="admin-shell__glow" aria-hidden />
      <div className="admin-shell__content flex min-h-0 w-full flex-1">
        <Sidebar
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMenuOpenForPath(null)}
        />

        <div className="admin-shell__main flex min-h-0 min-w-0 flex-1 flex-col">
          <Header
            onMenuToggle={() =>
              setMenuOpenForPath((current) =>
                current === pathname ? null : pathname,
              )
            }
          />
          <main className="admin-main min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-3 py-4 pb-24 sm:px-5 md:px-6 md:pb-6 lg:px-8 lg:py-6">
            {children}
          </main>
        </div>
      </div>

      <AdminBottomNav onOpenMenu={() => setMenuOpenForPath(pathname)} />
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <AdminThemeProvider>
      <ToastProvider>
        <AdminShellInner>{children}</AdminShellInner>
      </ToastProvider>
    </AdminThemeProvider>
  );
}
