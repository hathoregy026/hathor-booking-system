/**
 * Local-only hero-logo-tune Save regression with a real database session.
 * Usage: node scripts/test-hero-logo-tune-save.mjs (see docs/admin-login.md).
 */
import assert from "node:assert/strict";
import { withLocalAdminTest, reportLocalAdminTestFailure } from "./local-admin-test.mjs";

withLocalAdminTest(async ({ request, session }) => {
  const headers = { Cookie: session.cookie, "Content-Type": "application/json" };
  const get = await request("/api/admin/hero-logo-tune", { headers });
  assert.equal(get.status, 200);
  const data = await get.json();
  assert.equal(data.ok, true, "The local tune must load successfully.");
  const previous = data.tune;
  const marker = previous.gapTButton === 71 ? 72 : 71;
  try {
    const put = await request("/api/admin/hero-logo-tune", {
      method: "PUT", headers, body: JSON.stringify({ tune: { ...previous, gapTButton: marker } }),
    });
    assert.equal(put.status, 200);
    assert.equal((await put.json()).tune.gapTButton, marker);
    const publicResponse = await request("/api/hero-logo-tune?t=" + Date.now());
    assert.equal(publicResponse.status, 200);
    assert.equal((await publicResponse.json()).tune.gapTButton, marker);
    const home = await request("/?t=" + Date.now());
    assert.equal(home.status, 200);
    assert.ok((await home.text()).includes("--hathor-gap-t-btn: " + marker + "px"));
    console.log("PASS: local Save → public API → homepage SSR.");
  } finally {
    const restore = await request("/api/admin/hero-logo-tune", {
      method: "PUT", headers, body: JSON.stringify({ tune: previous }),
    });
    assert.equal(restore.status, 200, "Restore the original local tune even after a failed check.");
    console.log("Restored the original local tune.");
  }
}).catch(reportLocalAdminTestFailure);
