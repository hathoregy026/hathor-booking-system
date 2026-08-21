"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AdminThemeProvider, useAdminTheme } from "./ThemeProvider";
import { AdminBottomNav } from "./AdminBottomNav";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { ToastProvider } from "./ToastProvider";
import { ensurePublicScrollController } from "@/lib/public-scroll-controller";

function AdminShellInner({ children }: { children: React.ReactNode }) {
  const { theme } = useAdminTheme();
  const pathname = usePathname();
  const [menuOpenForPath, setMenuOpenForPath] = useState<string | null>(null);
  const mobileMenuOpen = menuOpenForPath === pathname;

  // <AdminScrollUnlock /> (app/admin/layout.tsx) clears the public welcome lock
  // on mount; re-assert it per navigation in case a client transition re-arms it.
  useEffect(() => {
    ensurePublicScrollController();
    const html = document.documentElement;
    const body = document.body;
    html.classList.add("admin-app");
    html.classList.remove("hathor-welcome-lock");
    html.classList.add("hathor-welcome-skip");
    html.classList.add("hathor-welcome-ready");
    html.style.removeProperty("overflow");
    html.style.removeProperty("height");
    body.style.removeProperty("overflow");
    body.style.removeProperty("height");

    return () => {
      html.classList.remove("admin-app");
      ensurePublicScrollController();
    };
  }, [pathname]);

  // Lock the page behind the mobile drawer, compensating for the scrollbar so
  // the content underneath does not jump sideways when it opens.
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const body = document.body;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
    };
  }, [mobileMenuOpen]);

  // Close the drawer with Escape.
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpenForPath(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileMenuOpen]);

  return (
    <div
      className="admin-shell min-h-screen overflow-x-hidden"
      data-theme={theme}
    >
      <div className="admin-shell__glow" aria-hidden />

      <Sidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMenuOpenForPath(null)}
      />

      <div className="admin-shell__stage relative z-[1] flex min-h-screen min-w-0 flex-col">
        <Suspense
          fallback={
            <header className="admin-header flex shrink-0 items-center px-4 sm:px-6" />
          }
        >
          <Header
            onMenuToggle={() =>
              setMenuOpenForPath((current) =>
                current === pathname ? null : pathname,
              )
            }
          />
        </Suspense>

        <main className="admin-main mx-auto w-full max-w-[1600px] flex-1 overflow-x-hidden px-4 py-6 pb-24 sm:px-6 md:pb-8 lg:px-8 lg:py-8">
          {children}
        </main>
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
