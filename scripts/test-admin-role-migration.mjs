/** Verify additive SQL and private-table privileges only on the guarded local DB. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import pg from "pg";
import { withLocalAdminTest, reportLocalAdminTestFailure } from "./local-admin-test.mjs";
withLocalAdminTest(async () => {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: false, connectionTimeoutMillis: 5_000 });
  await client.connect();
  try {
    assert.equal((await client.query("SELECT current_database() AS name")).rows[0].name, "hathor_admin_auth_test");
    await client.query("BEGIN");
    await client.query("CREATE SCHEMA admin_role_migration_qa");
    await client.query("SET LOCAL search_path TO admin_role_migration_qa, pg_catalog");
    await client.query('CREATE TABLE "AdminUser" (id text PRIMARY KEY, email text NOT NULL)');
    await client.query('INSERT INTO "AdminUser" (id,email) VALUES ($1,$2)', ["existing-test-person", "migration@example.invalid"]);
    await client.query(`DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='anon') THEN CREATE ROLE anon NOLOGIN; END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='authenticated') THEN CREATE ROLE authenticated NOLOGIN; END IF;
    END $$`);
    await client.query("GRANT USAGE ON SCHEMA admin_role_migration_qa TO anon, authenticated");
    // Simulate Supabase's broad defaults; the migration must remove all of them.
    await client.query("ALTER DEFAULT PRIVILEGES IN SCHEMA admin_role_migration_qa GRANT ALL ON TABLES TO anon, authenticated");
    await client.query("ALTER DEFAULT PRIVILEGES IN SCHEMA admin_role_migration_qa GRANT ALL ON TABLES TO PUBLIC");
    await client.query(readFileSync("prisma/migrations/20261011120000_admin_roles_and_invitations/migration.sql", "utf8"));
    const row = (await client.query('SELECT id,email,"isOwner","roleId" FROM "AdminUser"')).rows[0];
    assert.equal(row.email, "migration@example.invalid"); assert.equal(row.isOwner, false); assert.equal(row.roleId, null);
    const policies = (await client.query(`SELECT c.relname,c.relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
      WHERE n.nspname='admin_role_migration_qa' AND c.relname IN ('AdminRole','AdminInvitation')`)).rows;
    assert.equal(policies.length, 2); assert.ok(policies.every(value => value.relrowsecurity));
    const attempts = [
      'SELECT * FROM "AdminRole"',
      'INSERT INTO "AdminRole" (id,name,"updatedAt") VALUES (\'attempt\',\'Attempt\',now())',
      'UPDATE "AdminRole" SET name=\'Attempt\'',
      'DELETE FROM "AdminRole"',
      'SELECT * FROM "AdminInvitation"',
      'INSERT INTO "AdminInvitation" (id,"userId","tokenHash","expiresAt") VALUES (\'attempt\',\'existing-test-person\',\'hash\',now())',
      'UPDATE "AdminInvitation" SET "expiresAt"=now()',
      'DELETE FROM "AdminInvitation"',
    ];
    for (const roleQuery of ["SET LOCAL ROLE anon", "SET LOCAL ROLE authenticated"]) {
      await client.query(roleQuery);
      for (const sql of attempts) {
        await client.query("SAVEPOINT denied_access");
        let denied = false;
        try { await client.query(sql); }
        catch (error) { assert.equal(error.code, "42501"); denied = true; }
        await client.query("ROLLBACK TO SAVEPOINT denied_access");
        assert.equal(denied, true, "Data API roles must not access private tables.");
      }
      await client.query("RESET ROLE");
    }
    await client.query("SAVEPOINT invalid_permission");
    await assert.rejects(client.query('INSERT INTO "AdminRole" (id,name,permissions,"updatedAt") VALUES ($1,$2,$3,now())',
      ["bad-role", "Bad", ["people.manage"]]), error => error.code === "23514");
    await client.query("ROLLBACK TO SAVEPOINT invalid_permission");
    console.log("PASS: additive migration preserves existing accounts with no access; both private tables enable RLS; 16 Data API operations denied; invalid permissions refused.");
  } finally {
    try { await client.query("ROLLBACK"); } finally { await client.end(); }
  }
}).catch(reportLocalAdminTestFailure);
