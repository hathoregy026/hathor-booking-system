/**
 * Read-only availability audit CLI.
 *   npm run validate:availability
 */
import { config } from "dotenv";
config();

import { runCalendarAvailabilityAudit } from "../lib/validate-calendar-availability";
import { prisma } from "../lib/prisma";

async function main() {
  console.log("Availability audit (local DB, read-only preview)");
  console.log("Rules: RAW_DATA.md via hathor-catalog\n");

  const result = await runCalendarAvailabilityAudit(18);

  console.log(`Range: ${result.rangeStart} → ${result.rangeEnd}`);
  console.log(`Departure dates checked: ${result.departureDatesChecked}\n`);

  for (const option of [
    "3-nights-aswan-luxor",
    "4-nights-luxor-aswan",
    "7-nights-luxor-aswan-luxor",
  ]) {
    const count = result.failures.filter((f) => f.duration === option).length;
    console.log(`${option}: ${count === 0 ? "OK" : `${count} issue(s)`}`);
  }

  console.log("\n--- Summary ---");
  if (result.passed) {
    console.log("All departure dates align: calendar, search preview, RAW_DATA catalog.");
    return;
  }

  const byKind = new Map<string, number>();
  for (const f of result.failures) {
    byKind.set(f.kind, (byKind.get(f.kind) ?? 0) + 1);
  }
  for (const [kind, count] of byKind) {
    console.log(`  ${kind}: ${count}`);
  }

  console.log("\nFirst 25 failures:");
  for (const f of result.failures.slice(0, 25)) {
    console.log(
      `  [${f.kind}] ${f.duration} / ${f.roomType} / ${f.date}: ${f.detail}`,
    );
  }

  if (result.failures.length > 25) {
    console.log(`  ... and ${result.failures.length - 25} more`);
  }

  process.exitCode = 1;
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
