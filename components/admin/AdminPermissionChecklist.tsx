"use client";
import { ADMIN_AREAS, hasAdminPermission, type AdminPermission } from "@/lib/admin-permissions";
import { EMAIL_MAILBOXES, type MailboxId } from "@/lib/email-mailboxes";
export type IndividualAccess = { permissions: AdminPermission[]; mailboxViewIds: MailboxId[]; mailboxSendIds: MailboxId[] };
export const noIndividualAccess: IndividualAccess = { permissions: [], mailboxViewIds: [], mailboxSendIds: [] };
export function AdminPermissionChecklist({ value, onChange }: { value: IndividualAccess; onChange: (value: IndividualAccess) => void }) {
  function toggle(permission: AdminPermission, checked: boolean) {
    const permissions = value.permissions.filter(item => item !== permission);
    if (checked) permissions.push(permission);
    onChange({ ...value, permissions });
  }
  function mailbox(id: MailboxId, action: "view" | "send", checked: boolean) {
    const views = new Set(value.mailboxViewIds), sends = new Set(value.mailboxSendIds);
    if (action === "view") { if (checked) views.add(id); else { views.delete(id); sends.delete(id); } }
    else if (checked) { views.add(id); sends.add(id); } else sends.delete(id);
    const permissions: AdminPermission[] = value.permissions.filter(item => item !== "inbox.view" && item !== "inbox.send");
    if (views.size) permissions.push("inbox.view");
    if (sends.size) permissions.push("inbox.send");
    onChange({ ...value, permissions, mailboxViewIds: [...views], mailboxSendIds: [...sends] });
  }
  const check = (permission: AdminPermission, label: string) => <label key={permission} className="flex items-center gap-2"><input type="checkbox" aria-label={(ADMIN_AREAS.find(area => permission.startsWith(area.id + "."))?.label ?? "Access") + ": " + label} checked={value.permissions.includes(permission)} onChange={event => toggle(permission, event.target.checked)} />{label}</label>;
  return <div className="people-checklist">
    <h3 className="my-4 font-semibold">Email mailboxes</h3><p className="people-note mb-4">Only checked mailboxes are visible. Send also enables viewing. Organizing messages is a separate permission.</p>
    {EMAIL_MAILBOXES.map(item => <div key={item.id} className="people-permission"><div>{item.label}<small>{item.address}</small></div><div className="people-actions">
      <label className="flex items-center gap-2"><input type="checkbox" checked={value.mailboxViewIds.includes(item.id)} onChange={event => mailbox(item.id, "view", event.target.checked)} />View {item.label}</label>
      <label className="flex items-center gap-2"><input type="checkbox" checked={value.mailboxSendIds.includes(item.id)} onChange={event => mailbox(item.id, "send", event.target.checked)} />Send from {item.label}</label>
    </div></div>)}
    <div className="people-permission"><div>Email organization<small>Move, delete, mark read and edit mailbox handler names within checked mailboxes.</small></div>{check("inbox.manage", "Organize emails")}</div>
    {ADMIN_AREAS.filter(area => area.id !== "inbox").map(area => <div key={area.id} className="people-permission"><div>{area.label}<small>{area.description}</small></div><div className="people-actions">
      {check((area.id + ".view") as AdminPermission, "View")}
      {area.id === "bookings" && check("bookings.accept", "Accept bookings")}
      {area.id === "website" && <>{check("website.text", "Edit text")}{check("website.images", "Edit images")}</>}
      {check((area.id + ".manage") as AdminPermission, area.id === "website" ? "Full website settings" : "Manage")}
    </div></div>)}
    <p className="people-note mt-4">Manage includes viewing and all actions in that section. Accept includes booking details and the normal invoice workflow. Website image editing permits uploads. Unchecked mailboxes remain blocked even with email organization enabled.</p>
    {!hasAdminPermission({ isOwner: false, permissions: value.permissions }, "inbox.view") && <p className="people-note">No email access selected.</p>}
  </div>;
}
