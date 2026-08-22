import { AdminScrollUnlock } from "@/components/admin/AdminScrollUnlock";

/* Admin design system, scoped to /admin (login + panel) instead of being
   imported from app/globals.css. Keeps ~73KB of admin CSS and its unscoped
   [data-theme] token blocks off every public page.
   Order matters: admin-shell.css must load after admin.css so its rules win
   without !important. */
import "../admin.css";
import "../admin-shell.css";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AdminScrollUnlock />
      {children}
    </>
  );
}
