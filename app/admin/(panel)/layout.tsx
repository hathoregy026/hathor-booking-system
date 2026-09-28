import { Inter } from "next/font/google";
import { AdminShell } from "@/components/admin/AdminShell";
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

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={inter.variable}>
      <AdminShell>{children}</AdminShell>
    </div>
  );
}
