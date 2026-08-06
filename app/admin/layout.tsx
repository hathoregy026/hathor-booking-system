import { AdminScrollUnlock } from "@/components/admin/AdminScrollUnlock";

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
