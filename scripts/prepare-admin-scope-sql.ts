/** Prepare rollback-only SQL from the application's actual parameterized queries. Execute only on the isolated login test database. */
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { writeFileSync } from "node:fs";
import { fetchDashboardInbox, fetchInboxDetail, inboxQuerySchema, setInboxRead, setInboxFolder, deleteDashboardEmail } from "../lib/dashboard-inbox";
import { applyDashboardEmailAction } from "../lib/dashboard-email-actions";
import { fetchAdminNotifications } from "../lib/admin-notifications";
import { managementActionSchema } from "../lib/admin-management";
import { applyStaffBookingAction } from "../lib/booking-admin-api";
import type { bookingQuery } from "../lib/booking-database";
function literal(value: unknown): string {
  if (value === null || value === undefined) return "NULL";
  if (Array.isArray(value)) return "ARRAY[" + value.map(literal).join(",") + "]::text[]";
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  return "'" + String(value).replaceAll("'", "''") + "'";
}
async function main() {
  const ids = [randomUUID(), randomUUID(), randomUUID()];
  const tag = "scope-fixture-" + randomUUID();
  const statements: string[] = [];
  const query = (async (sql: string, values: unknown[] = []) => {
    statements.push(sql.replace(/\$(\d+)\b/g, (_match, number) => literal(values[Number(number)-1])));
    if (sql.includes("applied AS")) return [{ affected: JSON.parse(values[0] as string).length }];
    if (sql.includes("WITH profile")) return [{ unreadCount: 0, bookingCount: 0, emailCount: 0, bookingSeenThrough: "1970-01-01T00:00:00.000Z", items: [], activity: [] }];
    if (sql.includes("SELECT *, LEFT")) return [{ id: ids[0], direction: "INBOUND", status: "RECEIVED", createdAt: new Date(), readAt: null }];
    return [];
  }) as typeof bookingQuery;
  const captured = async (run: () => Promise<unknown>) => { statements.length = 0; await run(); return [...statements]; };
  let tests = "";
  const verifyRows = (sql: string, expected: number, name: string) => { tests += "SELECT count(*) INTO n FROM (" + sql + ") scope_result; IF n <> " + expected + " THEN RAISE EXCEPTION " + literal(name) + "; END IF;\n"; };
  const verifyWrite = (sql: string, expected: number, name: string) => { tests += "WITH scope_result AS (" + sql + ") SELECT count(*) INTO n FROM scope_result; IF n <> " + expected + " THEN RAISE EXCEPTION " + literal(name) + "; END IF;\n"; };
  verifyRows((await captured(() => fetchDashboardInbox(inboxQuerySchema.parse({ q: tag }), query, ["sales"])))[0], 1, "Mailbox search leaked hidden messages");
  verifyRows((await captured(() => fetchInboxDetail("general", ids[1], query, ["sales"])))[0], 0, "Direct hidden message leaked");
  verifyRows((await captured(() => fetchInboxDetail("general", ids[2], query, ["reservations"])))[0], 0, "Moved message leaked in original mailbox");
  verifyRows((await captured(() => fetchInboxDetail("general", ids[2], query, ["ceo"])))[0], 1, "Moved message unavailable to allowed mailbox");
  verifyWrite((await captured(() => setInboxRead("general", ids[1], true, query, ["sales"])))[0], 0, "Hidden message marked read");
  verifyWrite((await captured(() => setInboxFolder("general", ids[1], "spam", query, ["sales"])))[0], 0, "Hidden message moved to spam");
  verifyWrite((await captured(() => deleteDashboardEmail("general", ids[1], query, ["sales"])))[1], 0, "Hidden message deleted");
  const mixed = { action: "move" as const, mailboxId: "sales" as const, messages: ids.slice(0,2).map(id => ({ source: "general" as const, id })) };
  const move = (await captured(() => applyDashboardEmailAction(mixed, query, ["sales"])))[0];
  tests += move.replace("SELECT COUNT(*)::int AS affected FROM applied", "SELECT COUNT(*)::int INTO n FROM applied") + "; IF n <> 0 THEN RAISE EXCEPTION 'Mixed selection changed hidden messages'; END IF;\n";
  const notification = (await captured(() => fetchAdminNotifications(query, ["sales"])))[0];
  tests += "SELECT \"emailCount\" INTO n FROM (" + notification + ") scope_result; IF n <> 1 THEN RAISE EXCEPTION 'Notification counts leaked hidden mail'; END IF;\n";
  verifyWrite((await captured(() => setInboxRead("general", ids[0], true, query, ["sales"])))[0], 1, "Allowed message cannot be marked");
  verifyWrite((await captured(() => deleteDashboardEmail("general", ids[0], query, ["sales"])))[1], 1, "Allowed message cannot be deleted");
  const body = { action: "set-access", id: "synthetic", roleId: null, isOwner: false, currentPassword: "synthetic", code: "123456", permissions: ["inbox.view"] };
  assert.equal(managementActionSchema.safeParse({ ...body, mailboxViewIds: ["sales"], mailboxSendIds: ["ceo"] }).success, false);
  assert.equal(managementActionSchema.safeParse({ ...body, permissions: ["*"] }).success, false);
  assert.equal(managementActionSchema.safeParse({ ...body, mailboxViewIds: ["sales"], mailboxSendIds: ["sales"] }).success, true);
  let calls = 0;
  const dependencies = { administerBooking: async () => { calls++; throw new Error("synthetic action reached"); }, resolveAttachments: async () => { calls++; return []; } };
  const access = { isOwner: false, permissions: ["bookings.accept"] };
  await assert.rejects(() => applyStaffBookingAction("synthetic", { type: "accept" }, null, dependencies, access), /synthetic action reached/);
  assert.equal(calls, 2); calls = 0;
  await assert.rejects(() => applyStaffBookingAction("synthetic", { type: "cancel" }, null, dependencies, access));
  await assert.rejects(() => applyStaffBookingAction("synthetic", { type: "message", message: "Synthetic note" }, null, dependencies, access));
  assert.equal(calls, 0);
  const inserts = ids.map((id,index) => 'INSERT INTO "InboxMessage" (id,"mailboxId",sender,recipient,subject,"bodyText") VALUES (' + [id,["sales","ceo","reservations"][index],"synthetic@example.invalid","synthetic@example.invalid",tag,"Synthetic access test"].map(literal).join(",") + ');').join("\n");
  const placement = 'INSERT INTO "DashboardEmailPlacement" (source,"messageId","mailboxId") VALUES (' + ["general",ids[2],"ceo"].map(literal).join(",") + ');';
  const sql = ["BEGIN;", inserts, placement, "DO $scope$ DECLARE n integer; BEGIN", tests, "END $scope$;", "SELECT '11 mailbox SQL regressions passed; rollback follows' AS result;", "ROLLBACK;"].join("\n");
  writeFileSync(".tmp-admin-login-preview/scope-regressions.sql", sql);
  console.log("PASS: strict permission payloads and action denial before side effects. Prepared 11 SQL assertions for isolated test database only.");
}
void main().catch(error => { console.error("FAIL: preparing scoped permission tests", error instanceof assert.AssertionError ? error.message : error instanceof Error ? error.name : "unknown"); process.exitCode = 1; });
