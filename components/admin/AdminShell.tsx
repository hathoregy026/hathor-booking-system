"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    ensurePublicScrollController();
    const html = document.documentElement;
    const body = document.body;
    html.classList.add("admin-app");
    html.classList.remove("hathor-welcome-lock");
    html.classList.add("hathor-welcome-skip");
    html.classList.add("hathor-welcome-ready");
    html.style.removeProperty("overflow");
    body.style.removeProperty("overflow");
    body.style.removeProperty("height");
    html.style.removeProperty("height");

    return () => {
      html.classList.remove("admin-app");
      ensurePublicScrollController();
    };
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
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
        <Header
          onMenuToggle={() =>
            setMenuOpenForPath((current) =>
              current === pathname ? null : pathname,
            )
          }
        />
        <main className="admin-main mx-auto w-full max-w-[1600px] flex-1 overflow-x-hidden px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:py-8 lg:pb-8">
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