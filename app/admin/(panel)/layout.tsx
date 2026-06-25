import { Inter } from "next/font/google";
import { AdminShell } from "@/components/admin/AdminShell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-admin",
  weight: ["300", "400", "500", "600", "700"],
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
