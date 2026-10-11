import assert from "node:assert/strict";
import { test } from "node:test";
import { assertLocalAdminTestEnvironment, localAdminTestFetch, LocalAdminTestError } from "./local-admin-test.mjs";

const local = {
  DATABASE_URL: "postgresql://test@localhost:5432/hathor_admin_auth_test",
  TEST_BASE_URL: "http://localhost:3109",
};
test("allows loopback website and dedicated test database", () => {
  for (const host of ["localhost", "127.0.0.1", "[::1]"]) {
    assert.equal(assertLocalAdminTestEnvironment({ ...local,
      DATABASE_URL: "postgresql://test@" + host + ":5432/hathor_admin_auth_test",
      TEST_BASE_URL: "http://" + host + ":3109",
    }).baseUrl, "http://" + host + ":3109");
  }
});
test("refuses remote website, redirect-style URLs and banned port before requests", () => {
  for (const url of ["https://hathor-booking-system.vercel.app", "http://localhost.example.com",
    "http://localhost:3847", "http://localhost/path", "http://localhost?next=https://example.com",
    "http://localhost#fragment", "http://user:secret@localhost", "https://localhost"]) {
    assert.throws(() => assertLocalAdminTestEnvironment({ ...local, TEST_BASE_URL: url }), LocalAdminTestError);
  }
});
test("refuses remote DBs and host/SSL overrides before any DB import", () => {
  for (const url of ["postgresql://test@db.example.com/hathor_admin_auth_test",
    "postgresql://localhost@db.example.com/hathor_admin_auth_test", "postgresql://test@localhost/postgres",
    "postgresql://test@localhost/hathor_admin_auth_test?host=db.example.com",
    "postgresql://test@localhost/hathor_admin_auth_test?sslmode=disable",
    "postgresql://test@localhost/hathor_admin_auth_test?options=-csearch_path=public", "invalid"]) {
    assert.throws(() => assertLocalAdminTestEnvironment({ ...local, DATABASE_URL: url }), LocalAdminTestError);
  }
  for (const name of ["DIRECT_URL", "DATABASE_DIRECT_URL"]) {
    assert.throws(() => assertLocalAdminTestEnvironment({ ...local,
      [name]: "postgresql://test@db.example.com/hathor_admin_auth_test" }), LocalAdminTestError);
  }
});
test("refuses production and Vercel and requires an explicit test database", () => {
  for (const extra of [{ NODE_ENV: "production" }, { VERCEL: "1" }, { DATABASE_URL: "" }]) {
    assert.throws(() => assertLocalAdminTestEnvironment({ ...local, ...extra }), LocalAdminTestError);
  }
});
test("never follows a remote redirect or sends a request to another origin", async () => {
  const previous = { ...process.env };
  const originalFetch = globalThis.fetch;
  let calls = 0;
  try {
    for (const name of ["NODE_ENV", "VERCEL", "DIRECT_URL", "DATABASE_DIRECT_URL"]) delete process.env[name];
    Object.assign(process.env, local);
    globalThis.fetch = async (_url, options) => {
      calls += 1;
      assert.equal(options.redirect, "error");
      return new Response(null, { status: 200 });
    };
    await localAdminTestFetch(local.TEST_BASE_URL, "/api/admin/security");
    await assert.rejects(localAdminTestFetch(local.TEST_BASE_URL, "https://example.com"), LocalAdminTestError);
    assert.equal(calls, 1, "A remote destination must fail before fetch.");
  } finally {
    globalThis.fetch = originalFetch;
    for (const key of Object.keys(process.env)) if (!(key in previous)) delete process.env[key];
    Object.assign(process.env, previous);
  }
});
