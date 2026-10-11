import { requireAdminPage } from "@/lib/admin-server-auth";
import { AdminPeoplePanel } from "@/components/admin/AdminPeoplePanel";
import "./people.css";
export default async function PeoplePage() {
  await requireAdminPage("administrator");
  return <AdminPeoplePanel />;
}
