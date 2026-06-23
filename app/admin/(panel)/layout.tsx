import { Plus_Jakarta_Sans } from "next/font/google";
import { AdminShell } from "@/components/admin/AdminShell";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-admin",
  weight: ["400", "500", "600", "700"],
});

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={plusJakarta.variable}>
      <AdminShell>{children}</AdminShell>
    </div>
  );
}
