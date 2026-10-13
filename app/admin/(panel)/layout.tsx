import { Inter } from "next/font/google";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminAccessProvider } from "@/components/admin/AdminAccessProvider";
import { requireAdminPage } from "@/lib/admin-server-auth";
import "../../hathor-fonts.css";

/*
 * preload: false — the production build packs these font rules into a CSS file
 * the public pages share, so a preload here was fetched on every public page.
 * They still load wherever this layout's text uses them.
 */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-admin",
  weight: ["300", "400", "500", "600", "700"],
  preload: false,
});

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  /*
   * Database-checked session for every dashboard page. Middleware only sees
   * the cookie's signature; this is what turns away a logged-out, revoked,
   * idle or disabled session before any dashboard markup is rendered.
   */
  const identity = await requireAdminPage();

  return (
    <div className={inter.variable}>
      <AdminAccessProvider initial={{ userId: identity.userId, displayName: identity.displayName, isOwner: identity.isOwner, roleName: identity.roleName, permissions: identity.permissions, mailboxViewIds: identity.mailboxViewIds, mailboxSendIds: identity.mailboxSendIds }}>
        <AdminShell>{children}</AdminShell>
      </AdminAccessProvider>
    </div>
  );
}
