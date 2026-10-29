import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { NextRequest } from "next/server";
import { applyDashboardEmailAction, dashboardEmailActionSchema } from "../lib/dashboard-email-actions";
import { POST } from "../app/api/admin/inbox/bulk/route";
import { assertTrustedPublicJsonRequest, PublicRequestError } from "../lib/public-api-security";
import type { bookingQuery } from "../lib/booking-database";

async function main() {
  const messages = [{ source: "general" as const, id: randomUUID() }, { source: "booking" as const, id: randomUUID() }];
  for (const invalid of [
    { action: "delete", messages }, { action: "delete", messages, confirm: false },
    { action: "delete", messages: [], confirm: true }, { action: "move", messages, mailboxId: "other" },
    { action: "move", messages: [messages[0], messages[0]], mailboxId: "ceo" },
    { action: "move", messages: [{ source: "other", id: randomUUID() }], mailboxId: "ceo" },
    { action: "move", messages: [{ ...messages[0], extra: true }], mailboxId: "ceo" },
    { action: "delete", messages, confirm: true, deleteFromZoho: true },
    { action: "move", messages: Array.from({ length: 101 }, () => ({ source: "general", id: randomUUID() })), mailboxId: "ceo" },
  ]) assert.equal(dashboardEmailActionSchema.safeParse(invalid).success, false);
  let calls = 0;
  const query = (async (sql: string, values: unknown[]) => {
    calls++;
    assert.doesNotMatch(sql, /DELETE FROM|TRUNCATE|UPDATE "InboxMessage"|UPDATE "BookingMessage"|UPDATE "Booking"/);
    assert.match(sql, /FOR UPDATE OF m/);
    assert.match(sql, /COUNT\(\*\) FROM eligible.*COUNT\(\*\) FROM requested/);
    assert.deepEqual(JSON.parse(values[0] as string), messages);
    if (calls === 1) { assert.match(sql, /INSERT INTO "DashboardEmailPlacement"/); assert.equal(values[1], "ceo"); }
    else { assert.match(sql, /INSERT INTO "DashboardEmailDeletion"/); assert.equal(values.length, 1); }
    return [{ affected: 2 }];
  }) as typeof bookingQuery;
  assert.deepEqual(await applyDashboardEmailAction({ action: "move", messages, mailboxId: "ceo" }, query), { affected: 2 });
  assert.deepEqual(await applyDashboardEmailAction({ action: "delete", messages, confirm: true }, query), { affected: 2 });
  assert.equal(calls, 2);
  const unavailable = (async () => [{ affected: 0 }]) as typeof bookingQuery;
  await assert.rejects(applyDashboardEmailAction({ action: "move", messages, mailboxId: "ceo" }, unavailable), error => error instanceof PublicRequestError && error.status === 409);
  assert.equal((await POST(new NextRequest("https://www.hathorcruise.com/api/admin/inbox/bulk", { method: "POST" }))).status, 401);
  assert.throws(() => assertTrustedPublicJsonRequest(new Request("https://www.hathorcruise.com/api/admin/inbox/bulk", { method: "POST", headers: { "Content-Type": "application/json", Origin: "https://attacker.example" } })));
  console.log("Bulk email tests passed: strict identities, 100-item limit, confirmation, duplicate rejection, atomic eligibility, metadata-only operations, authorization and CSRF. No live messages touched.");
}
main().catch(error => { console.error(error); process.exitCode = 1; });
