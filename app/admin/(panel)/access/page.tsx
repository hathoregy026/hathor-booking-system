import Link from "next/link";
import { requireAdminPage } from "@/lib/admin-server-auth";
import { canVisitAdminPage } from "@/lib/admin-permissions";
const destinations = [
  ["/admin", "Dashboard"], ["/admin/bookings", "Bookings"], ["/admin/inbox", "Emails"],
  ["/admin/availability", "Availability"], ["/admin/cruises", "Cruises"], ["/admin/prices", "Prices & cabins"],
  ["/admin/analytics", "Analytics"], ["/admin/website-text", "Website"],
  ["/admin/ship-experience", "Ship experience"], ["/admin/blogs", "Blog posts"],
  ["/admin/email-templates", "Email templates"], ["/admin/storage", "Media storage"], ["/admin/people", "People & roles"],
];
export default async function AccessPage() {
  const identity = await requireAdminPage();
  const links = destinations.filter(([path]) => canVisitAdminPage(identity, path));
  return <div className="mx-auto max-w-3xl space-y-6">
    <div><h1 className="admin-page-title">Your dashboard access</h1>
    <p className="admin-page-subtitle">{identity.roleName ?? (identity.isOwner ? "Administrator" : "No role assigned")}</p></div>
    <p>{links.length ? "Choose one of the sections your role can open." : "Ask your administrator to assign a role. You can still manage your own sign-in security."}</p>
    <div className="flex flex-wrap gap-3">{links.map(([path, label]) => <Link key={path} href={path} className="btn-outline">{label}</Link>)}</div>
    <Link className="admin-inline-link" href="/admin/settings">Your password, devices and recovery codes</Link>
  </div>;
}
