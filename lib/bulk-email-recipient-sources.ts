import type { RecipientImport } from "@/lib/bulk-email-types";

export type BulkRecipientSource = RecipientImport & { id: string; kind: "file" | "manual"; name: string };

/** Keep provenance so removing a file cannot delete an address also entered manually. */
export function combineBulkRecipientSources(sources: BulkRecipientSource[], removed: string[] = []): RecipientImport {
  const excluded = new Set(removed);
  const emails = new Set<string>();
  let duplicates = 0;
  for (const source of sources) {
    duplicates += source.duplicates;
    for (const email of source.emails) {
      if (emails.has(email)) duplicates++;
      emails.add(email);
    }
  }
  return {
    emails: [...emails].filter(email => !excluded.has(email)), duplicates,
    invalid: [...new Set(sources.flatMap(source => source.invalid))].slice(0, 100),
    warnings: [...new Set(sources.flatMap(source => source.warnings))],
  };
}
