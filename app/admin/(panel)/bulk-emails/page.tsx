import { BulkEmails } from "@/components/admin/BulkEmails";
import { requireAdminPage } from "@/lib/admin-server-auth";
import "./bulk-emails.css";
export const metadata = { title: "Bulk emails | Hathor dashboard" };
export default async function BulkEmailsPage() {
  await requireAdminPage("administrator");
  return <BulkEmails />;
}
