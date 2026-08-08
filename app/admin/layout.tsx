import { AdminScrollUnlock } from "@/components/admin/AdminScrollUnlock";
import { Footer } from "@/components/layout/Footer";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AdminScrollUnlock />
      {children}
      <Footer />
    </>
  );
}
