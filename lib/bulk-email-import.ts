import { Worker } from "node:worker_threads";
import path from "node:path";
import { BULK_UPLOAD_LIMIT, type RecipientImport } from "@/lib/bulk-email-types";
import { extractBulkRecipients } from "@/lib/bulk-email-validation";
import { PublicRequestError } from "@/lib/public-api-security";

export async function importBulkRecipients(file: File): Promise<RecipientImport> {
  if (!file.size || file.size > BULK_UPLOAD_LIMIT) throw new PublicRequestError("Choose a file smaller than 2 MB.", 413);
  const extension = file.name.toLowerCase().split(".").pop();
  if (!extension || !["xlsx", "pdf", "csv"].includes(extension)) throw new PublicRequestError("Choose an Excel .xlsx, PDF, or CSV file. Save older .xls files as .xlsx first.", 415);
  const bytes = Buffer.from(await file.arrayBuffer());
  if (extension === "pdf" && bytes.subarray(0, 5).toString() !== "%PDF-") throw new PublicRequestError("The file is not a valid PDF.", 400);
  if (extension === "xlsx" && !bytes.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]))) throw new PublicRequestError("The file is not a valid Excel workbook.", 400);
  const parts = await new Promise<string[]>((resolve, reject) => {
    const worker = new Worker(path.join(process.cwd(), "scripts/bulk-email-import-worker.mjs"), {
      workerData: { kind: extension, bytes },
      resourceLimits: { maxOldGenerationSizeMb: 128, maxYoungGenerationSizeMb: 16, stackSizeMb: 4 },
      // Do not inherit loaders/debugging hooks from the application process.
      execArgv: [],
    });
    const timer = setTimeout(() => { void worker.terminate(); reject(new PublicRequestError("The file took too long to read. Upload a smaller list.", 422)); }, 15000);
    worker.once("message", (result: { parts?: string[]; error?: string }) => {
      clearTimeout(timer); void worker.terminate();
      if (result.error || !result.parts) reject(new PublicRequestError(result.error || "Unable to read file.", 422));
      else resolve(result.parts);
    });
    worker.once("error", () => { clearTimeout(timer); reject(new PublicRequestError("Unable to read file. Try a smaller, text-based file.", 422)); });
    worker.once("exit", () => { clearTimeout(timer); reject(new PublicRequestError("Unable to read file. Try a smaller file.", 422)); });
  });
  const result = extractBulkRecipients(parts);
  if (!result.emails.length) result.warnings.push(extension === "pdf" ? "No valid email addresses found. Scanned PDFs need text recognition first; use Excel or CSV instead." : "No valid email addresses found. Include a column containing complete email addresses.");
  return result;
}
