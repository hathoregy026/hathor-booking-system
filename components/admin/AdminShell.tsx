"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AdminThemeProvider, useAdminTheme } from "./ThemeProvider";
import { AdminBottomNav } from "./AdminBottomNav";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { ToastProvider } from "./ToastProvider";

function AdminShellInner({ children }: { children: React.ReactNode }) {
  const { theme } = useAdminTheme();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
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
    <div className="admin-shell flex min-h-screen overflow-x-hidden" data-theme={theme}>
      <div className="admin-shell__glow" aria-hidden />
      <div className="admin-shell__content flex min-h-screen w-full">
        <Sidebar
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <Header onMenuToggle={() => setMobileMenuOpen((open) => !open)} />
          <main className="flex-1 overflow-x-hidden px-3 py-4 pb-24 sm:px-5 md:px-6 md:pb-6 lg:px-8 lg:py-6">
            {children}
          </main>
        </div>
      </div>

      <AdminBottomNav onOpenMenu={() => setMobileMenuOpen(true)} />
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
