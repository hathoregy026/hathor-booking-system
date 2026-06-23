import "dotenv/config";
import { fetchAdminBookingsFast } from "../lib/admin-bookings-fetch.ts";

const start = Date.now();
try {
  const bookings = await fetchAdminBookingsFast({
    bin: false,
    calendar: false,
    statusFilter: "all",
  });
  console.log(`OK — ${bookings.length} bookings in ${Date.now() - start}ms`);
  console.log(bookings.map((b) => `${b.status} ${b.customerName}`).join("\n"));
} catch (error) {
  console.log(
    `FAIL — ${error instanceof Error ? error.message : error} (${Date.now() - start}ms)`,
  );
}
