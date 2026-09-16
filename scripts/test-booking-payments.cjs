require('dotenv').config({ quiet: true });
const pg = require('pg');
const fs = require('fs');

// Runs the payment lifecycle checks in one transaction and rolls them back.
(async () => {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000,
    query_timeout: 40000,
  });
  client.on('notice', notice => console.log(notice.message));
  try {
    await client.connect();
    await client.query(fs.readFileSync('scripts/test-booking-payments.sql', 'utf8'));
    console.log('PASS payment lifecycle; outer transaction rolled back');
  } catch (error) {
    console.error('FAIL', error.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
})();
