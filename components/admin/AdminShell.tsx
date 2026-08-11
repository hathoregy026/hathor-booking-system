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
  /* Menu is open only for the path it was opened on — soft nav closes it automatically. */
  const [menuOpenForPath, setMenuOpenForPath] = useState<string | null>(null);
  const mobileMenuOpen = menuOpenForPath === pathname;

  /*
   * Force native document scroll on every admin route.
   * Root TouchDeviceBootstrap can start Lenis on desktop; that + overflow locks
   * freezes the dashboard. Tear it down here and keep the page on window scroll.
   */
  useEffect(() => {
    ensurePublicScrollController();
    const html = document.documentElement;
    const body = document.body;
    html.classList.add("admin-app");
    /* Welcome splash lock is public-only; clear if left over from a soft land. */
    html.classList.remove("hathor-welcome-lock");
    html.classList.add("hathor-welcome-skip");
    html.classList.add("hathor-welcome-ready");
    html.style.removeProperty("overflow");
    body.style.removeProperty("overflow");
    body.style.removeProperty("height");
    html.style.removeProperty("height");

    return () => {
      html.classList.remove("admin-app");
      /* Re-evaluate Lenis when leaving admin for a public route. */
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
      className="admin-shell flex min-h-screen overflow-x-hidden"
      data-theme={theme}
    >
      <div className="admin-shell__glow" aria-hidden />
      <div className="admin-shell__content flex min-h-screen w-full">
        <Sidebar
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMenuOpenForPath(null)}
        />

        <div className="admin-shell__main flex min-w-0 flex-1 flex-col">
          <Header
            onMenuToggle={() =>
              setMenuOpenForPath((current) =>
                current === pathname ? null : pathname,
              )
            }
          />
          <main className="admin-main flex-1 overflow-x-hidden px-3 py-4 pb-24 sm:px-5 md:px-6 md:pb-6 lg:px-8 lg:py-6">
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
