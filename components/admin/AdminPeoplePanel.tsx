"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ADMIN_AREAS, type AdminPermission } from "@/lib/admin-permissions";
import { AdminPermissionChecklist, noIndividualAccess, type IndividualAccess } from "./AdminPermissionChecklist";
import { useAdminAccess } from "./AdminAccessProvider";
type Role = { id: string; name: string; permissions: AdminPermission[]; _count: { users: number } };
type Person = { id: string; email: string; displayName: string; isOwner: boolean; roleId: string | null;
  permissions: AdminPermission[]; mailboxViewIds: IndividualAccess["mailboxViewIds"]; mailboxSendIds: IndividualAccess["mailboxSendIds"];
  disabledAt: string | null; mfaEnrolledAt: string | null; invitation: { expiresAt: string } | null };
type ManagementEvent = { id: string; userId: string | null; type: string; detail: string | null; createdAt: string };
type Data = { users: Person[]; roles: Role[]; events: ManagementEvent[] };
type Action = Record<string, unknown> & { action: string };
export function AdminPeoplePanel() {
  const access = useAdminAccess();
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState<{ body: Action; title: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [link, setLink] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [assignment, setAssignment] = useState("");
  const [roleName, setRoleName] = useState("");
  const [roleId, setRoleId] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<AdminPermission[]>([]);
  const [inviteAccess, setInviteAccess] = useState<IndividualAccess>(noIndividualAccess);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [personAccess, setPersonAccess] = useState<IndividualAccess>(noIndividualAccess);
  const dialog = useRef<HTMLDialogElement>(null);
  const passwordInput = useRef<HTMLInputElement>(null);
  const reload = useCallback(async (signal?: AbortSignal) => {
    const response = await fetch("/api/admin/people", { cache: "no-store", signal });
    if (!response.ok) throw new Error("People and roles could not be loaded.");
    const result: Data = await response.json();
    if (!signal?.aborted) setData(result);
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    void reload(controller.signal).catch(() => { if (!controller.signal.aborted) setError("People and roles could not be loaded."); }); // eslint-disable-line react-hooks/set-state-in-effect -- State updates occur after the asynchronous network response.
    return () => controller.abort();
  }, [reload]);
  useEffect(() => {
    if (pending) { dialog.current?.showModal(); passwordInput.current?.focus(); }
    else dialog.current?.close();
  }, [pending]);
  function closeProof() { if (busy) return; setPending(null); setPassword(""); setCode(""); }
  function confirm(body: Action, title: string) {
    setError(""); setNotice(""); setLink(""); setPassword(""); setCode(""); setPending({ body, title });
  }
  const roleValue = (person: Person) => person.isOwner ? "administrator" : person.roleId ?? "";
  const roleChoice = (value: string) => ({ isOwner: value === "administrator", roleId: value && value !== "administrator" ? value : null });
  function permissionLevel(area: string) {
    return permissions.includes((area + ".manage") as AdminPermission) ? "edit" :
      permissions.includes((area + ".view") as AdminPermission) ? "view" : "hidden";
  }
  function setLevel(area: string, level: string) {
    setPermissions(current => [...current.filter(value => !value.startsWith(area + ".")),
      ...(level === "hidden" ? [] : [area + ".view"]), ...(level === "edit" ? [area + ".manage"] : [])] as AdminPermission[]);
  }
  function editRole(role: Role) { setRoleId(role.id); setRoleName(role.name); setPermissions(role.permissions); setLink(""); }
  async function submitProof(event: React.FormEvent) {
    event.preventDefault();
    if (!pending || busy) return;
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/admin/people", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...pending.body, currentPassword: password, code }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "The change could not be saved.");
      setPending(null); setPassword(""); setCode("");
      if (typeof result.setupPath === "string" && /^\/admin\/accept-invite#token=[a-f0-9]{64}$/.test(result.setupPath)) {
        setLink(window.location.origin + result.setupPath);
      }
      setNotice(pending.body.action === "delete-person"
        ? "Person deleted. Their sign-in and permissions have been removed."
        : "Saved. Changes to access sign out the affected people.");
      if (pending.body.action === "invite") { setName(""); setEmail(""); setAssignment(""); setInviteAccess(noIndividualAccess); }
      if (["create-role", "update-role"].includes(pending.body.action)) { setRoleName(""); setRoleId(null); setPermissions([]); }
      setEditingPerson(null);
      await reload();
    } catch (failure) { setError(failure instanceof Error ? failure.message : "The change could not be saved."); }
    finally { setBusy(false); }
  }
  const options = <><option value="">Individual permissions</option><option value="administrator">Administrator — full access</option>
    {data?.roles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}</>;
  return <div className="people-page">
    <div className="people-heading"><div><p className="people-kicker">Access administration</p><h1>People & roles</h1></div>
      <p className="people-note max-w-sm">Give each person their own sign-in and only the access they need. Administrators can manage everyone and every section.</p></div>
    {error && !pending && <p role="alert" className="people-error">{error}</p>}
    {notice && <p role="status" className="people-status">{notice}</p>}
    {link && <section className="people-section" aria-label="Private setup link">
      <h2>Private setup link</h2><p className="people-note mb-4">Shown only now. Share privately with this person. It expires after 48 hours and works once. No email was sent.</p>
      <textarea className="people-link" aria-label="Setup link" readOnly value={link} />
      <div className="people-actions mt-4"><button className="btn-primary" onClick={async () => {
        try { await navigator.clipboard.writeText(link); setNotice("Setup link copied."); } catch { setNotice("Select the link above and copy it."); }
      }}>Copy link</button><button className="btn-outline" onClick={() => setLink("")}>Hide link</button></div>
    </section>}
    {!data ? <p role="status">Loading people and roles…</p> : <>
      <section className="people-section"><h2>Invite a person</h2>
        <form onSubmit={event => { event.preventDefault(); confirm({ action: "invite", email: email.trim(), displayName: name.trim(), ...roleChoice(assignment), ...inviteAccess }, "Invite this person"); }}>
          <div className="people-grid"><label>Full name<input className="input" value={name} onChange={event => setName(event.target.value)} maxLength={80} required autoComplete="off" /></label>
          <label>Email<input className="input" type="email" value={email} onChange={event => setEmail(event.target.value)} maxLength={254} required autoComplete="off" /></label>
          <label>Access<select className="input" value={assignment} onChange={event => { setAssignment(event.target.value); setInviteAccess(noIndividualAccess); }}>{options}</select></label></div>
          <p className="people-note my-4">They choose their password using the setup link, then enroll an authenticator. No role means no business data.</p>
          {!assignment && <AdminPermissionChecklist value={inviteAccess} onChange={setInviteAccess} />}
          <button className="btn-primary" type="submit">Create setup link</button>
        </form>
      </section>
      <section className="people-section"><h2>People</h2>{data.users.map(person => {
        const self = person.id === access.userId;
        return <article className="people-row" key={person.id}>
          <div><p className="font-semibold">{person.displayName}{self ? " · You" : ""}</p><p className="people-note">{person.email}</p>
            <p className="people-note">{person.disabledAt ? "Disabled" : person.invitation ? "Password setup pending" : person.mfaEnrolledAt ? "Authenticator enrolled" : "Authenticator setup pending"}</p></div>
          <div><label>Role for {person.displayName}<select className="input" disabled={self} value={roleValue(person)}
            onChange={event => confirm({ action: "set-access", id: person.id, ...roleChoice(event.target.value) }, "Change this person's access")}>{options}</select></label>
            <div className="people-actions mt-3">
              <button className="btn-primary" disabled={self || person.isOwner} onClick={() => { setEditingPerson(person); setPersonAccess({ permissions: [...new Set([...(data.roles.find(role => role.id === person.roleId)?.permissions ?? []), ...person.permissions])], mailboxViewIds: person.mailboxViewIds, mailboxSendIds: person.mailboxSendIds }); }}>Choose permissions</button>
              <button className="btn-outline" disabled={self} onClick={() => confirm({ action: "set-enabled", id: person.id, enabled: !!person.disabledAt }, person.disabledAt ? "Enable this account" : "Disable this account")}>{person.disabledAt ? "Enable" : "Disable"}</button>
              <button className="btn-outline" disabled={self || !!person.disabledAt} onClick={() => confirm({ action: "password-link", id: person.id }, "Reset password with a new link")}>Password link</button>
              <button className="btn-outline" disabled={self || !person.mfaEnrolledAt} onClick={() => confirm({ action: "reset-mfa", id: person.id }, "Remove this person's authenticator and recovery codes")}>Reset authenticator</button>
              <button className="btn-outline" disabled={self} onClick={() => confirm({ action: "revoke-sessions", id: person.id }, "Sign out this person's devices")}>Sign out</button>
              <button className="btn-outline" disabled={self} onClick={() => confirm({ action: "unlock", id: person.id }, "Unlock sign-in attempts")}>Unlock</button>
              <button className="btn-outline people-delete" disabled={self} onClick={() => confirm({ action: "delete-person", id: person.id, confirm: true }, "Permanently delete " + person.displayName + "?")}>Delete person</button>
            </div></div>
        </article>;
      })}</section>
      {editingPerson && <section className="people-section"><h2>Permissions for {editingPerson.displayName}</h2><p className="people-note">Check the access this person should have. Saving replaces their role with these individual permissions.</p>
        <AdminPermissionChecklist value={personAccess} onChange={setPersonAccess} />
        <div className="people-actions mt-5"><button className="btn-primary" onClick={() => confirm({ action: "set-access", id: editingPerson.id, roleId: null, isOwner: false, ...personAccess }, "Save this person's permissions")}>Save permissions</button><button className="btn-outline" onClick={() => setEditingPerson(null)}>Cancel</button></div>
      </section>}
      <section className="people-section"><h2>{roleId ? "Edit role" : "Create a role"}</h2>
        <p className="people-note mb-5">Hidden blocks the page and API. View allows reading. Edit also allows changes and, where applicable, sending emails. Media uploads require Edit in Media storage.</p>
        <form onSubmit={event => { event.preventDefault(); confirm({ action: roleId ? "update-role" : "create-role", ...(roleId ? { id: roleId } : {}), name: roleName.trim(), permissions }, roleId ? "Update this role and sign out its members" : "Create this role"); }}>
          <label className="mb-5">Role name<input className="input" required minLength={2} maxLength={64} value={roleName} onChange={event => setRoleName(event.target.value)} /></label>
          {ADMIN_AREAS.map(area => <div className="people-permission" key={area.id}><div>{area.label}<small>{area.description}</small></div>
            <label><span className="sr-only">{area.label} access</span><select className="input" aria-label={area.label + " access"} value={permissionLevel(area.id)} onChange={event => setLevel(area.id, event.target.value)}>
              <option value="hidden">Hidden</option><option value="view">View</option><option value="edit">Edit</option>
            </select></label></div>)}
          <div className="people-actions mt-5"><button className="btn-primary" type="submit">{roleId ? "Save role" : "Create role"}</button>
            {roleId && <button className="btn-outline" type="button" onClick={() => { setRoleId(null); setRoleName(""); setPermissions([]); }}>Cancel editing</button>}</div>
        </form>
      </section>
      <section className="people-section"><h2>Saved roles</h2>{!data.roles.length && <p className="people-note">Create your first role above. All sections start Hidden.</p>}
        {data.roles.map(role => <article className="people-row" key={role.id}><div><p className="font-semibold">{role.name}</p>
          <p className="people-note">{role._count.users} people · {role.permissions.filter(permission => permission.endsWith(".view")).length} visible sections</p></div>
          <div className="people-actions"><button className="btn-outline" onClick={() => editRole(role)}>Edit {role.name}</button>
            <button className="btn-outline" disabled={role._count.users > 0} onClick={() => confirm({ action: "delete-role", id: role.id }, "Delete this unused role")}>Delete</button></div></article>)}
      </section>
      <section className="people-section"><h2>Recent access changes</h2>{!data.events.length && <p className="people-note">Changes will appear here.</p>}
        {data.events.map(event => <p key={event.id} className="people-note py-2">{new Date(event.createdAt).toLocaleString()} · {event.type.replace("MANAGEMENT_", "").toLowerCase().replaceAll("_", " ")} · {data.users.find(person => person.id === event.userId)?.displayName ?? "Administrator"}</p>)}
      </section>
    </>}
    <dialog ref={dialog} className="people-dialog" onCancel={event => { event.preventDefault(); closeProof(); }}>
      <form onSubmit={submitProof}><h2>{pending?.title}</h2>{pending?.body.action === "delete-person" && <p className="people-note">This permanently removes this person&apos;s dashboard account, permissions, setup links, sessions, authenticator and recovery codes. It cannot be undone. Existing bookings and emails are kept.</p>}<p className="people-note">Confirm this change with your own password and an authenticator or unused recovery code.</p>
        {error && <p role="alert" className="people-error">{error}</p>}
        <label>Your password<input ref={passwordInput} type="password" className="input" value={password} onChange={event => setPassword(event.target.value)} required maxLength={128} autoComplete="current-password" disabled={busy} /></label>
        <label>Your code<input className="input" value={code} onChange={event => setCode(event.target.value)} required maxLength={32} autoComplete="one-time-code" disabled={busy} /></label>
        <div className="people-actions"><button type="button" className="btn-outline" onClick={closeProof} disabled={busy}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={busy}>{busy ? "Saving…" : pending?.body.action === "delete-person" ? "Delete person" : "Confirm change"}</button></div>
      </form>
    </dialog>
  </div>;
}
